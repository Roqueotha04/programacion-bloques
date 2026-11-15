// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
"use client";

import { PARTS, GROUPS, MISSIONS, CHALLENGES } from "./data";
import {
  ACTS, DIRS, MAXSTEPS, cellColor, cellsOf, countB, countBlocks, find,
  fmtTime, goalLeft, goalMet, groupState, hasE, hasRepeat, limitFor, optFor,
  chOf, gateTxt, partDone, partName, selfTest, shortest, starsFor, startState, timeStars,
  tryAct, tryMove, walk,
} from "./engine";
import { freshSave, isProfe, saveKey } from "./save";

let booted = false;
export function boot() {
  if (booted) return;
  booted = true;
  const LABEL={u:"Arriba",d:"Abajo",l:"Izquierda",r:"Derecha"};  
  const $=id=>document.getElementById(id);  
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));  
  const RM=matchMedia("(prefers-reduced-motion: reduce)");  
    
  /* ================= guardado ================= */  
  const PROFE=isProfe();
  const KEY=saveKey();
  const FRESH=freshSave;  
  let SAVE=FRESH();  
  try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s) SAVE=Object.assign(SAVE,s); }catch(e){}
  if(!Array.isArray(SAVE.codes)) SAVE.codes=[];  
  function applyProfe(){ if(PROFE){ SAVE.seen=GROUPS.map(g=>g.id).concat(CHALLENGES.map(c=>c.id)); SAVE.owned=["robi","gato","astro","dino","rey"]; } }  
  /* el desafío de cada parte se abre al terminar (con al menos 1 estrella) todos sus niveles */  
  function chOpen(ch){ return PROFE||partDone(SAVE.stars,ch.part); }  
  applyProfe();  
  function groupsNow(){ const gs=groupState(SAVE.stars,SAVE.codes); if(PROFE) gs.forEach(s=>s.open=true); return gs; }  
  function persist(){ try{ localStorage.setItem(KEY,JSON.stringify(SAVE)); }catch(e){} }  
  const earned=()=>Object.values(SAVE.stars).reduce((a,b)=>a+b,0);  
  const wallet=()=>earned()-SAVE.spent;  
    
  /* ================= dibujos ================= */  
  /* colores: principal, claro, cuerpo, nombre */  
  const COLORS={cel:["#2FB0F0","#BDE8FF","#FFFFFF","Celeste"],ver:["#1EC48C","#BFF3DF","#F3FFF9","Verde"],nar:["#FF9A2E","#FFDDB8","#FFFAF3","Naranja"],  
    ros:["#FF6FB5","#FFD0E6","#FFF6FA","Rosa"],vio:["#8B6CF0","#DCD2FF","#F9F7FF","Violeta"],ama:["#F5B800","#FFEBA6","#FFFDF2","Amarillo"]};  
  const SKINS=[{id:"robi",name:"Robi",price:0},{id:"gato",name:"Gatobot",price:5},{id:"astro",name:"Astro",price:10},{id:"dino",name:"Dinobot",price:15},{id:"rey",name:"Rey Robot",price:20}];  
  function robotSVG(o){  
    o=o||{skin:SAVE.skin,color:SAVE.color};  
    const [m,l,b]=COLORS[o.color]||COLORS.cel, k="#0D3049", s=o.skin, sw=`stroke="${k}" stroke-width="2.5" stroke-linejoin="round"`;  
    let back="", front="", mouth=`<path d="M-6 11 Q0 15 6 11" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;  
    const antenna=`<line x1="0" y1="-31" x2="0" y2="-40" stroke="${k}" stroke-width="2.5" stroke-linecap="round"/><circle cx="0" cy="-43" r="5" fill="#57E1FF" ${sw}/>`;  
    if(s==="robi") back=antenna;  
    if(s==="gato"){  
      back=`<path d="M-27 -20 L-22 -47 L-5 -31Z" fill="${m}" ${sw}/><path d="M27 -20 L22 -47 L5 -31Z" fill="${m}" ${sw}/><path d="M-21 -30 L-20 -40 L-12 -33Z" fill="#FFB3D1"/><path d="M21 -30 L20 -40 L12 -33Z" fill="#FFB3D1"/>`;  
      front=`<path d="M-30 4 L-45 0 M-30 9 L-45 11 M30 4 L45 0 M30 9 L45 11" stroke="${k}" stroke-width="2" stroke-linecap="round"/><path d="M-2.5 7 h5 l-2.5 3z" fill="#FF6FB5"/>`;  
      mouth=`<path d="M-7 11 Q-3.5 15 0 11 Q3.5 15 7 11" stroke="${m}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; }  
    if(s==="astro"){  
      back=`<path d="M-17 22 L-30 33 L-17 30Z M17 22 L30 33 L17 30Z" fill="${m}" ${sw}/>`;  
      front=`<circle cx="0" cy="-6" r="40" fill="rgba(190,232,255,.25)" ${sw}/><path d="M-27 -27 A32 32 0 0 1 -8 -40" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="24" cy="-30" r="2.5" fill="#fff"/>`; }  
    if(s==="dino"){  
      back=`<path d="M-15 25 Q-40 30 -47 8 Q-36 19 -18 15Z" fill="${m}" ${sw}/><path d="M-22 -29 L-16 -44 L-9 -31 L-2 -47 L5 -31 L12 -44 L19 -29Z" fill="${m}" ${sw}/>`;  
      front=`<path d="M-4 11.5 L-2 15 L0 12 L2 15 L4 11.5" fill="#fff" stroke="${k}" stroke-width="1.2" stroke-linejoin="round"/>`; }  
    if(s==="rey"){  
      back=`<path d="M-27 -12 Q-42 28 -32 34 L32 34 Q42 28 27 -12Z" fill="#FF5A62" ${sw}/>`;  
      front=`<path d="M-18 -30 L-21 -49 L-10 -39 L0 -53 L10 -39 L21 -49 L18 -30Z" fill="#FFC21A" ${sw}/><circle cx="0" cy="-37" r="3.4" fill="#FF5A62"/><circle cx="-11" cy="-34" r="2.4" fill="#57E1FF"/><circle cx="11" cy="-34" r="2.4" fill="#57E1FF"/>`; }  
    return `<g class="flame"><path d="M-10 30 Q0 52 10 30Z" fill="#57E1FF"/><path d="M-5 30 Q0 43 5 30Z" fill="#fff"/></g>${back}  
   <rect x="-17" y="19" width="34" height="11" rx="5.5" fill="${l}" ${sw}/>  
   <circle cx="-31" cy="-6" r="6.5" fill="${m}" ${sw}/><circle cx="31" cy="-6" r="6.5" fill="${m}" ${sw}/>  
   <rect x="-29" y="-32" width="58" height="54" rx="22" fill="${b}" ${sw}/>  
   <rect x="-21" y="-23" width="42" height="26" rx="12" fill="#0D3049"/>  
   <g class="pupils"><rect x="-13" y="-16" width="8" height="12" rx="4" fill="#57E1FF"/><rect x="5" y="-16" width="8" height="12" rx="4" fill="#57E1FF"/></g>  
   ${mouth}${front}`; }  
  function rockSVG(){ return `<svg viewBox="0 0 100 100"><polygon points="50,12 86,31 50,50 14,31" fill="#D3DEE8" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>  
   <polygon points="14,31 50,50 50,90 14,71" fill="#9CB0C2" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>  
   <polygon points="86,31 50,50 50,90 86,71" fill="#7590A8" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>  
   <path d="M23 46v16M32 51v16" stroke="#C3D2DF" stroke-width="3" stroke-linecap="round"/></svg>`; }  
  function starPts(r,cx=50,cy=52){ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; p.push((cx+rr*Math.cos(a)).toFixed(1)+","+(cy+rr*Math.sin(a)).toFixed(1)); } return p.join(" "); }  
  function goalSVG(){ return `<svg class="goal" viewBox="0 0 100 100"><circle cx="50" cy="52" r="42" fill="#FFF3C4" opacity=".75"/><polygon points="${starPts(40)}" fill="#FFC21A" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/><polygon points="${starPts(16)}" fill="#FFE27A"/></svg>`; }  
  function batSVG(){ return `<svg class="bat" viewBox="0 0 100 100"><rect x="41" y="10" width="18" height="9" rx="2.5" fill="#0D3049"/><rect x="27" y="17" width="46" height="72" rx="11" fill="#fff" stroke="#0D3049" stroke-width="3.5"/>  
   <rect x="35" y="26" width="30" height="15" rx="4" fill="#1EC48C"/><rect x="35" y="45" width="30" height="15" rx="4" fill="#1EC48C"/><rect x="35" y="64" width="30" height="16" rx="4" fill="#1EC48C"/></svg>`; }  
  function starIco(on,dim="#D6E6F2"){ return `<svg viewBox="0 0 100 100"><polygon points="${starPts(46,50,53)}" fill="${on?"#FFC21A":dim}" stroke="${on?"#0D3049":"none"}" stroke-width="4" stroke-linejoin="round"/></svg>`; }  
  function starRow(k,dim){ return [0,1,2].map(i=>starIco(i<k,dim)).join(""); }  
  const ICO={  
    arrow:d=>`<svg viewBox="0 0 32 32"><g transform="rotate(${{u:0,r:90,d:180,l:270}[d]} 16 16)"><path d="M16 3 29 16h-8v13H11V16H3z" fill="#fff" stroke="rgba(0,0,0,.12)" stroke-width="1.5" stroke-linejoin="round"/></g></svg>`,  
    repeat:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M6.5 15a9.5 9.5 0 0 1 16.3-6.6M25.5 17a9.5 9.5 0 0 1-16.3 6.6" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><path d="M24 3v6.5h-6.5M8 29v-6.5h6.5" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,  
    flag:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M8 29V4" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><path d="M8 5c5-3 9 3 16 0v12c-7 3-11-3-16 0z" fill="${c}"/></svg>`,  
    step:()=>`<svg viewBox="0 0 32 32"><path d="M4 16h15M13 9l7 7-7 7" fill="none" stroke="#2FB0F0" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 7v18" stroke="#0D3049" stroke-width="3.4" stroke-linecap="round"/></svg>`,  
    restart:()=>`<svg viewBox="0 0 32 32"><path d="M7.5 12A10 10 0 1 1 6 18" fill="none" stroke="#0D3049" stroke-width="3.2" stroke-linecap="round"/><path d="M6 4v8h8" fill="none" stroke="#0D3049" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,  
    bulb:()=>`<svg viewBox="0 0 32 32"><path d="M16 3a8.5 8.5 0 0 0-5 15.3V22h10v-3.7A8.5 8.5 0 0 0 16 3z" fill="#FFC21A" stroke="#0D3049" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 26h8M13.5 29.5h5" stroke="#0D3049" stroke-width="2.4" stroke-linecap="round"/></svg>`,  
    trash:(c="#5F7F96")=>`<svg viewBox="0 0 32 32"><path d="M6 9h20M13 9V6h6v3M8.5 9l1.5 18h12l1.5-18M13.5 14v8M18.5 14v8" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,  
    blocks:()=>`<svg viewBox="0 0 32 32"><rect x="4" y="4" width="22" height="10" rx="3" fill="#3B82F0"/><rect x="4" y="17" width="22" height="10" rx="3" fill="#FF9A2E"/></svg>`,  
    back:()=>`<svg viewBox="0 0 32 32"><rect x="4" y="4" width="10" height="10" rx="3" fill="#fff"/><rect x="18" y="4" width="10" height="10" rx="3" fill="#fff"/><rect x="4" y="18" width="10" height="10" rx="3" fill="#fff"/><rect x="18" y="18" width="10" height="10" rx="3" fill="#fff"/></svg>`,  
    burst:()=>`<svg viewBox="0 0 64 64"><polygon points="32,3 38,21 56,13 46,30 62,38 42,41 46,61 32,47 18,61 22,41 2,38 18,30 8,13 26,21" fill="#FF5A62" stroke="#0D3049" stroke-width="2.5" stroke-linejoin="round"/><polygon points="32,19 35,28 44,26 38,34 43,42 34,39 32,48 30,39 21,42 26,34 20,26 29,28" fill="#FFC21A"/></svg>`,  
    question:()=>`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#FF9A2E" stroke="#0D3049" stroke-width="2.5"/><path d="M24 24a8 8 0 1 1 12 7c-3 2-4 3-4 7" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="47" r="3.6" fill="#fff"/></svg>`,  
    hourglass:()=>`<svg viewBox="0 0 64 64"><path d="M16 6h32M16 58h32" stroke="#0D3049" stroke-width="4" stroke-linecap="round"/><path d="M20 6c0 16 24 14 24 26S20 42 20 58h24c0-16-24-14-24-26S44 22 44 6z" fill="#BDE8FF" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/><path d="M24 54c2-6 14-6 16 0z" fill="#FF9A2E"/></svg>`,  
    drag:()=>`<svg viewBox="0 0 64 64"><rect x="4" y="10" width="40" height="20" rx="5" fill="#3B82F0"/><path d="M14 20h18" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M36 28v26l6-6 5 11 5-2-5-11h8z" fill="#fff" stroke="#0D3049" stroke-width="2.6" stroke-linejoin="round"/></svg>`,  
    robot:()=>`<svg viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`,  
    star:()=>goalSVG(),  
    bat:()=>batSVG(),  
    pencil:()=>`<svg viewBox="0 0 32 32"><path d="M6 26l2-7L21 6l5 5L13 24z" fill="#FFC21A" stroke="#0D3049" stroke-width="2.2" stroke-linejoin="round"/><path d="M18 9l5 5" stroke="#0D3049" stroke-width="2.2"/></svg>`,  
    eraser:()=>`<svg viewBox="0 0 32 32"><path d="M8 8l16 16M24 8L8 24" fill="none" stroke="#FF5A62" stroke-width="3.4" stroke-linecap="round"/></svg>`,  
    seq:()=>`<svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="8" rx="2.5" fill="#3B82F0"/><rect x="3" y="12" width="26" height="8" rx="2.5" fill="#3B82F0" opacity=".75"/><rect x="3" y="21" width="26" height="8" rx="2.5" fill="#3B82F0" opacity=".5"/></svg>`,  
    lock:(c="#9A5A00")=>`<svg viewBox="0 0 32 32"><path d="M10.5 14v-3.5a5.5 5.5 0 0 1 11 0V14" fill="none" stroke="${c}" stroke-width="3.2"/><rect x="6" y="14" width="20" height="15" rx="4" fill="${c}"/><circle cx="16" cy="21.5" r="2.4" fill="#fff"/></svg>`,  
    unlock:()=>`<svg viewBox="0 0 32 32"><path d="M10.5 14V9.5a5.5 5.5 0 0 1 10.6-2" fill="none" stroke="#11986A" stroke-width="3.2" stroke-linecap="round"/><rect x="6" y="14" width="20" height="15" rx="4" fill="#1EC48C"/><circle cx="16" cy="21.5" r="2.4" fill="#fff"/></svg>`,  
    palette:()=>`<svg viewBox="0 0 32 32"><path d="M16 3C8.5 3 3 8.7 3 15.5 3 22.3 8.3 28 14.3 28c2 0 2.6-1.6 1.8-3.1-.9-1.7.2-3.3 2.2-3.3H22c4 0 7-3 7-7C29 8.2 23.3 3 16 3z" fill="#fff" stroke="#0D3049" stroke-width="2"/><circle cx="9.5" cy="14.5" r="2.6" fill="#FF5A62"/><circle cx="14.5" cy="9" r="2.6" fill="#FFC21A"/><circle cx="21" cy="9.5" r="2.6" fill="#1EC48C"/><circle cx="23.5" cy="15.5" r="2.6" fill="#3B82F0"/></svg>`,  
    next:()=>`<svg viewBox="0 0 32 32"><path d="M6 16h18M17 8l8 8-8 8" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,  
    brush:(c="#fff")=>`<svg viewBox="0 0 32 32"><rect x="4" y="4" width="20" height="9" rx="3" fill="${c}"/><path d="M24 8.5h3v8H15v4" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><rect x="12.5" y="20" width="5" height="9" rx="2" fill="${c}"/></svg>`,  
    brushOff:(c="#fff")=>`<svg viewBox="0 0 32 32"><g opacity=".75"><rect x="4" y="4" width="20" height="9" rx="3" fill="${c}"/><path d="M24 8.5h3v8H15v4" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><rect x="12.5" y="20" width="5" height="9" rx="2" fill="${c}"/></g><path d="M4 28L28 4" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></svg>`,  
    music:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M12 24V7l14-3v17" fill="none" stroke="${c}" stroke-width="2.8" stroke-linejoin="round"/><circle cx="8.5" cy="24" r="4" fill="${c}"/><circle cx="22.5" cy="21" r="4" fill="${c}"/></svg>`,  
    ifq:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M16 3l13 13-13 13L3 16z" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><path d="M13 13a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="21.6" r="1.6" fill="${c}"/></svg>`,  
    clock:()=>`<svg viewBox="0 0 32 32"><path d="M13 3h6M16 3v4M24.5 8.5l2-2" stroke="#0D3049" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="18" r="11" fill="#fff" stroke="#0D3049" stroke-width="2.6"/><path d="M16 12v6l4 3" fill="none" stroke="#FF5A62" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,  
    check:()=>`<svg viewBox="0 0 32 32"><path d="M6 17l6 6L26 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`  
  };  
  $("ico3").innerHTML=ICO.pencil(); $("walletIco").innerHTML=starIco(true);  
  $("icoRun").innerHTML=ICO.flag(); $("icoStep").innerHTML=ICO.step(); $("icoStop").innerHTML=ICO.restart(); $("icoHint").innerHTML=ICO.bulb();  
  $("trash").innerHTML=ICO.trash(); $("backBtn").innerHTML=ICO.back()+"<span>Misiones</span>";  
  $("edPlay").innerHTML=ICO.flag()+"Jugar este mapa";  
  $("shopBtn").innerHTML=ICO.palette()+"<span>Taller del robot</span>";  
  $("resetBtn").innerHTML=ICO.trash("currentColor")+"Borrar progreso";  
  const RAIN=["#FFC21A","#1EC48C","#2FB0F0","#57E1FF","#FF9A2E","#FF5A62","#FF6FB5","#8B6CF0"];  
  const pick=a=>a[Math.random()*a.length|0];  
  { let i=0; $("heroTitle").innerHTML="Programación por bloques".split(" ").map(w=>`<b class="word">${[...w].map(ch=>`<span aria-hidden="true" style="--i:${i};color:${["#1689C9","#FF6FB5","#FF9A2E","#1EC48C","#8B6CF0","#2FB0F0"][i++%6]}">${ch}</span>`).join("")}</b>`).join(" "); }  
  $("sky").innerHTML=Array.from({length:16},(_,i)=>`<i class="${i%3===0?"st":""}" style="--x:${Math.random()*100}%;--s:${18+Math.random()*46}px;--c:${pick(RAIN)};--d:${18+Math.random()*22}s;--dl:-${Math.random()*40}s"></i>`).join("");  
    
  /* ================= sonido ================= */  
  let AC=null;  
  function tone(f,d,type="sine",vol=.12,when=0){ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)();  
    const t=AC.currentTime+when, o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);  
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t+d+.02);}catch(e){} }  
  const SND={ move:()=>tone(620,.08,"triangle"), crash:()=>{tone(140,.3,"sawtooth",.12);tone(90,.35,"sawtooth",.1,.05)},  
    bat:()=>[660,880,1100,1320].forEach((f,i)=>tone(f,.12,"triangle",.1,i*.07)), add:()=>tone(820,.05,"sine",.08),  
    pick:()=>tone(520,.05,"sine",.07), snap:()=>{tone(880,.05,"sine",.09);tone(1320,.06,"sine",.06,.04)}, trash:()=>tone(200,.15,"triangle",.1),  
    loop:()=>tone(980,.05,"sine",.05),  
    paint:()=>{tone(400,.12,"triangle",.09);tone(700,.1,"sine",.07,.06)},  
    dance:()=>[784,988,784,1175].forEach((f,i)=>tone(f,.1,"square",.05,i*.1)), nope:()=>{tone(300,.1,"triangle",.1);tone(240,.14,"triangle",.1,.09)},  
    unlock:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.2,"triangle",.11,i*.09)),  
    buy:()=>[988,1319,1568].forEach((f,i)=>tone(f,.16,"square",.05,i*.08)),  
    win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.22,"triangle",.12,i*.11)), fail:()=>{tone(330,.18,"triangle");tone(262,.28,"triangle",.12,.16)} };  
    
  /* ================= efectos: confeti, chispas, textos y estrellas que vuelan ================= */  
  const FX={P:[],on:false};  
  function fx(list){ if(RM.matches) return; FX.P.push(...list);  
    if(!FX.on){ FX.on=true; requestAnimationFrame(fxLoop); } }  
  function fxLoop(){  
    const cv=$("conf"), ctx=cv.getContext("2d");  
    if(cv.width!==innerWidth||cv.height!==innerHeight){ cv.width=innerWidth; cv.height=innerHeight; }  
    ctx.clearRect(0,0,cv.width,cv.height); FX.P=FX.P.filter(p=>p.life>0);  
    for(const p of FX.P){ p.vy+=p.g; p.vx*=p.dr; p.vy*=p.dr; p.x+=p.vx; p.y+=p.vy; p.a+=p.va; p.life--;  
      ctx.save(); ctx.globalAlpha=Math.min(1,p.life/20); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle=p.c;  
      if(p.sh==="star"){ ctx.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?p.s*.22:p.s*.5; ctx.lineTo(r*Math.cos(a),r*Math.sin(a)); } ctx.fill(); }  
      else ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);  
      ctx.restore(); }  
    if(FX.P.length) requestAnimationFrame(fxLoop); else { FX.on=false; ctx.clearRect(0,0,cv.width,cv.height); } }  
  function confetti(){ fx(Array.from({length:190},()=>({x:innerWidth/2+(Math.random()-.5)*300,y:innerHeight*.35,vx:(Math.random()-.5)*17,vy:-Math.random()*14-4,g:.35,dr:.99,  
    s:Math.random()*9+6,c:pick(RAIN),a:Math.random()*6,va:(Math.random()-.5)*.3,sh:Math.random()<.35?"star":"rect",life:150+Math.random()*40|0}))); }  
  function burst(x,y,cols=RAIN,n=18,sp=6){ fx(Array.from({length:n},(_,i)=>{ const a=i/n*Math.PI*2+Math.random()*.4, v=sp*(.5+Math.random()*.7);  
    return {x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.12,dr:.94,s:Math.random()*8+9,c:pick(cols),a:0,va:(Math.random()-.5)*.3,sh:"star",life:45+Math.random()*20|0}; })); }  
  function sparkle(x,y){ burst(x,y,["#FFFFFF","#57E1FF","#FFC21A","#FF6FB5"],7,2.6); }  
  function center(el){ const r=el.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }  
  function floatText(x,y,txt,col){ if(RM.matches) return; const d=document.createElement("div"); d.className="floater"; d.textContent=txt;  
    d.style.left=x+"px"; d.style.top=y+"px"; d.style.setProperty("--fc",col); document.body.appendChild(d); setTimeout(()=>d.remove(),1100); }  
  function bumpEl(el,cls="bump"){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }  
  function renderWallet(v=wallet()){ $("walletN").textContent=v; }  
  /* las estrellas ganadas vuelan hasta el contador de arriba */  
  function flyStars(from,k){  
    if(!k) return; let shown=wallet()-k; renderWallet(shown);  
    const [x0,y0]=center(from), [x1,y1]=center($("wallet"));  
    for(let i=0;i<k;i++){ const s=document.createElement("div"); s.className="flystar"; s.innerHTML=starIco(true); document.body.appendChild(s);  
      const mx=(x0+x1)/2+(Math.random()-.5)*220, my=Math.min(y0,y1)-90;  
      const an=s.animate([{transform:`translate(${x0-22}px,${y0-22}px) scale(.3) rotate(0)`},{transform:`translate(${mx-22}px,${my-22}px) scale(1.5) rotate(180deg)`,offset:.45},{transform:`translate(${x1-22}px,${y1-22}px) scale(.7) rotate(360deg)`}],  
        {duration:RM.matches?1:950,delay:i*260,easing:"ease-in-out",fill:"backwards"});  
      an.onfinish=()=>{ s.remove(); renderWallet(++shown); bumpEl($("wallet")); tone(880+i*220,.14,"triangle",.1); sparkle(x1,y1); }; }  
  }  
  let toastT=null;  
  function toast(icon,txt){ let t=$("toast"); if(!t){ t=document.createElement("div"); t.id="toast"; t.setAttribute("role","status"); document.body.appendChild(t); }  
    t.className="toast"; t.innerHTML=icon+`<span>${txt}</span>`; t.style.animation="none"; void t.offsetWidth; t.style.animation="";  
    clearTimeout(toastT); toastT=setTimeout(()=>t.classList.add("hidden"),2800); }  
    
  /* ================= pantallas ================= */  
  let SCREEN="menu";  
  function show(id){ SCREEN=id; ["menu","game","editor","shop"].forEach(x=>$(x).classList.toggle("hidden",x!==id)); scrollTo(0,0);  
    if(id!=="game"&&CH) endChallenge(); /* salir del juego cancela el desafío en curso */  
    const inCh=id==="game"&&!!(G&&G.map.ch);  
    $("backBtn").classList.toggle("hidden",id==="menu"); $("logo").classList.toggle("hidden",id!=="menu");  
    $("tTitle").classList.toggle("hidden",id==="menu"); $("tStars").classList.toggle("hidden",id!=="game"||inCh); $("tTimer").classList.toggle("hidden",!inCh); }  
  function setTop(num,name){ $("tNum").innerHTML=num; $("tName").textContent=name; }  
  function renderTopStars(){ const k=G&&G.map.id!=="custom"?(SAVE.stars[G.map.id]||0):0; $("tStars").innerHTML=starRow(k,"rgba(255,255,255,.45)"); }  
  $("backBtn").onclick=()=>{ if(SCREEN==="game") stopRun(); renderMenu(); show("menu"); };  
  $("wallet").onclick=()=>openShop();  
    
  /* ================= menú ================= */  
  function miniMap(rows,s=14){ let h=`<div class="mini" style="grid-template-columns:repeat(${rows[0].length},${s}px);--ms:${s}px">`;  
    for(const row of rows) for(const ch of row) h+=`<i class="${ch==="#"?"r":ch==="."?"":ch}"></i>`; return h+"</div>"; }  
  function partIco(p){ return p===1?ICO.arrow("r"):p===2?ICO.brush():p===3?ICO.repeat():ICO.ifq(); }  
  function lockWhy(st){ return st.gate?`Primero ${gateTxt(SAVE.stars,st.gate,true).replace(/^./,c=>c.toLowerCase())}`:st.needCode?"Pedile el código a tu profe":st.prevLeft?`Primero terminá «${st.prevTitle}»`:`Necesitás ${st.g.need} estrellas de esta parte (tenés ${st.earned})`; }  
  function renderMenu(){  
    $("heroBot").innerHTML=robotSVG(); $("logoBot").innerHTML=robotSVG(); renderWallet();  
    $("total").innerHTML=starIco(true)+`${earned()} estrellas ganadas`;  
    const GS=groupsNow(); let h="", i=0, fresh=false;  
    for(const P of PARTS){  
      /* una card por parte; cada grupo de niveles se abre por separado */  
      const sts=GS.filter(s=>s.g.part===P.id), ms=MISSIONS.filter(m=>m.part===P.id), got=ms.reduce((a,m)=>a+(SAVE.stars[m.id]||0),0);  
      h+=`<section class="grp" style="--gc:${P.c};--gl:${P.l}"><div class="grph">`+  
        `<span class="gdot">${partIco(P.id)}</span><div><h3>Parte ${P.id} · ${P.title}</h3><span class="gsub">${P.sub}</span></div>`+
        (PROFE&&P.code?`<span class="profe">Código: ${P.code}</span>`:"")+
        `<span class="gprog">${starIco(true)} ${got} / ${ms.length*3}</span></div><div class="cards">`;
      for(const st of sts){  
        const g=st.g, isNew=st.open&&!SAVE.seen.includes(g.id);  
        if(isNew){ SAVE.seen.push(g.id); fresh=true; }  
        const need=st.gate?gateTxt(SAVE.stars,st.gate):st.needCode?"Pedile el código a tu profe":st.prevLeft?"Terminá los anteriores":`Juntá ${g.need}${starIco(true)}`;
        h+=st.ms.map(m=>{ const k=SAVE.stars[m.id]||0;
          return `<button class="card${k===3?" s3":""}${st.open?"":" locked"}${isNew?" new":""}" data-id="${m.id}" data-why="${lockWhy(st)}"${st.needCode?` data-code="${st.needCode}"`:""} style="--i:${i++};--gc:${g.c};--gl:${g.l}"><span class="num">${m.num}</span>${miniMap(m.rows)}<h3>${m.title}</h3>`+
            (st.open?`<div class="stars">${starRow(k)}</div>`:`<span class="need">${need}</span><span class="lock">${ICO.lock()}</span>`)+`</button>`; }).join("");  
      }  
      h+=`</div></section>`;  
    }  
    /* card aparte: los desafíos extra, para los que terminan antes */  
    const chGot=CHALLENGES.reduce((a,c)=>a+(SAVE.stars[c.id]||0),0);  
    h+=`<section class="grp" style="--gc:#8B6CF0;--gl:#E6DFFF"><div class="grph">`+  
      `<span class="gdot">${ICO.clock()}</span><div><h3>Desafíos extra</h3><span class="gsub">3 niveles seguidos, con cronómetro</span></div>`+  
      `<span class="gprog">${starIco(true)} ${chGot} / ${CHALLENGES.length*3}</span></div>`;  
    for(const ch of CHALLENGES){  
      const open=chOpen(ch), isNew=open&&!SAVE.seen.includes(ch.id);  
      if(isNew){ SAVE.seen.push(ch.id); fresh=true; }  
      h+=chCard(ch,i++,open,isNew);  
    }  
    h+=`</section>`;  
    $("parts").innerHTML=h;  
    let c=`<button class="card make" id="makeBtn" style="--i:${i++}"><span class="plus">+</span><h3>Creá tu mapa</h3></button>`;  
    if(SAVE.custom) c+=`<button class="card" data-id="custom" style="--i:${i}">${miniMap(SAVE.custom.rows)}<h3>Mi mapa</h3></button>`;  
    $("cards3").innerHTML=c;  
    if(fresh){ persist(); setTimeout(()=>{ confetti(); SND.unlock(); toast(ICO.unlock(),"¡Desbloqueaste niveles nuevos!"); },500); }  
  }  
  function chCard(ch,i,open,isNew){  
    const k=SAVE.stars[ch.id]||0, best=SAVE.best[ch.id], why=`Terminá todos los niveles de la ${partName(ch.part)}`;  
    return `<button class="chcard${open?"":" locked"}${k===3?" s3":""}${isNew?" new":""}" data-ch="${ch.id}" data-why="${why}" style="--i:${i}">`+  
      `<span class="chico">${ICO.clock()}</span><div class="chtxt"><span class="chtag">Desafío extra</span><h3>${ch.title}</h3>`+  
      `<span class="chsub">3 niveles seguidos · con cronómetro</span>`+  
      (open?`<div class="chrow"><span class="stars">${starRow(k)}</span>${best!=null?`<span class="chbest">${ICO.clock()}Récord ${fmtTime(best)}</span>`:""}</div>`  
           :`<span class="need">${ICO.lock("#9A5A00")}${why}</span>`)+  
      `</div><div class="chmaps">${ch.levels.map(m=>miniMap(m.rows,9)).join("")}</div></button>`;
  }
  /* ventana emergente (aviso del desafío y código del profe) */
  function openModal(html){ closeModal();
    const d=document.createElement("div"); d.id="modal"; d.className="mback";
    d.innerHTML=`<div class="mbox" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(d);
    d.addEventListener("click",e=>{ if(e.target===d) closeModal(); }); return d; }
  function closeModal(){ const d=$("modal"); if(d) d.remove(); }
  addEventListener("keydown",e=>{ if(e.key==="Escape") closeModal(); });
  /* al terminar el último nivel de una parte: invitar a jugar su desafío */
  function chModal(ch){
    const more=PARTS.some(p=>p.after.includes(ch.part));
    const d=openModal(`<span class="mico">${ICO.clock()}</span><h2>¡Terminaste la ${partName(ch.part)}!</h2>`+
      `<p>Ahora jugá el <b>${ch.title}</b>${more?" para abrir la parte siguiente":""}.</p>`+
      `<div class="mbtns"><button class="mbtn alt" data-later>Después</button><button class="mbtn" data-go>Jugar desafío${ICO.next()}</button></div>`);
    d.querySelector("[data-go]").onclick=()=>{ closeModal(); startChallenge(ch); };
    d.querySelector("[data-later]").onclick=()=>{ closeModal(); const el=document.querySelector(`.chcard[data-ch="${ch.id}"]`);
      if(el){ el.scrollIntoView({block:"center",behavior:RM.matches?"auto":"smooth"}); bumpEl(el,"hey"); } };
  }
  /* código del profe para abrir una parte */
  const normCode=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"").toLowerCase();
  function askCode(pid){ const P=PARTS.find(p=>p.id===pid);
    const d=openModal(`<span class="mico">${ICO.lock("#FFC21A")}</span><h2>${partName(pid)}</h2>`+
      `<p>Pedile el código a tu profe para abrir esta parte.</p>`+
      `<input class="minput" id="codeIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Código" aria-label="Código">`+
      `<div class="mbtns"><button class="mbtn alt" data-later>Cancelar</button><button class="mbtn" data-go>Abrir${ICO.next()}</button></div>`);
    const inp=d.querySelector("#codeIn"); setTimeout(()=>inp.focus(),60);
    const go=()=>{ if(normCode(inp.value)===normCode(P.code)){ if(!SAVE.codes.includes(pid)) SAVE.codes.push(pid); persist(); closeModal(); renderMenu(); }
      else { bumpEl(inp,"no"); SND.nope(); inp.select(); toast(ICO.lock("#FFC21A"),"Ese código no es"); } };
    d.querySelector("[data-go]").onclick=go; inp.addEventListener("keydown",e=>{ if(e.key==="Enter") go(); });
    d.querySelector("[data-later]").onclick=closeModal;
  }

  /* borrar progreso (para un alumno nuevo): hay que tocar dos veces */
  let resetT=null;  
  function resetResetBtn(){ clearTimeout(resetT); const b=$("resetBtn"); b.classList.remove("ask"); b.innerHTML=ICO.trash("currentColor")+"Borrar progreso"; }  
  function askReset(){ const b=$("resetBtn");  
    if(!b.classList.contains("ask")){ b.classList.add("ask"); b.innerHTML=ICO.trash("#fff")+"¿Seguro? Tocá otra vez"; SND.nope(); resetT=setTimeout(resetResetBtn,4000); return; }  
    SAVE=FRESH(); applyProfe(); persist(); for(const k in PROGS) delete PROGS[k];  
    resetResetBtn(); renderMenu(); SND.trash(); toast(ICO.robot(),"Progreso borrado. ¡A empezar de nuevo!"); }  
  $("menu").addEventListener("click",e=>{  
    if(e.target.closest("#shopBtn")) return openShop();  
    if(e.target.closest("#resetBtn")) return askReset();  
    const x=e.target.closest(".chcard");  
    if(x){ if(x.classList.contains("locked")){ bumpEl(x,"no"); SND.nope(); return toast(ICO.lock("#FFC21A"),x.dataset.why); }  
      return startChallenge(CHALLENGES.find(c=>c.id===x.dataset.ch)); }  
    const c=e.target.closest(".card"); if(!c) return;  
    if(c.id==="makeBtn") return openEditor();  
    if(c.classList.contains("locked")){ if(c.dataset.code) return askCode(+c.dataset.code);
      bumpEl(c,"no"); SND.nope(); return toast(ICO.lock("#FFC21A"),c.dataset.why); }  
    const mp=c.dataset.id==="custom"?SAVE.custom:MISSIONS.find(x=>x.id===c.dataset.id); if(mp) startPlay(mp);  
  });  
    
  /* ================= tablero ================= */  
  function buildBoard(holder,rows,withRobot,availW,availH,intro){  
    const n=rows.length, m=rows[0].length;  
    const cs=Math.max(34,Math.min(80,Math.floor(Math.min((availW-6)/m,(availH-6)/n))-3));  
    holder.style.setProperty("--cs",cs+"px");  
    let h=`<div class="cells${intro?" intro":""}" style="grid-template-columns:repeat(${m},var(--cs))">`;  
    for(let r=0;r<n;r++) for(let c=0;c<m;c++){ const ch=rows[r][c];  
      const inner=ch==="#"?rockSVG():ch==="E"?goalSVG():ch==="B"?batSVG():(ch==="R"&&!withRobot)?`<svg class="rsvg" viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`:"";  
      h+=`<div class="cell${(r+c)%2?" alt":""}${ch==="X"?" red":ch==="V"?" green":""}" data-r="${r}" data-c="${c}" style="--i:${r+c}">${inner}</div>`; }  
    if(withRobot) h+=`<div class="robot noanim${intro?" drop":""}" id="bot" data-look="r"><div class="shadow"></div><div class="bob"><svg viewBox="-50 -50 100 100">${robotSVG()}</svg></div><span class="penmark">${ICO.brush()}</span></div>`;  
    holder.innerHTML=h+"</div>";  
    return cs+3; // paso entre casillas (incluye separación)  
  }  
    
  /* ================= juego ================= */  
  let G=null; const PROGS={};  
  function startPlay(map){  
    PROGS[map.id]=PROGS[map.id]||[];  
    const S=startState(map), opt=optFor(map,shortest(map,S));  
    const tools=map.tools??"r"; /* el mapa propio (cls 0) tiene repetir */  
    G={map,rows:map.rows,n:map.rows.length,m:map.rows[0].length,nB:countB(map.rows),nX:cellsOf(map.rows,"X").length,nV:cellsOf(map.rows,"V").length,  
       prog:PROGS[map.id],run:0,busy:false,ctx:null,S,tools,rep:tools.includes("r"),opt,max:limitFor(map,opt),hint:false};  
    setTop(map.num||ICO.pencil(),map.ch?`Desafío · Nivel ${map.num} de 3`:map.title); renderTopStars();  
    $("hintBtn").classList.toggle("hidden",!!map.ch||!!map.need);  
    renderPalette(); show("game"); drawBoard(false,true); renderProg();  
    const lim=`Podés usar hasta ${G.max} bloques`, toStar=hasE(map)?", después a la estrella":"";  
    if(map.ch&&map.num===1){ const ch=CHALLENGES.find(c=>c.id===map.ch);  
      say("",ICO.clock(),"El reloj mide cuánto tardás",`3 estrellas: menos de ${fmtTime(ch.t3)} · 2 estrellas: menos de ${fmtTime(ch.t2)}`); }  
    else if(G.nV) say("",ICO.ifq("#11986A"),"Rojas: pintar · Verdes: bailar",`Usá el bloque si y llegá a la estrella · ${lim}`);  
    else if(G.nX&&tools.includes("i")) say("",ICO.ifq("#11986A"),"¡Pintá solo las rojas!",`Usá el bloque si y llegá a la estrella · ${lim}`);  
    else if(G.nX) say("",ICO.brush("#7E3DB0"),G.nX>1?`Pintá las ${G.nX} celdas rojas`:"Pintá la celda roja",`Usá el pincel en las rojas y guardalo en las blancas${toStar} · ${lim}`);  
    else if(map.need) say("",ICO.brush("#7E3DB0"),`Llegá a la estrella pintando ${map.need} celdas`,"Usá el pincel: mientras lo usás, pinta todo por donde pasa");  
    else if(G.nB) say("",ICO.bat(),G.nB>1?`Juntá las ${G.nB} baterías`:"Primero la batería",`Después, a la estrella · ${lim}`);  
    else if(map.cls===2) say("",ICO.repeat("#D9780F"),"¡Usá el bloque repetir!",lim);  
    else say("",ICO.star(),"¡Llevá al robot a la estrella!",lim);  
  }  
  function boardSpace(){ const wide=innerWidth>1150; return [$("boardwrap").clientWidth-26, wide?Math.max(240,innerHeight-430):620]; }  
  function drawBoard(keep,intro){  
    const [w,h]=boardSpace(); G.step=buildBoard($("gBoard"),G.rows,true,w,h,intro);  
    if(intro) setTimeout(()=>{ const b=$("bot"); b&&b.classList.remove("drop"); },1300);  
    if(!keep) return resetRobot();  
    const mark=(keys,cls)=>keys.forEach(k=>{ const [r,c]=k.split(",").map(Number); cellEl(r,c).classList.add(cls); });  
    mark(G.S.got,"got"); mark(G.S.pnt,"pnt"); mark(G.S.dan,"danced"); $("bot").classList.toggle("pen",!!G.S.pen);  
    placeNow();  
  }  
  function cellEl(r,c){ return $("gBoard").querySelector(`.cell[data-r="${r}"][data-c="${c}"]`); }  
  function place(S,dx=0,dy=0){ $("bot").style.transform=`translate(${(S.c+dx)*G.step}px,${(S.r+dy)*G.step}px)`; }  
  function placeNow(){ const bot=$("bot"); bot.classList.add("noanim"); place(G.S); void bot.offsetWidth; bot.classList.remove("noanim"); renderStatus(); }  
  function resetRobot(){  
    G.S=startState(G.map); G.trail=0; G.lastGot=null; clearHint();  
    $("gBoard").querySelectorAll(".cell").forEach(el=>el.classList.remove("trail","got","flash","pnt","danced"));  
    $("gBoard").classList.remove("win","bump");  
    document.querySelectorAll("#canvas .on, #canvas .err").forEach(b=>b.classList.remove("on","err"));  
    document.querySelectorAll("#canvas .running, #canvas .yes, #canvas .nope").forEach(b=>b.classList.remove("running","yes","nope"));  
    $("bot").dataset.look="r"; $("bot").classList.remove("happy","shake","moving","boogie","pen"); placeNow();  
  }  
  function renderStatus(){  
    let h="";  
    if(G.nB){ const got=G.S.got.length, up=G.lastGot!=null&&got>G.lastGot; G.lastGot=got;  
      h+=`<span class="chip${got>=G.nB?" full":""}${up?" bump":""}">${Array.from({length:G.nB},(_,i)=>`<span class="bslot${i<got?" on":""}">${batSVG()}</span>`).join("")} ${got} / ${G.nB}</span>`; }  
    /* contadores de pintar: rojas pintadas, verdes con baile, o celdas pintadas en pintar libre */  
    const g=goalLeft(G.map,G.S), chip=(col,done,tot,txt)=>`<span class="chip${done>=tot?" full":""}"><span class="sq" style="background:${col}"></span>${txt} ${done} / ${tot}</span>`;  
    if(G.nX) h+=chip("#FF5A62",G.nX-g.red,G.nX,"Rojas");  
    if(G.nV) h+=chip("#1EC48C",G.nV-g.green,G.nV,"Verdes");  
    if(G.map.need) h+=chip("var(--paint)",Math.min(G.S.pnt.length,G.map.need),G.map.need,"Pintadas");  
    if(G.tools.includes("n")) h+=`<span class="chip pench${G.S.pen?" on":""}">${ICO.brush(G.S.pen?"#fff":"#7E3DB0")}${G.S.pen?"Pincel en uso":"Pincel guardado"}</span>`;  
    $("status").innerHTML=h;  
  }  
  function T(){ return 1300-(+$("speed").value); }  
  function applySpeed(){ document.documentElement.style.setProperty("--t",Math.round(T()*.8)+"ms"); }  
  $("speed").oninput=applySpeed; applySpeed();  
  function say(kind,icon,title,sub="",extra="",el="msg"){  
    const m=$(el); m.className="msg"+(kind?" "+kind:"");  
    m.innerHTML=`<span class="mi">${icon}</span><div><div class="mt">${title}</div>${sub?`<div class="ms">${sub}</div>`:""}${extra}</div>`;  
    void m.offsetWidth; m.classList.add("pop");  
  }  
    
  /* ---------- paleta y programa ---------- */  
  function renderPalette(){  
    let h=`<div class="pgroup" id="pg-mov"><h4><i style="background:var(--mov)"></i>Movimiento</h4>${["u","d","l","r"].map(d=>blockHTML({t:"move",dir:d},null,true)).join("")}</div>`;  
    let cats=`<button class="cat on" data-g="pg-mov"><i style="background:var(--mov)"></i>Movimiento</button>`;  
    const T_=G.tools;  
    if(T_.includes("p")||T_.includes("b")||T_.includes("n")){  
      h+=`<div class="pgroup" id="pg-act"><h4><i style="background:var(--pnt)"></i>Acciones</h4>${T_.includes("n")?blockHTML({t:"penon"},null,true)+blockHTML({t:"penoff"},null,true):""}${T_.includes("p")?blockHTML({t:"paint"},null,true):""}${T_.includes("b")?blockHTML({t:"dance"},null,true):""}</div>`;  
      cats+=`<button class="cat" data-g="pg-act"><i style="background:var(--pnt)"></i>Acciones</button>`; }  
    if(T_.includes("r")||T_.includes("i")){  
      h+=`<div class="pgroup" id="pg-ctl"><h4><i style="background:var(--ctl)"></i>Control</h4>${T_.includes("r")?blockHTML({t:"repeat",n:2,body:[]},null,true):""}${T_.includes("i")?blockHTML({t:"if",c:"x",body:[]},null,true):""}</div>`;  
      cats+=`<button class="cat" data-g="pg-ctl"><i style="background:var(--ctl)"></i>Control</button>`; }  
    $("pal").innerHTML=h; $("cats").innerHTML=cats;  
  }  
  const COLS={x:["roja","#FF5A62"],v:["verde","#1EC48C"]};  
  $("cats").onclick=e=>{ const b=e.target.closest(".cat"); if(!b) return;  
    document.querySelectorAll("#cats .cat").forEach(x=>x.classList.toggle("on",x===b)); $(b.dataset.g).scrollIntoView({behavior:"smooth",block:"start"}); };  
  function blockHTML(b,addr,pal){  
    const at=pal?`data-new="${b.t==="repeat"?"rep":b.t==="move"?b.dir:b.t}"`:`data-a="${addr}"`;  
    if(b.t==="move") return `<div class="blk mov" ${at}><span class="ic">${ICO.arrow(b.dir)}</span><span>${LABEL[b.dir]}</span></div>`;  
    if(b.t==="paint") return `<div class="blk act" ${at}><span class="ic">${ICO.brush()}</span><span>pintar</span></div>`;  
    if(b.t==="dance") return `<div class="blk act" ${at}><span class="ic">${ICO.music()}</span><span>bailar</span></div>`;  
    if(b.t==="penon") return `<div class="blk act" ${at}><span class="ic">${ICO.brush()}</span><span>usar pincel</span></div>`;  
    if(b.t==="penoff") return `<div class="blk act off" ${at}><span class="ic">${ICO.brushOff()}</span><span>guardar pincel</span></div>`;  
    const inner=b.body.length?listHTML(b.body,addr):'<div class="ph"></div>';  
    /* si y repetir comparten la forma de C */  
    if(b.t==="if") return `<div class="blk rep iff" ${at}><div class="rtop"><span class="ic">${ICO.ifq()}</span><span>si la celda es</span>`+  
      (pal?`<span class="colsel"><i style="--cc:${COLS[b.c][1]}"></i>${COLS[b.c][0]}</span>`:`<button class="colsel" data-col title="Cambiar color"><i style="--cc:${COLS[b.c][1]}"></i>${COLS[b.c][0]}</button>`)+  
      `</div><div class="mouth"><div class="arm"></div><div class="slot list"${pal?"":` data-l="${addr}"`}>${inner}</div></div><div class="rbot"></div></div>`;  
    return `<div class="blk rep" ${at}><div class="rtop"><span class="ic">${ICO.repeat()}</span><span>repetir</span>`+  
      `<span class="nctl">${pal?"":'<button data-minus aria-label="Menos">−</button>'}<b>${b.n}</b>${pal?"":'<button data-plus aria-label="Más">+</button>'}</span><span class="lap"></span></div>`+  
      `<div class="mouth"><div class="arm"></div><div class="slot list"${pal?"":` data-l="${addr}"`}>${inner}</div></div><div class="rbot"></div></div>`;  
  }  
  function listHTML(list,prefix){ return list.map((b,i)=>blockHTML(b,prefix===""?String(i):prefix+"."+i,false)).join(""); }  
  function used(){ return countBlocks(G.prog)+1; }  
  function renderProg(){  
    const root=G.prog.length?listHTML(G.prog,""):`<div class="rootph">${ICO.drag()}Arrastrá bloques acá</div>`;  
    $("canvas").innerHTML=`<div class="blk hat"><span>al tocar</span><span class="ic">${ICO.flag("#11986A")}</span></div><div class="list root" data-l="">${root}</div><div class="dropline hidden" id="dropline"></div>`;  
    const n=used(), c=$("count"); c.innerHTML=ICO.blocks()+`${n} / ${G.max}`; c.classList.toggle("full",n>=G.max); c.classList.remove("no");  
    $("goal").classList.toggle("hidden",G.map.cls===2||G.opt==null);  
    if(G.map.cls!==2) $("goal").innerHTML=starIco(true)+"meta "+G.opt;  
    $("runBtn").classList.toggle("ready",G.prog.length>0);  
    resetClear();  
  }  
  const toArr=a=>a===""?[]:String(a).split(".").map(Number);  
  function getList(path){ let l=G.prog; for(const i of path) l=l[i].body; return l; }  
  function removeAt(addr){ return getList(addr.slice(0,-1)).splice(addr[addr.length-1],1)[0]; }  
  function insertAt(path,i,b){ getList(path).splice(i,0,b); }  
  function newBlock(kind){ return kind==="rep"?{t:"repeat",n:2,body:[]}:kind==="if"?{t:"if",c:"x",body:[]}:ACTS[kind]?{t:kind}:{t:"move",dir:kind}; }  
  function tooMany(extra){ if(used()+extra<=G.max) return false;  
    say("warn",G.rep?ICO.repeat("#D9780F"):ICO.blocks(),`¡Máximo ${G.max} bloques!`,G.tools.includes("i")?"Usá repetir y si para ahorrar bloques":G.map.cls===2?"Usá repetir para ahorrar bloques":"El bloque «al tocar» también cuenta");  
    bumpEl($("count"),"no"); SND.nope(); return true; }  
  function changed(){ G.run++; releaseWait(); G.ctx=null; setBusy(false); renderProg(); resetRobot(); }  
  function freshAt(addr){ const el=document.querySelector(`#canvas .blk[data-a="${addr}"]`); if(!el) return;  
    el.classList.add("fresh"); const r=el.getBoundingClientRect(); sparkle(r.left+30,r.top+r.height/2); bumpEl($("count")); }  
    
  /* ---------- arrastrar y soltar ---------- */  
  let D=null;  
  document.addEventListener("pointerdown",e=>{  
    if(e.button!==0||!G||G.busy||SCREEN!=="game"||e.target.closest("button")) return;  
    const el=e.target.closest(".blk"); if(!el||el.classList.contains("hat")) return;  
    const inPal=!!el.closest("#pal"); if(!inPal&&!el.closest("#canvas")) return;  
    e.preventDefault();  
    const r=el.getBoundingClientRect();  
    D={inPal,kind:el.dataset.new,addr:el.dataset.a,x0:e.clientX,y0:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,started:false};  
    addEventListener("pointermove",onMove); addEventListener("pointerup",onUp); addEventListener("pointercancel",onUp);  
  });  
  function startDrag(){  
    if(D.inPal){ D.block=newBlock(D.kind); if(tooMany(countBlocks([D.block]))){ D=null; return; } }  
    else { const a=toArr(D.addr); D.from={path:a.slice(0,-1),i:a[a.length-1]}; D.block=removeAt(a); renderProg(); }  
    D.started=true;  
    const g=document.createElement("div"); g.className="ghost"; g.innerHTML=blockHTML(D.block,"g",false); document.body.appendChild(g); D.ghost=g;  
    document.body.classList.add("dragging"); SND.pick();  
  }  
  function onMove(e){  
    if(!D) return;  
    if(!D.started){ if(Math.hypot(e.clientX-D.x0,e.clientY-D.y0)<6) return; startDrag(); if(!D) return; }  
    const gx=e.clientX-D.ox, gy=e.clientY-D.oy; D.ghost.style.transform=`translate(${gx}px,${gy}px)`;  
    const t=document.elementFromPoint(e.clientX,e.clientY);  
    D.zone=!t?null:(t.closest("#trash")||t.closest("#pal"))?"del":t.closest("#script")?"drop":null;  
    $("trash").classList.toggle("hot",D.zone==="del"); $("pal").classList.toggle("drop",D.zone==="del"&&!D.inPal);  
    D.pt=D.zone==="drop"?nearestPoint(gx,gy):null; showDropline(D.pt);  
  }  
  function onUp(){  
    removeEventListener("pointermove",onMove); removeEventListener("pointerup",onUp); removeEventListener("pointercancel",onUp);  
    const d=D; D=null; if(!d) return;  
    if(!d.started){ if(d.inPal&&!tooMany(1)){ G.prog.push(newBlock(d.kind)); SND.snap(); changed(); freshAt(G.prog.length-1); } return; }  
    d.ghost.remove(); document.body.classList.remove("dragging"); $("trash").classList.remove("hot"); $("pal").classList.remove("drop");  
    let at=null;  
    if(d.zone==="drop"&&d.pt){ insertAt(d.pt.path,d.pt.i,d.block); at=d.pt.path.concat(d.pt.i).join("."); SND.snap(); }  
    else if(d.zone==="del"){ if(!d.inPal){ SND.trash(); const [x,y]=center($("trash")); burst(x,y,["#FF5A62","#FF9A2E","#5F7F96"],10,4); } }  
    else if(!d.inPal) insertAt(d.from.path,d.from.i,d.block);  
    changed(); if(at!=null) freshAt(at);  
  }  
  /* lugares donde se puede enganchar un bloque: antes del primero y después de cada uno, en cada lista */  
  function nearestPoint(gx,gy){  
    let best=null, bd=Infinity;  
    document.querySelectorAll("#canvas .list").forEach(L=>{  
      const path=toArr(L.dataset.l), kids=[...L.children].filter(k=>k.classList.contains("blk")), x=L.getBoundingClientRect().left;  
      const pts=kids.length?[{i:0,y:kids[0].getBoundingClientRect().top},...kids.map((k,j)=>({i:j+1,y:k.getBoundingClientRect().bottom}))]:[{i:0,y:L.getBoundingClientRect().top}];  
      for(const p of pts){ const d=Math.abs(gy-p.y)+Math.abs(gx-x)*.5; if(d<bd){ bd=d; best={path,i:p.i,x,y:p.y}; } }  
    });  
    return best;  
  }  
  function showDropline(p){ const el=$("dropline"); if(!el) return; el.classList.toggle("hidden",!p); if(!p) return;  
    const cv=$("canvas"), cr=cv.getBoundingClientRect();  
    el.style.left=(p.x-cr.left+cv.scrollLeft)+"px"; el.style.top=(p.y-cr.top+cv.scrollTop-3)+"px"; }  
    
  $("canvas").addEventListener("click",e=>{  
    const cs=e.target.closest("[data-col]");  
    if(cs&&!G.busy){ const a=toArr(cs.closest(".iff").dataset.a), blk=getList(a.slice(0,-1))[a[a.length-1]];  
      const opts=G.tools.includes("b")?["x","v"]:["x"]; blk.c=opts[(opts.indexOf(blk.c)+1)%opts.length]; SND.add(); return changed(); }  
    const b=e.target.closest("[data-minus],[data-plus]"); if(!b||G.busy) return;  
    const blk=getList(toArr(b.closest(".rep").dataset.a).slice(0,-1))[toArr(b.closest(".rep").dataset.a).pop()];  
    blk.n=Math.max(2,Math.min(10,blk.n+(b.hasAttribute("data-plus")?1:-1))); SND.add(); changed();  
  });  
  let clearT=null;  
  function resetClear(){ clearTimeout(clearT); $("clearBtn").classList.remove("ask"); $("clearBtn").innerHTML=ICO.trash("currentColor")+"Borrar todo"; }  
  $("clearBtn").onclick=()=>{ if(G.busy||!G.prog.length) return; const b=$("clearBtn");  
    if(!b.classList.contains("ask")){ b.classList.add("ask"); b.innerHTML=ICO.trash("#fff")+"¿Seguro?"; clearT=setTimeout(resetClear,3000); return; }  
    G.prog.length=0; SND.trash(); changed(); say("",ICO.drag(),"Programa vacío","Arrastrá bloques para empezar"); };  
    
  /* ---------- ejecución ---------- */  
  function setBusy(v){ G.busy=v; document.body.classList.toggle("busy",v); $("runBtn").disabled=v; $("stepBtn").disabled=v; if(v) $("runBtn").classList.remove("ready"); }  
  function releaseWait(){ if(G&&G.ctx&&G.ctx.waiting){ const w=G.ctx.waiting; G.ctx.waiting=null; w(); } }  
  function waitStep(){ $("runBtn").disabled=false; $("stepBtn").disabled=false;  
    return new Promise(r=>{ G.ctx.waiting=()=>{ $("runBtn").disabled=true; $("stepBtn").disabled=true; r(); }; }); }  
  function light(addr){ document.querySelectorAll("#canvas .on").forEach(x=>x.classList.remove("on"));  
    const el=document.querySelector(`#canvas .blk[data-a="${addr}"]`); if(el){ el.classList.add("on"); el.scrollIntoView({block:"nearest"}); } }  
  function setLap(addr,k,n){ const el=document.querySelector(`#canvas .rep[data-a="${addr}"]`); if(!el) return;  
    el.classList.add("running"); el.querySelector(".lap").textContent=`${k} / ${n}`; }  
    
  async function run(step){  
    if(G.ctx&&G.ctx.waiting){ if(!step) G.ctx.stepMode=false; releaseWait(); return; }  
    if(G.busy) return;  
    if(!G.prog.length) return say("warn",ICO.drag(),"Arrastrá bloques al programa");  
    const id=++G.run; resetRobot();  
    const ctx=G.ctx={id,stepMode:step,waiting:null,moves:0}; setBusy(true);  
    say("",ICO.robot(),step?"Paso a paso":"¡Allá va!",step?"Tocá Paso para seguir":"");  
    await sleep(200); if(id!==G.run) return;  
    /* el si pregunta por la celda donde está el robot en ese momento */  
    const it=walk(G.prog,c=>cellColor(G.map,G.S)===c); let res={k:"end"}, last=null, n=0;  
    for(let nx=it.next();!nx.done;nx=it.next()){ const ev=nx.value;  
      if(++n>MAXSTEPS){ res={k:"long"}; break; }  
      const addr=ev.addr.join(".");  
      if(ev.t==="loop"){ setLap(addr,ev.k+1,ev.n); SND.loop(); if(!ctx.stepMode){ await sleep(T()*.25); if(id!==G.run) return; } continue; }  
      if(ev.t==="if"){ askIf(addr,ev.ok); if(!ctx.stepMode){ await sleep(T()*.35); if(id!==G.run) return; } continue; }  
      light(addr); last=addr;  
      let r;  
      if(ev.t==="move"){ r=tryMove(G.map,G.S,ev.dir); await animate(r,ev.dir); }  
      else { r=tryAct(G.map,G.S,ACTS[ev.t]); await animateAct(r,ev.t); }  
      if(id!==G.run) return;  
      ctx.moves++;  
      if(r.k!=="ok"){ res=r; break; }  
      if(ctx.stepMode){ say("",ICO.step(),`Paso ${ctx.moves}`,"Tocá Paso para seguir o Ir para terminar"); await waitStep(); if(id!==G.run) return; }  
    }  
    if(res.k==="win"){ let nx; do{ nx=it.next(); }while(!nx.done&&(nx.value.t==="loop"||nx.value.t==="if")); res.left=!nx.done; }  
    /* sin estrella en el mapa: se gana al terminar el programa con todo pintado */  
    if(res.k==="end"&&!hasE(G.map)&&goalMet(G.map,G.S)) res={k:"win"};  
    G.ctx=null; setBusy(false); finish(res,last);  
  }  
  /* el bloque si se ilumina verde si la respuesta es sí, gris si es no */  
  function askIf(addr,ok){ const el=document.querySelector(`#canvas .iff[data-a="${addr}"]`); if(!el) return;  
    el.classList.remove("yes","nope"); void el.offsetWidth; el.classList.add(ok?"yes":"nope"); SND.loop();  
    setTimeout(()=>el.classList.remove("yes","nope"),Math.max(350,T()*.9)); }  
  async function animateAct(r,kind){  
    const bot=$("bot"), t=T(), c=cellEl(G.S.r,G.S.c), [x,y]=center(c);  
    if(r.k==="bad"){ SND.crash(); c.classList.add("flash"); bot.classList.add("shake"); setTimeout(()=>bot.classList.remove("shake"),400);  
      floatText(x,y-20,"¡Ups!","#FF5A62"); await sleep(t*.8); return; }  
    G.S=r.S;  
    if(kind==="penon"||kind==="penoff"){ bot.classList.toggle("pen",G.S.pen); SND.add();  
      floatText(x,y-24,G.S.pen?"¡Pincel!":"Guardado",G.S.pen?"#7E3DB0":"#5F7F96");  
      if(r.pnt){ c.classList.add("pnt"); SND.paint(); burst(x,y,["#4C8DF6","#2563C9","#9CC3FF","#FFFFFF"],12,4); }  
      await sleep(t*.6); renderStatus(); return; }  
    if(kind==="paint"){ c.classList.add("pnt"); SND.paint(); burst(x,y,["#4C8DF6","#2563C9","#9CC3FF","#FFFFFF"],14,4);  
      if(r.ok) floatText(x,y-24,"¡Pintada!","#2563C9"); }  
    else { bot.classList.remove("boogie"); void bot.offsetWidth; bot.classList.add("boogie"); SND.dance();  
      if(r.ok){ c.classList.add("danced"); burst(x,y,["#1EC48C","#FFC21A","#FF6FB5","#FFFFFF"],16,5); floatText(x,y-24,"♪ ♫","#11986A"); } }  
    await sleep(t); bot.classList.remove("boogie");  
    renderStatus();  
  }  
  async function animate(r,dir){  
    const bot=$("bot"), t=T(); bot.dataset.look=dir;  
    if(r.k==="crash"){ const [dr,dc]=DIRS[dir]; place(G.S,dc*.32,dr*.32); SND.crash(); await sleep(t*.45); place(G.S);  
      bot.classList.add("shake"); setTimeout(()=>bot.classList.remove("shake"),400); bumpEl($("gBoard"));  
      const [x,y]=center(bot); burst(x+dc*G.step*.4,y+dr*G.step*.4,["#FF5A62","#FF9A2E","#FFC21A"],14,5); floatText(x,y-20,"¡Pum!","#FF5A62");  
      if(r.why==="rock") cellEl(r.r,r.c).classList.add("flash"); await sleep(t*.5); return; }  
    const prev=cellEl(G.S.r,G.S.c); prev.style.setProperty("--tc",RAIN[G.trail++%RAIN.length]); prev.classList.add("trail");  
    G.S=r.S; bot.classList.add("moving"); place(G.S); SND.move();  
    const [px,py]=center(prev); sparkle(px,py);  
    await sleep(t); bot.classList.remove("moving");  
    if(r.pnt){ const c=cellEl(G.S.r,G.S.c); c.classList.add("pnt"); SND.paint(); const [x,y]=center(c); burst(x,y,["#4C8DF6","#2563C9","#9CC3FF"],8,3); }  
    if(r.bat){ const c=cellEl(G.S.r,G.S.c); c.classList.add("got"); SND.bat();  
      const [x,y]=center(c); burst(x,y,["#1EC48C","#7BE6BD","#FFC21A","#FFFFFF"],22,6); floatText(x,y-24,"+1 ⚡","#11986A"); }  
    renderStatus();  
  }  
  function finish(res,last){  
    document.querySelectorAll("#canvas .on").forEach(x=>x.classList.remove("on"));  
    if(res.k==="win"&&G.map.ch) return chLevelWin(res);  
    if(res.k==="win"){  
      const count=used(), usedRep=hasRepeat(G.prog), k=starsFor(G.map,count,usedRep,G.opt,G.hint,G.S.wrong);  
      let gained=0, opened=[];
      const map=G.map, part=map.id!=="custom"&&map.part, wasDone=part&&partDone(SAVE.stars,part);
      if(G.map.id!=="custom"){ const old=SAVE.stars[G.map.id]||0;
        if(k>old){ const before=groupsNow(); SAVE.stars[G.map.id]=k; gained=k-old; persist(); renderTopStars();
          opened=groupsNow().filter((s,i)=>s.open&&!before[i].open).map(s=>s.g.title); } }
      let sub;
      if(G.map.cls===2&&!usedRep) sub=`${ICO.repeat("#D9780F")} ¿Probás con repetir?`;
      else if(G.S.wrong) sub=`${ICO.brush("#7E3DB0")} Pintaste ${G.S.wrong>1?G.S.wrong+" celdas que no eran rojas":"una celda que no era roja"}${G.tools.includes("n")?" · Guardá el pincel en las blancas":""}`;
      else if(G.opt!=null&&count>G.opt) sub=`${ICO.blocks()} Se puede con <b>${G.opt}</b> bloques`;
      else sub=G.map.need?"¡Llegó pintando!":"¡Programa perfecto!";
      if(G.hint&&k<3) sub+=" · Sin pista ganás 3 estrellas";
      if(res.left) sub+=" · Sobraron bloques";
      const idx=MISSIONS.indexOf(G.map), nxt=MISSIONS[idx+1], gs=nxt&&groupsNow().find(s=>s.g.id===nxt.grp);
      let extra=`<div class="bigstars">${starRow(k)}</div>`;
      if(opened.length) extra+=`<div class="unl">${ICO.unlock()} ¡Desbloqueaste «${opened.join("» y «")}»!</div>`;
      /* se acaba de terminar la parte y falta su desafío: volver al menú e invitar a jugarlo */
      const ch=part&&!wasDone&&partDone(SAVE.stars,part)&&chOf(part), toCh=ch&&!SAVE.stars[ch.id];
      if(toCh) extra+=`<div class="unl">${ICO.clock()} ¡Se abrió el ${ch.title}!</div>`;
      else if(idx>=0&&gs&&gs.open) extra+=`<button class="nextbtn" data-next="${nxt.id}">Siguiente${ICO.next()}</button>`;
      say("ok",ICO.star(),hasE(G.map)?"¡Llegó!":"¡Listo!",sub,extra);
      celebrate(gained);
      if(toCh) setTimeout(()=>{ if(SCREEN!=="game"||G.map!==map) return; stopRun(); renderMenu(); show("menu"); chModal(ch); },2800);
      if(opened.length) setTimeout(()=>{ SND.unlock(); confetti(); },1600);
      return;
    }  
    if(res.k==="crash"){ const el=last&&document.querySelector(`#canvas .blk[data-a="${last}"]`); el&&el.classList.add("err");  
      say("err",ICO.burst(),res.why==="out"?"¡Ahí no hay camino!":"¡Chocó!","Mirá el bloque rojo"); return; }  
    if(res.k==="bad"){ const el=last&&document.querySelector(`#canvas .blk[data-a="${last}"]`); el&&el.classList.add("err");  
      return res.why==="p"?say("err",ICO.brush("#FF5A62"),"¡Esa celda no era roja!","Solo se pintan las rojas: usá el bloque si")  
                          :say("err",ICO.music("#FF5A62"),"¡Ahí no se baila!","Solo en las celdas verdes: usá el bloque si"); }  
    SND.fail();  
    if(res.k==="long") return say("err",ICO.hourglass(),"¡Muy largo!","Revisá los números de repetir");  
    const g=goalLeft(G.map,G.S), toStar=hasE(G.map)?", después a la estrella":"";  
    if(g.bat) return say("warn",ICO.bat(),G.nB>1?"Faltan baterías":"Falta la batería","Primero las baterías, después la estrella");  
    if(g.red) return say("warn",ICO.brush("#FF5A62"),g.red>1?`Faltan pintar ${g.red} rojas`:"Falta pintar 1 roja",`Pintá todas las rojas${toStar}`);  
    if(g.green) return say("warn",ICO.music("#11986A"),g.green>1?`Faltan bailar en ${g.green} verdes`:"Falta bailar en 1 verde","En cada verde, ¡a bailar!");  
    if(g.need) return say("warn",ICO.brush("#7E3DB0"),g.need>1?`Faltan pintar ${g.need} celdas`:"Falta pintar 1 celda",`Tenés que pintar ${G.map.need}${toStar}`);  
    say("warn",ICO.question(),"No llegó todavía","¿Qué bloque falta?");  
  }  
  function celebrate(gained){  
    SND.win(); confetti(); $("gBoard").classList.add("win");  
    const bot=$("bot"); bot.classList.add("happy"); setTimeout(()=>bot.classList.remove("happy"),2100);  
    const [x,y]=center(cellEl(G.S.r,G.S.c)); burst(x,y,["#FFC21A","#FFE27A","#FFFFFF","#FF6FB5"],26,8);  
    if(gained){ renderWallet(wallet()-gained); setTimeout(()=>flyStars($("msg").querySelector(".bigstars")||bot,gained),700); }  
  }  
  function stopRun(){ if(!G) return; G.run++; releaseWait(); G.ctx=null; setBusy(false); resetRobot(); }  
    
  /* ---------- desafío extra: cronómetro que suma (se pausa entre niveles) ---------- */  
  let CH=null, chTick=null;  
  function chMs(){ return CH?CH.acc+(CH.t0!=null?performance.now()-CH.t0:0):0; }  
  function renderTimer(){ if(CH) $("tTimer").innerHTML=ICO.clock()+`<span>${fmtTime(chMs()/1000)}</span>`; }  
  function endChallenge(){ clearInterval(chTick); CH=null; }  
  function startChallenge(ch){ CH={ch,idx:0,acc:0,t0:null}; playLevel(); }  
  function playLevel(){ const m=CH.ch.levels[CH.idx]; PROGS[m.id]=[]; startPlay(m);  
    CH.t0=performance.now(); clearInterval(chTick); chTick=setInterval(renderTimer,250); renderTimer(); }  
  function chLevelWin(res){  
    CH.acc+=performance.now()-CH.t0; CH.t0=null; clearInterval(chTick); renderTimer();  
    G.done=true; setBusy(true); /* nivel cerrado: solo se puede seguir */  
    const ch=CH.ch, left=res.left?" · Sobraron bloques":"";  
    if(CH.idx<ch.levels.length-1){  
      say("ok",ICO.star(),`¡Nivel ${CH.idx+1} superado!`,`${ICO.clock()} El reloj espera hasta que sigas${left}`,`<button class="nextbtn" data-chnext>Nivel ${CH.idx+2}${ICO.next()}</button>`);  
      return celebrate(0); }  
    const sec=Math.floor(CH.acc/1000), k=timeStars(ch,sec), old=SAVE.stars[ch.id]||0, prev=SAVE.best[ch.id], rec=prev==null||sec<prev;  
    const gained=Math.max(0,k-old);  
    if(k>old) SAVE.stars[ch.id]=k; if(rec) SAVE.best[ch.id]=sec; persist();  
    let sub=k<3?`Para ${k+1} estrellas: menos de ${fmtTime(k===2?ch.t3:ch.t2)}`:"¡Tiempo perfecto!";  
    if(!rec) sub+=` · Tu récord: ${fmtTime(prev)}`;  
    let extra=`<div class="bigstars">${starRow(k)}</div>`;  
    if(rec&&prev!=null) extra+=`<div class="unl">${ICO.clock()} ¡Nuevo récord!</div>`;  
    extra+=`<button class="nextbtn" data-chagain>Jugar otra vez${ICO.next()}</button>`;  
    say("ok",ICO.star(),`¡Desafío completo en ${fmtTime(sec)}!`,sub,extra);  
    celebrate(gained);  
  }  
    
  $("runBtn").onclick=()=>run(false); $("stepBtn").onclick=()=>run(true);  
  $("stopBtn").onclick=()=>{ if(G.done) return; stopRun(); $("runBtn").classList.toggle("ready",G.prog.length>0); say("",ICO.robot(),"Listo para empezar","Tocá Ir para probar"); };  
  $("msg").addEventListener("click",e=>{  
    if(CH&&e.target.closest("[data-chnext]")){ stopRun(); CH.idx++; return playLevel(); }  
    if(CH&&e.target.closest("[data-chagain]")){ stopRun(); return startChallenge(CH.ch); }  
    const b=e.target.closest("[data-next]"); if(!b) return;  
    const m=MISSIONS.find(x=>x.id===b.dataset.next); stopRun(); startPlay(m); });  
    
  /* pista: ilumina las próximas casillas del camino más corto (en misiones baja una estrella) */  
  let hintT=null;  
  function clearHint(){ clearTimeout(hintT); document.querySelectorAll("#gBoard .hint").forEach(x=>x.classList.remove("hint")); }  
  $("hintBtn").onclick=()=>{ if(!G||G.busy) return; clearHint();  
    const p=shortest(G.map,G.S); if(!p||!p.length) return;  
    p.slice(0,3).forEach(([r,c],i)=>{ const el=cellEl(r,c); el.style.setProperty("--hd",(i*.25)+"s"); el.classList.add("hint"); });  
    G.hint=true; say("",ICO.bulb(),"Seguí las luces",G.map.id!=="custom"?"Con pista podés ganar hasta 2 estrellas":""); hintT=setTimeout(clearHint,4500); };  
    
  /* ================= taller del robot ================= */  
  let ASK=null;  
  function openShop(){ if(SCREEN==="game") stopRun(); ASK=null; setTop(ICO.palette(),"Taller del robot"); show("shop"); renderShop();  
    const sk=$("skins"); sk.classList.add("intro"); setTimeout(()=>sk.classList.remove("intro"),900); }  
  function renderShop(cheer){  
    const w=wallet();  
    $("ped").innerHTML=`<svg viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`;  
    $("shopName").textContent=SKINS.find(s=>s.id===SAVE.skin).name;  
    $("shopStars").innerHTML=starIco(true)+`Tenés <b>${w}</b> estrellas para gastar`;  
    $("skins").innerHTML=SKINS.map((s,i)=>{ const own=SAVE.owned.includes(s.id), on=SAVE.skin===s.id;  
      const tag=on?`<span class="tag use">${ICO.check()}En uso</span>`:own?`<span class="tag">Usar</span>`  
        :ASK===s.id?`<span class="tag ask">¿Comprar?</span>`:`<span class="tag buy">${starIco(true)}${s.price}</span>`;  
      return `<button class="skin${on?" on":""}${!own&&w<s.price?" poor":""}" data-s="${s.id}" style="--i:${i}"><svg class="prev" viewBox="-50 -50 100 100" data-look="r">${robotSVG({skin:s.id,color:SAVE.color})}</svg><b>${s.name}</b>${tag}</button>`; }).join("");  
    $("swatches").innerHTML=Object.entries(COLORS).map(([id,c])=>`<button class="sw" data-c="${id}" style="--c:${c[0]}" title="${c[3]}" aria-label="${c[3]}" aria-pressed="${SAVE.color===id}"></button>`).join("");  
    renderWallet();  
    if(cheer){ bumpEl($("ped"),"cheer"); const [x,y]=center($("ped")); burst(x,y,RAIN,20,7); }  
  }  
  $("skins").onclick=e=>{ const b=e.target.closest(".skin"); if(!b) return; const s=SKINS.find(x=>x.id===b.dataset.s), w=wallet();  
    if(SAVE.owned.includes(s.id)){ ASK=null; if(SAVE.skin!==s.id){ SAVE.skin=s.id; persist(); SND.snap(); renderShop(true); } return; }  
    if(w<s.price){ bumpEl(b,"no"); SND.nope(); return toast(starIco(true),`Te faltan ${s.price-w} estrellas. ¡Jugá más misiones!`); }  
    if(ASK!==s.id){ ASK=s.id; SND.pick(); return renderShop(); }  
    SAVE.spent+=s.price; SAVE.owned.push(s.id); SAVE.skin=s.id; ASK=null; persist(); SND.buy(); renderShop(true); confetti();  
    toast(ICO.unlock(),`¡Nuevo diseño: ${s.name}!`); };  
  $("swatches").onclick=e=>{ const b=e.target.closest(".sw"); if(!b) return; SAVE.color=b.dataset.c; persist(); SND.add(); renderShop(true); };  
    
  /* ================= editor ================= */  
  let E=null;  
  const TOOLS=[{id:"R",label:"Robot",svg:()=>`<svg viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`},{id:"E",label:"Estrella",svg:goalSVG},  
    {id:"#",label:"Caja",svg:rockSVG},{id:"B",label:"Batería",svg:batSVG},{id:".",label:"Borrar",svg:ICO.eraser}];  
  function blankGrid(s){ return [...Array(s)].map(()=>Array(s).fill(".")); }  
  function openEditor(){  
    E={tool:"#",grid:SAVE.custom?SAVE.custom.rows.map(r=>r.split("")):blankGrid(6)};  
    $("tools").innerHTML=TOOLS.map(t=>`<button class="tool" data-t="${t.id}">${t.svg()}<span>${t.label}</span></button>`).join("");  
    setTop(ICO.pencil(),"Creá tu mapa"); show("editor"); drawEditor();  
    say("",ICO.pencil(),"Elegí y tocá las casillas","Robot, estrella y cajas","","edMsg");  
  }  
  function drawEditor(){  
    document.querySelectorAll("#tools .tool").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===E.tool));  
    document.querySelectorAll("#sizeSeg button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.s===E.grid.length));  
    buildBoard($("eBoard"),E.grid.map(r=>r.join("")),false,Math.min(620,$("eWrap").clientWidth-26),innerWidth>860?innerHeight-130:620);  
  }  
  $("tools").onclick=e=>{ const b=e.target.closest(".tool"); if(!b) return; E.tool=b.dataset.t; drawEditor(); };  
  $("sizeSeg").onclick=e=>{ const b=e.target.closest("button"); if(!b) return; E.grid=blankGrid(+b.dataset.s); drawEditor(); };  
  $("edClear").onclick=()=>{ E.grid=blankGrid(E.grid.length); drawEditor(); };  
  $("eBoard").onclick=e=>{ const c=e.target.closest(".cell"); if(!c) return; const r=+c.dataset.r, col=+c.dataset.c, cur=E.grid[r][col];  
    if(["R","E","B"].includes(E.tool)) E.grid.forEach(row=>row.forEach((v,i)=>{ if(v===E.tool) row[i]="."; }));  
    E.grid[r][col]=(E.tool==="#"&&cur==="#")?".":E.tool; SND.add(); drawEditor(); };  
  $("edPlay").onclick=()=>{ const rows=E.grid.map(r=>r.join(""));  
    if(!find(rows,"R")) return say("warn",ICO.robot(),"Falta el robot","","","edMsg");  
    if(!find(rows,"E")) return say("warn",ICO.star(),"Falta la estrella","","","edMsg");  
    const map={id:"custom",cls:0,title:"Mi mapa",rows};  
    if(!shortest(map,startState(map))) return say("err",rockSVG(),"No hay camino","Sacá alguna caja","","edMsg");  
    SAVE.custom=map; persist(); PROGS.custom=[]; startPlay(map); };  
    
  addEventListener("resize",()=>{ clearTimeout(window._rz); window._rz=setTimeout(()=>{  
    if(SCREEN==="game"&&G&&!G.busy) drawBoard(true); else if(SCREEN==="editor") drawEditor(); },200); });  
    
  if(PROFE) $("logo").insertAdjacentHTML("beforeend",`<span class="profe">Modo profe · todo desbloqueado</span>`);  
  renderMenu();  
  if(/[?&]test/.test(location.search)){ const box=document.createElement("div"); box.className="testbox";  
    box.innerHTML="<h3>Autoverificación</h3>"+selfTest().map(r=>`<div>${r.ok?"✔":"✖"} ${r.title} — ${r.info}</div>`).join(""); document.body.appendChild(box); }  
  
}
