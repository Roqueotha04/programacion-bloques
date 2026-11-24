// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
"use client";

import { PARTS, GROUPS, MISSIONS, CHALLENGES, CLASS_CODES, applyKids, applyPython } from "./data";
import {
  ACTS, DIRS, MAXSTEPS, MAXACT, countProgram, hasCall, parseSol, cellColor, cellsOf, sense, pickWorlds, worldMap, countB, countBlocks, find,
  fmtTime, goalLeft, goalMet, groupState, hasE, hasRepeat, hasRepeatAll, limitFor, maxStars, optFor, starsAdv, starsPy,
  chOf, gateTxt, partDone, partName, selfTest, shortest, starsFor, startState, timeStars,
  tryAct, tryMove, walk,
} from "./engine";
import { parsePy, pyWalk, pyLines, pyMissing, PY_REQ_TIP, blocksToPy, pyHTML } from "./python";
import { freshSave, isKids, isProfe, isPython, saveKey } from "./save";

let booted = false;
export function boot() {
  if (booted) return;
  booted = true;
  const PY_ED=isPython(); /* edición Python (?python): reemplaza las partes; tiene prioridad sobre ?chicos */
  if (PY_ED) applyPython(); else if (isKids()) applyKids();
  const LABEL={u:"Arriba",d:"Abajo",l:"Izquierda",r:"Derecha"};
  
  const $=id=>document.getElementById(id);
  
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  
  const RM=matchMedia("(prefers-reduced-motion: reduce)");
  
  
  
  /* ================= guardado ================= */
  
  const PROFE=isProfe();
  const KEY=saveKey();
  const FRESH=freshSave;
  
  let SAVE=FRESH();
  
  try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s){
    const hadBody=!!s.body; SAVE=Object.assign(SAVE,s);
    if(!hadBody){ if(!s.color||s.color==="cel"){ SAVE.color="marino"; SAVE.body="gris"; } else SAVE.body="blanco"; } }
  }catch(e){}
  if(!SAVE.body) SAVE.body="gris";
  if(!SAVE.face) SAVE.face="normal";
  if(!Array.isArray(SAVE.faces)) SAVE.faces=["normal"];
  else if(!SAVE.faces.includes("normal")) SAVE.faces.unshift("normal");
  if(!["robi","gato","astro","dino","lentes","rayo","caballero","rey"].includes(SAVE.skin)) SAVE.skin="robi";
  if(!Array.isArray(SAVE.codes)) SAVE.codes=[];
  function applyProfe(){ if(PROFE){ SAVE.seen=GROUPS.map(g=>g.id).concat(CHALLENGES.map(c=>c.id)); SAVE.owned=["robi","gato","chica","astro","dino","princesa","lentes","rayo","caballero","valquiria","rey"]; SAVE.faces=["normal","guino","enojado","cool"]; } }
  /* el desafío de cada parte se abre al terminar (con al menos 1 estrella) todos sus niveles */
  
  function chOpen(ch){ return PROFE||partDone(SAVE.stars,ch.part); }
  
  applyProfe();
  
  function groupsNow(){ const gs=groupState(SAVE.stars,SAVE.codes); if(PROFE) gs.forEach(s=>s.open=true); return gs; }
  
  function persist(){ try{ localStorage.setItem(KEY,JSON.stringify(SAVE)); }catch(e){} }
  
  const earned=()=>Object.values(SAVE.stars).reduce((a,b)=>a+b,0);
  
  const wallet=()=>earned()-SAVE.spent;
  
  
  
  /* ================= dibujos ================= */
  
  /* cuerpo: relleno de la cara. detalle: [fuerte, claro, nombre] para aro, cuello y costados */
  const BODIES={gris:["#E4EBF3","Gris"],blanco:["#FFFFFF","Blanco"],cel:["#D7F0FF","Celeste"],ver:["#D8F8EC","Verde"],nar:["#FFE8CC","Naranja"],ros:["#FFD9EC","Rosa"],vio:["#E6DEFF","Violeta"],ama:["#FFF3C4","Amarillo"]};
  const ACCENTS={marino:["#14325C","#C5D9F0","Marino"],cel:["#2FB0F0","#BDE8FF","Celeste"],ver:["#1EC48C","#BFF3DF","Verde"],nar:["#FF9A2E","#FFDDB8","Naranja"],ros:["#FF6FB5","#FFD0E6","Rosa"],vio:["#8B6CF0","#DCD2FF","Violeta"],ama:["#F5B800","#FFEBA6","Amarillo"]};
  const SKINS=[{id:"robi",name:"GENI",price:0},{id:"gato",name:"Gatobot",price:6},{id:"chica",name:"Chica bot",price:9},{id:"astro",name:"Astro",price:12},{id:"dino",name:"Dinobot",price:18},{id:"princesa",name:"Princess",price:21},{id:"lentes",name:"Lentes",price:24},{id:"rayo",name:"Rayo",price:30},{id:"caballero",name:"Caballero",price:36},{id:"valquiria",name:"Valquiria bot",price:39},{id:"rey",name:"Rey Robot",price:42},
    {id:"mega",name:"67 BOT",price:0,secret:"mega"},{id:"dios",name:"DIOS BOT",price:0,secret:"dios"}];
  /* robots secretos: no se compran, se ganan. Los desafíos cuentan solo si se jugaron (mira el mejor tiempo, así los códigos de clase no los regalan) */
  const all3=ms=>ms.every(m=>(SAVE.stars[m.id]||0)>=maxStars(m));
  const chPlayed3=ch=>{ const b=SAVE.best[ch.id]; return b!=null&&timeStars(ch,b)>=3; };
  const SECRETS={
    /* (si la edición no tiene Repetir, como la de Python, no se regala: hace falta al menos un nivel) */
    mega:{hint:"sacá 3 estrellas en todos los niveles de Repetir y Repetir avanzado, y en el Desafío de repetir",ok:()=>{ const ms=MISSIONS.filter(m=>!m.py&&(m.part===4||m.part===4.5)); return ms.length>0&&all3(ms)&&CHALLENGES.filter(c=>c.part===4).every(chPlayed3); }},
    dios:{hint:"sacá 3 estrellas en todos los niveles y todos los desafíos del juego",ok:()=>all3(MISSIONS)&&CHALLENGES.every(chPlayed3)}};
  function secretOk(s){ return !s.secret||PROFE||SECRETS[s.secret].ok(); }
  const skinOwned=s=>SAVE.owned.includes(s.id)||(!!s.secret&&secretOk(s));
  const lockedSecrets=()=>SKINS.filter(s=>s.secret&&!skinOwned(s));
  const secretMsgs=before=>before.filter(skinOwned).map(s=>`<div class="unl">${ICO.unlock()} ¡Ganaste un robot secreto: ${s.name}! Buscalo en el taller</div>`).join("");
  const FACES=[{id:"normal",name:"Normal",price:0},{id:"guino",name:"Guiño",price:8},{id:"enojado",name:"Enojado",price:12},{id:"cool",name:"Cool",price:16}];
  function robotSVG(o){
    o=Object.assign({skin:SAVE.skin,color:SAVE.color,body:SAVE.body,face:SAVE.face},o||{});
    let [m,l]=ACCENTS[o.color]||ACCENTS.marino, b=(BODIES[o.body]||BODIES.gris)[0], k="#0D3049";
    const s=o.skin, f=FACES.some(x=>x.id===o.face)?o.face:"normal";
    if(s==="mega"){ m="#0B0F1A"; l="#22D3FF"; b="#151A27"; k="#22D3FF"; } /* 67 BOT: negro con azul neón, sin importar los colores elegidos */
    if(s==="dios"){ m="#F1F4F9"; l="#FFD34D"; b="#FFFFFF"; k="#B8901A"; } /* DIOS BOT: blanco y dorado */
    const sw=`stroke="${k}" stroke-width="2.5" stroke-linejoin="round"`;
    const eye=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#57E1FF"/>`;
    let pupils=eye(-13,-16,8,12)+eye(5,-16,8,12);
    let mouth=`<path d="M-6 11 Q0 15 6 11" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if(f==="guino") pupils=eye(-13,-16,8,12)+`<rect x="4" y="-11" width="10" height="3.2" rx="1.6" fill="#57E1FF"/>`;
    if(f==="cool") pupils=`<rect x="-13" y="-12" width="8" height="5" rx="2.5" fill="#57E1FF"/>`+`<rect x="5" y="-12" width="8" height="5" rx="2.5" fill="#57E1FF"/>`, mouth=`<path d="M-4 12 Q2 16 8 11" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if(f==="enojado") pupils=`<path d="M-15 -21 L-4 -17" stroke="#57E1FF" stroke-width="2.3" fill="none" stroke-linecap="round"/>`+eye(-13,-15,8,11)+`<path d="M15 -21 L4 -17" stroke="#57E1FF" stroke-width="2.3" fill="none" stroke-linecap="round"/>`+eye(5,-15,8,11), mouth=`<path d="M-6 14 Q0 10 6 14" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    let back="", front="";
    const antenna=`<line x1="0" y1="-31" x2="0" y2="-40" stroke="${k}" stroke-width="2.5" stroke-linecap="round"/><circle cx="0" cy="-43" r="5" fill="${l}" ${sw}/>`;
  
    if(s==="robi") back=antenna;
  
    if(s==="gato"){
  
      back=`<path d="M-27 -20 L-22 -47 L-5 -31Z" fill="${m}" ${sw}/><path d="M27 -20 L22 -47 L5 -31Z" fill="${m}" ${sw}/><path d="M-21 -30 L-20 -40 L-12 -33Z" fill="#FFB3D1"/><path d="M21 -30 L20 -40 L12 -33Z" fill="#FFB3D1"/>`;
  
      front=`<path d="M-30 4 L-45 0 M-30 9 L-45 11 M30 4 L45 0 M30 9 L45 11" stroke="${k}" stroke-width="2" stroke-linecap="round"/><path d="M-2.5 7 h5 l-2.5 3z" fill="#FF6FB5"/>`;
      if(f==="normal") mouth=`<path d="M-7 11 Q-3.5 15 0 11 Q3.5 15 7 11" stroke="${m}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; }
    if(s==="astro"){
  
      back=`<path d="M-17 22 L-30 33 L-17 30Z M17 22 L30 33 L17 30Z" fill="${m}" ${sw}/>`;
  
      front=`<circle cx="0" cy="-6" r="40" fill="rgba(190,232,255,.25)" ${sw}/><path d="M-27 -27 A32 32 0 0 1 -8 -40" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="24" cy="-30" r="2.5" fill="#fff"/>`; }
  
    if(s==="dino"){
  
      back=`<path d="M-15 25 Q-40 30 -47 8 Q-36 19 -18 15Z" fill="${m}" ${sw}/><path d="M-22 -29 L-16 -44 L-9 -31 L-2 -47 L5 -31 L12 -44 L19 -29Z" fill="${m}" ${sw}/>`;
  
      if(f==="normal") front=`<path d="M-4 11.5 L-2 15 L0 12 L2 15 L4 11.5" fill="#fff" stroke="${k}" stroke-width="1.2" stroke-linejoin="round"/>`; }
    if(s==="lentes"){
      front=`<rect x="-22" y="-21" width="19" height="15" rx="6" fill="#121820" stroke="${k}" stroke-width="2.4"/><rect x="3" y="-21" width="19" height="15" rx="6" fill="#121820" stroke="${k}" stroke-width="2.4"/><path d="M-3 -14h6" stroke="${k}" stroke-width="2.8" fill="none"/><path d="M-22 -15H-33M22 -15H33" stroke="${k}" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M-18 -18h8M7 -18h6" stroke="#9EC9F5" stroke-width="1.7" stroke-linecap="round" fill="none"/>`; }
    if(s==="rayo"){
      back=`<path d="M-16 -6 L-44 -22 L-36 -2Z" fill="${m}" ${sw}/><path d="M16 -6 L44 -22 L36 -2Z" fill="${m}" ${sw}/>`;
      front=`<path d="M-24 -26 H24 L18 -16 H-18Z" fill="${m}" ${sw}/><path d="M15 3 L18 0 L16.4 5.2 L20 5.2 L14.6 12 L16.2 6.8 L12.4 6.8Z" fill="#FFC21A" stroke="${k}" stroke-width="1.3" stroke-linejoin="round"/>`; }
    if(s==="caballero"){
      back=`<path d="M-1 -34 C-10 -58 8 -64 5 -34Z" fill="#E10600" ${sw}/><path d="M2 -34 C8 -56 18 -60 9 -32Z" fill="#FF5A62" ${sw}/>`;
      front=`<path d="M-30 -4 L-26 -34 H26 L30 -4 L18 -4 L16 -28 H-16 L-18 -4Z" fill="${m}" ${sw}/>`; }
    if(s==="rey"){
      back=`<path d="M-32 -4 Q-50 34 -38 40 H38 Q50 34 32 -4Z" fill="#C8102E" ${sw}/>`;
      front=`<path d="M-24 -34 L-28 -62 L-13 -44 L0 -68 L13 -44 L28 -62 L24 -34Z" fill="#FFC21A" ${sw}/><circle cx="0" cy="-50" r="4" fill="#FF5A62" stroke="${k}" stroke-width="1.4"/><circle cx="-13" cy="-43" r="2.8" fill="#57E1FF" stroke="${k}" stroke-width="1.2"/><circle cx="13" cy="-43" r="2.8" fill="#7DFFB2" stroke="${k}" stroke-width="1.2"/>`; }
    /* chicas: pestañas y cachetes (con la cara normal o guiño) */
    const lashes=f==="normal"||f==="guino"?`<path d="M-12 -17 L-14 -21 M-9 -17 L-9 -22 M-6 -17 L-4 -21 M6 -17 L4 -21 M9 -17 L9 -22 M12 -17 L14 -21" stroke="#57E1FF" stroke-width="1.6" stroke-linecap="round"/>`:"";
    const blush=`<circle cx="-20" cy="10" r="4" fill="#FF9CCB" opacity=".85"/><circle cx="20" cy="10" r="4" fill="#FF9CCB" opacity=".85"/>`;
    if(s==="chica")
      front=`<path d="M12 -33 L0 -44 L1 -24Z" fill="#FF6FB5" ${sw}/><path d="M12 -33 L25 -43 L23 -23Z" fill="#FF6FB5" ${sw}/><circle cx="12" cy="-33" r="4.5" fill="#FF9CCB" ${sw}/>`+lashes+blush;
    if(s==="princesa"){
      back=`<path d="M-31 -12 Q-34 -42 0 -42 Q34 -42 31 -12 Q40 14 36 34 Q28 30 26 18 H-26 Q-28 30 -36 34 Q-40 14 -31 -12Z" fill="#FFC94D" ${sw}/>`;
      front=`<path d="M-15 -30 L-13 -41 L-6 -34 L0 -45 L6 -34 L13 -41 L15 -30Z" fill="#FFD84D" ${sw}/><circle cx="0" cy="-36" r="3" fill="#FF6FB5" stroke="${k}" stroke-width="1.2"/>`+lashes+blush; }
    if(s==="valquiria"){
      const braid=x=>[6,15,24,33].map(y=>`<circle cx="${x}" cy="${y}" r="4.6" fill="#F5B800" stroke="${k}" stroke-width="2"/>`).join("");
      back=`<path d="M-26 -24 C-44 -30 -52 -46 -46 -60 C-40 -48 -33 -44 -24 -40Z" fill="#fff" ${sw}/><path d="M26 -24 C44 -30 52 -46 46 -60 C40 -48 33 -44 24 -40Z" fill="#fff" ${sw}/>`+
        `<path d="M-29 -30 Q-39 -37 -41 -49 M-33 -26 Q-45 -32 -47 -43 M29 -30 Q39 -37 41 -49 M33 -26 Q45 -32 47 -43" stroke="${k}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`+braid(-31)+braid(31);
      front=`<path d="M-29 -10 C-31 -46 31 -46 29 -10 L24 -10 C24 -33 -24 -33 -24 -10Z" fill="#C5CFDD" ${sw}/><path d="M-3 -33 H3 V-20 L0 -17 L-3 -20Z" fill="#C5CFDD" ${sw}/>`+lashes+blush; }
    if(s==="mega"){
      mouth=mouth.split(m).join(l);
      back=`<path d="M-21 -29 L-33 -55 L-9 -33Z" fill="${m}" ${sw}/><path d="M21 -29 L33 -55 L9 -33Z" fill="${m}" ${sw}/><path d="M-27 -36 L-31 -46 M27 -36 L31 -46" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`+
        `<path d="M-38 -12 L-52 -24 L-46 -2Z" fill="${m}" ${sw}/><path d="M38 -12 L52 -24 L46 -2Z" fill="${m}" ${sw}/>`;
      front=`<path d="M-24 -27 H24" stroke="${l}" stroke-width="2" stroke-linecap="round"/><path d="M-26 10 L-20 16 M26 10 L20 16" stroke="${l}" stroke-width="2" stroke-linecap="round"/>`+
        `<path d="M-3 18 L3 18 L0 24Z M-10 22 H-6 M6 22 H10" fill="${l}" stroke="${l}" stroke-width="1.6" stroke-linecap="round"/>`; }
    if(s==="dios"){
      pupils=f==="normal"?`<rect x="-15" y="-18" width="11" height="14" rx="4" fill="#FFE680"/><rect x="4" y="-18" width="11" height="14" rx="4" fill="#FFE680"/><circle cx="-9.5" cy="-11" r="2.6" fill="#fff"/><circle cx="9.5" cy="-11" r="2.6" fill="#fff"/>`:pupils.split("#57E1FF").join("#FFE680");
      mouth="";
      back=`<ellipse cx="0" cy="-52" rx="21" ry="5.5" fill="none" stroke="#FFD34D" stroke-width="4"/>`+
        `<path d="M-30 -18 Q-46 -46 -16 -46 Q0 -58 16 -46 Q46 -46 30 -18 Q50 6 40 30 Q30 22 28 10 H-28 Q-30 22 -40 30 Q-50 6 -30 -18Z" fill="#FFFFFF" ${sw}/>`;
      front=`<path d="M-18 -26 Q-10 -31 -3 -25 M18 -26 Q10 -31 3 -25" stroke="#D4A82A" stroke-width="3.4" fill="none" stroke-linecap="round"/>`+
        `<path d="M-27 2 Q-30 26 -16 38 Q-10 50 0 44 Q10 50 16 38 Q30 26 27 2 Q14 10 0 8 Q-14 10 -27 2Z" fill="#FFFFFF" ${sw}/>`+
        `<path d="M-12 18 Q-10 28 -8 34 M0 16 V38 M12 18 Q10 28 8 34" stroke="#D9DEE8" stroke-width="2" fill="none" stroke-linecap="round"/>`+
        `<path d="M-15 5 Q-8 0 0 5 Q8 0 15 5 Q9 10 0 8 Q-9 10 -15 5Z" fill="#FFFFFF" ${sw}/>`; }
    const scr=s==="mega"?"#05070D":s==="dios"?"#2B2340":"#0D3049", glow=s==="mega"?"#22D3FF":s==="dios"?"#FFD34D":"";
    const core=`<g class="flame"><path d="M-10 30 Q0 52 10 30Z" fill="${l}"/><path d="M-5 30 Q0 43 5 30Z" fill="#fff"/></g>${back}
   <rect x="-19" y="14" width="38" height="16" rx="7" fill="${m}" ${sw}/>
   <circle cx="-33" cy="-6" r="8" fill="${m}" ${sw}/><circle cx="33" cy="-6" r="8" fill="${m}" ${sw}/>
   <rect x="-29" y="-32" width="58" height="54" rx="22" fill="${b}" ${sw}/>
   <rect x="-21" y="-23" width="42" height="26" rx="12" fill="${scr}"/>
   <g class="pupils">${pupils}</g>
   ${mouth}${front}`;
    /* robots secretos: brillo alrededor */
    return glow?`<defs><filter id="glow-${s}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="${glow}" flood-opacity=".9"/></filter></defs><g filter="url(#glow-${s})">${core}</g>`:core; }
  function rockSVG(){ return `<svg viewBox="0 0 100 100"><polygon points="50,12 86,31 50,50 14,31" fill="#D3DEE8" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>
  
   <polygon points="14,31 50,50 50,90 14,71" fill="#9CB0C2" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>
  
   <polygon points="86,31 50,50 50,90 86,71" fill="#7590A8" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>
  
   <path d="M23 46v16M32 51v16" stroke="#C3D2DF" stroke-width="3" stroke-linecap="round"/></svg>`; }
  
  function starPts(r,cx=50,cy=52){ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; p.push((cx+rr*Math.cos(a)).toFixed(1)+","+(cy+rr*Math.sin(a)).toFixed(1)); } return p.join(" "); }
  
  function goalSVG(){ return `<svg class="goal" viewBox="0 0 100 100"><circle cx="50" cy="52" r="42" fill="#FFF3C4" opacity=".75"/><polygon points="${starPts(40)}" fill="#FFC21A" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/><polygon points="${starPts(16)}" fill="#FFE27A"/></svg>`; }
  
  function batSVG(){ return `<svg class="bat" viewBox="0 0 100 100"><rect x="41" y="10" width="18" height="9" rx="2.5" fill="#0D3049"/><rect x="27" y="17" width="46" height="72" rx="11" fill="#fff" stroke="#0D3049" stroke-width="3.5"/>
  
   <rect x="35" y="26" width="30" height="15" rx="4" fill="#1EC48C"/><rect x="35" y="45" width="30" height="15" rx="4" fill="#1EC48C"/><rect x="35" y="64" width="30" height="16" rx="4" fill="#1EC48C"/></svg>`; }
  
  function starIco(on,dim="#D6E6F2"){ return `<svg viewBox="0 0 100 100"><polygon points="${starPts(46,50,53)}" fill="${on?"#FFC21A":dim}" stroke="${on?"#0D3049":"none"}" stroke-width="4" stroke-linejoin="round"/></svg>`; }
  
  function starRow(k,dim,n=3){ return Array.from({length:n},(_,i)=>starIco(i<k,dim)).join(""); }
  
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
  
    check:()=>`<svg viewBox="0 0 32 32"><path d="M6 17l6 6L26 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    code:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M11 9 4 16l7 7M21 9l7 7-7 7M18.5 5.5l-5 21" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`

  };
  
  $("ico3").innerHTML=ICO.pencil(); $("walletIco").innerHTML=starIco(true);
  
  $("icoRun").innerHTML=ICO.flag(); $("icoStep").innerHTML=ICO.step(); $("icoStop").innerHTML=ICO.restart(); $("icoHint").innerHTML=ICO.bulb();
  
  $("codeBtn").innerHTML=ICO.lock("#fff")+"<span>Código</span>"; $("trash").innerHTML=ICO.trash(); $("backBtn").innerHTML=ICO.back()+"<span>Misiones</span>";
  
  $("edPlay").innerHTML=ICO.flag()+"Jugar este mapa";
  
  $("shopBtn").innerHTML=ICO.palette()+"<span>Taller del robot</span>";
  
  $("resetBtn").innerHTML=ICO.trash("currentColor")+"Borrar progreso";
  
  const RAIN=["#FFC21A","#1EC48C","#2FB0F0","#57E1FF","#FF9A2E","#FF5A62","#FF6FB5","#8B6CF0"];
  
  const pick=a=>a[Math.random()*a.length|0];
  
  { let i=0; $("heroTitle").innerHTML="Programa con GENI".split(" ").map(w=>`<b class="word">${[...w].map(ch=>`<span aria-hidden="true" style="--i:${i++};color:${w==="GENI"?"#3E6FA8":"#14325C"}">${ch}</span>`).join("")}</b>`).join(" "); }
  $("sky").innerHTML=Array.from({length:30},(_,i)=>{ const navy=i%10<3;
    return `<i class="${i%3===0?"st":""}${navy?" nv":""}" style="--x:${Math.random()*100}%;--s:${18+Math.random()*46}px;--c:${navy?"#14325C":pick(RAIN)};--d:${18+Math.random()*22}s;--dl:-${Math.random()*40}s"></i>`; }).join("");
  
  
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
  
    dizzy:()=>[392,330,392,311,370,294,349,262].forEach((f,i)=>tone(f,.2,"sine",.1,i*.15)),
    boom:()=>{ tone(60,.9,"sawtooth",.2); tone(90,.7,"square",.1,.02); [220,170,130,90,60].forEach((f,i)=>tone(f,.3,"sawtooth",.14,i*.06)); tone(1400,.25,"square",.05,.01); tone(800,.4,"triangle",.07,.1); }, win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.22,"triangle",.12,i*.11)), fail:()=>{tone(330,.18,"triangle");tone(262,.28,"triangle",.12,.16)} };
  
  
  
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
  
    $("backBtn").classList.toggle("hidden",id==="menu"); $("codeBtn").classList.toggle("hidden",id!=="menu"); $("logo").classList.toggle("hidden",id!=="menu");
  
    $("tTitle").classList.toggle("hidden",id==="menu"); $("tStars").classList.toggle("hidden",id!=="game"||inCh); $("tTimer").classList.toggle("hidden",!inCh); }
  
  function setTop(num,name){ $("tNum").innerHTML=num; $("tName").textContent=name; }
  
  function renderTopStars(){ const k=G&&G.map.id!=="custom"?(SAVE.stars[G.map.id]||0):0; $("tStars").innerHTML=starRow(k,"rgba(255,255,255,.45)",G?maxStars(G.map):3); }
  
  $("backBtn").onclick=()=>{ if(SCREEN==="game") stopRun(); renderMenu(); show("menu"); };
  
  $("wallet").onclick=()=>openShop();
  
  
  
  /* ================= menú ================= */
  
  function miniMap(rows,s=14){ if(s===14) s=Math.max(5,Math.min(14,Math.floor((144-6-2*(rows[0].length-1))/rows[0].length))); /* en las tarjetas, los mapas largos se achican para no salirse */ let h=`<div class="mini" style="grid-template-columns:repeat(${rows[0].length},${s}px);--ms:${s}px">`;
  
    for(const row of rows) for(const ch of row) h+=`<i class="${ch==="#"?"r":ch==="."?"":ch}"></i>`; return h+"</div>"; }
  
  function partIco(P){ const p=P.id; if(P.py) return ICO.code(); return p===1?ICO.arrow("r"):p===2?ICO.brush():p===3?ICO.repeat():p===5?ICO.music():p===4.5||p===5.5?ICO.repeat():ICO.ifq(); }
  
  function lockWhy(st){ return st.gate?`Primero ${gateTxt(SAVE.stars,st.gate,true).replace(/^./,c=>c.toLowerCase())}`:st.needCode?"Pedile el código a tu profe":st.prevLeft?`Primero terminá «${st.prevTitle}»`:`Necesitás ${st.g.need} estrellas de esta parte (tenés ${st.earned})`; }
  
  function renderMenu(){
  
    $("heroBot").innerHTML=robotSVG(); $("logoBot").innerHTML=robotSVG(); renderWallet();
  
    $("total").innerHTML=starIco(true)+`${earned()} estrellas ganadas`;
  
    const GS=groupsNow(); let h="", i=0, fresh=false;
  
    for(const P of PARTS){
  
      /* una card por parte; cada grupo de niveles se abre por separado */
  
      const sts=GS.filter(s=>s.g.part===P.id), ms=MISSIONS.filter(m=>m.part===P.id), got=ms.reduce((a,m)=>a+(SAVE.stars[m.id]||0),0);
  
      h+=`<section class="grp" style="--gc:${P.c};--gl:${P.l}"><div class="grph">`+
  
        `<span class="gdot">${partIco(P)}</span><div><h3>Parte ${P.id} · ${P.title}</h3><span class="gsub">${P.sub}</span></div>`+(P.extra&&ms.length&&ms.every(m=>(SAVE.stars[m.id]||0)>=maxStars(m))?`<span class="plat">${starIco(true)}Platino</span>`:"")+
        (PROFE&&P.code?`<span class="profe">Código: ${P.code}</span>`:"")+
        `<span class="gprog">${starIco(true)} ${got} / ${ms.reduce((a,m)=>a+maxStars(m),0)}</span></div><div class="cards">`;
      for(const st of sts){
  
        const g=st.g, isNew=st.open&&!SAVE.seen.includes(g.id);
  
        if(isNew){ SAVE.seen.push(g.id); fresh=true; }
  
        const need=st.gate?gateTxt(SAVE.stars,st.gate):st.needCode?"Pedile el código a tu profe":st.prevLeft?"Terminá los anteriores":`Juntá ${g.need}${starIco(true)}`;
        h+=st.ms.map(m=>{ const k=SAVE.stars[m.id]||0;
          return `<button class="card${k>=maxStars(m)?" s3":""}${st.open?"":" locked"}${isNew?" new":""}" data-id="${m.id}" data-why="${lockWhy(st)}"${st.needCode?` data-code="${st.needCode}"`:""} style="--i:${i++};--gc:${g.c};--gl:${g.l}"><span class="num">${m.num}</span>${miniMap(m.rows)}<h3>${m.title}</h3>`+
            (st.open?`<div class="stars">${starRow(k,undefined,maxStars(m))}</div>`:`<span class="need">${need}</span><span class="lock">${ICO.lock()}</span>`)+`</button>`; }).join("");
  
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

  /* botón «Código» (arriba a la izquierda): un código de clase marca partes como superadas (3 estrellas, que se acreditan al taller)
     y abre Repetir; también sirve el código de cada parte (genIArepetir, funcionesGENia). Repetir un código no suma dos veces */
  function applyClassCode(cc){ let gained=0; const set=id=>{ const old=SAVE.stars[id]||0; if(old<3){ gained+=3-old; SAVE.stars[id]=3; } };
    cc.parts.filter(p=>PARTS.some(x=>x.id===p)).forEach(p=>{ MISSIONS.filter(m=>m.part===p).forEach(m=>set(m.id)); CHALLENGES.filter(c=>c.part===p).forEach(c=>set(c.id)); });
    (cc.unlock||[]).filter(p=>PARTS.some(x=>x.id===p)&&!SAVE.codes.includes(p)).forEach(p=>SAVE.codes.push(p));
    return gained; }
  function openCodes(){
    const d=openModal(`<span class="mico">${ICO.lock("#FFC21A")}</span><h2>Poné tu código</h2>`+
      `<p>Escribí el código que te dio tu profe.</p>`+
      (PROFE?`<p>${CLASS_CODES.map(c=>escH(c.code)).concat(PARTS.filter(p=>p.code).map(p=>escH(p.code))).join(" · ")}</p>`:"")+
      `<input class="minput" id="codeIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Código" aria-label="Código">`+
      `<div class="mbtns"><button class="mbtn alt" data-later>Cancelar</button><button class="mbtn" data-go>Listo${ICO.next()}</button></div>`);
    const inp=d.querySelector("#codeIn"); setTimeout(()=>inp.focus(),60);
    const go=()=>{ const v=normCode(inp.value); if(!v) return;
      const cc=CLASS_CODES.find(c=>normCode(c.code)===v), P=PARTS.find(p=>p.code&&normCode(p.code)===v);
      if(cc){ const gained=applyClassCode(cc); persist(); closeModal(); renderMenu();
        toast(ICO.unlock(),gained?`¡Código aceptado! +${gained} estrellas para el Taller`:"Ese código ya estaba usado"); }
      else if(P){ const had=SAVE.codes.includes(P.id); if(!had) SAVE.codes.push(P.id); persist(); closeModal(); renderMenu();
        toast(ICO.unlock(),had?"Esa parte ya estaba abierta":`¡Abriste la ${partName(P.id)}!`); }
      else { bumpEl(inp,"no"); SND.nope(); inp.select(); toast(ICO.lock("#FFC21A"),"Ese código no es"); } };
    d.querySelector("[data-go]").onclick=go; inp.addEventListener("keydown",e=>{ if(e.key==="Enter") go(); });
    d.querySelector("[data-later]").onclick=closeModal;
  }
  $("codeBtn").onclick=openCodes;
  /* borrar progreso (para un alumno nuevo): hay que tocar dos veces */
  let resetT=null;
  
  function resetResetBtn(){ clearTimeout(resetT); const b=$("resetBtn"); b.classList.remove("ask"); b.innerHTML=ICO.trash("currentColor")+"Borrar progreso"; }
  
  function askReset(){ const b=$("resetBtn");
  
    if(!b.classList.contains("ask")){ b.classList.add("ask"); b.innerHTML=ICO.trash("#fff")+"¿Seguro? Tocá otra vez"; SND.nope(); resetT=setTimeout(resetResetBtn,4000); return; }
  
    SAVE=FRESH(); applyProfe(); persist(); for(const k in PROGS) delete PROGS[k]; for(const k in FUNCS) delete FUNCS[k]; for(const k in NAMES) delete NAMES[k]; for(const k in PYCODE) delete PYCODE[k];

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
  
    const cs=Math.max(20,Math.min(80,Math.floor(Math.min((availW-6)/m,(availH-6)/n))-3));
  
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
  
  let G=null; const PROGS={}, FUNCS={}, NAMES={}; /* funciones y sus nombres por nivel (no se guardan en localStorage, como PROGS) */
  const PYCODE={}; /* código de Python por nivel (tampoco se guarda en localStorage) */
  const PY_START="def main():\n    ...\n\nmain()\n";
  
  function startPlay(map){
  
    PROGS[map.id]=PROGS[map.id]||[];
    /* funciones: tools «f» (1 función, 2 si el mapa dice fns:2); pre: cuerpos ya armados */
    const fids=(map.tools??"r").includes("f")?(map.fns===2?["A","B"]:["A"]):[];
    if(!FUNCS[map.id]){ FUNCS[map.id]={}; NAMES[map.id]={}; fids.forEach(f=>{ FUNCS[map.id][f]=map.pre&&map.pre[f]?parseSol(map.pre[f]):[]; }); }
  
    const S=startState(map), opt=optFor(map,shortest(map,S));
  
    const tools=map.tools??"r"; /* el mapa propio (cls 0) tiene repetir */
  
    G={map,rows:map.rows,n:map.rows.length,m:map.rows[0].length,nB:countB(map.rows),nX:cellsOf(map.rows,"X").length,nV:cellsOf(map.rows,"V").length,
  
       prog:PROGS[map.id],funcs:FUNCS[map.id],names:NAMES[map.id],fids,fn:fids.length>0,lock:map.lock||[],run:0,busy:false,ctx:null,S,tools,rep:tools.includes("r"),opt,max:limitFor(map,opt),hint:false};
  
    /* mundos: wm = mapa del mundo que se está jugando, worlds = filas de los mundos de este intento, wi = mundo actual (null si no corre) */
    G.tries=0; G.pathLen=(shortest(map,S)||[]).length; /* adv: intentos fallidos y largo del camino más corto, para las estrellas */
    G.wm=map; G.worlds=map.worlds?pickWorlds(map):null; G.wi=null; G.keepW=false; G.conds=map.conds||(tools.includes("b")?["x","v"]:["x"]);
    /* Python: el programa es texto (G.code); se lee con parsePy al tocar Ir */
    G.py=!!map.py; G.code=G.py?(PYCODE[map.id]??(map.pre??PY_START)):""; G.pyAst=null; $("game").classList.toggle("pymode",G.py);


    setTop(map.num||ICO.pencil(),map.ch?`Desafío · Nivel ${map.num} de 3`:map.title); renderTopStars();

    $("hintBtn").classList.toggle("hidden",!!map.ch||!!map.need||!!map.worlds||map.cls===3||G.py);

    renderPalette(); show("game"); drawBoard(false,true); renderProg(true);
  
    const lim=`Podés usar hasta ${G.max} bloques`, toStar=hasE(map)?", después a la estrella":"";
  
    if(map.ch&&map.num===1){ const ch=CHALLENGES.find(c=>c.id===map.ch);
  
      say("",ICO.clock(),"El reloj mide cuánto tardás",`3 estrellas: menos de ${fmtTime(ch.t3)} · 2 estrellas: menos de ${fmtTime(ch.t2)}`); }
    else if(map.tip) say("",G.py?ICO.code("#3776AB"):ICO.blocks(),map.tip[0],map.tip[1]+(map.goal?` · Meta: ${map.goal} líneas`:""));
    else if(G.py) say("",ICO.code("#3776AB"),"¡Escribí el programa en Python!","Tocá un comando de la izquierda para agregarlo · Ir para probar");

    else if(map.adv) say("",ICO.blocks(),"¡Una función que se llama a sí misma!",`Creá tu función y llamala adentro de ella misma: se repite hasta llegar a la estrella${G.nX||G.nV?" · Pintá las rojas y bailá en las verdes":""} · ${lim}`);
    else if(map.worlds) say("",ICO.ifq("#6366F1"),"¡El mapa cambia!",`Tu programa tiene que funcionar en todos${map.reveal?" · Mirá los mundos de abajo":""} · ${lim}`);
    else if((G.nV||G.nX)&&!tools.includes("i")&&!tools.includes("n")) say("",ICO.music("#11986A"),G.nX?"Pintá las rojas y bailá en las verdes":G.nV>1?"¡Bailá en las celdas verdes!":"¡Bailá en la celda verde!",`Después, a la estrella${map.cls===2?" · "+lim:""}`);
    else if(G.fn) say("",ICO.blocks(),G.fids.every(f=>G.lock.includes(f))?"¡Llamá a la función para ahorrar bloques!":"¡Creá una función y llamala varias veces!",lim);
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
  
  /* cambia al mundo i: redibuja el tablero con sus filas y recalcula los contadores */
  function setWorld(i){ G.wi=i; G.rows=G.worlds[i]; G.wm=worldMap(G.map,G.rows); G.nB=countB(G.rows); G.nX=cellsOf(G.rows,"X").length; G.nV=cellsOf(G.rows,"V").length; drawBoard(false); }
  function resetRobot(){
    if(G.worlds&&!G.keepW){ const back=G.wi>0; G.wi=null; if(back) return setWorld(0); }
    G.S=startState(G.wm); G.trail=0; G.lastGot=null; clearHint();
  
    $("gBoard").querySelectorAll(".cell").forEach(el=>el.classList.remove("trail","got","flash","pnt","danced","scorch"));
  
    $("gBoard").classList.remove("win","bump");
  
    document.querySelectorAll("#canvas .on, #canvas .err").forEach(b=>b.classList.remove("on","err"));
  
    document.querySelectorAll("#canvas .running, #canvas .yes, #canvas .nope").forEach(b=>b.classList.remove("running","yes","nope"));
  
    $("bot").dataset.look="r"; $("bot").classList.remove("happy","shake","moving","boogie","pen","boom","dizzy"); $("bot").querySelectorAll(".dz").forEach(e=>e.remove()); $("gBoard").classList.remove("kaboom"); placeNow();
    pyMark(null);
  
  }
  
  function renderStatus(){
  
    let h="";
  
    if(G.nB){ const got=G.S.got.length, up=G.lastGot!=null&&got>G.lastGot; G.lastGot=got;
  
      h+=`<span class="chip${got>=G.nB?" full":""}${up?" bump":""}">${Array.from({length:G.nB},(_,i)=>`<span class="bslot${i<got?" on":""}">${batSVG()}</span>`).join("")} ${got} / ${G.nB}</span>`; }
  
    /* contadores de pintar: rojas pintadas, verdes con baile, o celdas pintadas en pintar libre */
  
    const g=goalLeft(G.wm,G.S), chip=(col,done,tot,txt)=>`<span class="chip${done>=tot?" full":""}"><span class="sq" style="background:${col}"></span>${txt} ${done} / ${tot}</span>`;
  
    if(G.nX) h+=chip("#FF5A62",G.nX-g.red,G.nX,"Rojas");
  
    if(G.nV) h+=chip("#1EC48C",G.nV-g.green,G.nV,"Verdes");
  
    if(G.map.need) h+=chip("var(--paint)",Math.min(G.S.pnt.length,G.map.need),G.map.need,"Pintadas");
  
    if(G.tools.includes("n")) h+=`<span class="chip pench${G.S.pen?" on":""}">${ICO.brush(G.S.pen?"#fff":"#7E3DB0")}${G.S.pen?"Pincel en uso":"Pincel guardado"}</span>`;
  
    if(G.worlds&&G.wi!=null) h+=`<span class="chip wchip">Mundo ${G.wi+1} de ${G.worlds.length}</span>`;
    if(G.worlds&&G.map.reveal) h+=`<div class="wstrip"><span>Estos son los mundos posibles</span>${G.worlds.map((w,i)=>`<div class="wmini${i===G.wi?" on":""}">${miniMap(w,10)}</div>`).join("")}</div>`;
    $("status").innerHTML=h;
  }
  
  function T(){ return 1300-(+$("speed").value); }
  
  function applySpeed(){ document.documentElement.style.setProperty("--t",Math.round(T()*.8)+"ms"); }
  
  $("speed").oninput=applySpeed; applySpeed();
  
  function say(kind,icon,title,sub="",extra="",el="msg"){
    if(G&&G.pre&&el==="msg") sub=G.pre+(sub?" · "+sub:"");
    const m=$(el); m.className="msg"+(kind?" "+kind:"");
  
    m.innerHTML=`<span class="mi">${icon}</span><div><div class="mt">${title}</div>${sub?`<div class="ms">${sub}</div>`:""}${extra}</div>`;
  
    void m.offsetWidth; m.classList.add("pop");
  
  }
  
  
  
  /* ---------- paleta y programa ---------- */
  
  /* Python: la columna de bloques se vuelve una lista de comandos; tocarlos los escribe en el código.
     [código, qué hace, tool que lo muestra ("" = siempre), en la misma línea (preguntas)] */
  const PY_PAL=[
    {id:"pg-mov",title:"Movimiento",col:"var(--mov)",items:[["arriba()","sube una celda"],["abajo()","baja una celda"],["izquierda()","va a la izquierda"],["derecha()","va a la derecha"]]},
    {id:"pg-act",title:"Acciones",col:"var(--pnt)",items:[["pintar()","pinta la celda roja","p"],["bailar()","baila en la celda verde","b"]]},
    {id:"pg-py",title:"Python",col:"var(--fn)",items:[["def nombre():","crea una función","f"],["nombre()","llama a tu función","f"],["for i in range(3):","repite 3 veces","r"],
      ["nombre = 1","crea una variable","v"],["nombre = nombre + 1","la variable suma 1","v"],["def nombre(n):","función con parámetro n","v"],
      ["while not en_estrella():","repite hasta llegar","w"],["if celda_roja():","hace algo solo si…","i"],["else:","si no…","i"]]},
    {id:"pg-ask",title:"Preguntas",col:"var(--ctl)",tool:"wi",items:[["en_estrella()","¿llegó a la estrella?","",1],["celda_roja()","¿está en una roja?","",1],["celda_verde()","¿está en una verde?","b",1],
      ["pared_derecha()","¿hay pared a la derecha?","",1],["pared_abajo()","¿hay pared abajo?","",1],["pared_arriba()","¿hay pared arriba?","",1],["pared_izquierda()","¿hay pared a la izquierda?","",1]]}];
  function renderPyPalette(){ let h="", cats="";
    for(const g of PY_PAL){ if(g.tool&&![...g.tool].some(t=>G.tools.includes(t))) continue;
      const items=g.items.filter(([, ,t])=>!t||G.tools.includes(t)); if(!items.length) continue;
      h+=`<div class="pgroup" id="${g.id}"><h4><i style="background:${g.col}"></i>${g.title}</h4>${items.map(([c,d, ,inl])=>`<button class="pyins" data-ins="${escH(c)}"${inl?' data-inline="1"':""}><code>${pyHTML(c)}</code><span>${d}</span></button>`).join("")}</div>`;
      cats+=`<button class="cat${cats?"":" on"}" data-g="${g.id}"><i style="background:${g.col}"></i>${g.title}</button>`; }
    $("pal").innerHTML=h; $("cats").innerHTML=cats; }
  function renderPalette(){
    if(G.py) return renderPyPalette();

    let h=`<div class="pgroup" id="pg-mov"><h4><i style="background:var(--mov)"></i>Movimiento</h4>${["u","d","l","r"].map(d=>blockHTML({t:"move",dir:d},null,true)).join("")}</div>`;
  
    let cats=`<button class="cat on" data-g="pg-mov"><i style="background:var(--mov)"></i>Movimiento</button>`;
  
    const T_=G.tools;
  
    if(T_.includes("p")||T_.includes("b")||T_.includes("n")){
  
      h+=`<div class="pgroup" id="pg-act"><h4><i style="background:var(--pnt)"></i>Acciones</h4>${T_.includes("n")?blockHTML({t:"penon"},null,true)+blockHTML({t:"penoff"},null,true):""}${T_.includes("p")?blockHTML({t:"paint"},null,true):""}${T_.includes("b")?blockHTML({t:"dance"},null,true):""}</div>`;
  
      cats+=`<button class="cat" data-g="pg-act"><i style="background:var(--pnt)"></i>Acciones</button>`; }
  
    if(T_.includes("r")||T_.includes("i")){
      h+=`<div class="pgroup" id="pg-ctl"><h4><i style="background:var(--ctl)"></i>Control</h4>${T_.includes("r")?blockHTML({t:"repeat",n:2,body:[]},null,true):""}${T_.includes("i")?blockHTML({t:"if",c:G.conds[0],body:[]},null,true):""}${T_.includes("e")?blockHTML({t:"else",body:[]},null,true):""}</div>`;
  
      cats+=`<button class="cat" data-g="pg-ctl"><i style="background:var(--ctl)"></i>Control</button>`; }
  
    if(G.fn){ h+=`<div class="pgroup" id="pg-fn"><h4><i style="background:var(--fn)"></i>Funciones</h4>${G.fids.map(f=>blockHTML({t:"call",f},null,true)).join("")}</div>`;
      cats+=`<button class="cat" data-g="pg-fn"><i style="background:var(--fn)"></i>Funciones</button>`; }
    $("pal").innerHTML=h; $("cats").innerHTML=cats;
  
  }
  
  const COLS={x:["roja","#FF5A62"],v:["verde","#1EC48C"]};
  /* chip de la condición del si: color de celda o pared por dirección ("pared →", "no hay pared ↓") */
  const ARR={u:"↑",d:"↓",l:"←",r:"→"};
  function condChip(c){ return COLS[c]?`<i style="--cc:${COLS[c][1]}"></i>${COLS[c][0]}`:`<i class="wc">${ARR[c[1]]}</i>${c[0]==="n"?"no hay pared":"pared"}`; }

  
  $("cats").onclick=e=>{ const b=e.target.closest(".cat"); if(!b) return;
  
    document.querySelectorAll("#cats .cat").forEach(x=>x.classList.toggle("on",x===b)); $(b.dataset.g).scrollIntoView({behavior:"smooth",block:"start"}); };
  
  const escH=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fnLabel=f=>(G.names[f]||"").trim()?escH(G.names[f].trim()):"Función "+f; /* el nombre libre siempre va escapado */
  function blockHTML(b,addr,pal){
  
    const at=pal?`data-new="${b.t==="call"?"call:"+b.f:b.t==="repeat"?"rep":b.t==="move"?b.dir:b.t}"`:`data-a="${addr}"`;
  
    if(b.t==="call") return `<div class="blk fnc" ${at}><span class="ic">ƒ</span><span>llamar a <b>${fnLabel(b.f)}</b></span></div>`;
    if(b.t==="move") return `<div class="blk mov" ${at}><span class="ic">${ICO.arrow(b.dir)}</span><span>${LABEL[b.dir]}</span></div>`;
  
    if(b.t==="paint") return `<div class="blk act" ${at}><span class="ic">${ICO.brush()}</span><span>pintar</span></div>`;
  
    if(b.t==="dance") return `<div class="blk act" ${at}><span class="ic">${ICO.music()}</span><span>bailar</span></div>`;
  
    if(b.t==="penon") return `<div class="blk act" ${at}><span class="ic">${ICO.brush()}</span><span>usar pincel</span></div>`;
  
    if(b.t==="penoff") return `<div class="blk act off" ${at}><span class="ic">${ICO.brushOff()}</span><span>guardar pincel</span></div>`;
  
    const inner=b.body.length?listHTML(b.body,addr):'<div class="ph"></div>';
  
    /* si y repetir comparten la forma de C */
  
    if(b.t==="else") return `<div class="blk rep iff els" ${at}><div class="rtop"><span class="ic">${ICO.ifq()}</span><span>si no</span></div><div class="mouth"><div class="arm"></div><div class="slot list"${pal?"":` data-l="${addr}"`}>${inner}</div></div><div class="rbot"></div></div>`;
    if(b.t==="if") return `<div class="blk rep iff" ${at}><div class="rtop"><span class="ic">${ICO.ifq()}</span><span>${COLS[b.c]?"si la celda es":"si"}</span>`+
      (pal?`<span class="colsel">${condChip(b.c)}</span>`:`<button class="colsel" data-col title="Cambiar condición">${condChip(b.c)}</button>`)+
      `</div><div class="mouth"><div class="arm"></div><div class="slot list"${pal?"":` data-l="${addr}"`}>${inner}</div></div><div class="rbot"></div></div>`;
  
    return `<div class="blk rep" ${at}><div class="rtop"><span class="ic">${ICO.repeat()}</span><span>repetir</span>`+
  
      `<span class="nctl">${pal?"":'<button data-minus aria-label="Menos">−</button>'}<b>${b.n}</b>${pal?"":'<button data-plus aria-label="Más">+</button>'}</span><span class="lap"></span></div>`+
  
      `<div class="mouth"><div class="arm"></div><div class="slot list"${pal?"":` data-l="${addr}"`}>${inner}</div></div><div class="rbot"></div></div>`;
  
  }
  
  function listHTML(list,prefix){ return list.map((b,i)=>blockHTML(b,prefix===""?String(i):prefix.endsWith(":")?prefix+i:prefix+"."+i,false)).join(""); }
  
  /* mis funciones: una caja en forma de C por función, con su nombre editable (los bloques de dentro tienen dirección «A:0.1») */
  function fnsHTML(){ if(!G.fn) return "";
    return `<div class="fns"><h5>Mis funciones</h5>${G.fids.map(f=>{ const lk=G.lock.includes(f);
      return `<div class="rep fnbox${lk?" lock":""}" data-fn="${f}"><div class="rtop"><span class="ic">ƒ</span><input class="fname" data-fname="${f}" maxlength="14" value="${escH(G.names[f]||"")}" placeholder="Función ${f}" aria-label="Nombre de la función ${f}"${lk?" disabled":""}>${lk?`<span class="lk">${ICO.lock("#fff")}</span>`:""}</div>`+
        `<div class="mouth"><div class="arm"></div><div class="slot list" data-l="${f}:">${G.funcs[f].length?listHTML(G.funcs[f],f+":"):'<div class="ph"></div>'}</div></div><div class="rbot"></div></div>`; }).join("")}</div>`; }
  function used(){ return countProgram(G.prog,G.funcs)+1; }
  
  /* edición Python: debajo de los bloques, el mismo programa escrito en Python («al tocar» es main) */
  function mirrorHTML(){ if(!PY_ED) return "";
    return `<div class="pymirror"><h5>${ICO.code("#3776AB")}Tu programa en Python</h5><pre>${pyHTML(blocksToPy(G.prog,G.fn?G.funcs:{},G.names,!!G.map.notes))}</pre></div>`; }
  function renderProg(full){
    if(G.py) return renderPy(full);

    const root=G.prog.length?listHTML(G.prog,""):`<div class="rootph">${ICO.drag()}Arrastrá bloques acá</div>`;

    $("canvas").innerHTML=`<div class="blk hat"><span>al tocar</span><span class="ic">${ICO.flag("#11986A")}</span></div><div class="list root" data-l="">${root}</div>${fnsHTML()}${mirrorHTML()}<div class="dropline hidden" id="dropline"></div>`;
  
    const n=used(), c=$("count"); c.innerHTML=ICO.blocks()+`${n} / ${G.max}`; c.classList.toggle("full",n>=G.max); c.classList.remove("no");
  
    $("goal").classList.toggle("hidden",G.map.cls===2||G.map.cls===3||G.opt==null);
  
    if(G.map.cls!==2&&G.map.cls!==3) $("goal").innerHTML=starIco(true)+"meta "+G.opt;
  
    $("runBtn").classList.toggle("ready",G.prog.length>0);
  
    resetClear();
  
  }
  
  /* ---------- editor de Python ---------- */
  const PY_LH=26, PY_PAD=12; /* alto de línea y margen de arriba del editor (iguales en game.css) */
  /* full: arma el editor de cero (al entrar al nivel). Si no, solo actualiza el contador (así no se pierde el cursor) */
  function renderPy(full){
    const n=pyLines(G.code), c=$("count"); c.innerHTML=ICO.code("#3776AB")+`${n} ${n===1?"línea":"líneas"}`; c.classList.remove("full","no");
    $("goal").classList.toggle("hidden",G.map.goal==null); if(G.map.goal!=null) $("goal").innerHTML=starIco(true)+"meta "+G.map.goal;
    $("runBtn").classList.toggle("ready",!!G.code.trim()); resetClear();
    if(!full&&$("pyta")) return;
    $("canvas").innerHTML=`<div class="pyed"><div class="pygut" id="pygut" aria-hidden="true"></div><div class="pywrap"><div class="pyhl hidden" id="pyhl"></div>`+
      `<textarea id="pyta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Código en Python"></textarea></div></div>`;
    $("pyta").value=G.code; pyGrow(); }
  function pyGrow(){ const ta=$("pyta"); if(!ta) return; const n=ta.value.split("\n").length;
    $("pygut").innerHTML=Array.from({length:n},(_,i)=>`<i data-ln="${i+1}">${i+1}</i>`).join("");
    ta.style.height=(n*PY_LH+PY_PAD*2+40)+"px"; }
  /* marca una línea: cls "" (corriendo), "yes"/"no" (respuesta de if/while), "err" (error); sin línea, la saca */
  function pyMark(ln,cls=""){ const hl=$("pyhl"); if(!hl) return; document.querySelectorAll("#pygut i.on,#pygut i.err").forEach(x=>x.classList.remove("on","err"));
    if(!ln){ hl.className="pyhl hidden"; return; }
    hl.className="pyhl"+(cls?" "+cls:""); hl.style.top=(PY_PAD+(ln-1)*PY_LH)+"px"; void hl.offsetWidth; hl.classList.add("pop");
    const g=document.querySelector(`#pygut i[data-ln="${ln}"]`); if(g){ g.classList.add(cls==="err"?"err":"on"); g.scrollIntoView({block:"nearest"}); } }
  function pyErr(ln,msg){ pyMark(ln,"err"); SND.nope(); say("err",ICO.code("#FF5A62"),`Error en la línea ${ln}`,escH(msg)); }
  /* el texto cambió (tecla o comando): se guarda y se corta la ejecución, como al mover un bloque */
  function pySync(){ const ta=$("pyta"); if(!ta||!G||!G.py||ta.value===G.code) return; G.code=ta.value; PYCODE[G.map.id]=G.code; pyGrow(); changed(); }
  /* escribe texto en el cursor (con deshacer, si el navegador deja) */
  function taInsert(ta,text){ ta.focus(); let ok=false; try{ ok=document.execCommand("insertText",false,text); }catch(e){} if(!ok) ta.setRangeText(text,ta.selectionStart,ta.selectionEnd,"end"); }
  /* comando de la izquierda: las preguntas van en el cursor; el resto en una línea nueva con la sangría de la actual
     (si la línea está vacía o es «...» o pass, la reemplaza). «nombre» queda seleccionado para escribir encima */
  function pyInsert(txt,inline){ const ta=$("pyta"); if(!ta) return;
    if(inline){ taInsert(ta,txt); return pySync(); }
    const v=ta.value, s=ta.selectionStart, ls=v.lastIndexOf("\n",s-1)+1, nl=v.indexOf("\n",s), le=nl<0?v.length:nl, line=v.slice(ls,le), ind=line.match(/^ */)[0];
    let ins, at;
    if(!line.trim()||/^\s*(pass\b|\.\.\.)/.test(line)){ ta.focus(); ta.setSelectionRange(ls,le); ins=ind+txt; at=ls; }
    else { ta.focus(); ta.setSelectionRange(le,le); ins="\n"+ind+(line.trimEnd().endsWith(":")?"    ":"")+txt; at=le; }
    taInsert(ta,ins);
    const k=ins.indexOf("nombre");
    if(k>=0) ta.setSelectionRange(at+k,at+k+6);
    else if(txt.endsWith(":")) taInsert(ta,"\n"+ins.split("\n").pop().match(/^ */)[0]+"    ");
    pySync(); }
  $("pal").addEventListener("click",e=>{ const b=e.target.closest(".pyins"); if(!b||!G||!G.py||G.busy) return; SND.add(); pyInsert(b.dataset.ins,b.dataset.inline==="1"); });
  $("canvas").addEventListener("input",e=>{ if(e.target.id==="pyta") pySync(); });
  /* Tab = 4 espacios (Shift+Tab saca), Enter mantiene la sangría y suma 4 después de «:» */
  $("canvas").addEventListener("keydown",e=>{ const ta=e.target; if(ta.id!=="pyta"||ta.readOnly) return;
    const v=ta.value, s=ta.selectionStart, ls=v.lastIndexOf("\n",s-1)+1;
    if(e.key==="Tab"){ e.preventDefault();
      if(e.shiftKey){ const k=(v.slice(ls).match(/^ {1,4}/)||[""])[0].length; if(k){ ta.setSelectionRange(ls,ls+k); taInsert(ta,""); } }
      else taInsert(ta,"    ".slice((s-ls)%4)); pySync(); }
    else if(e.key==="Enter"&&!e.isComposing){ e.preventDefault(); const before=v.slice(ls,s); let ind=before.match(/^ */)[0]; if(before.trimEnd().endsWith(":")) ind+="    ";
      taInsert(ta,"\n"+ind); pySync(); } });
  const splitA=a=>{ a=String(a); const k=a.indexOf(":"), t=k<0?a:a.slice(k+1); return {f:k<0?null:a.slice(0,k),path:t===""?[]:t.split(".").map(Number)}; }; /* "A:0.1" = función A, bloque 0.1; sin letra = programa */
  const joinA=(f,path)=>f?f+":"+path.join("."):path.join(".");
  const badCall=(b,f)=>f&&(b.t==="call"?!(G.map.adv?b.f<=f:b.f<f):b.body&&b.body.some(x=>badCall(x,f))); /* una función solo llama a otra anterior (B a A); en los niveles avanzados también a sí misma */
  function getList(f,path){ let l=f?G.funcs[f]:G.prog; for(const i of path) l=l[i].body; return l; }
  function removeAt(f,addr){ return getList(f,addr.slice(0,-1)).splice(addr[addr.length-1],1)[0]; }
  function insertAt(f,path,i,b){ getList(f,path).splice(i,0,b); }
  function newBlock(kind){ return kind.startsWith("call:")?{t:"call",f:kind[5]}:kind==="rep"?{t:"repeat",n:2,body:[]}:kind==="if"?{t:"if",c:G.conds[0],body:[]}:kind==="else"?{t:"else",body:[]}:ACTS[kind]?{t:kind}:{t:"move",dir:kind}; }
  
  function tooMany(extra){ if(used()+extra<=G.max) return false;
  
    say("warn",G.rep?ICO.repeat("#D9780F"):ICO.blocks(),`¡Máximo ${G.max} bloques!`,G.map.cls===3?"Usá una función para ahorrar bloques":G.tools.includes("i")?"Usá repetir y si para ahorrar bloques":G.map.cls===2?"Usá repetir para ahorrar bloques":"El bloque «al tocar» también cuenta");
  
    bumpEl($("count"),"no"); SND.nope(); return true; }
  
  function changed(){ G.keepW=false; G.run++; releaseWait(); G.ctx=null; setBusy(false); renderProg(); resetRobot(); }
  
  function freshAt(addr){ const el=document.querySelector(`#canvas .blk[data-a="${addr}"]`); if(!el) return;
  
    el.classList.add("fresh"); const r=el.getBoundingClientRect(); sparkle(r.left+30,r.top+r.height/2); bumpEl($("count")); }
  
  
  
  /* ---------- arrastrar y soltar ---------- */
  
  let D=null;
  
  document.addEventListener("pointerdown",e=>{
  
    if(e.button!==0||!G||G.busy||SCREEN!=="game"||e.target.closest("button,input")) return;
  
    const el=e.target.closest(".blk"); if(!el||el.classList.contains("hat")||el.closest(".fnbox.lock")) return;
  
    const inPal=!!el.closest("#pal"); if(!inPal&&!el.closest("#canvas")) return;
  
    e.preventDefault();
  
    const r=el.getBoundingClientRect();
  
    D={inPal,kind:el.dataset.new,addr:el.dataset.a,x0:e.clientX,y0:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,started:false};
  
    addEventListener("pointermove",onMove); addEventListener("pointerup",onUp); addEventListener("pointercancel",onUp);
  
  });
  
  function startDrag(){
  
    if(D.inPal){ D.block=newBlock(D.kind); if(tooMany(countBlocks([D.block]))){ D=null; return; } }
  
    else { const s=splitA(D.addr), a=s.path; D.from={f:s.f,path:a.slice(0,-1),i:a[a.length-1]}; D.block=removeAt(s.f,a); renderProg(); }
  
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
  
    if(d.zone==="drop"&&d.pt&&!badCall(d.block,d.pt.f)){ insertAt(d.pt.f,d.pt.path,d.pt.i,d.block); at=joinA(d.pt.f,d.pt.path.concat(d.pt.i)); SND.snap(); }
    else if(d.zone==="drop"&&d.pt){ SND.nope(); say("warn",ICO.blocks(),"Ahí no se puede llamar a esa función",G.map.adv?"Una función puede llamarse a sí misma o llamar a las anteriores":"Una función solo llama a las anteriores"); if(!d.inPal) insertAt(d.from.f,d.from.path,d.from.i,d.block); }
  
    else if(d.zone==="del"){ if(!d.inPal){ SND.trash(); const [x,y]=center($("trash")); burst(x,y,["#FF5A62","#FF9A2E","#5F7F96"],10,4); } }
  
    else if(!d.inPal) insertAt(d.from.f,d.from.path,d.from.i,d.block);
  
    changed(); if(at!=null) freshAt(at);
  
  }
  
  /* lugares donde se puede enganchar un bloque: antes del primero y después de cada uno, en cada lista */
  
  function nearestPoint(gx,gy){
  
    let best=null, bd=Infinity;
  
    document.querySelectorAll("#canvas .list").forEach(L=>{
  
      if(L.closest(".fnbox.lock")) return; const {f,path}=splitA(L.dataset.l), kids=[...L.children].filter(k=>k.classList.contains("blk")), x=L.getBoundingClientRect().left;
  
      const pts=kids.length?[{i:0,y:kids[0].getBoundingClientRect().top},...kids.map((k,j)=>({i:j+1,y:k.getBoundingClientRect().bottom}))]:[{i:0,y:L.getBoundingClientRect().top}];
  
      for(const p of pts){ const d=Math.abs(gy-p.y)+Math.abs(gx-x)*.5; if(d<bd){ bd=d; best={f,path,i:p.i,x,y:p.y}; } }
  
    });
  
    return best;
  
  }
  
  function showDropline(p){ const el=$("dropline"); if(!el) return; el.classList.toggle("hidden",!p); if(!p) return;
  
    const cv=$("canvas"), cr=cv.getBoundingClientRect();
  
    el.style.left=(p.x-cr.left+cv.scrollLeft)+"px"; el.style.top=(p.y-cr.top+cv.scrollTop-3)+"px"; }
  
  
  
  $("canvas").addEventListener("click",e=>{
  
    const cs=e.target.closest("[data-col]");
  
    if(cs&&!G.busy){ const s=splitA(cs.closest(".iff").dataset.a), a=s.path, blk=getList(s.f,a.slice(0,-1))[a[a.length-1]];
  
      const opts=G.conds; blk.c=opts[(opts.indexOf(blk.c)+1)%opts.length]; SND.add(); return changed(); }
  
    const b=e.target.closest("[data-minus],[data-plus]"); if(!b||G.busy) return;
  
    const s=splitA(b.closest(".rep").dataset.a), blk=getList(s.f,s.path.slice(0,-1))[s.path[s.path.length-1]];
  
    blk.n=Math.max(2,Math.min(10,blk.n+(b.hasAttribute("data-plus")?1:-1))); SND.add(); changed();
  
  });
  
  /* nombre de la función: se guarda al escribir y se aplica (paleta y programa) al terminar, así no se pierde el foco */
  $("canvas").addEventListener("input",e=>{ const i=e.target.closest&&e.target.closest("[data-fname]"); if(i&&!G.busy) G.names[i.dataset.fname]=i.value.slice(0,14); });
  $("canvas").addEventListener("change",e=>{ const i=e.target.closest&&e.target.closest("[data-fname]"); if(!i||G.busy) return;
    G.names[i.dataset.fname]=i.value.trim().slice(0,14); renderPalette(); renderProg(); });
  $("canvas").addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.matches&&e.target.matches("[data-fname]")) e.target.blur(); });
  let clearT=null;
  
  function resetClear(){ clearTimeout(clearT); $("clearBtn").classList.remove("ask"); $("clearBtn").innerHTML=ICO.trash("currentColor")+(G&&G.py?"Volver al código inicial":"Borrar todo"); }

  $("clearBtn").onclick=()=>{
    /* Python: vuelve al código de arranque del nivel (también pide confirmar) */
    if(G.py){ const start=G.map.pre??PY_START; if(G.busy||G.code===start) return; const b=$("clearBtn");
      if(!b.classList.contains("ask")){ b.classList.add("ask"); b.innerHTML=ICO.trash("#fff")+"¿Seguro?"; clearT=setTimeout(resetClear,3000); return; }
      G.code=start; delete PYCODE[G.map.id]; SND.trash(); changed(); renderProg(true); return say("",ICO.code("#3776AB"),"Código inicial","Escribí tu programa y tocá Ir"); }
    if(G.busy||(!G.prog.length&&!G.fids.some(f=>!G.lock.includes(f)&&G.funcs[f].length))) return; const b=$("clearBtn");
  
    if(!b.classList.contains("ask")){ b.classList.add("ask"); b.innerHTML=ICO.trash("#fff")+"¿Seguro?"; clearT=setTimeout(resetClear,3000); return; }
  
    G.prog.length=0; G.fids.forEach(f=>{ if(!G.lock.includes(f)) G.funcs[f].length=0; }); SND.trash(); changed(); say("",ICO.drag(),"Programa vacío","Arrastrá bloques para empezar"); };
  
  
  
  /* ---------- ejecución ---------- */
  
  function setBusy(v){ G.busy=v; document.body.classList.toggle("busy",v); $("runBtn").disabled=v; $("stepBtn").disabled=v; if(v) $("runBtn").classList.remove("ready");
    const ta=$("pyta"); if(ta) ta.readOnly=v; /* mientras corre, el código no se edita (Inicio lo libera) */ }
  
  function releaseWait(){ if(G&&G.ctx&&G.ctx.waiting){ const w=G.ctx.waiting; G.ctx.waiting=null; w(); } }
  
  function waitStep(){ $("runBtn").disabled=false; $("stepBtn").disabled=false;
  
    return new Promise(r=>{ G.ctx.waiting=()=>{ $("runBtn").disabled=true; $("stepBtn").disabled=true; r(); }; }); }
  
  /* en Python, addr es el número de línea */
  function light(addr){ if(G.py) return pyMark(addr); document.querySelectorAll("#canvas .on").forEach(x=>x.classList.remove("on"));
  
    const el=document.querySelector(`#canvas .blk[data-a="${addr}"]`); if(el){ el.classList.add("on"); el.scrollIntoView({block:"nearest"}); } }
  
  function setLap(addr,k,n){ if(G.py) return pyMark(addr); const el=document.querySelector(`#canvas .rep[data-a="${addr}"]`); if(!el) return;
  
    el.classList.add("running"); el.querySelector(".lap").textContent=`${k} / ${n}`; }
  
  
  
  async function run(step){
  
    if(G.ctx&&G.ctx.waiting){ if(!step) G.ctx.stepMode=false; releaseWait(); return; }
  
    if(G.busy) return;
  
    /* Python: se lee el código antes de correr; un error marca la línea y no arranca */
    if(G.py){ if(!G.code.trim()) return say("warn",ICO.code("#3776AB"),"Escribí tu programa en Python");
      const r=parsePy(G.code); if(!r.ok){ resetRobot(); return pyErr(r.ln,r.msg); } G.pyAst=r.prog; }
    else if(!G.prog.length) return say("warn",ICO.drag(),"Arrastrá bloques al programa");

    const id=++G.run; G.keepW=false; if(G.worlds&&G.map.pool) G.worlds=pickWorlds(G.map); /* con pool, cada intento sortea sus mundos */
    resetRobot(); if(G.worlds){ G.keepW=true; setWorld(0); }
    const ctx=G.ctx={id,stepMode:step,waiting:null,moves:0}; setBusy(true);
  
    say("",ICO.robot(),step?"Paso a paso":"¡Allá va!",step?"Tocá Paso para seguir":"");
  
    await sleep(200); if(id!==G.run) return;
  
    /* el si pregunta por la celda donde está el robot en ese momento */
  
    let res={k:"end"}, last=null;
    for(let wi=0;wi<(G.worlds?G.worlds.length:1);wi++){
    if(wi>0){ setWorld(wi); await sleep(600); if(id!==G.run) return; }
    const it=G.py?pyWalk(G.pyAst,c=>sense(G.wm,G.S,c)):walk(G.prog,c=>sense(G.wm,G.S,c),[],G.funcs); let n=0; res={k:"end"};
    for(let nx=it.next();!nx.done;nx=it.next()){ const ev=nx.value;

      if(++n>MAXSTEPS){ res={k:"boom"}; break; }
      if(ev.t==="error"){ res={k:"pyerr",ln:ev.ln,msg:ev.msg}; break; }

      const addr=G.py?ev.ln:typeof ev.addr[0]==="string"?ev.addr[0]+":"+ev.addr.slice(1).join("."):ev.addr.join(".");
      /* Python: asignar, def, pass y «...» solo marcan su línea un momento */
      if(ev.t==="stmt"){ pyMark(ev.ln); if(!ctx.stepMode){ await sleep(T()*.15); if(id!==G.run) return; } continue; }

      if(ev.t==="loop"){ setLap(addr,ev.k+1,ev.n); SND.loop(); if(!ctx.stepMode){ await sleep(T()*.25); if(id!==G.run) return; } continue; }
  
      if(ev.t==="if"||ev.t==="else"){ askIf(addr,ev.ok); if(!ctx.stepMode){ await sleep(T()*.35); if(id!==G.run) return; } continue; }
  
      if(ev.t==="call"){ if(typeof ev.addr[0]==="string"&&ev.addr[0]===ev.f) ctx.rec=true; /* se llamó a sí misma */ light(addr); SND.loop(); if(!ctx.stepMode){ await sleep(T()*.35); if(id!==G.run) return; } continue; }
      if(G.map.cls!==0&&ctx.moves>=(G.map.maxAct||MAXACT)){ res={k:"boom"}; break; } /* demasiadas acciones (bucle infinito, repetir de más): GENI explota. El mapa propio (cls 0) no tiene tope */
      light(addr); last=addr;
  
      let r;
  
      if(ev.t==="move"){ r=tryMove(G.wm,G.S,ev.dir); await animate(r,ev.dir); }
  
      else { r=tryAct(G.wm,G.S,ACTS[ev.t]); await animateAct(r,ev.t); }
  
      if(id!==G.run) return;
  
      ctx.moves++;
  
      if(r.k!=="ok"){ res=r; break; }
  
      if(ctx.stepMode){ say("",ICO.step(),`Paso ${ctx.moves}`,"Tocá Paso para seguir o Ir para terminar"); await waitStep(); if(id!==G.run) return; }
  
    }
  
    if(res.k==="win"){ let nx, g=0; do{ nx=it.next(); }while(++g<MAXSTEPS&&!nx.done&&(nx.value.t==="loop"||nx.value.t==="if"||nx.value.t==="else"||nx.value.t==="call")); res.left=!nx.done; res.acts=ctx.moves; res.rec=!!ctx.rec; }
  
    /* sin estrella en el mapa: se gana al terminar el programa con todo pintado */
  
    if(res.k==="end"&&!hasE(G.wm)&&goalMet(G.wm,G.S)) res={k:"win"};  
    if(res.k!=="win"){ res.world=wi; break; }
    }
    if(res.acts==null) res.acts=ctx.moves;
    G.ctx=null; setBusy(false); finish(res,last);
  
  }
  
  /* el bloque si se ilumina verde si la respuesta es sí, gris si es no */
  
  function askIf(addr,ok){ if(G.py){ SND.loop(); return pyMark(addr,ok?"yes":"no"); } const el=document.querySelector(`#canvas .iff[data-a="${addr}"]`); if(!el) return;
  
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
  
  /* con mundos, el motivo de la falla va precedido de «¡Falló en el mundo N!» */
  function finish(res,last){ if(G.worlds&&res.k!=="win"&&res.world!=null){ G.pre=`¡Falló en el mundo ${res.world+1}!`; try{ return finish0(res,last); } finally{ G.pre=""; } } return finish0(res,last); }
  function finish0(res,last){
  
    document.querySelectorAll("#canvas .on").forEach(x=>x.classList.remove("on"));
  
    /* niveles avanzados: ganar sin que una función se llame a sí misma no cuenta; un bucle infinito hace explotar a GENI */
    if(res.k==="win"&&G.map.adv&&!res.rec){ G.tries++; SND.fail(); return say("warn",ICO.question(),"¡Llegó, pero sin recursión!","En este nivel una función tiene que llamarse a sí misma"); }
    if(res.k!=="win"&&G.map.adv) G.tries++;
    if(res.k==="pyerr") return pyErr(res.ln,res.msg);
    if(res.k==="win"&&G.py) pyMark(null);
    if(res.k==="boom") return explode();
    if(res.k==="win"&&G.map.ch) return chLevelWin(res);
  
    if(res.k==="win"){
  
      /* Python: estrellas por lo que pide el nivel (req) y la meta de líneas */
      const miss=G.py?pyMissing(G.pyAst,G.map.req):null;
      const count=G.py?pyLines(G.code):used(), usedRep=G.map.cls===3?hasCall(G.prog):hasRepeat(G.prog), k=G.py?starsPy(G.map,{lines:count,req:!miss}):G.map.adv?starsAdv(G.map,{count,rep:hasRepeatAll(G.prog,G.funcs),acts:res.acts,opt:G.pathLen}):starsFor(G.map,count,usedRep,G.opt,G.hint,G.S.wrong);
  
      let gained=0, opened=[];
      const map=G.map, part=map.id!=="custom"&&map.part, wasDone=part&&partDone(SAVE.stars,part), lockedSec=lockedSecrets();
      if(G.map.id!=="custom"){ const old=SAVE.stars[G.map.id]||0;
        if(k>old){ const before=groupsNow(); SAVE.stars[G.map.id]=k; gained=k-old; persist(); renderTopStars();
          opened=groupsNow().filter((s,i)=>s.open&&!before[i].open).map(s=>s.g.title); } }
      let sub;
      if(G.py) sub=miss?`${ICO.code("#3776AB")} ${PY_REQ_TIP[miss]} para ganar 3 estrellas`:G.map.goal!=null&&count>G.map.goal?`${ICO.code("#3776AB")} Se puede con <b>${G.map.goal}</b> líneas`:"¡Código perfecto!";
      else if(G.map.adv){ const m=G.map; sub=count>m.goal?`${ICO.blocks()} Se puede con <b>${m.goal}</b> bloques`:m.rep&&!hasRepeatAll(G.prog,G.funcs)?`${ICO.repeat("#D9780F")} Probá usar repetir para ganar 3 estrellas`:res.acts>G.pathLen?"Se puede con menos pasos":"¡Recursión perfecta!"; }
      else if(G.map.cls===3&&!usedRep) sub=`${ICO.blocks()} ¿Probás con una función?`;
      else if(G.map.cls===2&&!usedRep) sub=`${ICO.repeat("#D9780F")} ¿Probás con repetir?`;
      else if(G.S.wrong) sub=`${ICO.brush("#7E3DB0")} Pintaste ${G.S.wrong>1?G.S.wrong+" celdas que no eran rojas":"una celda que no era roja"}${G.tools.includes("n")?" · Guardá el pincel en las blancas":""}`;
      else if(G.opt!=null&&count>G.opt) sub=`${ICO.blocks()} Se puede con <b>${G.opt}</b> bloques`;
      else sub=G.worlds?"¡Funciona en todos los mundos!":G.map.need?"¡Llegó pintando!":"¡Programa perfecto!";
      if(G.hint&&k<3) sub+=" · Sin pista ganás 3 estrellas";
      if(res.left) sub+=G.py?" · Sobró código después de llegar":" · Sobraron bloques";
      const idx=MISSIONS.indexOf(G.map), nxt=MISSIONS[idx+1], gs=nxt&&groupsNow().find(s=>s.g.id===nxt.grp);
      let extra=`<div class="bigstars">${starRow(k,undefined,maxStars(G.map))}</div>`;
      if(opened.length) extra+=`<div class="unl">${ICO.unlock()} ¡Desbloqueaste «${opened.join("» y «")}»!</div>`;
      extra+=secretMsgs(lockedSec);
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
  
    if(res.k==="crash"){ const el=!G.py&&last&&document.querySelector(`#canvas .blk[data-a="${last}"]`); el&&el.classList.add("err"); if(G.py) pyMark(last,"err");

      say("err",ICO.burst(),res.why==="out"?"¡Ahí no hay camino!":"¡Chocó!",G.py?`Mirá la línea ${last}`:"Mirá el bloque rojo"); return; }

    if(res.k==="bad"){ const el=!G.py&&last&&document.querySelector(`#canvas .blk[data-a="${last}"]`); el&&el.classList.add("err"); if(G.py) pyMark(last,"err");
  
      return res.why==="p"?say("err",ICO.brush("#FF5A62"),"¡Esa celda no era roja!","Solo se pintan las rojas"+(G.tools.includes("i")?": usá el bloque si":""))
  
                          :say("err",ICO.music("#FF5A62"),"¡Ahí no se baila!","Solo en las celdas verdes"+(G.tools.includes("i")?": usá el bloque si":"")); }
  
    SND.fail();
  
    if(res.k==="long") return say("err",ICO.hourglass(),"¡Muy largo!","Revisá los números de repetir");
  
    /* Python: el programa terminó sin mover a GENI (casi siempre falta llamar a main() al final) */
    if(G.py&&!res.acts) return say("warn",ICO.question(),"GENI no se movió",G.pyAst&&G.pyAst.body.some(s=>s.k==="call")?"¿Las funciones que llamás mueven a GENI?":"Definiste funciones pero no las llamaste: escribí main() al final, sin sangría");
    const g=goalLeft(G.wm,G.S), toStar=hasE(G.map)?", después a la estrella":"";
  
    if(g.bat) return say("warn",ICO.bat(),G.nB>1?"Faltan baterías":"Falta la batería","Primero las baterías, después la estrella");
  
    if(g.red) return say("warn",ICO.brush("#FF5A62"),g.red>1?`Faltan pintar ${g.red} rojas`:"Falta pintar 1 roja",`Pintá todas las rojas${toStar}`);
  
    if(g.green) return say("warn",ICO.music("#11986A"),g.green>1?`Faltan bailar en ${g.green} verdes`:"Falta bailar en 1 verde","En cada verde, ¡a bailar!");
  
    if(g.need) return say("warn",ICO.brush("#7E3DB0"),g.need>1?`Faltan pintar ${g.need} celdas`:"Falta pintar 1 celda",`Tenés que pintar ${G.map.need}${toStar}`);
  
    say("warn",ICO.question(),"No llegó todavía","¿Qué bloque falta?");
  
  }
  
  /* demasiados movimientos (bucle infinito, repetir de más): GENI se marea (da vueltas con estrellas girando), explota en grande y recién después aparece el mensaje.
     Si se toca Parar/Cambiar el programa a mitad (G.run cambia) la animación se corta. */
  function explode(){ const id=G.run, bot=$("bot"), k=RM.matches?.25:1, alive=()=>G&&G.run===id&&SCREEN==="game";
    setBusy(true); bot.classList.remove("shake");
    bot.insertAdjacentHTML("beforeend",'<span class="dz" aria-hidden="true"><i>★</i><i>★</i><i>★</i></span>'); bot.classList.add("dizzy"); SND.dizzy();
    setTimeout(()=>{ if(!alive()) return; const dz=bot.querySelector(".dz"); if(dz) dz.remove(); bot.classList.remove("dizzy"); void bot.offsetWidth; bot.classList.add("boom"); },1250*k);
    setTimeout(()=>{ if(!alive()) return; const [x,y]=center(bot); SND.boom();
      const fl=document.createElement("div"); fl.className="fxflash"; document.body.appendChild(fl); setTimeout(()=>fl.remove(),700);
      burst(x,y,["#FFFFFF","#FFF3C4","#FFC21A"],46,13); burst(x,y,["#FF5A62","#FF9A2E","#FFC21A"],56,10);
      setTimeout(()=>burst(x,y,["#0D3049","#5F7F96","#FF9A2E","#FFFFFF"],40,7),130);
      floatText(x,y-34,"¡BOOM!","#FF5A62"); const g=$("gBoard"); g.classList.remove("kaboom"); void g.offsetWidth; g.classList.add("kaboom");
      const c=cellEl(G.S.r,G.S.c); if(c) c.classList.add("scorch"); },1900*k);
    setTimeout(()=>{ if(!alive()) return; setBusy(false); $("gBoard").classList.remove("kaboom");
      say("err",ICO.burst(),"¡GENI explotó!",G.map.adv?"Tu función no termina nunca: ¿llega a la estrella?":`Hizo más de ${G.map.maxAct||MAXACT} movimientos. Revisá tu programa: ¿repite de más o da vueltas?`); },2750*k); }
  function celebrate(gained){
  
    SND.win(); confetti(); $("gBoard").classList.add("win");
  
    const bot=$("bot"); bot.classList.add("happy"); setTimeout(()=>bot.classList.remove("happy"),2100);
  
    const [x,y]=center(cellEl(G.S.r,G.S.c)); burst(x,y,["#FFC21A","#FFE27A","#FFFFFF","#FF6FB5"],26,8);
  
    if(gained){ renderWallet(wallet()-gained); setTimeout(()=>flyStars($("msg").querySelector(".bigstars")||bot,gained),700); }
  
  }
  
  function stopRun(){ if(!G) return; G.keepW=false; G.run++; releaseWait(); G.ctx=null; setBusy(false); resetRobot(); }
  
  
  
  /* ---------- desafío extra: cronómetro que suma (se pausa entre niveles) ---------- */
  
  let CH=null, chTick=null;
  
  function chMs(){ return CH?CH.acc+(CH.t0!=null?performance.now()-CH.t0:0):0; }
  
  function renderTimer(){ if(CH) $("tTimer").innerHTML=ICO.clock()+`<span>${fmtTime(chMs()/1000)}</span>`; }
  
  function endChallenge(){ clearInterval(chTick); CH=null; }
  
  function startChallenge(ch){ CH={ch,idx:0,acc:0,t0:null}; playLevel(); }
  
  function playLevel(){ const m=CH.ch.levels[CH.idx]; PROGS[m.id]=[]; delete FUNCS[m.id]; delete NAMES[m.id]; delete PYCODE[m.id]; startPlay(m);
  
    CH.t0=performance.now(); clearInterval(chTick); chTick=setInterval(renderTimer,250); renderTimer(); }
  
  function chLevelWin(res){
  
    CH.acc+=performance.now()-CH.t0; CH.t0=null; clearInterval(chTick); renderTimer();
  
    G.done=true; setBusy(true); /* nivel cerrado: solo se puede seguir */
  
    const ch=CH.ch, left=res.left?" · Sobraron bloques":"";
  
    if(CH.idx<ch.levels.length-1){
  
      say("ok",ICO.star(),`¡Nivel ${CH.idx+1} superado!`,`${ICO.clock()} El reloj espera hasta que sigas${left}`,`<button class="nextbtn" data-chnext>Nivel ${CH.idx+2}${ICO.next()}</button>`);
  
      return celebrate(0); }
  
    const sec=Math.floor(CH.acc/1000), k=timeStars(ch,sec), old=SAVE.stars[ch.id]||0, prev=SAVE.best[ch.id], rec=prev==null||sec<prev;
  
    const gained=Math.max(0,k-old), lockedBefore=lockedSecrets();
  
    if(k>old) SAVE.stars[ch.id]=k; if(rec) SAVE.best[ch.id]=sec; persist();
  
    let sub=k<3?`Para ${k+1} estrellas: menos de ${fmtTime(k===2?ch.t3:ch.t2)}`:"¡Tiempo perfecto!";
  
    if(!rec) sub+=` · Tu récord: ${fmtTime(prev)}`;
  
    let extra=`<div class="bigstars">${starRow(k,undefined,maxStars(G.map))}</div>`;
  
    if(rec&&prev!=null) extra+=`<div class="unl">${ICO.clock()} ¡Nuevo récord!</div>`;
    extra+=secretMsgs(lockedBefore);
  
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
    ["skins","faces"].forEach(id=>{ const el=$(id); el.classList.add("intro"); setTimeout(()=>el.classList.remove("intro"),900); }); }
  function shopTag(on,own,id,price){ return on?`<span class="tag use">${ICO.check()}En uso</span>`:own?`<span class="tag">Usar</span>`:ASK===id?`<span class="tag ask">¿Comprar?</span>`:`<span class="tag buy">${starIco(true)}${price}</span>`; }
  function renderShop(cheer){
    const w=wallet();
    $("ped").innerHTML=`<svg viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`;
    const face=FACES.find(f=>f.id===SAVE.face);
    $("shopName").textContent=SKINS.find(s=>s.id===SAVE.skin).name+(SAVE.face==="normal"?"":" · "+face.name);
    $("shopStars").innerHTML=starIco(true)+`Tenés <b>${w}</b> estrellas para gastar`;
    $("skins").innerHTML=SKINS.map((s,i)=>{ const own=skinOwned(s), on=SAVE.skin===s.id;
      if(!own&&s.secret) return `<button class="skin secret" data-s="${s.id}" style="--i:${i}"><svg class="prev" viewBox="-50 -50 100 100">${robotSVG({skin:s.id,face:"normal"})}</svg><b>Robot secreto</b><span class="tag">${ICO.lock("#22D3FF")}¿Cómo se gana?</span></button>`;
      return `<button class="skin${on?" on":""}${!own&&w<s.price?" poor":""}" data-s="${s.id}" style="--i:${i}"><svg class="prev" viewBox="-50 -50 100 100" data-look="r">${robotSVG({skin:s.id})}</svg><b>${s.name}</b>${shopTag(on,own,s.id,s.price)}</button>`; }).join("");
    $("faces").innerHTML=FACES.map((s,i)=>{ const own=SAVE.faces.includes(s.id), on=SAVE.face===s.id;
      return `<button class="skin${on?" on":""}${!own&&w<s.price?" poor":""}" data-f="${s.id}" style="--i:${i}"><svg class="prev" viewBox="-50 -50 100 100" data-look="r">${robotSVG({skin:"robi",face:s.id})}</svg><b>${s.name}</b>${shopTag(on,own,s.id,s.price)}</button>`; }).join("");
    $("bodies").innerHTML=Object.entries(BODIES).map(([id,c])=>`<button class="sw" data-b="${id}" style="--c:${c[0]}" title="${c[1]}" aria-label="${c[1]}" aria-pressed="${SAVE.body===id}"></button>`).join("");
    $("accents").innerHTML=Object.entries(ACCENTS).map(([id,c])=>`<button class="sw" data-a="${id}" style="--c:${c[0]}" title="${c[2]}" aria-label="${c[2]}" aria-pressed="${SAVE.color===id}"></button>`).join("");
    renderWallet();
    if(cheer){ bumpEl($("ped"),"cheer"); const [x,y]=center($("ped")); burst(x,y,RAIN,20,7); }
  }
  function buyItem(b,list,owned,apply){ const s=list.find(x=>x.id===b.dataset.s||x.id===b.dataset.f); if(!s) return; const w=wallet();
    if(owned(s)){ ASK=null; apply(s,false); return; }
    if(w<s.price){ bumpEl(b,"no"); SND.nope(); return toast(starIco(true),`Te faltan ${s.price-w} estrellas. ¡Jugá más misiones!`); }
    if(ASK!==s.id){ ASK=s.id; SND.pick(); return renderShop(); }
    SAVE.spent+=s.price; ASK=null; apply(s,true); persist(); SND.buy(); renderShop(true); confetti(); }
  $("skins").onclick=e=>{ const b=e.target.closest(".skin"); if(!b) return;
    const sec=SKINS.find(x=>x.id===b.dataset.s&&x.secret&&!skinOwned(x));
    if(sec){ bumpEl(b,"no"); SND.nope(); return toast(ICO.lock("#22D3FF"),`Robot secreto: ${SECRETS[sec.secret].hint}`); }
    buyItem(b,SKINS,skinOwned,(s,bought)=>{ if(!bought&&SAVE.skin===s.id) return; SAVE.skin=s.id; if(bought) SAVE.owned.push(s.id); persist(); if(!bought){ SND.snap(); renderShop(true); } else toast(ICO.unlock(),`¡Nuevo diseño: ${s.name}!`); }); };
  $("faces").onclick=e=>{ const b=e.target.closest(".skin"); if(!b) return;
    buyItem(b,FACES,s=>SAVE.faces.includes(s.id),(s,bought)=>{ if(!bought&&SAVE.face===s.id) return; SAVE.face=s.id; if(bought) SAVE.faces.push(s.id); persist(); if(!bought){ SND.snap(); renderShop(true); } else toast(ICO.unlock(),`¡Nueva cara: ${s.name}!`); }); };
  $("bodies").onclick=e=>{ const b=e.target.closest(".sw"); if(!b) return; SAVE.body=b.dataset.b; persist(); SND.add(); renderShop(true); };
  $("accents").onclick=e=>{ const b=e.target.closest(".sw"); if(!b) return; SAVE.color=b.dataset.a; persist(); SND.add(); renderShop(true); };
  
  
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
  if(PY_ED){ $("logo").insertAdjacentHTML("beforeend",`<span class="pytag">${ICO.code()}Python</span>`);
    $("heroSub").textContent="Escribí programas en Python, con funciones y variables, y llevá a GENI hasta la estrella."; }
  
  renderMenu();
  
  if(/[?&]test/.test(location.search)){ const box=document.createElement("div"); box.className="testbox";
  
    box.innerHTML="<h3>Autoverificación</h3>"+selfTest().map(r=>`<div>${r.ok?"✔":"✖"} ${r.title} — ${r.info}</div>`).join(""); document.body.appendChild(box); }
  
  
}
