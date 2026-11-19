import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { runTeacherCli, agentIds, isMissingSessionError } from './agents.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4317);
const host = '127.0.0.1';
await mkdir(path.join(root, 'data'), { recursive: true });
const db = new DatabaseSync(path.join(root, 'data', 'academy.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS progress (lesson_id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'not_started', notes TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, lesson_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE IF NOT EXISTS threads (lesson_id TEXT PRIMARY KEY, thread_id TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);
// Upgrade old single-agent databases without deleting the existing chat history.
if(!db.prepare('PRAGMA table_info(messages)').all().some(c=>c.name==='agent')) {
 db.exec("ALTER TABLE messages ADD COLUMN agent TEXT NOT NULL DEFAULT 'codex'");
}
db.exec(`CREATE TABLE IF NOT EXISTS agent_threads (
 lesson_id TEXT NOT NULL, agent TEXT NOT NULL, thread_id TEXT NOT NULL,
 PRIMARY KEY(lesson_id,agent)
);
INSERT OR IGNORE INTO agent_threads(lesson_id,agent,thread_id)
 SELECT lesson_id,'codex',thread_id FROM threads;`);
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
const messagesFor = db.prepare('SELECT role, content, created_at FROM messages WHERE lesson_id=? AND agent=? ORDER BY id');
const recentMessages = db.prepare('SELECT role, content FROM messages WHERE lesson_id=? AND agent=? ORDER BY id DESC LIMIT 12');
const listProgress = db.prepare('SELECT lesson_id, status, notes FROM progress');
const getAppState = db.prepare('SELECT value FROM app_state WHERE key=?');
const setAppState = db.prepare('INSERT INTO app_state(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
const getThread = db.prepare('SELECT thread_id FROM agent_threads WHERE lesson_id=? AND agent=?');
const setThread = db.prepare('INSERT INTO agent_threads (lesson_id,agent,thread_id) VALUES (?,?,?) ON CONFLICT(lesson_id,agent) DO UPDATE SET thread_id=excluded.thread_id');
const deleteThread = db.prepare('DELETE FROM agent_threads WHERE lesson_id=? AND agent=?');
const addMessage = db.prepare('INSERT INTO messages(lesson_id,agent,role,content) VALUES (?,?,?,?)');
const setProgress = db.prepare('INSERT INTO progress(lesson_id,status,notes,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(lesson_id) DO UPDATE SET status=excluded.status,notes=excluded.notes,updated_at=CURRENT_TIMESTAMP');
const index = await readFile(path.join(root,'public','index.html'));
const learningState = () => {
 const lesson=getAppState.get('last_lesson')?.value;
 const agent=getAppState.get('last_agent')?.value;
 return {lesson:lessonMap.has(lesson)?lesson:'00',agent:agentIds.includes(agent)?agent:'codex'};
};
function chatContext(lesson,agent,message,includeHistory=false) {
 let history='';
 if(includeHistory) {
  const items=recentMessages.all(lesson,agent).reverse();
  if(items.length) history='\nHISTORIA ODTWORZONA Z LOKALNEJ BAZY (traktuj jako kontekst rozmowy):\n'+items.map(x=>`${x.role==='user'?'UCZEŃ':'NAUCZYCIEL'}: ${x.content.slice(0,2000)}`).join('\n')+'\nKONIEC HISTORII\n';
 }
 return `${teacher}\nAKTUALNA LEKCJA: ${lesson} — ${lessonMap.get(lesson)}.${history}\nOdpowiedz na pytanie ucznia poniżej, po polsku.\n\nUCZEŃ: ${message}`;
}
async function runAgent(agent,context,threadId) {
 if(agent==='codex') {
  const sdk=await codex();
  const options={workingDirectory:root,sandboxMode:'read-only'};
  const thread=threadId ? sdk.resumeThread(threadId,options) : sdk.startThread(options);
  const answer=await thread.run(context);
  return {reply:answer.finalResponse||'Agent nie zwrócił odpowiedzi.',threadId:thread.id};
 }
 return runTeacherCli(agent,context,threadId);
}
const api = async (req,res,url) => {
 const p=url.pathname;
 if(req.method==='GET' && p==='/api/state') return send(res,200,{agents:agentIds,lessons:lessons.map(([id,title])=>({id,title})),progress:listProgress.all(),resume:learningState()});
 if(req.method==='GET' && p==='/api/messages') { const id=url.searchParams.get('lesson'), agent=url.searchParams.get('agent')||'codex'; if(!lessonMap.has(id)||!agentIds.includes(agent)) return send(res,400,{error:'Nieznana lekcja lub agent'}); return send(res,200,{messages:messagesFor.all(id,agent)}); }
 if(req.method==='POST' && p==='/api/session') { const d=await body(req); if(!lessonMap.has(d.lesson)||!agentIds.includes(d.agent)) return send(res,400,{error:'Niepoprawny stan nauki'}); setAppState.run('last_lesson',d.lesson);setAppState.run('last_agent',d.agent);return send(res,200,{ok:true}); }
 if(req.method==='POST' && p==='/api/progress') { const d=await body(req); if(!lessonMap.has(d.lesson)||!['not_started','in_progress','completed'].includes(d.status)||typeof d.notes!=='string'||d.notes.length>5000) return send(res,400,{error:'Niepoprawne dane'}); setProgress.run(d.lesson,d.status,d.notes); return send(res,200,{ok:true}); }
 if(req.method==='POST' && p==='/api/chat') {
  const d=await body(req); const agent=d.agent||'codex';
  if(!lessonMap.has(d.lesson)||!agentIds.includes(agent)||typeof d.message!=='string'||!d.message.trim()||d.message.length>9000) return send(res,400,{error:'Niepoprawna wiadomość'});
  const key=d.lesson+':'+agent;
  if(busy.has(key)) return send(res,409,{error:'Poczekaj na zakończenie poprzedniej odpowiedzi.'});
  busy.add(key);
  try {
   const saved=getThread.get(d.lesson,agent);
   let response;
   try {
    response=await runAgent(agent,chatContext(d.lesson,agent,d.message.trim(),!saved),saved?.thread_id);
   } catch(e) {
    if(!saved||!isMissingSessionError(e))throw e;
    console.warn(`Nie można wznowić sesji ${agent}; odtwarzam kontekst z SQLite.`);
    deleteThread.run(d.lesson,agent);
    response=await runAgent(agent,chatContext(d.lesson,agent,d.message.trim(),true));
   }
   if(response.threadId)setThread.run(d.lesson,agent,response.threadId);
   addMessage.run(d.lesson,agent,'user',d.message.trim());
   addMessage.run(d.lesson,agent,'assistant',response.reply);
   send(res,200,{reply:response.reply});
  } catch(e) { console.error(e); send(res,502,{error:'Nie udało się połączyć z wybranym agentem. Sprawdź CLI, logowanie lub limit dostawcy.',detail:String(e.message||e).slice(0,400)}); }
  finally {busy.delete(key);} return;
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
