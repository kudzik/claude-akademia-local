import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const agentIds = ['codex','claude','antigravity'];
export const isMissingSessionError = error => /no conversation found with session id|thread\/resume failed: no rollout found/i.test(String(error?.message||error));

// Teacher mode: no shell interpolation, temporary workspace, bounded output and execution.
export async function runTeacherCli(agent,prompt,sessionId) {
 if (!['claude','antigravity'].includes(agent)) throw new Error('Nieznany adapter CLI');
 const cwd=await mkdtemp(path.join(os.tmpdir(),'claude-akademia-agent-'));
 try {
  const isClaude=agent==='claude';
  const exe=isClaude?'claude':'agy';
  const args=isClaude
   ? ['--safe-mode','--restricted','--strict-mcp-config','--disable-slash-commands','--permission-prompts','none','-p',prompt,'--output-format','json','--tools','',...(sessionId?['--resume',sessionId]:[])]
   : ['--disable-slash-commands','-p',prompt,'--output-format','json','--sandbox',...(sessionId?['--conversation',sessionId]:[])];
  const output=await spawnJson(exe,args,cwd);
  const result=JSON.parse(output);
  if (isClaude) {
   if(result.is_error || typeof result.result!=='string') throw new Error(result.error||'Claude Code nie zwrócił odpowiedzi');
   return {reply:result.result,threadId:result.session_id||sessionId||null};
  }
  if(result.status!=='SUCCESS'||typeof result.response!=='string') throw new Error(result.error||'Antigravity nie zakończył zadania');
  return {reply:result.response,threadId:result.conversation_id||sessionId||null};
 } finally { await rm(cwd,{recursive:true,force:true}).catch(()=>{}); }
}

function spawnJson(exe,args,cwd){
 return new Promise((resolve,reject)=>{
  let stdout='',stderr='',settled=false;
  const child=spawn(exe,args,{cwd,stdio:['ignore','pipe','pipe'],env:process.env});
  const timer=setTimeout(()=>child.kill(),120000);
  const done=(err,value)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(err)reject(err);else resolve(value);
  };
  child.on('error',e=>done(new Error(`Nie można uruchomić ${exe}: ${e.code||e.message}`)));
  child.stdout.on('data',data=>{
   stdout+=data.toString();
   if(stdout.length>1024*1024)child.kill();
  });
  child.stderr.on('data',data=>{stderr=(stderr+data.toString()).slice(-3000)});
  child.on('close',(code,signal)=>{
   if(stdout.length>1024*1024)return done(new Error('Odpowiedź CLI przekroczyła limit rozmiaru'));
   if(signal)return done(new Error(`Proces ${exe} przerwany (limit czasu lub sygnał)`));
   if(code!==0)return done(new Error(`${exe} zakończył działanie: ${stderr.slice(-500)||'kod '+code}`));
   done(null,stdout);
  });
 });
}
