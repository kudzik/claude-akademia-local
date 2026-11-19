import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';

const source=path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
let tmp,server,baseUrl;

test.beforeAll(async()=>{
 tmp=await mkdtemp(path.join(os.tmpdir(),'claude-akademia-ui-'));
 await cp(path.join(source,'server.mjs'),path.join(tmp,'server.mjs'));
 await cp(path.join(source,'agents.mjs'),path.join(tmp,'agents.mjs'));
 await cp(path.join(source,'public'),path.join(tmp,'public'),{recursive:true});
 const port=50000+Math.floor(Math.random()*10000);
 baseUrl=`http://127.0.0.1:${port}`;
 server=spawn(process.execPath,['server.mjs'],{cwd:tmp,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 for(let n=0;n<100;n++){
  if(server.exitCode!==null)throw new Error('Serwer testowy zakończył pracę');
  try{if((await fetch(baseUrl+'/api/state')).ok)return}catch{}
  await pause(30);
 }
 throw new Error('Serwer testowy nie wystartował');
});

test.afterAll(async()=>{
 if(server){server.kill();await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve))}
 if(tmp)await rm(tmp,{recursive:true,force:true});
});

test('complete model lesson persists results and feedback',async({page},testInfo)=>{
 await page.goto(baseUrl);
 await expect(page.getByRole('heading',{name:'00 — Diagnoza i przygotowanie środowiska'})).toBeVisible();
 const diagnostic=page.locator('#diagnosticQuiz');
 await diagnostic.locator('input[name="q0"][value="b"]').check();
 await diagnostic.locator('input[name="q1"][value="b"]').check();
 await diagnostic.locator('input[name="q2"][value="c"]').check();
 await diagnostic.getByRole('button',{name:'Sprawdź diagnozę'}).click();
 await expect(page.locator('#diagnosticResult')).toContainText('Wynik: 3/3');
 await expect(page.locator('#diagnosticResult li')).toHaveCount(3);

 const checks=page.locator('#exerciseChecklist input');
 for(let i=0;i<await checks.count();i++)await checks.nth(i).check();
 await page.getByRole('button',{name:'Zapisz wykonanie ćwiczenia'}).click();
 await expect(page.locator('#exerciseResult')).toContainText('Ćwiczenie wykonane');

 const finalQuiz=page.locator('#finalQuiz');
 await finalQuiz.locator('input[name="q0"][value="b"]').check();
 await finalQuiz.locator('input[name="q1"][value="c"]').check();
 await finalQuiz.locator('input[name="q2"][value="a"]').check();
 await finalQuiz.locator('input[name="q3"][value="a"]').check();
 await finalQuiz.getByRole('button',{name:'Sprawdź test końcowy'}).click();
 await expect(page.locator('#finalResult')).toContainText('Wynik: 3/4 — zaliczony');
 await expect(page.locator('#finalResult')).toContainText('Do poprawy');
 await page.screenshot({path:testInfo.outputPath('desktop-feedback.png'),fullPage:true});

 await page.reload();
 await expect(page.locator('#diagnosticResult')).toContainText('Ostatni wynik: 3/3');
 await expect(page.locator('#exerciseResult')).toContainText('Ćwiczenie wykonane');
 await expect(page.locator('#finalResult')).toContainText('Ostatni wynik: 3/4 — zaliczony');
 await page.screenshot({path:testInfo.outputPath('desktop-full.png'),fullPage:true});
});

test('complete module 01 independently from module 00',async({page},testInfo)=>{
 await page.goto(baseUrl);
 await page.locator('[data-id="01"]').click();
 await expect(page.getByRole('heading',{name:'01 — Podstawy Claude i Claude Code'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'2. Claude, czat i Claude Code'})).toBeVisible();

 const diagnostic=page.locator('#diagnosticQuiz');
 for(const [name,value] of [['q0','b'],['q1','c'],['q2','b'],['q3','a']])await diagnostic.locator(`input[name="${name}"][value="${value}"]`).check();
 await diagnostic.getByRole('button',{name:'Sprawdź diagnozę'}).click();
 await expect(page.locator('#diagnosticResult')).toContainText('Wynik: 4/4');

 const checks=page.locator('#exerciseChecklist input');
 await expect(checks).toHaveCount(6);
 for(let i=0;i<await checks.count();i++)await checks.nth(i).check();
 await page.getByRole('button',{name:'Zapisz wykonanie ćwiczenia'}).click();

 const finalQuiz=page.locator('#finalQuiz');
 for(const [name,value] of [['q0','b'],['q1','c'],['q2','a'],['q3','b'],['q4','a']])await finalQuiz.locator(`input[name="${name}"][value="${value}"]`).check();
 await finalQuiz.getByRole('button',{name:'Sprawdź test końcowy'}).click();
 await expect(page.locator('#finalResult')).toContainText('Wynik: 4/5 — zaliczony');
 await expect(page.locator('#finalResult')).toContainText('Do poprawy');
 await page.screenshot({path:testInfo.outputPath('module-01-feedback.png'),fullPage:true});

 await page.reload();
 await expect(page.getByRole('heading',{name:'01 — Podstawy Claude i Claude Code'})).toBeVisible();
 await expect(page.locator('#diagnosticResult')).toContainText('Ostatni wynik: 4/4');
 await expect(page.locator('#finalResult')).toContainText('Ostatni wynik: 4/5 — zaliczony');
 await page.locator('[data-id="00"]').click();
 await expect(page.locator('#finalResult')).toContainText('Ostatni wynik: 3/4 — zaliczony');
});

test('mobile layout has no horizontal overflow',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(baseUrl);
 await page.locator('[data-id="01"]').click();
 const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,offenders:[...document.querySelectorAll('body *')].map(el=>({el,rect:el.getBoundingClientRect()})).filter(x=>x.rect.right>window.innerWidth+1).slice(0,8).map(x=>({tag:x.el.tagName,id:x.el.id,className:x.el.className,right:Math.round(x.rect.right),width:Math.round(x.rect.width),text:x.el.textContent?.trim().slice(0,80)}))}));
 expect(dimensions.scrollWidth,JSON.stringify(dimensions.offenders)).toBeLessThanOrEqual(dimensions.innerWidth);
 await expect(page.locator('#diagnosticQuiz')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('module-01-mobile.png'),fullPage:true});
});
