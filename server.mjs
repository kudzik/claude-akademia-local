import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4317);
const host = '127.0.0.1';
await mkdir(path.join(root, 'data'), { recursive: true });
const db = new DatabaseSync(path.join(root, 'data', 'academy.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS progress (lesson_id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'not_started', notes TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, lesson_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS threads (lesson_id TEXT PRIMARY KEY, thread_id TEXT NOT NULL);
`);
const lessons = [
 ['00','Diagnoza i przygotowanie środowiska'],['01','Podstawy Claude i Claude Code'],
 ['02','Skuteczna komunikacja z Claude'],['03','Terminal i VS Code w praktyce'],
 ['04','Praca z kodem i GitHub'],['05','Kontekst, pamięć i instrukcje'],
 ['06','Skills i rozszerzanie możliwości'],['07','MCP i integracje'],
 ['08','Hooks, konfiguracja i bezpieczeństwo'],['09','Subagenci i praca wieloagentowa'],
 ['10','Automatyzacja i Agent SDK'],['11','Projekt końcowy i audyt kompetencji']
];
const lessonMap = new Map(lessons);
const teacher = `Jesteś nauczycielem indywidualnego kursu Claude Code w języku polskim. Uczeń jest początkujący. Temat rozpatruj na podstawie oficjalnej dokumentacji Anthropic: https://code.claude.com/docs/en/overview. Nie udawaj, że weryfikowałeś stronę, jeśli nie masz dostępu. Ucz konkretnie, jedno zagadnienie naraz. Na początku lekcji pokaż cel i krótki materiał, potem przykład, ćwiczenie i pytanie sprawdzające. Nie podawaj od razu odpowiedzi na ćwiczenie. Weryfikuj rozumowanie, a nie tylko wybór odpowiedzi. Zwracaj uwagę na uprawnienia i bezpieczeństwo. Gdy uczeń prosi o test, zadawaj po jednym pytaniu. Nie edytuj plików ani nie wykonuj poleceń w trakcie rozmowy nauczycielskiej. Nie twierdź, że postępy zostały automatycznie ocenione — sam uczeń oznacza ukończenie lekcji.`;
let codexPromise;
function codex() { codexPromise ??= import('@openai/codex-sdk').then(m => new m.Codex()); return codexPromise; }
const busy = new Set();
const send = (res,status,obj) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(JSON.stringify(obj)); };
async function body(req) { let s=''; for await (const chunk of req) { s += chunk; if(s.length>24000) throw new Error('Wiadomość jest za długa'); } return JSON.parse(s||'{}'); }
const messagesFor = db.prepare('SELECT role, content, created_at FROM messages WHERE lesson_id=? ORDER BY id');
const listProgress = db.prepare('SELECT lesson_id, status, notes FROM progress');
const getThread = db.prepare('SELECT thread_id FROM threads WHERE lesson_id=?');
const setThread = db.prepare('INSERT INTO threads (lesson_id,thread_id) VALUES (?,?) ON CONFLICT(lesson_id) DO UPDATE SET thread_id=excluded.thread_id');
const addMessage = db.prepare('INSERT INTO messages(lesson_id,role,content) VALUES (?,?,?)');
const setProgress = db.prepare('INSERT INTO progress(lesson_id,status,notes,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(lesson_id) DO UPDATE SET status=excluded.status,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP');
const index = await readFile(path.join(root,'public','index.html'));
const api = async (req,res,url) => {
 const p=url.pathname;
 if(req.method==='GET' && p==='/api/state') return send(res,200,{lessons:lessons.map(([id,title])=>({id,title})),progress:listProgress.all()});
 if(req.method==='GET' && p==='/api/messages') { const id=url.searchParams.get('lesson'); if(!lessonMap.has(id)) return send(res,400,{error:'Nieznana lekcja'}); return send(res,200,{messages:messagesFor.all(id)}); }
 if(req.method==='POST' && p==='/api/progress') { const d=await body(req); if(!lessonMap.has(d.lesson)||!['not_started','in_progress','completed'].includes(d.status)||typeof d.notes!=='string'||d.notes.length>5000) return send(res,400,{error:'Niepoprawne dane'}); setProgress.run(d.lesson,d.status,d.notes); return send(res,200,{ok:true}); }
 if(req.method==='POST' && p==='/api/chat') {
  const d=await body(req); if(!lessonMap.has(d.lesson)||typeof d.message!=='string'||!d.message.trim()||d.message.length>9000) return send(res,400,{error:'Niepoprawna wiadomość'});
  if(busy.has(d.lesson)) return send(res,409,{error:'Poczekaj na zakończenie poprzedniej odpowiedzi.'});
  busy.add(d.lesson);
  try {
   const sdk=await codex(); const saved=getThread.get(d.lesson);
   const options={workingDirectory:root,sandboxMode:'read-only'};
   const thread=saved ? sdk.resumeThread(saved.thread_id, options) : sdk.startThread(options);
   const context=`${teacher}\nAKTUALNA LEKCJA: ${d.lesson} — ${lessonMap.get(d.lesson)}.\nOdpowiedz na pytanie ucznia poniżej, po polsku.\n\nUCZEŃ: ${d.message.trim()}`;
   const answer=await thread.run(context);
   if(thread.id) setThread.run(d.lesson,thread.id);
   const reply=answer.finalResponse || 'Agent nie zwrócił odpowiedzi.';
   addMessage.run(d.lesson,'user',d.message.trim()); addMessage.run(d.lesson,'assistant',reply);
   send(res,200,{reply});
  } catch(e) { console.error(e); send(res,502,{error:'Nie udało się połączyć z Codex. Sprawdź instalację i zalogowanie w Codex CLI lub VS Code.',detail:String(e.message||e).slice(0,400)}); }
  finally {busy.delete(d.lesson);} return;
 }
 send(res,404,{error:'Nie znaleziono endpointu'});
};
const server=http.createServer(async(req,res)=>{ try {
 // Only accept the expected local Host to reduce DNS-rebinding exposure.
 const expectedHost=`127.0.0.1:${port}`;
 if(req.headers.host!==expectedHost) return send(res,403,{error:'Niedozwolony adres hosta'});
 // Browser requests mutating local state must originate from this application.
 if(req.method==='POST' && req.url?.startsWith('/api/')) {
  const origin=req.headers.origin;
  if(origin && origin!==`http://${expectedHost}`) return send(res,403,{error:'Niedozwolone źródło żądania'});
  if(!req.headers['content-type']?.toLowerCase().startsWith('application/json')) return send(res,415,{error:'Wymagany Content-Type: application/json'});
 }
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname.startsWith('/api/')) return await api(req,res,url);
 if(req.method==='GET' && (url.pathname==='/'||url.pathname==='/index.html')) { res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:",'X-Content-Type-Options':'nosniff'}); return res.end(index); }
 res.writeHead(404); res.end('Nie znaleziono');
} catch(e) { console.error(e); send(res,500,{error:'Błąd serwera: '+String(e.message||e)}); } });
server.listen(port,host,()=>console.log(`Claude Akademia: http://${host}:${port}`));
