import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, cp, mkdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import { isMissingSessionError } from '../agents.mjs';

const source=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let tmp,child,url,port;
async function startServer(){
 child=spawn(process.execPath,['server.mjs'],{cwd:tmp,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 for(let n=0;n<100;n++){
  if(child.exitCode!==null) throw new Error('Serwer zakończył pracę');
  try { const r=await fetch(url+'/api/state'); if(r.ok) return; }catch{}
  await pause(30);
 }
 throw new Error('Serwer nie wystartował');
}
async function stopServer(){
 if(!child)return;
 child.kill();
 await new Promise(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',resolve)});
 child=null;
}
before(async()=>{
 tmp=await mkdtemp(path.join(os.tmpdir(),'claude-akademia-test-'));
 await cp(path.join(source,'server.mjs'),path.join(tmp,'server.mjs'));
 await cp(path.join(source,'agents.mjs'),path.join(tmp,'agents.mjs'));
 await cp(path.join(source,'public'),path.join(tmp,'public'),{recursive:true});
 await mkdir(path.join(tmp,'data'));
 const legacy=new DatabaseSync(path.join(tmp,'data','academy.sqlite'));
 legacy.exec(`CREATE TABLE progress (lesson_id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'not_started', notes TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, lesson_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE threads (lesson_id TEXT PRIMARY KEY, thread_id TEXT NOT NULL);
  INSERT INTO messages(lesson_id,role,content) VALUES ('00','user','starsza rozmowa');
  INSERT INTO threads(lesson_id,thread_id) VALUES ('00','legacy-thread');`);
 legacy.close();
 port=45000+Math.floor(Math.random()*10000);
 url=`http://127.0.0.1:${port}`;
 await startServer();
});
after(async()=>{
 await stopServer();
 if(tmp) await rm(tmp,{recursive:true,force:true});
});
test('local page and module list', async()=>{
 const page=await fetch(url+'/');assert.equal(page.status,200);
 const state=await (await fetch(url+'/api/state')).json();
 assert.equal(state.lessons.length,12);
});
test('model lesson markup and client script are present and valid',async()=>{
 const html=await readFile(path.join(source,'public','index.html'),'utf8');
 assert.match(html,/id="diagnosticQuiz"/);
 assert.match(html,/id="exerciseChecklist"/);
 assert.match(html,/id="finalQuiz"/);
 const script=html.match(/<script>([\s\S]*)<\/script>/)?.[1];
 assert.ok(script);
 assert.doesNotThrow(()=>new Function(script));
});
test('reject untrusted Host',async()=>{
 const status=await new Promise((resolve,reject)=>{
  const req=request(url+'/api/state',{headers:{Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode)});
  req.on('error',reject);req.end();
 });
 assert.equal(status,403);
});
test('reject cross-origin JSON mutations',async()=>{
 const r=await fetch(url+'/api/progress',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:'{}'});
 assert.equal(r.status,403);
});
test('reject non-JSON mutations',async()=>{
 const r=await fetch(url+'/api/progress',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'});
 assert.equal(r.status,415);
});
test('persist lesson progress and reject invalid lessons',async()=>{
 const headers={'Content-Type':'application/json',Origin:url};
 const ok=await fetch(url+'/api/progress',{method:'POST',headers,body:JSON.stringify({lesson:'00',status:'in_progress',notes:'Test'})});
 assert.equal(ok.status,200);
 const state=await (await fetch(url+'/api/state')).json();
 assert.equal(state.progress.find(p=>p.lesson_id==='00').notes,'Test');
 const bad=await fetch(url+'/api/progress',{method:'POST',headers,body:JSON.stringify({lesson:'missing',status:'completed',notes:''})});
 assert.equal(bad.status,400);
});

test('agent list and separate history queries', async()=>{
 const state=await (await fetch(url+'/api/state')).json();
 assert.deepEqual(state.agents,['codex','claude','antigravity']);
 const result=await fetch(url+'/api/messages?lesson=00&agent=claude');
 assert.equal(result.status,200);
 assert.deepEqual((await result.json()).messages,[]);
 const migrated=await (await fetch(url+'/api/messages?lesson=00&agent=codex')).json();
 assert.equal(migrated.messages[0].content,'starsza rozmowa');
 const bad=await fetch(url+'/api/messages?lesson=00&agent=unknown');
 assert.equal(bad.status,400);
});
test('reject unsupported agent before executing CLI',async()=>{
 const r=await fetch(url+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:url},body:JSON.stringify({lesson:'00',agent:'unknown',message:'Test'})});
 assert.equal(r.status,400);
});
test('score and persist the model lesson without exposing answer keys',async()=>{
 const headers={'Content-Type':'application/json',Origin:url};
 const diagnostic=await fetch(url+'/api/assessment',{method:'POST',headers,body:JSON.stringify({lesson:'00',phase:'diagnostic',answers:['b','a','c']})});
 assert.deepEqual(await diagnostic.json(),{score:2,total:3});
 const final=await fetch(url+'/api/assessment',{method:'POST',headers,body:JSON.stringify({lesson:'00',phase:'final',answers:['b','c','a','c']})});
 assert.deepEqual(await final.json(),{score:4,total:4,passed:true});
 const exercise=await fetch(url+'/api/exercise',{method:'POST',headers,body:JSON.stringify({lesson:'00',completed:true})});
 assert.equal(exercise.status,200);
 const invalid=await fetch(url+'/api/assessment',{method:'POST',headers,body:JSON.stringify({lesson:'00',phase:'final',answers:['b']})});
 assert.equal(invalid.status,400);
 const state=await (await fetch(url+'/api/state')).json();
 assert.equal('answers' in state,false);
 assert.deepEqual(state.results.map(({lesson_id,diagnostic_score,diagnostic_total,exercise_completed,final_score,final_total})=>({lesson_id,diagnostic_score,diagnostic_total,exercise_completed,final_score,final_total})),[{lesson_id:'00',diagnostic_score:2,diagnostic_total:3,exercise_completed:true,final_score:4,final_total:4}]);
});
test('persist selected lesson and agent across server restart',async()=>{
 const headers={'Content-Type':'application/json',Origin:url};
 const saved=await fetch(url+'/api/session',{method:'POST',headers,body:JSON.stringify({lesson:'07',agent:'antigravity'})});
 assert.equal(saved.status,200);
 const invalid=await fetch(url+'/api/session',{method:'POST',headers,body:JSON.stringify({lesson:'missing',agent:'codex'})});
 assert.equal(invalid.status,400);
 await stopServer();
 await startServer();
 const state=await (await fetch(url+'/api/state')).json();
 assert.deepEqual(state.resume,{lesson:'07',agent:'antigravity'});
 assert.equal(state.results[0].final_score,4);
 assert.equal(state.results[0].exercise_completed,true);
});
test('only recover context for a missing external session',()=>{
 assert.equal(isMissingSessionError(new Error('No conversation found with session ID: test')),true);
 assert.equal(isMissingSessionError(new Error('thread/resume failed: no rollout found for thread id test')),true);
 assert.equal(isMissingSessionError(new Error('rate limit exceeded')),false);
 assert.equal(isMissingSessionError(new Error('network timeout')),false);
});
