import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, cp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';

const source=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let tmp,child,url;
before(async()=>{
 tmp=await mkdtemp(path.join(os.tmpdir(),'claude-akademia-test-'));
 await cp(path.join(source,'server.mjs'),path.join(tmp,'server.mjs'));
 await cp(path.join(source,'public'),path.join(tmp,'public'),{recursive:true});
 const port=45000+Math.floor(Math.random()*10000);
 url=`http://127.0.0.1:${port}`;
 child=spawn(process.execPath,['server.mjs'],{cwd:tmp,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 for(let n=0;n<100;n++){
  if(child.exitCode!==null) throw new Error('Serwer zakończył pracę');
  try { const r=await fetch(url+'/api/state'); if(r.ok) return; }catch{}
  await pause(30);
 }
 throw new Error('Serwer nie wystartował');
});
after(async()=>{
 if(child){child.kill();await new Promise(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',resolve)});}
 if(tmp) await rm(tmp,{recursive:true,force:true});
});
test('local page and module list', async()=>{
 const page=await fetch(url+'/');assert.equal(page.status,200);
 const state=await (await fetch(url+'/api/state')).json();
 assert.equal(state.lessons.length,12);
});
test('reject untrusted Host',async()=>{
 const r=await fetch(url+'/api/state',{headers:{Host:'evil.example'}});
 assert.equal(r.status,403);
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
