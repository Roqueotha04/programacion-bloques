// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
"use client";

import { WORLDS, PARTS, GROUPS, MISSIONS, CHALLENGES, CLASS_CODES, applyKids, applyPython, hideParts, EDITION_PARTS, ED } from "./data";
import {
  ACTS, DIRS, MAXSTEPS, MAXACT, countProgram, hasCall, parseSol, cellColor, cellsOf, sense, pickWorlds, worldMap, countB, countBlocks, find,
  fmtTime, goalLeft, goalMet, groupState, hasE, hasRepeat, hasRepeatAll, limitFor, maxStars, optFor, starsAdv, starsPy,
  chOf, gateTxt, partDone, partName, selfTest, shortest, starsFor, startState, timeStars,
  tryAct, tryMove, walk, EVMAX, DOORS, MULTI, multiCells,
} from "./engine";
import { parsePy, pyWalk, pyLines, pyMissing, PY_REQ_TIP, blocksToPy, pyHTML, pyExprText, pyCondText } from "./python";
import { freshSave, isKids, isProfe, isPython, saveKey } from "./save";

let booted = false;
/* hidden: partes ocultas por vista que eligió el profe ({normal:[4.5], chicos:[], python:[]}), leídas en page.tsx */
export function boot(hidden?: Record<string, number[]>) {
  if (booted) return;
  booted = true;
  const PY_ED=isPython(); /* edición Python (?python): reemplaza las partes; tiene prioridad sobre ?chicos */
  if (PY_ED) applyPython(); else if (isKids()) applyKids();
  /* con ?profe las partes ocultas se ven marcadas; con ?test no se oculta nada (selfTest revisa todo) */
  if (!/[?&]test/.test(location.search)) hideParts((hidden&&hidden[ED.kind])||[], isProfe());
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
  if(!Array.isArray(SAVE.codes)) SAVE.codes=[];
  SAVE.codes=SAVE.codes.map(c=>c===3?4:c); /* Repetir pasó de la parte 3 a la 4: el código ya ingresado sigue valiendo */
  function applyProfe(){ if(PROFE){ SAVE.seen=GROUPS.map(g=>g.id).concat(CHALLENGES.map(c=>c.id)); SAVE.owned=["robi","gato","chica","astro","dino","princesa","lentes","rayo","caballero","valquiria","rey"]; SAVE.faces=["normal","guino","enojado","cool"]; } }
  /* el desafío de cada parte se abre al terminar (con al menos 1 estrella) todos sus niveles */
  
  function chOpen(ch){ return PROFE||(partDone(SAVE.stars,ch.part)&&!worldLocked(worldOf(ch.part))); }
  
  applyProfe();
  
  /* mundos: se eligen libres en el carrusel; los que tienen lock quedan cerrados (?profe los abre) y los que no tienen partes son «Próximamente» */
  const worldOf=p=>(PARTS.find(x=>x.id===p)||{}).world||1;
  const worldParts=w=>PARTS.filter(p=>(p.world||1)===w);
  const worldStars=w=>worldParts(w).reduce((a,p)=>a+MISSIONS.filter(m=>m.part===p.id).reduce((b,m)=>b+(SAVE.stars[m.id]||0),0)
    +CHALLENGES.filter(c=>c.part===p.id).reduce((b,c)=>b+(SAVE.stars[c.id]||0),0),0);
  const worldMax=w=>worldParts(w).reduce((a,p)=>a+3*(MISSIONS.filter(m=>m.part===p.id).length+CHALLENGES.filter(c=>c.part===p.id).length),0);
  const worldSoon=w=>!worldParts(w).length;
  function worldLocked(w){ const W=WORLDS.find(x=>x.id===w); return !W||worldSoon(w)||(!PROFE&&!!W.lock); }
  function worldWhy(w){ return `El mundo ${WORLDS.find(x=>x.id===w).title} todavía está bloqueado: ¡muy pronto!`; }
  let WORLD=null; /* mundo abierto en el menú: null = carrusel de mundos, número = página del mundo, "map" = mapa propio */
  let CAR=0; /* índice del mundo que se ve en el carrusel */
  function groupsNow(){ const gs=groupState(SAVE.stars,SAVE.codes);
    if(PROFE) gs.forEach(s=>s.open=true);
    else gs.forEach(s=>{ const w=worldOf(s.g.part); if(worldLocked(w)){ s.open=false; s.worldLock=w; } });
    return gs; }
  
  function persist(){ try{ localStorage.setItem(KEY,JSON.stringify(SAVE)); }catch(e){} }
  
  const earned=()=>Object.values(SAVE.stars).reduce((a,b)=>a+b,0);
  
  const wallet=()=>earned()-SAVE.spent;
  
  
  
  /* ================= dibujos ================= */
  
  /* cuerpo: relleno de la cara. detalle: [fuerte, claro, nombre] para aro, cuello y costados */
  const BODIES={gris:["#E4EBF3","Gris"],blanco:["#FFFFFF","Blanco"],cel:["#D7F0FF","Celeste"],ver:["#D8F8EC","Verde"],nar:["#FFE8CC","Naranja"],ros:["#FFD9EC","Rosa"],vio:["#E6DEFF","Violeta"],ama:["#FFF3C4","Amarillo"]};
  const ACCENTS={marino:["#14325C","#C5D9F0","Marino"],cel:["#2FB0F0","#BDE8FF","Celeste"],ver:["#1EC48C","#BFF3DF","Verde"],nar:["#FF9A2E","#FFDDB8","Naranja"],ros:["#FF6FB5","#FFD0E6","Rosa"],vio:["#8B6CF0","#DCD2FF","Violeta"],ama:["#F5B800","#FFEBA6","Amarillo"]};
  const SKINS=[{id:"robi",name:"GENI",price:0},{id:"gato",name:"Gatobot",price:6},{id:"chica",name:"Chica bot",price:9},{id:"astro",name:"Astro",price:12},{id:"dino",name:"Dinobot",price:18},{id:"princesa",name:"Princess",price:21},{id:"lentes",name:"Lentes",price:24},{id:"rayo",name:"Rayo",price:30},{id:"caballero",name:"Caballero",price:36},{id:"valquiria",name:"Valquiria bot",price:39},{id:"rey",name:"Rey Robot",price:42},
    {id:"mega",name:"67 BOT",price:0,secret:"mega"},{id:"dios",name:"DIOS BOT",price:0,secret:"dios"}];
  if(!SKINS.some(s=>s.id===SAVE.skin)) SAVE.skin="robi"; /* (antes había una lista vieja que dejaba afuera los secretos y las chicas: al recargar volvían a GENI) */
  /* promo: los robots secretos, gratis para todos hasta el 27/11/2026 a las 17:30 (hora de la compu). Después se vuelven a ganar */
  const FREE_UNTIL=new Date(2026,10,27,17,30).getTime(), freeNow=()=>Date.now()<FREE_UNTIL;
  /* robots secretos: no se compran, se ganan. Los desafíos cuentan solo si se jugaron (mira el mejor tiempo, así los códigos de clase no los regalan) */
  const all3=ms=>ms.every(m=>(SAVE.stars[m.id]||0)>=maxStars(m));
  const chPlayed3=ch=>{ const b=SAVE.best[ch.id]; return b!=null&&timeStars(ch,b)>=3; };
  const SECRETS={
    /* (si la edición no tiene Repetir, como la de Python, no se regala: hace falta al menos un nivel) */
    mega:{hint:"sacá 3 estrellas en todos los niveles de Repetir y Repetir avanzado, y en el Desafío de repetir",ok:()=>{ const ms=MISSIONS.filter(m=>!m.py&&(m.part===4||m.part===4.5)); return ms.length>0&&all3(ms)&&CHALLENGES.filter(c=>c.part===4).every(chPlayed3); }},
    dios:{hint:"sacá 3 estrellas en todos los niveles y todos los desafíos del juego",ok:()=>all3(MISSIONS)&&CHALLENGES.every(chPlayed3)}};
  function secretOk(s){ return !s.secret||PROFE||freeNow()||SECRETS[s.secret].ok(); }
  const promoOnly=s=>!!s.secret&&!PROFE&&freeNow()&&!SECRETS[s.secret].ok();
  /* si terminó la promo y tenía puesto un secreto que no ganó, vuelve a GENI */
  function fixSkin(){ const s=SKINS.find(x=>x.id===SAVE.skin); if(!s||(s.secret&&!skinOwned(s))){ SAVE.skin="robi"; persist(); } }
  const skinOwned=s=>SAVE.owned.includes(s.id)||(!!s.secret&&secretOk(s));
  const lockedSecrets=()=>SKINS.filter(s=>s.secret&&!skinOwned(s));
  const secretMsgs=before=>before.filter(skinOwned).map(s=>`<div class="unl">${ICO.unlock()} ¡Ganaste un robot secreto: ${s.name}! Buscalo en el taller</div>`).join("");
  const EXPR=["wow","sorpresa","triste"];
  const FACES=[{id:"normal",name:"Normal",price:0},{id:"guino",name:"Guiño",price:8},{id:"enojado",name:"Enojado",price:12},{id:"cool",name:"Cool",price:16}];
  function robotSVG(o){
    o=Object.assign({skin:SAVE.skin,color:SAVE.color,body:SAVE.body,face:SAVE.face},o||{});
    let [m,l]=ACCENTS[o.color]||ACCENTS.marino, b=(BODIES[o.body]||BODIES.gris)[0], k="#0D3049";
    const s=o.skin, f=FACES.some(x=>x.id===o.face)||EXPR.includes(o.face)?o.face:"normal";
    if(s==="mega"){ m="#0B0F1A"; l="#22D3FF"; b="#151A27"; k="#22D3FF"; } /* 67 BOT: negro con azul neón, sin importar los colores elegidos */
    if(s==="dios"){ m="#F1F4F9"; l="#FFD34D"; b="#FFFFFF"; k="#B8901A"; } /* DIOS BOT: blanco y dorado */
    const sw=`stroke="${k}" stroke-width="2.5" stroke-linejoin="round"`;
    const eye=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#57E1FF"/>`;
    let pupils=eye(-13,-16,8,12)+eye(5,-16,8,12);
    let mouth=`<path d="M-6 11 Q0 15 6 11" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if(f==="guino") pupils=eye(-13,-16,8,12)+`<rect x="4" y="-11" width="10" height="3.2" rx="1.6" fill="#57E1FF"/>`;
    if(f==="cool") pupils=`<rect x="-13" y="-12" width="8" height="5" rx="2.5" fill="#57E1FF"/>`+`<rect x="5" y="-12" width="8" height="5" rx="2.5" fill="#57E1FF"/>`, mouth=`<path d="M-4 12 Q2 16 8 11" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if(f==="enojado") pupils=`<path d="M-15 -21 L-4 -17" stroke="#57E1FF" stroke-width="2.3" fill="none" stroke-linecap="round"/>`+eye(-13,-15,8,11)+`<path d="M15 -21 L4 -17" stroke="#57E1FF" stroke-width="2.3" fill="none" stroke-linecap="round"/>`+eye(5,-15,8,11), mouth=`<path d="M-6 14 Q0 10 6 14" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    /* caras de un momento (portales y llaves): wow = ojos de estrella, sorpresa = ojos redondos y boca en O, triste */
    if(f==="wow") pupils=[-9,9].map(x=>`<polygon points="${starPts(7.5,x,-10)}" fill="#FFC21A" stroke="#FFF3C4" stroke-width="1"/>`).join(""), mouth=`<path d="M-9 8 Q0 20 9 8Z" fill="${m}" stroke="${m}" stroke-width="2" stroke-linejoin="round"/><path d="M-4 13 Q0 16 4 13" fill="#FF8FB3"/>`;
    if(f==="sorpresa") pupils=`<circle cx="-9" cy="-10" r="6.5" fill="#57E1FF"/><circle cx="9" cy="-10" r="6.5" fill="#57E1FF"/><circle cx="-7" cy="-12" r="2" fill="#fff"/><circle cx="11" cy="-12" r="2" fill="#fff"/>`, mouth=`<ellipse cx="0" cy="12" rx="4.5" ry="5.5" fill="${m}"/>`;
    if(f==="triste") pupils=`<path d="M-15 -19 L-5 -15 M15 -19 L5 -15" stroke="#57E1FF" stroke-width="2.3" stroke-linecap="round"/>`+eye(-13,-12,8,8)+eye(5,-12,8,8)+`<circle cx="-15" cy="-1" r="2.4" fill="#57E1FF" opacity=".9"/>`, mouth=`<path d="M-6 15 Q0 9 6 15" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
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
      /* los cuernos son manos (palma para arriba): al pasar el nivel hacen «six seven» (.robot.six en game.css). El brazo nace detrás de la cabeza */
      const hand=d=>{ const cx=d*28;
        return `<g class="h67 h67${d<0?"l":"r"}"><path d="M${d*12} -24 L${cx} -41" stroke="${k}" stroke-width="9" stroke-linecap="round"/><path d="M${d*12} -24 L${cx} -41" stroke="${m}" stroke-width="5" stroke-linecap="round"/>`+
          `<g transform="translate(${cx} -44) scale(${d} 1)"><path d="M-4 -6 Q-6 -15 -1 -15 Q2.5 -15 1.5 -6Z" fill="${m}" ${sw}/>`+ /* pulgar */
          `<path d="M-10 -2 Q-11 -9 -3 -9 L10 -9 Q16 -9 16 -5 Q16 -1 11 -1 L-4 1 Q-10 1 -10 -2Z" fill="${m}" ${sw}/>`+ /* palma y dedos, para arriba */
          `<path d="M5 -8.5 V-4.5 M9.5 -8.5 V-4.5" stroke="${l}" stroke-width="1.5" stroke-linecap="round"/></g></g>`; };
      back=hand(-1)+hand(1)+
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
    /* el id del filtro es único por dibujo: con uno fijo, si el primero quedaba en una pantalla oculta, los demás se veían invisibles */
    const gid=`glow-${s}-${++GLOW}`;
    return glow?`<defs><filter id="${gid}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="${glow}" flood-opacity=".9"/></filter></defs><g filter="url(#${gid})">${core}</g>`:core; }
  let GLOW=0;
  function rockSVG(){ return `<svg viewBox="0 0 100 100"><polygon points="50,12 86,31 50,50 14,31" fill="#D3DEE8" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>
  
   <polygon points="14,31 50,50 50,90 14,71" fill="#9CB0C2" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>
  
   <polygon points="86,31 50,50 50,90 86,71" fill="#7590A8" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/>
  
   <path d="M23 46v16M32 51v16" stroke="#C3D2DF" stroke-width="3" stroke-linecap="round"/></svg>`; }
  
  function starPts(r,cx=50,cy=52){ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r; p.push((cx+rr*Math.cos(a)).toFixed(1)+","+(cy+rr*Math.sin(a)).toFixed(1)); } return p.join(" "); }
  
  function goalSVG(){ return `<svg class="goal" viewBox="0 0 100 100"><circle cx="50" cy="52" r="42" fill="#FFF3C4" opacity=".75"/><polygon points="${starPts(40)}" fill="#FFC21A" stroke="#0D3049" stroke-width="3" stroke-linejoin="round"/><polygon points="${starPts(16)}" fill="#FFE27A"/></svg>`; }
  
  function batSVG(){ return `<svg class="bat" viewBox="0 0 100 100"><rect x="41" y="10" width="18" height="9" rx="2.5" fill="#0D3049"/><rect x="27" y="17" width="46" height="72" rx="11" fill="#fff" stroke="#0D3049" stroke-width="3.5"/>
  
   <rect x="35" y="26" width="30" height="15" rx="4" fill="#1EC48C"/><rect x="35" y="45" width="30" height="15" rx="4" fill="#1EC48C"/><rect x="35" y="64" width="30" height="16" rx="4" fill="#1EC48C"/></svg>`; }
  
  /* ===== Portales y llaves: dibujos ===== */
  const PCOL={O:["#2FB0F0","#BDE8FF","#14325C"],U:["#FF9A2E","#FFE2C2","#8A3D00"]}, KCOL={k:["#FFC21A","#FFE27A","Dorada"],j:["#FF6FB5","#FFD0E6","Rosa"],c:["#38BDF8","#BAE6FD","Celeste"]};
  function portalSVG(ch){ const [c,l,d]=PCOL[ch];
    return `<svg class="portal" viewBox="0 0 100 100"><defs><radialGradient id="pg-${ch}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${l}"/><stop offset=".8" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></radialGradient></defs>
     <circle class="ring" cx="50" cy="50" r="44" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="10 8" opacity=".8"/>
     <circle cx="50" cy="50" r="36" fill="url(#pg-${ch})" stroke="${d}" stroke-width="3"/>
     <g class="swirl">${[0,120,240].map(a=>`<path d="M50 50 C50 30 70 26 78 40" transform="rotate(${a} 50 50)" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`).join("")}</g>
     <circle class="core" cx="50" cy="50" r="8" fill="#fff"/></svg>`; }
  function keySVG(ch,cls="key"){ const [c,l]=KCOL[ch];
    return `<svg class="${cls}" viewBox="0 0 100 100"><circle cx="32" cy="50" r="19" fill="${c}" stroke="#0D3049" stroke-width="4.5"/><circle cx="32" cy="50" r="7" fill="#fff" stroke="#0D3049" stroke-width="3.5"/>
     <path d="M50 43 H86 V57 H80 V68 H71 V57 H64 V65 H56 V57 H50Z" fill="${c}" stroke="#0D3049" stroke-width="4.5" stroke-linejoin="round"/><path d="M22 40 a12 12 0 0 1 10 -4" stroke="${l}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`; }
  function doorSVG(ch){ const [c,l]=KCOL[DOORS[ch]];
    return `<svg class="door" viewBox="0 0 100 100"><rect x="12" y="6" width="76" height="90" rx="12" fill="#5B4331" stroke="#0D3049" stroke-width="4"/>
     <g class="panel"><rect x="18" y="12" width="64" height="80" rx="9" fill="${l}" stroke="#0D3049" stroke-width="3.5"/><path d="M28 28h44M28 46h44M28 64h44M28 80h44" stroke="${c}" stroke-width="4" stroke-linecap="round"/></g>
     <g class="lock"><path class="shackle" d="M39 52 v-9 a11 11 0 0 1 22 0 v9" fill="none" stroke="#0D3049" stroke-width="6" stroke-linecap="round"/><rect x="31" y="50" width="38" height="30" rx="7" fill="${c}" stroke="#0D3049" stroke-width="4"/><path d="M50 60 v9" stroke="#0D3049" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="60" r="4.5" fill="#0D3049"/></g></svg>`; }
  function starIco(on,dim="#D6E6F2"){ return `<svg viewBox="0 0 100 100"><polygon points="${starPts(46,50,53)}" fill="${on?"#FFC21A":dim}" stroke="${on?"#0D3049":"none"}" stroke-width="4" stroke-linejoin="round"/></svg>`; }
  
  function starRow(k,dim,n=3){ return Array.from({length:n},(_,i)=>starIco(i<k,dim)).join(""); }
  
  const ICO={
  
    arrow:d=>`<svg viewBox="0 0 32 32"><g transform="rotate(${{u:0,r:90,d:180,l:270}[d]} 16 16)"><path d="M16 3 29 16h-8v13H11V16H3z" fill="#fff" stroke="rgba(0,0,0,.12)" stroke-width="1.5" stroke-linejoin="round"/></g></svg>`,
  
    repeat:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M6.5 15a9.5 9.5 0 0 1 16.3-6.6M25.5 17a9.5 9.5 0 0 1-16.3 6.6" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><path d="M24 3v6.5h-6.5M8 29v-6.5h6.5" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
    key:()=>`<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="21" rx="6" fill="#fff" stroke="#4A3300" stroke-width="2.5"/><rect x="4" y="21" width="24" height="7" rx="3.5" fill="#4A3300"/></svg>`,
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
  
    flip:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M8 21a9 9 0 1 1 6.5 5.6" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round"/><path d="M4.5 16.5L8 21.5l4.6-3.8" fill="none" stroke="${c}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    music:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M12 24V7l14-3v17" fill="none" stroke="${c}" stroke-width="2.8" stroke-linejoin="round"/><circle cx="8.5" cy="24" r="4" fill="${c}"/><circle cx="22.5" cy="21" r="4" fill="${c}"/></svg>`,
  
    ifq:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M16 3l13 13-13 13L3 16z" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><path d="M13 13a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="21.6" r="1.6" fill="${c}"/></svg>`,
  
    clock:()=>`<svg viewBox="0 0 32 32"><path d="M13 3h6M16 3v4M24.5 8.5l2-2" stroke="#0D3049" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="18" r="11" fill="#fff" stroke="#0D3049" stroke-width="2.6"/><path d="M16 12v6l4 3" fill="none" stroke="#FF5A62" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  
    check:()=>`<svg viewBox="0 0 32 32"><path d="M6 17l6 6L26 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    code:(c="#fff")=>`<svg viewBox="0 0 32 32"><path d="M11 9 4 16l7 7M21 9l7 7-7 7M18.5 5.5l-5 21" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    portal:(c="#fff")=>`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="${c}" stroke-width="2.8"/><path d="M16 16c0-4 4-6 7-3M16 16c-4 0-6 4-3 7M16 16c3 2 2 7-2 7" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></svg>`,

    key:(c="#fff")=>`<svg viewBox="0 0 32 32"><circle cx="10" cy="16" r="6.5" fill="none" stroke="${c}" stroke-width="3"/><path d="M16.5 16H29M25 16v5M21 16v4" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`

  };
  
  $("ico3").innerHTML=ICO.pencil(); $("walletIco").innerHTML=starIco(true);
  
  $("icoRun").innerHTML=ICO.flag(); $("icoStep").innerHTML=ICO.step(); $("icoStop").innerHTML=ICO.restart(); $("icoHint").innerHTML=ICO.bulb();
  
  $("codeBtn").innerHTML=ICO.lock("#fff")+"<span>Código</span>"; $("trash").innerHTML=ICO.trash(); $("backBtn").innerHTML=ICO.back()+"<span>Misiones</span>";
  
  $("edPlay").innerHTML=ICO.flag()+"Jugar este mapa";
  
  { let i=0; $("heroTitle").innerHTML="Programa con GENI".split(" ").map(w=>`<b class="word">${[...w].map(ch=>`<span aria-hidden="true" style="--i:${i++};color:${w==="GENI"?"#3E6FA8":"#14325C"}">${ch}</span>`).join("")}</b>`).join(" "); }
  $("shopBtn").innerHTML=ICO.palette()+"<span>Taller del robot</span>"; $("mapBtn").innerHTML=ICO.pencil()+"<span>Mapa propio</span>";
  
  $("resetBtn").innerHTML=ICO.trash("currentColor")+"Borrar progreso";
  
  const RAIN=["#FFC21A","#1EC48C","#2FB0F0","#57E1FF","#FF9A2E","#FF5A62","#FF6FB5","#8B6CF0"];
  
  const pick=a=>a[Math.random()*a.length|0];
  
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
  
    dance:()=>[784,988,784,1175].forEach((f,i)=>tone(f,.1,"square",.05,i*.1)), flip:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.09,"sine",.08,i*.07)), nope:()=>{tone(300,.1,"triangle",.1);tone(240,.14,"triangle",.1,.09)},
  
    unlock:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.2,"triangle",.11,i*.09)),
  
    buy:()=>[988,1319,1568].forEach((f,i)=>tone(f,.16,"square",.05,i*.08)),
  
    portal:()=>{ [330,440,587,784,1046,1397].forEach((f,i)=>tone(f,.16,"sine",.08,i*.045)); tone(1760,.35,"triangle",.04,.28); tone(2093,.3,"sine",.03,.36); },
    key:()=>[1319,1568,1319,1976,2349].forEach((f,i)=>tone(f,.1,"triangle",.08,i*.06)),
    door:()=>{ tone(240,.07,"square",.06); tone(480,.1,"triangle",.08,.07); [523,659,784,1047].forEach((f,i)=>tone(f,.18,"triangle",.09,.2+i*.08)); },
    locked:()=>{ tone(170,.12,"square",.08); tone(140,.18,"square",.08,.11); },
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
  
  function show(id){ SCREEN=id; document.body.dataset.scr=id; const WW=typeof WORLD==="number"?WORLDS.find(w=>w.id===WORLD):null; document.body.dataset.world=(id==="menu"||id==="game")&&WW?WW.theme:""; ["menu","game","editor","shop"].forEach(x=>$(x).classList.toggle("hidden",x!==id)); scrollTo(0,0);
  
    if(id!=="game"&&CH) endChallenge(); /* salir del juego cancela el desafío en curso */
  
    const inCh=id==="game"&&!!(G&&G.map.ch);
  
    const inW=id==="menu"&&!!WORLD; if(inW){ if(WW) setTop(WORLD,"Mundo "+WORLD+" · "+WW.title); else setTop(ICO.pencil(),"Mapa propio"); }
    $("backBtn").classList.toggle("hidden",id==="menu"&&!WORLD); $("codeBtn").classList.toggle("hidden",id!=="menu"); $("logo").classList.toggle("hidden",id!=="menu"||inW);
  
    $("tTitle").classList.toggle("hidden",id==="menu"&&!inW); $("tStars").classList.toggle("hidden",id!=="game"||inCh); $("tTimer").classList.toggle("hidden",!inCh); }
  
  function setTop(num,name){ $("tNum").innerHTML=num; $("tName").textContent=name; }
  
  function renderTopStars(){ const k=G&&G.map.id!=="custom"?(SAVE.stars[G.map.id]||0):0; $("tStars").innerHTML=starRow(k,"rgba(255,255,255,.45)",G?maxStars(G.map):3); }
  
  $("backBtn").onclick=()=>{ if(SCREEN==="game") stopRun(); else if(SCREEN==="menu") WORLD=null; renderMenu(); show("menu"); };
  
  $("wallet").onclick=()=>openShop();
  
  
  
  /* ================= menú ================= */
  
  function miniMap(rows,s=14){ if(s===14) s=Math.max(5,Math.min(14,Math.floor((144-6-2*(rows[0].length-1))/rows[0].length))); /* en las tarjetas, los mapas largos se achican para no salirse */ let h=`<div class="mini" style="grid-template-columns:repeat(${rows[0].length},${s}px);--ms:${s}px">`;
  
    for(const row of rows) for(const ch of row) h+=`<i class="${ch==="#"?"r":ch==="."?"":ch}"></i>`; return h+"</div>"; }
  
  function partIco(P){ const p=P.id; if(P.py) return ICO.code(); if(P.icon) return ICO[P.icon](); return p===1?ICO.arrow("r"):p===2?ICO.brush():p===3?ICO.repeat():p===5?ICO.music():p===4.5||p===5.5?ICO.repeat():p===9||p===10?ICO.key():ICO.ifq(); }
  
  function lockWhy(st){ return st.worldLock?worldWhy(st.worldLock):st.gate?`Primero ${gateTxt(SAVE.stars,st.gate,true).replace(/^./,c=>c.toLowerCase())}`:st.needCode?"Pedile el código a tu profe":st.prevLeft?`Primero terminá «${st.prevTitle}»`:`Necesitás ${st.g.need} estrellas de esta parte (tenés ${st.earned})`; }
  
  const ADV_OPEN={}; /* «Niveles avanzados» de cada mundo: empieza plegado */
  function renderMenu(onlyAdv=false){
  
    if(!onlyAdv){ fixSkin(); $("heroBot").innerHTML=robotSVG(); $("logoBot").innerHTML=robotSVG(); renderWallet();
  
    $("total").innerHTML=starIco(true)+`${earned()} estrellas ganadas`; }
  
    const GS=groupsNow(); let h="", i=0, fresh=false;

    /* una card por parte; cada grupo de niveles se abre por separado */
    const partHTML=P=>{
      const sts=GS.filter(s=>s.g.part===P.id), ms=MISSIONS.filter(m=>m.part===P.id), got=ms.reduce((a,m)=>a+(SAVE.stars[m.id]||0),0);
      let o=`<section class="grp" style="--gc:${P.c};--gl:${P.l}"><div class="grph">`+
        `<span class="gdot">${partIco(P)}</span><div><h3>Parte ${P.id} · ${P.title}</h3><span class="gsub">${P.sub}</span></div>`+(P.extra&&ms.length&&ms.every(m=>(SAVE.stars[m.id]||0)>=maxStars(m))?`<span class="plat">${starIco(true)}Platino</span>`:"")+
        (PROFE&&P.code?`<span class="profe">Código: ${P.code}</span>`:"")+(P.hidden?`<span class="profe poff">Oculta para alumnos</span>`:"")+
        `<span class="gprog">${starIco(true)} ${got} / ${ms.reduce((a,m)=>a+maxStars(m),0)}</span></div><div class="cards">`;
      for(const st of sts){
        const g=st.g, isNew=st.open&&!SAVE.seen.includes(g.id);
        if(isNew){ SAVE.seen.push(g.id); fresh=true; }
        const need=st.gate?gateTxt(SAVE.stars,st.gate):st.needCode?"Pedile el código a tu profe":st.prevLeft?"Terminá los anteriores":`Juntá ${g.need}${starIco(true)}`;
        o+=st.ms.map(m=>{ const k=SAVE.stars[m.id]||0;
          return `<button class="card${k>=maxStars(m)?" s3":""}${st.open?"":" locked"}${isNew?" new":""}" data-id="${m.id}" data-why="${lockWhy(st)}"${st.needCode?` data-code="${st.needCode}"`:""} style="--i:${i++};--gc:${g.c};--gl:${g.l}"><span class="num">${m.num}</span>${miniMap(m.rows)}<h3>${m.title}</h3>`+
            (st.open?`<div class="stars">${starRow(k,undefined,maxStars(m))}</div>`:`<span class="need">${need}</span><span class="lock">${ICO.lock()}</span>`)+`</button>`; }).join("");
      }
      return o+`</div></section>`;
    };

    /* niveles avanzados (partes extra) de un mundo: opcionales, abajo de todo y plegados (ADV_OPEN por mundo).
       Sus cards cuentan la demora de la animación desde 0, así aparecen enseguida al abrirlos */
    const advHTML=w=>{ const EXTRA=worldParts(w).filter(P=>P.extra), on=!!ADV_OPEN[w];
      const xs=GS.filter(s=>EXTRA.some(P=>P.id===s.g.part)), xOpen=xs.some(s=>s.open), xNew=xs.some(s=>s.open&&!SAVE.seen.includes(s.g.id));
      const base=[...new Set(EXTRA.flatMap(P=>P.after))].map(id=>PARTS.find(P=>P.id===id)).filter(Boolean).map(P=>`«${P.title}»`);
      const why=`Terminá ${base.join(" o ")} (con su desafío) para abrirlos`;
      let o=`<section class="grp advgrp${on?" on":""}"><div class="grph">`+
        `<span class="gdot">${ICO.star()}</span><div><h3>Niveles avanzados</h3><span class="gsub">más difíciles, para los que quieren más</span></div></div>`+
        `<button class="advcard${xOpen?"":" locked"}${xNew?" new":""}" id="advBtn" data-why="${why}" aria-expanded="${on}">`+
        `<span class="advtag">Opcional</span><span class="advtxt">${EXTRA.map(P=>P.title).join(" · ")}</span>`+
        (xOpen?`<span class="advgo">${on?"Ocultar":"Ver niveles"}${ICO.next()}</span>`:`<span class="need">${ICO.lock("#9A5A00")}${why}</span>`)+`</button>`;
      if(on&&xOpen){ i=0; o+=`<div class="advparts">${EXTRA.map(partHTML).join("")}</div>`; }
      return o+`</section>`;
    };
    const celebrateNew=()=>{ if(fresh){ persist(); setTimeout(()=>{ confetti(); SND.unlock(); toast(ICO.unlock(),"¡Desbloqueaste niveles nuevos!"); },500); } };

    /* abrir o cerrar los avanzados del mundo abierto: se redibuja solo esa sección, no todo el menú */
    if(onlyAdv){ const sec=document.querySelector("#parts .advgrp"); if(sec&&typeof WORLD==="number"){ sec.outerHTML=advHTML(WORLD); if(fresh) persist(); return; } } /* sin confeti: abrirlos no es desbloquear nada */

    /* cada mundo es una página: sus partes, sus desafíos (una card por desafío, como los niveles) y sus niveles avanzados plegados.
       La demora de la animación empieza en 0 en cada mundo, así no espera a las cards de los otros */
    const HW={};
    for(const W of WORLDS){ i=0; h="";
      for(const P of worldParts(W.id)) if(!P.extra) h+=partHTML(P);
      const chs=CHALLENGES.filter(c=>worldOf(c.part)===W.id);
      if(chs.length){
        const chGot=chs.reduce((a,c)=>a+(SAVE.stars[c.id]||0),0);
        h+=`<section class="grp chgrp" style="--gc:#8B6CF0;--gl:#E6DFFF"><div class="grph">`+
          `<span class="gdot">${ICO.clock()}</span><div><h3>Desafíos</h3><span class="gsub">3 niveles seguidos, con cronómetro · se abren al terminar cada parte</span></div>`+
          `<span class="gprog">${starIco(true)} ${chGot} / ${chs.length*3}</span></div><div class="cards chcards">`;
        for(const ch of chs){
          const open=chOpen(ch), isNew=open&&!SAVE.seen.includes(ch.id);
          if(isNew){ SAVE.seen.push(ch.id); fresh=true; }
          h+=chCard(ch,i++,open,isNew);
        }
        h+=`</div></section>`;
      }
      if(worldParts(W.id).some(P=>P.extra)) h+=advHTML(W.id);
      HW[W.id]=h; }
    i=0; renderWorlds(HW);
  
    let c=`<button class="card make" id="makeBtn" style="--i:${i++}"><span class="plus">+</span><h3>Creá tu mapa</h3></button>`;
  
    if(SAVE.custom) c+=`<button class="card" data-id="custom" style="--i:${i}">${miniMap(SAVE.custom.rows)}<h3>Mi mapa</h3></button>`;
  
    $("cards3").innerHTML=c;
    ["hero","worlds"].forEach(id=>$(id).classList.toggle("hidden",!!WORLD)); $("parts").classList.toggle("hidden",typeof WORLD!=="number");
    ["sec3","cards3"].forEach(id=>$(id).classList.toggle("hidden",WORLD!=="map"));
  
    celebrateNew();
  
  }
  
  /* pantalla de mundos (WORLD=null) o página del mundo elegido */
  const SOON_EV=`<section class="soonev"><div class="evpad"><span class="ek u">${ICO.arrow("u")}</span><span class="ek l">${ICO.arrow("l")}</span><span class="ek d">${ICO.arrow("d")}</span><span class="ek r">${ICO.arrow("r")}</span></div>`+
    `<div class="evtxt"><span class="evtag">Próximamente</span><h3>Eventos con flechas</h3><p>Cada flecha va a tener su propio programa. El robot junta cosas, las guarda en el inventario y termina cruzando un portal.</p>`+
    `<div class="evinv"><i></i><i></i><i></i><i></i></div></div><div class="evportal"></div></section>`;
  /* carrusel: un mundo por vez, con su número, su dibujo y flechas (o deslizar / flechas del teclado) */
  function renderWorlds(HW){
    CAR=Math.max(0,Math.min(CAR,WORLDS.length-1));
    const slides=WORLDS.map((W,k)=>{ const soon=worldSoon(W.id), locked=worldLocked(W.id), got=worldStars(W.id), max=worldMax(W.id),
      names=worldParts(W.id).map(p=>`<span class="wchip">${p.title}</span>`).join(""), why=soon?"Próximamente":locked?worldWhy(W.id):"";
      return `<div class="wslide${locked?" locked":""}" data-world="${W.theme}" style="--wc:${W.c};--wl:${W.l}">`+
        `<span class="wnum">${W.id}</span><h2>${W.title}</h2><p>${W.sub}</p>`+
        `<button class="wart" data-w="${W.id}" data-why="${why}" aria-label="Entrar al mundo ${W.title}">${worldArt(W)}${locked?`<span class="wlock">${ICO.lock("#fff")}</span>`:""}</button>`+
        `<div class="wchips">${names}</div>`+
        (locked?`<span class="need">${ICO.lock("#9A5A00")}Próximamente</span>`
               :`<button class="wgo" data-w="${W.id}"><span class="wst">${starIco(true)} ${got} / ${max}</span><span>Jugar</span>${ICO.next()}</button>`)+
        (PROFE&&W.lock?`<span class="profe">Bloqueado para alumnos</span>`:"")+`</div>`; }).join("");
    $("worlds").innerHTML=`<button class="carr prev" id="carPrev" aria-label="Mundo anterior">${CHEV}</button>`+
      `<div class="carview"><div class="cartrack" id="carTrack">${slides}</div></div>`+
      `<button class="carr next" id="carNext" aria-label="Mundo siguiente">${CHEV}</button>`+
      `<div class="cardots">${WORLDS.map((W,k)=>`<button class="cdot" data-k="${k}" aria-label="Mundo ${W.id}: ${W.title}"></button>`).join("")}</div>`;
    carGo(CAR,true);
    if(typeof WORLD==="number"){ const W=WORLDS.find(w=>w.id===WORLD);
      $("parts").innerHTML=`<section class="wbanner"><h2>${W.title}</h2><span>${W.sub}</span></section>`+(HW[WORLD]||"")+(W.theme==="ev"?SOON_EV:""); }
  }
  const CHEV=`<svg viewBox="0 0 40 64"><path d="M8 6 L33 32 L8 58" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function carGo(k,quiet){ const n=WORLDS.length; k=Math.max(0,Math.min(n-1,k)); if(!quiet&&k!==CAR) SND.pick(); CAR=k;
    const t=$("carTrack"); if(!t) return; t.style.setProperty("--k",k);
    t.querySelectorAll(".wslide").forEach((el,i)=>{ el.setAttribute("aria-hidden",String(i!==k)); el.querySelectorAll("button").forEach(b=>b.tabIndex=i===k?0:-1); });
    $("carPrev").classList.toggle("off",k===0); $("carNext").classList.toggle("off",k===n-1);
    document.querySelectorAll("#worlds .cdot").forEach((d,i)=>d.classList.toggle("on",i===k)); }
  /* dibujo de cada mundo: GENI sobre unas baldosas en perspectiva y algo de lo que enseña el mundo (según W.theme) */
  function worldArt(W){
    const iso=(x,y)=>[124+(x-y)*36,92+(x+y)*21];
    const tile=(x,y,top="#C9D6E8",side="#9FB2CC")=>{ const [cx,cy]=iso(x,y), st=`stroke="#53657E" stroke-width="2" stroke-linejoin="round"`;
      return `<path d="M${cx-36} ${cy} L${cx} ${cy+21} L${cx} ${cy+33} L${cx-36} ${cy+12}Z" fill="${side}" ${st}/>`+
        `<path d="M${cx} ${cy+21} L${cx+36} ${cy} L${cx+36} ${cy+12} L${cx} ${cy+33}Z" fill="${side}" opacity=".85" ${st}/>`+
        `<path d="M${cx} ${cy-21} L${cx+36} ${cy} L${cx} ${cy+21} L${cx-36} ${cy}Z" fill="${top}" ${st}/>`; };
    const GOAL=["#F6D77A","#D2AE45"];
    const floor=cells=>cells.slice().sort((a,b)=>(a[0]+a[1])-(b[0]+b[1])).map(c=>tile(...c)).join("");
    const bot=(x,y)=>{ const [cx,cy]=iso(x,y); return `<ellipse cx="${cx}" cy="${cy+2}" rx="20" ry="7" fill="rgba(13,48,73,.25)"/><g class="wbot"><svg x="${cx-38}" y="${cy-74}" width="76" height="76" viewBox="-50 -50 100 100" overflow="visible">${robotSVG()}</svg></g>`; };
    const star=(x,y)=>{ const [cx,cy]=iso(x,y); return `<g class="wstar"><polygon points="${starPts(17,cx,cy-26)}" fill="#FFC21A" stroke="#B98500" stroke-width="2.5" stroke-linejoin="round"/></g>`; };
    const arrow=(cx,cy,r,rot)=>`<path transform="rotate(${rot} ${cx} ${cy})" d="M${cx-r} ${cy} H${cx+r*.6} M${cx+r*.1} ${cy-r*.6} L${cx+r} ${cy} L${cx+r*.1} ${cy+r*.6}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    const chip=(x,y,w,h,fill,inner,cls="")=>`<g class="wfloat ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="#0D3049" stroke-width="2.5"/>${inner}</g>`;
    const txt=(x,y,t,size=22)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="#fff" font-family="inherit">${t}</text>`;
    let h="";
    if(W.theme==="seq"){ /* una fila de órdenes, una después de la otra */
      h=floor([[0,0],[1,0],[2,0],[2,1],[2,2,...GOAL]])+bot(0,0)+star(2,2)+
        [0,0,90].map((r,i)=>chip(250,22+i*42,54,34,"#3B82F0",arrow(277,39+i*42,13,r),"d"+i)).join(""); }
    else if(W.theme==="opt"){ /* repetir y funciones: menos bloques */
      h=floor([[0,0],[1,0],[2,0],[3,0],[3,1,...GOAL]])+bot(0,0)+star(3,1)+
        chip(232,22,78,50,"#FF9A2E",`<path d="M250 47a10 10 0 0 1 17-7M266 49a10 10 0 0 1-17 7" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`+txt(290,56,"×4"),"d0")+
        chip(240,90,62,40,"#5B6CF0",txt(271,117,"f( )"),"d1"); }
    else if(W.theme==="cond"){ /* el robot mira la celda y decide */
      h=floor([[0,0],[1,0,"#FF8A8F","#D9545B"],[2,0],[0,1],[1,1],[2,1,"#7EE0A8","#3FAE70"],[1,2],[2,2,...GOAL]])+bot(0,0)+star(2,2)+
        `<g class="wfloat d0"><path d="M272 16 L306 50 L272 84 L238 50Z" fill="#0EA5A4" stroke="#0D3049" stroke-width="2.5" stroke-linejoin="round"/>${txt(272,62,"?",34)}</g>`+
        `<g class="wfloat d1"><circle cx="255" cy="114" r="13" fill="#FF5A62" stroke="#0D3049" stroke-width="2.5"/><circle cx="290" cy="114" r="13" fill="#1EC48C" stroke="#0D3049" stroke-width="2.5"/></g>`; }
    else if(W.theme==="portal"){ /* portales y llaves */
      const [ax,ay]=iso(1,0), [bx,by]=iso(2,1);
      h=floor([[0,0],[1,0],[2,1],[3,1,...GOAL]])+
        `<g class="wportal"><ellipse cx="${ax}" cy="${ay}" rx="21" ry="11" fill="#57E1FF" stroke="#0E7490" stroke-width="3"/><ellipse cx="${bx}" cy="${by}" rx="21" ry="11" fill="#57E1FF" stroke="#0E7490" stroke-width="3"/></g>`+
        bot(0,0)+star(3,1)+
        `<g class="wfloat d0"><circle cx="252" cy="44" r="13" fill="none" stroke="#F5B800" stroke-width="6"/><path d="M265 44 H300 M292 44 v11 M282 44 v8" fill="none" stroke="#F5B800" stroke-width="6" stroke-linecap="round"/></g>`; }
    else { /* eventos: cada tecla, una acción */
      h=floor([[0,0],[1,0],[1,1],[2,1,...GOAL]])+bot(0,0)+star(2,1)+
        [[0,0,-90],[-1,1,180],[0,1,90],[1,1,0]].map(([dx,dy,r],i)=>{ const x=268+dx*38, y=22+dy*38;
          return chip(x-16,y,34,34,"#8B5CF6",arrow(x+1,y+17,10,r),"d"+(i%3)); }).join(""); }
    return `<svg class="wsvg" viewBox="0 0 320 210" aria-hidden="true">${h}</svg>`;
  }
  function chCard(ch,i,open,isNew){
    const k=SAVE.stars[ch.id]||0, best=SAVE.best[ch.id], why=`Terminá todos los niveles de la ${partName(ch.part)}`, P=PARTS.find(p=>p.id===ch.part);
    return `<button class="chcard${open?"":" locked"}${k===3?" s3":""}${isNew?" new":""}" data-ch="${ch.id}" data-why="${why}" style="--i:${i}${P?`;--gc:${P.c};--gl:${P.l}`:""}">`+
      `<span class="chico">${ICO.clock()}</span><span class="chtag">${P?P.title:"Desafío"}</span>`+
      `<div class="chmaps">${ch.levels.map(m=>miniMap(m.rows,6)).join("")}</div><h3>${ch.title}</h3>`+
      (open?`<div class="chrow"><span class="stars">${starRow(k)}</span>${best!=null?`<span class="chbest">${ICO.clock()}${fmtTime(best)}</span>`:""}</div>`
           :`<span class="need">Terminá la parte ${ch.part}</span><span class="lock">${ICO.lock()}</span>`)+`</button>`;
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

  /* ===== Configuración del profe (inicio) =====
     botón «Configuración» (solo con ?profe): login con usuario y contraseña (lo controla el servidor, app/api/profe) y un interruptor
     por parte en cada vista. Lo oculto desaparece para los alumnos de esa vista; acá se ve marcado «Oculta para alumnos» */
  const ED_NAMES={normal:"Normal",chicos:"Chicos (6 a 8)",python:"Python"};
  async function profeApi(path,body){
    const r=await fetch("/api/profe/"+path,body===undefined?{cache:"no-store"}:{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const j=await r.json().catch(()=>({})); if(!r.ok) throw Object.assign(new Error(j.error||"No se pudo conectar"),{status:r.status}); return j; }
  async function openConfig(){
    try{ cfgPanel((await profeApi("config")).hidden); }catch{ cfgLogin(); } }
  function cfgLogin(){
    const d=openModal(`<span class="mico">${ICO.lock("#FFC21A")}</span><h2>Configuración</h2><p>Entrá con tu usuario de profe.</p>`+
      `<form id="cfgForm"><input class="minput" id="cfgUser" type="email" autocomplete="username" placeholder="Usuario" aria-label="Usuario">`+
      `<div class="cfgpass"><input class="minput" id="cfgPass" type="password" autocomplete="current-password" placeholder="Contraseña" aria-label="Contraseña">`+
      `<button type="button" class="cfgeye" id="cfgEye" aria-pressed="false">Ver</button></div>`+
      `<div class="mbtns"><button type="button" class="mbtn alt" data-later>Cancelar</button><button class="mbtn" data-go>Entrar${ICO.next()}</button></div></form>`);
    const u=d.querySelector("#cfgUser"), p=d.querySelector("#cfgPass"), go=d.querySelector("[data-go]"); setTimeout(()=>u.focus(),60);
    d.querySelector("[data-later]").onclick=closeModal;
    const eye=d.querySelector("#cfgEye"); eye.onclick=()=>{ const show=p.type==="password"; p.type=show?"text":"password";
      eye.textContent=show?"Ocultar":"Ver"; eye.setAttribute("aria-pressed",String(show)); p.focus(); };
    d.querySelector("#cfgForm").onsubmit=async e=>{ e.preventDefault(); go.disabled=true;
      try{ const j=await profeApi("login",{user:u.value,pass:p.value}); cfgPanel(j.hidden); }
      catch(err){ go.disabled=false; bumpEl(p,"no"); SND.nope(); p.select(); toast(ICO.lock("#FFC21A"),err.message); } };
  }
  function cfgPanel(hidden){
    const state={normal:[...(hidden.normal||[])],chicos:[...(hidden.chicos||[])],python:[...(hidden.python||[])]};
    let tab=ED.kind;
    const d=openModal(`<span class="mico">${ICO.unlock()}</span><h2>Configuración</h2><p>Elegí qué partes ven los alumnos en cada vista.</p>`+
      `<div class="cfgtabs" role="tablist">${Object.keys(ED_NAMES).map(k=>`<button type="button" role="tab" data-tab="${k}">${ED_NAMES[k]}</button>`).join("")}</div>`+
      `<div class="cfglist" id="cfgList"></div>`+
      `<div class="mbtns"><button class="mbtn alt" data-out>Salir</button><button class="mbtn alt" data-later>Cerrar</button><button class="mbtn" data-go>Guardar${ICO.next()}</button></div>`);
    d.querySelector(".mbox").classList.add("cfgbox");
    const draw=()=>{ d.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===tab)));
      d.querySelector("#cfgList").innerHTML=EDITION_PARTS[tab].map(P=>{ const on=!state[tab].includes(P.id);
        return `<label class="cfgrow"><span>Parte ${P.id} · ${escH(P.title)}${P.extra?' <i>extra</i>':""}</span>`+
          `<input type="checkbox" role="switch" data-p="${P.id}"${on?" checked":""}><b>${on?"Visible":"Oculta"}</b></label>`; }).join(""); };
    d.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{ tab=b.dataset.tab; draw(); });
    d.querySelector("#cfgList").addEventListener("change",e=>{ const id=Number(e.target.dataset.p), on=e.target.checked;
      state[tab]=on?state[tab].filter(x=>x!==id):[...state[tab],id]; e.target.nextElementSibling.textContent=on?"Visible":"Oculta"; });
    d.querySelector("[data-later]").onclick=closeModal;
    d.querySelector("[data-out]").onclick=async()=>{ await profeApi("logout",{}).catch(()=>{}); closeModal(); toast(ICO.lock("#FFC21A"),"Saliste de la configuración"); };
    const save=d.querySelector("[data-go]");
    save.onclick=async()=>{ save.disabled=true;
      try{ for(const k of Object.keys(state)) await profeApi("config",{edition:k,hidden:state[k]});
        PARTS.forEach(P=>P.hidden=state[ED.kind].includes(P.id)); closeModal(); renderMenu(); toast(ICO.unlock(),"¡Guardado! Los alumnos lo ven al recargar la página"); }
      catch(err){ save.disabled=false; toast(ICO.lock("#FFC21A"),err.message); if(err.status===401) cfgLogin(); } };
    draw();
  }
  if(PROFE){ const b=document.createElement("button"); b.className="resetbtn cfgbtn"; b.id="cfgBtn"; b.innerHTML=ICO.lock("#FFC21A")+"<span>Configuración</span>";
    b.onclick=openConfig; $("resetBtn").before(b); }
  /* ===== Configuración del profe (fin) ===== */
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
    if(e.target.closest("#mapBtn")){ WORLD="map"; renderMenu(); return show("menu"); }
    if(e.target.closest("#carPrev")) return carGo(CAR-1);
    if(e.target.closest("#carNext")) return carGo(CAR+1);
    const dot=e.target.closest(".cdot"); if(dot) return carGo(+dot.dataset.k);
    const wc=e.target.closest("[data-w]");
    if(wc){ const w=+wc.dataset.w, k=WORLDS.findIndex(x=>x.id===w); if(k!==CAR) return carGo(k);
      if(worldLocked(w)){ bumpEl(wc.closest(".wslide"),"no"); SND.nope(); return toast(ICO.lock("#FFC21A"),wc.dataset.why||worldWhy(w)); }
      WORLD=w; renderMenu(); return show("menu"); }
  
  
    const a=e.target.closest("#advBtn");
    if(a){ if(a.classList.contains("locked")){ bumpEl(a,"no"); SND.nope(); return toast(ICO.lock("#FFC21A"),a.dataset.why); }
      const w=WORLD; ADV_OPEN[w]=!ADV_OPEN[w]; renderMenu(true); if(ADV_OPEN[w]){ const el=document.querySelector(".advparts"); el&&el.scrollIntoView({block:"start",behavior:RM.matches?"auto":"smooth"}); } return; }

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
  
      const inner=ch==="#"?rockSVG():ch==="E"?goalSVG():ch==="B"?batSVG():PCOL[ch]?portalSVG(ch):KCOL[ch]?keySVG(ch):DOORS[ch]?doorSVG(ch):(ch==="R"&&!withRobot)?`<svg class="rsvg" viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`:"";
  
      h+=`<div class="cell${(r+c)%2?" alt":""}${ch==="X"?" red":ch==="V"?" green":MULTI.includes(ch)?" multi mc-"+ch:PCOL[ch]?" portalc po-"+ch:DOORS[ch]?" doorc":""}" data-r="${r}" data-c="${c}" style="--i:${r+c}">${inner}</div>`; }
  
    if(withRobot) h+=`<div class="robot noanim${intro?" drop":""}" id="bot" data-look="r"><div class="shadow"></div><div class="bob"><svg viewBox="-50 -50 100 100">${robotSVG()}</svg></div><span class="penmark">${ICO.brush()}</span><span class="keymark"></span></div>`;
  
    holder.innerHTML=h+"</div>";
  
    return cs+3; // paso entre casillas (incluye separación)
  
  }
  
  
  
  /* ================= juego ================= */
  
  let G=null; const PROGS={}, FUNCS={}, NAMES={}, EVS={}; /* EVS: eventos por nivel {tecla:{x,y,body}} (tampoco se guardan en localStorage) */ /* funciones y sus nombres por nivel (no se guardan en localStorage, como PROGS) */
  const PYCODE={}; /* código de Python por nivel (tampoco se guarda en localStorage) */
  const PY_START="def main():\n    ...\n\nmain()\n";
  let PY_PICK=true; /* en los niveles que dejan elegir: true = «Elegir» (selects), false = «Escribir». Se recuerda entre niveles */
  
  function startPlay(map){
  
    PROGS[map.id]=PROGS[map.id]||[]; EVS[map.id]=EVS[map.id]||{};
    /* funciones: tools «f» (1 función, 2 si el mapa dice fns:2); pre: cuerpos ya armados */
    const fids=(map.tools??"r").includes("f")?(map.fns===2?["A","B"]:["A"]):[];
    if(!FUNCS[map.id]){ FUNCS[map.id]={}; NAMES[map.id]={}; fids.forEach(f=>{ FUNCS[map.id][f]=map.pre&&map.pre[f]?parseSol(map.pre[f]):[]; }); }
  
    const S=startState(map), opt=optFor(map,shortest(map,S));
  
    const tools=map.tools??"r"; /* el mapa propio (cls 0) tiene repetir */
  
    G={map,rows:map.rows,n:map.rows.length,m:map.rows[0].length,nB:countB(map.rows),nX:cellsOf(map.rows,"X").length,nV:cellsOf(map.rows,"V").length,nM:multiCells(map.rows).length,
  
       prog:PROGS[map.id],funcs:FUNCS[map.id],names:NAMES[map.id],fids,fn:fids.length>0,lock:map.lock||[],run:0,busy:false,ctx:null,S,tools,rep:tools.includes("r"),opt,max:limitFor(map,opt),hint:false,
       ev:!!map.ev,free:!!map.free,capture:null,keys:map.keys?[...map.keys]:[],evs:EVS[map.id],listen:false,live:false,pn:0,kq:Promise.resolve()}; /* eventos: teclas del nivel, sus bloques (evs), si espera teclas (listen) y cuántas acciones hizo (pn) */
  
    /* mundos: wm = mapa del mundo que se está jugando, worlds = filas de los mundos de este intento, wi = mundo actual (null si no corre) */
    G.tries=0; G.pathLen=(shortest(map,S)||[]).length; /* adv: intentos fallidos y largo del camino más corto, para las estrellas */
    G.wm=map; G.worlds=map.worlds?pickWorlds(map):null; G.wi=null; G.keepW=false; G.conds=map.conds||["x","v"]; /* en el si siempre se elige el color: roja o verde */
    /* Python: el programa es texto (G.code); se lee con parsePy al tocar Ir */
    G.fun=/[OUkjcKJC]/.test(map.rows.join("")); G.nK=[...new Set(map.rows.join("").match(/[kjc]/g)||[])]; /* portales y llaves */
    G.py=!!map.py; G.code=G.py?(PYCODE[map.id]??(map.pre??PY_START)):""; G.pyAst=null; $("game").classList.toggle("pymode",G.py);
    /* modo «Elegir» (cada línea con selects): obligatorio con pick:"only" (parte 2); en los demás niveles de código se elige con el botón */
    G.pickOnly=G.py&&map.pick==="only"; G.pick=G.py&&(G.pickOnly||PY_PICK); G.pkSel=null;


    setTop(map.num||ICO.pencil(),map.ch?`Desafío · Nivel ${map.num} de 3`:map.title); renderTopStars();

    $("hintBtn").classList.toggle("hidden",!!map.ch||!!map.need||!!map.worlds||map.cls===3||G.py||G.ev); $("stepBtn").classList.toggle("hidden",G.ev); $("pauseBtn").classList.toggle("hidden",G.ev); $("pauseBtn").disabled=true; renderKeypad();

    renderPalette(); show("game"); drawBoard(false,true); renderProg(true);
  
    const lim=`Podés usar hasta ${G.max} bloques`, toStar=hasE(map)?", después a la estrella":"";
  
    if(map.ch&&map.num===1){ const ch=CHALLENGES.find(c=>c.id===map.ch);
  
      say("",ICO.clock(),"El reloj mide cuánto tardás",`3 estrellas: menos de ${fmtTime(ch.t3)} · 2 estrellas: menos de ${fmtTime(ch.t2)}`); }
    else if(map.tip) say("",G.py?ICO.code("#3776AB"):G.fun?(/[kjc]/.test(map.rows.join(""))&&!/[OU]/.test(map.rows.join(""))?ICO.key("#B98500"):ICO.portal("#06B6D4")):ICO.blocks(),map.tip[0],map.tip[1]+(map.goal?` · Meta: ${map.goal} líneas`:""));
    else if(G.py&&G.pick) say("",ICO.code("#3776AB"),"¡Armá el programa en Python!","En cada línea elegí la orden · ＋ agrega una línea · Ir para probar");
    else if(G.py) say("",ICO.code("#3776AB"),"¡Escribí el programa en Python!","Tocá un comando de la izquierda para agregarlo · Ir para probar");

    else if(map.adv) say("",ICO.blocks(),"¡Una función que se llama a sí misma!",`Creá tu función y llamala adentro de ella misma: se repite hasta llegar a la estrella${G.nX||G.nV?" · Pintá las rojas y bailá en las verdes":""} · ${lim}`);
    else if(map.worlds) say("",ICO.ifq("#6366F1"),"¡El mapa cambia!",`Tu programa tiene que funcionar en todos los mapas · Normal: de a uno · Doble: todos a la vez · ${lim}`);
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
    if(isMulti()) return drawBoards(intro);
    unMulti();
    const [w,h]=boardSpace(); G.step=buildBoard($("gBoard"),G.rows,true,w,h,intro);
  
    if(intro) setTimeout(()=>{ const b=$("bot"); b&&b.classList.remove("drop"); },1300);
  
    if(!keep) return resetRobot();
  
    const mark=(keys,cls)=>keys.forEach(k=>{ const [r,c]=k.split(",").map(Number); cellEl(r,c).classList.add(cls); });
  
    mark(G.S.got,"got"); mark(G.S.pnt,"pnt"); mark(G.S.dan,"danced"); mark(G.S.flp||[],"flipped"); mark(G.S.open||[],"open"); keyCells(G.S.keys||[]).forEach(el=>el.classList.add("got")); $("bot").classList.toggle("pen",!!G.S.pen);
  
    placeNow();
  
  }
  
  function cellEl(r,c){ return $("gBoard").querySelector(`.cell[data-r="${r}"][data-c="${c}"]`); }
  /* celdas de las llaves ya agarradas (para dibujarlas como juntadas) */
  function keyCells(ks){ return [...$("gBoard").querySelectorAll(".cell")].filter(el=>ks.includes(G.rows[+el.dataset.r][+el.dataset.c])); }
  /* GENI cambia de cara un momento (wow, sorpresa, triste) y vuelve a la suya; null la vuelve ya */
  let faceT=null;
  function setFace(f,ms=900){ clearTimeout(faceT); const sv=()=>$("bot")&&$("bot").querySelector(".bob svg"); if(!sv()) return;
    sv().innerHTML=robotSVG(f?{face:f}:{}); if(f) faceT=setTimeout(()=>{ if(sv()) sv().innerHTML=robotSVG(); },ms); }
  
  function place(S,dx=0,dy=0){ $("bot").style.transform=`translate(${(S.c+dx)*G.step}px,${(S.r+dy)*G.step}px)`; }
  
  function placeNow(){ const bot=$("bot"); bot.classList.add("noanim"); place(G.S); void bot.offsetWidth; bot.classList.remove("noanim"); renderStatus(); }
  
  /* cambia al mundo i: redibuja el tablero con sus filas y recalcula los contadores */
  function setWorld(i){ G.wi=i; G.rows=G.worlds[i]; G.wm=worldMap(G.map,G.rows); G.nB=countB(G.rows); G.nX=cellsOf(G.rows,"X").length; G.nV=cellsOf(G.rows,"V").length; G.nM=multiCells(G.rows).length; drawBoard(false); }

  /* ---------- varios mapas a la vez (niveles con worlds, menos Python) ----------
     Un tablero y un robot por mapa, uno al lado del otro. El mismo programa corre en todos a la vez, un paso por vez: cada robot
     pregunta el si por su propia celda (arriba de cada uno sale «sí» o «no»). Los bloques se iluminan siguiendo al primer mapa que
     sigue andando. Si un mapa falla, se frena todo. El tablero del mapa 1 es el de siempre (#gBoard, #bot); G.B tiene uno por mapa */
  let VIEW2=false; /* vista de los mapas: false = Normal (de a uno, como siempre), true = Doble (todos a la vez). Se recuerda entre niveles */
  function isMulti(){ return !!(G&&G.worlds&&!G.py&&VIEW2); }
  function setView(v){ if(!G||!G.worlds||G.busy||VIEW2===v) return; VIEW2=v; SND.add(); G.keepW=false; G.wi=null;
    G.rows=G.worlds[0]; G.wm=worldMap(G.map,G.rows); drawBoard(false); }
  $("status").addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-view]"); if(b) setView(b.dataset.view==="2"); });
  function unMulti(){ const wb=$("wboards"); if(G) G.B=null; if(!wb) return; $("boardwrap").appendChild($("gBoard")); wb.remove(); $("boardwrap").classList.remove("multi"); }
  function drawBoards(intro){
    const wrap=$("boardwrap"), N=G.worlds.length; wrap.appendChild($("gBoard")); /* el tablero de siempre sale antes de rehacer las cajas */
    let wb=$("wboards"); if(!wb){ wb=document.createElement("div"); wb.id="wboards"; wb.className="wboards"; wrap.appendChild(wb); }
    wrap.classList.add("multi");
    const [w,h]=boardSpace(), bw=w-26, bh=Math.max(190,Math.floor((h-(N-1)*14)/N)-44); /* un mapa abajo del otro */
    wb.innerHTML=G.worlds.map((_,i)=>`<div class="wbox"><span class="wlbl">Mapa ${i+1}</span>${i?`<div class="board" data-wb="${i}"></div>`:""}</div>`).join("");
    wb.firstElementChild.appendChild($("gBoard"));
    G.B=G.worlds.map((rows,i)=>{ const holder=i?wb.querySelector(`[data-wb="${i}"]`):$("gBoard"), step=buildBoard(holder,rows,true,bw,bh,intro), bot=holder.querySelector(".robot");
      if(i) bot.removeAttribute("id"); return {i,holder,bot,rows,wm:worldMap(G.map,rows),step,S:startState(worldMap(G.map,rows)),trail:0,moves:0}; });
    G.step=G.B[0].step; G.rows=G.worlds[0]; G.wm=G.B[0].wm;
    if(intro) setTimeout(()=>{ if(G&&G.B) G.B.forEach(b=>b.bot.classList.remove("drop")); },1300);
    resetRobot(); }
  const cellB=(b,r,c)=>b.holder.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  function placeB(b,S,dx=0,dy=0){ b.bot.style.transform=`translate(${(S.c+dx)*b.step}px,${(S.r+dy)*b.step}px)`; }
  function resetB(b){ b.S=startState(b.wm); b.trail=0; b.moves=0;
    b.holder.querySelectorAll(".cell").forEach(el=>el.classList.remove("trail","got","flash","pnt","danced","flipped"));
    b.holder.classList.remove("win","bump","wfail"); b.bot.dataset.look="r"; b.bot.classList.remove("happy","shake","moving","boogie","flip","pen");
    b.bot.classList.add("noanim"); placeB(b,b.S); void b.bot.offsetWidth; b.bot.classList.remove("noanim"); }
  /* un paso de un robot; loud: solo el primero hace sonar, así no suena todo dos veces */
  async function moveB(b,r,dir,loud){ const t=T(), bot=b.bot; bot.dataset.look=dir;
    if(r.k==="crash"){ const [dr,dc]=DIRS[dir]; placeB(b,b.S,dc*.32,dr*.32); SND.crash(); await sleep(t*.45); placeB(b,b.S);
      bot.classList.add("shake"); setTimeout(()=>bot.classList.remove("shake"),400); bumpEl(b.holder); const [x,y]=center(bot); floatText(x,y-20,"¡Pum!","#FF5A62"); await sleep(t*.5); return; }
    const prev=cellB(b,b.S.r,b.S.c); prev.style.setProperty("--tc",RAIN[b.trail++%RAIN.length]); prev.classList.add("trail");
    b.S=r.S; bot.classList.add("moving"); placeB(b,b.S); if(loud) SND.move();
    await sleep(t); bot.classList.remove("moving"); }
  async function actB(b,r,kind,loud){ const t=T(), bot=b.bot, c=cellB(b,b.S.r,b.S.c), [x,y]=center(c);
    if(r.k==="bad"){ SND.crash(); c.classList.add("flash"); bot.classList.add("shake"); setTimeout(()=>bot.classList.remove("shake"),400); floatText(x,y-20,"¡Ups!","#FF5A62"); await sleep(t*.8); return; }
    b.S=r.S;
    if(kind==="paint"){ c.classList.add("pnt"); if(loud) SND.paint(); burst(x,y,["#4C8DF6","#2563C9","#9CC3FF","#FFFFFF"],14,4); if(r.ok) floatText(x,y-24,"¡Pintada!","#2563C9"); }
    else if(kind==="flip"){ bot.classList.remove("flip"); void bot.offsetWidth; bot.classList.add("flip"); if(loud) SND.flip();
      if(r.ok){ c.classList.add("flipped"); burst(x,y,["#FFC21A","#3B82F0","#A0673A","#FFFFFF"],16,5); floatText(x,y-24,"¡Voltereta!","#7C3AED"); } }
    else if(kind==="dance"){ bot.classList.remove("boogie"); void bot.offsetWidth; bot.classList.add("boogie"); if(loud) SND.dance();
      if(r.ok){ c.classList.add("danced"); burst(x,y,["#1EC48C","#FFC21A","#FF6FB5","#FFFFFF"],16,5); floatText(x,y-24,"♪ ♫","#11986A"); } }
    await sleep(t); bot.classList.remove("boogie","flip"); }
  /* la respuesta del si de cada robot, arriba de él */
  function ifB(b,ok){ const [x,y]=center(b.bot); floatText(x,y-30,ok?"sí":"no",ok?"#11986A":"#5F7F96"); }
  const addrOf=ev=>typeof ev.addr[0]==="string"?ev.addr[0]+":"+ev.addr.slice(1).join("."):ev.addr.join(".");
  async function runMulti(id,ctx){
    const B=G.B, its=B.map(b=>walk(G.prog,c=>sense(b.wm,b.S,c),[],G.funcs)), st=B.map(()=>({n:0,res:null,last:null,left:false}));
    let fail=-1, ticks=0;
    while(fail<0){
      if(G.paused){ await pauseGate(id); if(id!==G.run) return; }
      const lead=st.findIndex(x=>!x.res); if(lead<0) break;
      /* cada mapa avanza hasta su próxima acción; el primero que sigue andando ilumina los bloques (con sus pausas) */
      const acts=[];
      for(let i=0;i<B.length;i++){ const s=st[i]; if(s.res) continue;
        for(let nx=its[i].next();;nx=its[i].next()){
          if(nx.done){ s.res={k:"end"}; break; }
          if(++s.n>MAXSTEPS){ s.res={k:"boom"}; break; }
          const ev=nx.value, addr=addrOf(ev);
          if(ev.t==="loop"||ev.t==="call"){ if(i===lead){ ev.t==="loop"?setLap(addr,ev.k+1,ev.n):light(addr); SND.loop(); if(!ctx.stepMode){ await sleep(T()*.25); if(id!==G.run) return; } } continue; }
          if(ev.t==="if"||ev.t==="else"){ if(ev.t==="if") ifB(B[i],ev.ok); if(i===lead){ askIf(addr,ev.ok); if(!ctx.stepMode){ await sleep(T()*.35); if(id!==G.run) return; } } continue; }
          if(G.map.cls!==0&&B[i].moves>=(G.map.maxAct||MAXACT)){ s.res={k:"boom"}; break; }
          s.last=addr; acts.push([i,ev]); break; }
        if(s.res&&s.res.k!=="win"){ fail=i; break; } }
      if(fail>=0||!acts.length) break;
      const la=acts.find(([i])=>i===lead)||acts[0]; light(st[la[0]].last);
      const rs=await Promise.all(acts.map(async([i,ev],k)=>{ const b=B[i];
        const r=ev.t==="move"?tryMove(b.wm,b.S,ev.dir):tryAct(b.wm,b.S,ACTS[ev.t]);
        await (ev.t==="move"?moveB(b,r,ev.dir,k===0):actB(b,r,ev.t,k===0)); return [i,r]; }));
      if(id!==G.run) return;
      ticks++;
      for(const [i,r] of rs){ const s=st[i]; B[i].moves++;
        if(r.k==="win"){ /* llegó: ¿sobraron bloques? */ let nx, g=0; do{ nx=its[i].next(); }while(++g<MAXSTEPS&&!nx.done&&(nx.value.t==="loop"||nx.value.t==="if"||nx.value.t==="else"||nx.value.t==="call"));
          s.left=!nx.done; s.res={k:"win"}; B[i].holder.classList.add("win"); B[i].bot.classList.add("happy"); }
        else if(r.k!=="ok"){ s.res=r; if(fail<0) fail=i; } }
      if(fail<0&&ctx.stepMode&&st.some(x=>!x.res)){ say("",ICO.step(),`Paso ${ticks}`,"Tocá Paso para seguir o Ir para terminar"); await waitStep(); if(id!==G.run) return; }
    }
    G.ctx=null; setBusy(false);
    if(fail<0){ const wrong=Math.max(0,...B.map(b=>b.S.wrong||0));
      G.S={...B[0].S,wrong}; G.wm=B[0].wm; G.rows=B[0].rows;
      return finish({k:"win",left:st.some(x=>x.left),acts:Math.max(...B.map(b=>b.moves)),world:null},st[0].last); }
    const b=B[fail]; b.holder.classList.add("wfail"); G.S=b.S; G.wm=b.wm; G.rows=b.rows;
    finish({...st[fail].res,acts:b.moves,world:fail},st[fail].last); }
  function resetRobot(){
    if(G.worlds&&!G.keepW&&!isMulti()){ const back=G.wi>0; G.wi=null; if(back) return setWorld(0); }
    if(isMulti()&&G.B){ G.wm=G.B[0].wm; G.rows=G.B[0].rows; } /* después de una falla en otro mapa, se vuelve al mapa 1 */
    G.S=startState(G.wm); G.trail=0; G.lastGot=null; clearHint(); G.listen=false; G.live=false; keypadState();
  
    $("gBoard").querySelectorAll(".cell").forEach(el=>el.classList.remove("trail","got","flash","pnt","danced","flipped","scorch","open","warping","nokey"));
  
    $("gBoard").classList.remove("win","bump");
  
    document.querySelectorAll("#canvas .on, #canvas .err").forEach(b=>b.classList.remove("on","err"));
  
    document.querySelectorAll("#canvas .running, #canvas .yes, #canvas .nope").forEach(b=>b.classList.remove("running","yes","nope"));
  
    $("bot").dataset.look="r"; $("bot").classList.remove("happy","shake","moving","boogie","flip","pen","boom","dizzy","warpout","warpin","haskey"); setFace(null); $("bot").querySelectorAll(".dz").forEach(e=>e.remove()); $("gBoard").classList.remove("kaboom"); placeNow();
    pyMark(null);
    if(isMulti()&&G.B) G.B.forEach(resetB);
  
  }
  
  function renderStatus(){
  
    let h="";
  
    if(G.nB){ const got=G.S.got.length, up=G.lastGot!=null&&got>G.lastGot; G.lastGot=got;
  
      h+=`<span class="chip${got>=G.nB?" full":""}${up?" bump":""}">${Array.from({length:G.nB},(_,i)=>`<span class="bslot${i<got?" on":""}">${batSVG()}</span>`).join("")} ${got} / ${G.nB}</span>`; }
  
    /* contadores de pintar: rojas pintadas, verdes con baile, o celdas pintadas en pintar libre */
  
    const g=goalLeft(G.wm,G.S), chip=(col,done,tot,txt)=>`<span class="chip${done>=tot?" full":""}"><span class="sq" style="background:${col}"></span>${txt} ${done} / ${tot}</span>`;
  
    if(G.nX&&!isMulti()) h+=chip("#FF5A62",G.nX-g.red,G.nX,"Rojas"); /* con varios mapas a la vez, cada tablero muestra lo suyo */
  
    if(G.nV&&!isMulti()) h+=chip("#1EC48C",G.nV-g.green,G.nV,"Verdes");
    if(G.nM&&!isMulti()) h+=chip("linear-gradient(135deg,#FFC21A 33%,#3B82F0 33% 66%,#A0673A 66%)",G.nM-g.multi,G.nM,"Colores");
  
    if(G.map.need) h+=chip("var(--paint)",Math.min(G.S.pnt.length,G.map.need),G.map.need,"Pintadas");
  
    if(G.nK.length){ const ks=G.S.keys||[]; h+=`<span class="chip keych${G.nK.every(k=>ks.includes(k))?" full":""}">${G.nK.map(k=>`<span class="kslot${ks.includes(k)?" on":""}">${keySVG(k,"")}</span>`).join("")} Llaves ${G.nK.filter(k=>ks.includes(k)).length} / ${G.nK.length}</span>`; }
    { const km=$("bot")&&$("bot").querySelector(".keymark"), ks=G.S.keys||[]; if(km){ km.innerHTML=ks.map(k=>keySVG(k,"")).join(""); $("bot").classList.toggle("haskey",ks.length>0); } }
    if(G.tools.includes("n")) h+=`<span class="chip pench${G.S.pen?" on":""}">${ICO.brush(G.S.pen?"#fff":"#7E3DB0")}${G.S.pen?"Pincel en uso":"Pincel guardado"}</span>`;
  
    if(G.worlds&&!G.py) h+=`<div class="vsw" role="group" aria-label="Cómo ver los mapas"><button data-view="1"${VIEW2?"":' class="on"'}>Normal</button><button data-view="2"${VIEW2?' class="on"':""}>Doble</button></div>`;
    if(G.worlds&&G.wi!=null&&!isMulti()) h+=`<span class="chip wchip">Mapa ${G.wi+1} de ${G.worlds.length}</span>`;
    if(G.worlds&&G.map.reveal&&!isMulti()) h+=`<div class="wstrip"><span>Estos son los mapas</span>${G.worlds.map((w,i)=>`<div class="wmini${i===G.wi?" on":""}">${miniMap(w,10)}</div>`).join("")}</div>`;
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
    {id:"pg-py",title:"Python",col:"var(--fn)",items:[["def nombre():","crea una función","f"],["nombre()","llama a tu función","f"],["repetir(3):","repite 3 veces","r"],
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
  
      h+=`<div class="pgroup" id="pg-act"><h4><i style="background:var(--pnt)"></i>Acciones</h4>${T_.includes("n")?blockHTML({t:"penon"},null,true)+blockHTML({t:"penoff"},null,true):""}${T_.includes("p")?blockHTML({t:"paint"},null,true):""}${T_.includes("b")?blockHTML({t:"dance"},null,true):""}${T_.includes("t")?blockHTML({t:"flip"},null,true):""}</div>`;
  
      cats+=`<button class="cat" data-g="pg-act"><i style="background:var(--pnt)"></i>Acciones</button>`; }
  
    if(T_.includes("r")||T_.includes("i")){
      h+=`<div class="pgroup" id="pg-ctl"><h4><i style="background:var(--ctl)"></i>Control</h4>${T_.includes("r")?blockHTML({t:"repeat",n:2,body:[]},null,true):""}${T_.includes("i")?blockHTML({t:"if",c:G.conds[0],body:[]},null,true):""}${T_.includes("e")?blockHTML({t:"else",body:[]},null,true):""}</div>`;
  
      cats+=`<button class="cat" data-g="pg-ctl"><i style="background:var(--ctl)"></i>Control</button>`; }
  
    if(G.fn){ h+=`<div class="pgroup" id="pg-fn"><h4><i style="background:var(--fn)"></i>Funciones</h4>${G.fids.map(f=>blockHTML({t:"call",f},null,true)).join("")}</div>`;
      cats+=`<button class="cat" data-g="pg-fn"><i style="background:var(--fn)"></i>Funciones</button>`; }
    /* eventos: arriba de todo el bloque «al apretar» (se le cambia la tecla tocándola) */
    if(G.ev){ h=`<div class="pgroup" id="pg-evt"><h4><i style="background:var(--evt)"></i>Eventos</h4>${blockHTML({t:"listen"},null,true)}${G.free?evHTML("*",true):G.keys.map(k=>evHTML(k,true)).join("")}</div>`+h;
      cats=`<button class="cat on" data-g="pg-evt"><i style="background:var(--evt)"></i>Eventos</button>`+cats.replace('class="cat on"','class="cat"'); }
    $("pal").innerHTML=h; $("cats").innerHTML=cats;

  }
  
  const COLS={x:["roja","#FF5A62"],v:["verde","#1EC48C"]};
  /* chip de la condición del si: color de celda o pared por dirección ("pared →", "no hay pared ↓") */
  const ARR={u:"↑",d:"↓",l:"←",r:"→"};
  /* eventos: texto de cada tecla (flechas y letras P/B) y la tecla del teclado que la dispara */
  const KEYTXT={u:"↑",d:"↓",l:"←",r:"→",s:"Espacio"}, KEYNAME={u:"flecha arriba",d:"flecha abajo",l:"flecha izquierda",r:"flecha derecha",s:"barra espaciadora"};
  /* tecla del teclado → código del juego: flechas u d l r, espacio s, letras y números «k:a». Lo demás (Esc, Tab, Enter, F1...) no se usa */
  const evKeyOf=e=>{ const m={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r"}; if(m[e.key]) return m[e.key]; if(e.key===" ") return "s";
    return /^[a-zñ0-9]$/i.test(e.key)?"k:"+e.key.toLowerCase():null; };
  const keyLabel=k=>KEYTXT[k]||(k&&k.startsWith("k:")?k.slice(2).toUpperCase():"?");
  /* bloque de evento (bloque de inicio, como «al tocar»): «al apretar [tecla]» con su pila de acciones. En el programa va con posición libre
     (G.evs[id]={key,x,y,body}); en la paleta (pal) no tiene posición. La pila usa direcciones «@id:0» (como las funciones).
     Niveles guiados: el id es la tecla (una por tecla, fija). Niveles libres (map.free): ids e1, e2... y la tecla se elige con el selector */
  function evHTML(id,pal){ const e=pal?null:G.evs[id], key=pal?(id==="*"?null:id):e.key, body=e?e.body:[], inner=body.length?listHTML(body,"@"+id+":"):'<div class="ph"></div>';
    const cap=G.free&&!pal?`<button class="kcap ksel${key?"":" ask"}" data-ksel title="Elegir la tecla">${key?keyLabel(key):"?"}</button>`:`<span class="kcap">${key?keyLabel(key):"?"}</span>`;
    const del=pal?"":`<button class="evx" data-evdel title="Borrar este evento" aria-label="Borrar este evento">×</button>`;
    return `<div class="blk rep evt" ${pal?`data-new="ev:${id}"`:`data-ev="${id}"`}><div class="rtop"><span class="ic">${ICO.key()}</span><span>al apretar</span>${cap}${del}</div>`+
      `<div class="mouth"><div class="arm"></div><div class="slot list"${pal?"":` data-l="@${id}:"`}>${inner}</div></div><div class="rbot"></div></div>`; }
  /* zona «Mis eventos» (debajo del programa, como «Mis funciones»): los eventos van en el orden en que se pusieron (ese orden decide quién corre primero
     si dos usan la misma tecla) */
  function evsHTML(){ const ids=Object.keys(G.evs);
    return `<div class="evzone"><h5>Mis eventos</h5>${ids.length?ids.map(id=>evHTML(id,false)).join(""):`<div class="evph">${ICO.key("#4A3300")}Arrastrá un «al apretar» acá</div>`}</div>`; }
  function condChip(c){ return COLS[c]?`<i style="--cc:${COLS[c][1]}"></i>${COLS[c][0]}`:`<i class="wc">${ARR[c[1]]}</i>${c[0]==="n"?"no hay pared":"pared"}`; }

  
  $("cats").onclick=e=>{ const b=e.target.closest(".cat"); if(!b) return;
  
    document.querySelectorAll("#cats .cat").forEach(x=>x.classList.toggle("on",x===b)); $(b.dataset.g).scrollIntoView({behavior:"smooth",block:"start"}); };
  
  const escH=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fnLabel=f=>(G.names[f]||"").trim()?escH(G.names[f].trim()):"Función "+f; /* el nombre libre siempre va escapado */
  function blockHTML(b,addr,pal){
  
    const at=pal?`data-new="${b.t==="call"?"call:"+b.f:b.t==="repeat"?"rep":b.t==="move"?b.dir:b.t}"`:`data-a="${addr}"`;
  
    if(b.t==="evnew") return evHTML(b.key,true); /* el evento que se arrastra desde la paleta */
    if(b.t==="listen") return `<div class="blk evl" ${at}><span class="ic">${ICO.key()}</span><span>escuchar eventos</span></div>`;
    if(b.t==="call") return `<div class="blk fnc" ${at}><span class="ic">ƒ</span><span>llamar a <b>${fnLabel(b.f)}</b></span></div>`;
    if(b.t==="move") return `<div class="blk mov" ${at}><span class="ic">${ICO.arrow(b.dir)}</span><span>${LABEL[b.dir]}</span></div>`;
  
    if(b.t==="paint") return `<div class="blk act" ${at}><span class="ic">${ICO.brush()}</span><span>pintar</span></div>`;
  
    if(b.t==="dance") return `<div class="blk act" ${at}><span class="ic">${ICO.music()}</span><span>bailar</span></div>`;
    if(b.t==="flip") return `<div class="blk act" ${at}><span class="ic">${ICO.flip()}</span><span>voltereta</span></div>`;
  
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
  /* eventos: cada «al apretar» cuenta 1 y cada acción de su pila otro */
  const evUsed=()=>G.ev?Object.values(G.evs).reduce((a,e)=>a+1+countBlocks(e.body),0):0;
  function used(){ return countProgram(G.prog,G.funcs)+1+evUsed()-G.prog.filter(b=>b.t==="listen").length; } /* «escuchar eventos» no cuenta como bloque */
  
  /* edición Python: debajo de los bloques, el mismo programa escrito en Python («al tocar» es main) */
  function mirrorHTML(){ if(!PY_ED) return "";
    return `<div class="pymirror"><h5>${ICO.code("#3776AB")}Tu programa en Python</h5><pre>${pyHTML(blocksToPy(G.prog,G.fn?G.funcs:{},G.names,!!G.map.notes))}</pre></div>`; }
  function renderProg(full){
    if(G.py) return renderPy(full);

    const root=G.prog.length?listHTML(G.prog,""):`<div class="rootph">${ICO.drag()}${G.ev?"Lo que hace al empezar":"Arrastrá bloques acá"}</div>`;

    $("canvas").innerHTML=`<div class="blk hat"><span>al tocar</span><span class="ic">${ICO.flag("#11986A")}</span></div><div class="list root" data-l="">${root}</div>${fnsHTML()}${mirrorHTML()}`+
      (G.ev?evsHTML():"")+`<div class="dropline hidden" id="dropline"></div>`;
    /* guiado: un evento por tecla, el que ya está puesto se apaga en la paleta. Libre: se apaga al llegar al máximo de eventos del nivel */
    if(G.ev){ const full=Object.keys(G.evs).length>=(G.map.evmax||4);
      document.querySelectorAll('#pal [data-new^="ev:"]').forEach(el=>el.classList.toggle("used",G.free?full:!!G.evs[el.dataset.new.slice(3)])); renderKeypad(); }
  
    const n=used(), c=$("count"); c.innerHTML=ICO.blocks()+`${n} / ${G.max}`; c.classList.toggle("full",n>=G.max); c.classList.remove("no");
  
    $("goal").classList.toggle("hidden",G.map.cls===2||G.map.cls===3||G.opt==null);
  
    if(G.map.cls!==2&&G.map.cls!==3) $("goal").innerHTML=starIco(true)+"meta "+G.opt;
  
    $("runBtn").classList.toggle("ready",G.prog.length>0||(G.ev&&Object.keys(G.evs).length>0));

    resetClear();

  }

  /* ---------- editor de Python ---------- */
  const PY_LH=22, PY_PAD=10; /* alto de línea y margen de arriba del editor (iguales en game.css) */
  /* full: arma el editor de cero (al entrar al nivel). Si no, solo actualiza el contador (así no se pierde el cursor).
     El editor es un textarea transparente encima de un <pre> con colores (mismo texto, misma letra), y abajo «Así se ve en bloques» */
  function renderPy(full){
    const n=pyLines(G.code), c=$("count"); c.innerHTML=ICO.code("#3776AB")+`${n} ${n===1?"línea":"líneas"}`; c.classList.remove("full","no");
    $("goal").classList.toggle("hidden",G.map.goal==null); if(G.map.goal!=null) $("goal").innerHTML=starIco(true)+"meta "+G.map.goal;
    $("runBtn").classList.toggle("ready",!!G.code.trim()); resetClear();
    const blocksBox=`<div class="pyblocks"><h5>${ICO.blocks()}Así se ve en bloques</h5><div id="pybl"></div></div>`;
    const sw=G.pickOnly?"":`<div class="picksw" role="group" aria-label="Cómo armar el código"><button data-pymode="pick"${G.pick?' class="on"':""}>☰ Elegir</button><button data-pymode="write"${G.pick?"":' class="on"'}>✎ Escribir</button></div>`;
    if(G.pick){ if(!full&&$("pickrows")){ pickRender(); pyBlocks(G.code); return; }
      $("canvas").innerHTML=sw+`<div class="picked" id="pickrows"></div>`+blocksBox; G.pyBlocksLn=null; pickRender(); pyBlocks(G.code); return; }
    if(!full&&$("pyta")) return;
    $("canvas").innerHTML=sw+`<div class="pyed"><div class="pygut" id="pygut" aria-hidden="true"></div><div class="pywrap" id="pywrap"><div class="pyhl hidden" id="pyhl"></div><pre class="pyhi" id="pyhi" aria-hidden="true"></pre>`+
      `<textarea id="pyta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Código en Python"></textarea></div></div>`+
      blocksBox;
    G.pyBlocksLn=null; $("pyta").value=G.code; pyGrow(); }
  function pyGrow(){ const ta=$("pyta"); if(!ta) return; const n=ta.value.split("\n").length;
    $("pygut").innerHTML=Array.from({length:n},(_,i)=>`<i data-ln="${i+1}">${i+1}</i>`).join("");
    $("pyhi").innerHTML=pyHTML(ta.value)+"\n"; $("pywrap").classList.add("hi"); /* recién ahora el texto del textarea se vuelve transparente */
    ta.style.height=(n*PY_LH+PY_PAD*2)+"px"; ta.style.width="auto"; ta.style.width=Math.max($("pywrap").clientWidth,ta.scrollWidth)+"px";
    pyBlocks(ta.value); }
  /* ---- el código como bloques (el espejo al revés) ---- */
  const PY_MOVE_DIR={arriba:"u",abajo:"d",izquierda:"l",derecha:"r"};
  /* cada bloque lleva data-ln (su línea), así se ilumina junto con la línea que corre */
  function pyStmtHTML(s){ const ln=`data-ln="${s.ln}"`, cmouth=(body,extra="")=>`<div class="mouth"><div class="arm"></div><div class="slot list">${pyListHTML(body)}</div></div><div class="rbot"></div></div>${extra}`;
    if(s.k==="call"){ const d=PY_MOVE_DIR[s.name];
      if(d&&!s.args.length) return `<div class="blk mov" ${ln}><span class="ic">${ICO.arrow(d)}</span><span>${LABEL[d]}</span></div>`;
      if(s.name==="pintar") return `<div class="blk act" ${ln}><span class="ic">${ICO.brush()}</span><span>pintar</span></div>`;
      if(s.name==="bailar") return `<div class="blk act" ${ln}><span class="ic">${ICO.music()}</span><span>bailar</span></div>`;
      const a=s.args.map(x=>pyExprText(x)).join(", ");
      return `<div class="blk fnc" ${ln}><span class="ic">ƒ</span><span>llamar a <b>${escH(s.name)}${a?`(${escH(a)})`:""}</b></span></div>`; }
    if(s.k==="set") return `<div class="blk pvar" ${ln}><span class="ic">=</span><span><b>${escH(s.n)}</b> ${s.op==="="?"vale":s.op==="+="?"suma":"resta"} <b>${escH(pyExprText(s.e))}</b></span></div>`;
    if(s.k==="hole") return `<div class="blk phole" ${ln}><span>___ completá acá</span></div>`;
    if(s.k==="for"){ const a=s.args.map(x=>pyExprText(x)), n=a.length===1?a[0]:`${a[1]} − ${a[0]}`;
      return `<div class="blk rep" ${ln}><div class="rtop"><span class="ic">${ICO.repeat()}</span><span>repetir</span><span class="nctl"><b>${escH(n)}</b></span><span>veces</span></div>${cmouth(s.body)}`; }
    if(s.k==="while") return `<div class="blk rep iff pwhile" ${ln}><div class="rtop"><span class="ic">${ICO.repeat()}</span><span>mientras</span><span class="colsel">${escH(pyCondText(s.cond))}</span></div>${cmouth(s.body)}`;
    if(s.k==="if") return `<div class="blk rep iff" ${ln}><div class="rtop"><span class="ic">${ICO.ifq()}</span><span>si</span><span class="colsel">${escH(pyCondText(s.cond))}</span></div>`+
      cmouth(s.body,s.orelse?`<div class="blk rep iff els"><div class="rtop"><span class="ic">${ICO.ifq()}</span><span>si no</span></div>${cmouth(s.orelse)}`:"");
    return ""; } /* pass, «...», global: no se dibujan */
  function pyListHTML(list){ const h=list.map(pyStmtHTML).join(""); return h||'<div class="ph"></div>'; }
  function pyBlocks(code){ const box=$("pybl"); if(!box) return; const r=parsePy(code,true); /* los ___ se dibujan como hueco */
    if(!r.ok){ box.classList.add("stale"); const n=box.querySelector(".pynote")||box.appendChild(Object.assign(document.createElement("div"),{className:"pynote"}));
      n.textContent=`Hay un error en la línea ${r.ln}: arreglalo para ver los bloques`; return; }
    const defs=r.prog.body.filter(s=>s.k==="def"), rest=r.prog.body.filter(s=>s.k!=="def");
    box.classList.remove("stale");
    box.innerHTML=`<div class="blk hat"><span>al tocar</span><span class="ic">${ICO.flag("#11986A")}</span></div><div class="list root">${pyListHTML(rest)}</div>`+
      (defs.length?`<div class="fns"><h5>Funciones</h5>${defs.map(d=>`<div class="rep fnbox" data-ln="${d.ln}"><div class="rtop"><span class="ic">ƒ</span><span class="fnm">${escH(d.name)}(${escH(d.params.join(", "))})</span></div>`+
        `<div class="mouth"><div class="arm"></div><div class="slot list">${pyListHTML(d.body)}</div></div><div class="rbot"></div></div>`).join("")}</div>`:"");
    if(G.pyBlocksLn) pyMarkBlock(G.pyBlocksLn.ln,G.pyBlocksLn.cls); }
  function pyMarkBlock(ln,cls){ document.querySelectorAll("#pybl .on,#pybl .err").forEach(x=>x.classList.remove("on","err"));
    if(!ln) return; const el=document.querySelector(`#pybl [data-ln="${ln}"]`); if(el) el.classList.add(cls==="err"?"err":"on"); }
  /* marca una línea: cls "" (corriendo), "yes"/"no" (respuesta de if/while), "err" (error); sin línea, la saca. También su bloque */
  function pyMark(ln,cls=""){
    const rows=$("pickrows"); if(rows){ G.pyBlocksLn=ln?{ln,cls}:null; pyMarkBlock(ln,cls); /* modo «Elegir»: se marca la fila */
      rows.querySelectorAll(".pickrow.on").forEach(x=>x.classList.remove("on","yes","no","err"));
      const r=ln&&rows.querySelector(`.pickrow[data-ln="${ln}"]`); if(r){ r.classList.add("on"); if(cls) r.classList.add(cls); r.scrollIntoView({block:"nearest"}); } return; }
    const hl=$("pyhl"); if(!hl) return; document.querySelectorAll("#pygut i.on,#pygut i.err").forEach(x=>x.classList.remove("on","err"));
    G.pyBlocksLn=ln?{ln,cls}:null; pyMarkBlock(ln,cls);
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
  $("pal").addEventListener("click",e=>{ const b=e.target.closest(".pyins"); if(!b||!G||!G.py||G.busy) return; SND.add();
    if(G.pick) return pickPal(b.dataset.ins,b.dataset.inline==="1"); pyInsert(b.dataset.ins,b.dataset.inline==="1"); });
  $("canvas").addEventListener("input",e=>{ if(e.target.id==="pyta") pySync(); });
  /* Tab = 4 espacios (Shift+Tab saca), Enter mantiene la sangría y suma 4 después de «:» */
  $("canvas").addEventListener("keydown",e=>{ const ta=e.target; if(ta.id!=="pyta"||ta.readOnly) return;
    const v=ta.value, s=ta.selectionStart, ls=v.lastIndexOf("\n",s-1)+1;
    if(e.key==="Tab"){ e.preventDefault();
      if(e.shiftKey){ const k=(v.slice(ls).match(/^ {1,4}/)||[""])[0].length; if(k){ ta.setSelectionRange(ls,ls+k); taInsert(ta,""); } }
      else taInsert(ta,"    ".slice((s-ls)%4)); pySync(); }
    else if(e.key==="Enter"&&!e.isComposing){ e.preventDefault(); const before=v.slice(ls,s); let ind=before.match(/^ */)[0]; if(before.trimEnd().endsWith(":")) ind+="    ";
      taInsert(ta,"\n"+ind); pySync(); } });

  /* ---------- modo «Elegir»: el código se arma con selects, una fila por línea ----------
     El programa sigue siendo el texto G.code (corre, cuenta líneas y marca errores igual que al escribir): cada línea se reconoce
     (pickRead) y se vuelve a escribir (pickBuild). La sangría la pone el juego, siempre de 4 espacios: ← → solo dejan las que valen
     en Python (después de «:» va una más; si no, igual o menos). Las líneas que no se reconocen se muestran tal cual */
  function pickRead(t){ let s=t, com=""; const h=s.indexOf("#"); if(h>=0){ com=s.slice(h).trim(); s=s.slice(0,h); } s=s.trim(); let m;
    const R=(k,f={})=>Object.assign({k,com},f);
    if(!s) return R(com?"com":"blank");
    if(s==="___"||s==="..."||s==="pass") return R("hole");
    if(m=s.match(/^(arriba|abajo|izquierda|derecha|pintar|bailar)\(\)$/)) return R(m[1]);
    if((m=s.match(/^repetir\(\s*(\w+)\s*\):$/))||(m=s.match(/^for \w+ in range\(\s*(\w+)\s*\):$/))) return R("rep",{n:m[1]});
    if(m=s.match(/^def (\w+)\(\s*(\w*)\s*\):$/)) return R("def",{name:m[1],p:m[2]});
    if(m=s.match(/^(while|if) (not )?(\w+)\(\):$/)) return R(m[1],{c:(m[2]||"")+m[3]});
    if(s==="else:") return R("else");
    if((m=s.match(/^(\w+)\s*=\s*(\w+)\s*\+\s*(\w+)$/))&&m[1]===m[2]) return R("inc",{name:m[1],n:m[3]});
    if(m=s.match(/^(\w+)\s*=\s*(\w+)$/)) return R("set",{name:m[1],v:m[2]});
    if(m=s.match(/^(\w+)\(\s*(\w*)\s*\)$/)) return R("call",{name:m[1],a:m[2]});
    return R("raw",{t:s}); }
  function pickBuild(r){ const k=r.k, b=k==="hole"?"___":k==="rep"?`repetir(${r.n}):`:k==="def"?`def ${r.name}(${r.p||""}):`:k==="call"?`${r.name}(${r.a||""})`:
      k==="set"?`${r.name} = ${r.v}`:k==="inc"?`${r.name} = ${r.name} + ${r.n}`:k==="while"||k==="if"?`${k} ${r.c}():`:k==="else"?"else:":k==="raw"?r.t:k+"()";
    return r.com?b+"  "+r.com:b; }
  const HOLE=ind=>({ind,t:"___",r:{k:"hole",com:""}});
  function pickLines(){ return G.code.replace(/\n$/,"").split("\n").map(t=>({ind:Math.floor(t.match(/^ */)[0].length/4),t:t.trim(),r:pickRead(t)})); }
  const pickHead=l=>["rep","def","while","if","else"].includes(l.r.k)||(l.r.k==="raw"&&l.r.t.endsWith(":"));
  /* def main(): y la llamada main() del final no se tocan */
  const pickFixed=l=>l.ind===0&&((l.r.k==="def"&&l.r.name==="main"&&!l.r.p)||(l.r.k==="call"&&l.r.name==="main"&&!l.r.a));
  const pickSkip=l=>l.r.k==="blank"||l.r.k==="com";
  function pickPrev(L,i){ let p=i-1; while(p>=0&&pickSkip(L[p])) p--; return p; }
  /* sangrías que valen para la fila i: después de «:», una más; si no, de 0 a la de arriba. Después de def main():, al menos 1 */
  function pickRange(L,i){ const p=pickPrev(L,i), head=p>=0&&pickHead(L[p]); let hi=p<0?0:head?L[p].ind+1:L[p].ind, lo=head?hi:0;
    if(lo===0&&L.slice(0,i).some(l=>pickFixed(l)&&l.r.k==="def")){ lo=1; hi=Math.max(hi,1); } return [lo,hi]; }
  function pickNorm(L){ L.forEach((l,i)=>{ if(pickSkip(l)||pickFixed(l)) return; const [lo,hi]=pickRange(L,i); l.ind=Math.max(lo,Math.min(hi,l.ind)); }); }
  function pickSave(L){ pickNorm(L); const code=L.map(l=>l.r.k==="blank"?"":"    ".repeat(l.ind)+l.t).join("\n")+"\n";
    if(code===G.code) return pickRender(); G.code=code; PYCODE[G.map.id]=code; changed(); }
  function pickNames(L){ const fns=[], vars=new Set();
    L.forEach(l=>{ if(l.r.k==="def"){ if(l.r.name!=="main") fns.push(l.r); if(l.r.p) vars.add(l.r.p); } if(l.r.k==="set"||l.r.k==="inc") vars.add(l.r.name); });
    return {fns,vars:[...vars].filter(v=>v!=="___")}; }
  const pickNameOk=v=>String(v).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9_]+/g,"_").replace(/^[0-9_]+/,"").slice(0,16);
  /* [orden, cómo se ve en la lista, tool que la muestra] */
  const PICK_KINDS=[["Movimiento",[["arriba","arriba()"],["abajo","abajo()"],["izquierda","izquierda()"],["derecha","derecha()"]]],
    ["Acciones",[["pintar","pintar()","p"],["bailar","bailar()","b"]]],
    ["Python",[["rep","repetir(…):","r"],["def","def …():","f"],["set","… = …","v"],["inc","… = … + …","v"],["while","while …:","w"],["if","if …:","i"],["else","else:","i"]]]];
  const pickQs=()=>PY_PAL.find(g=>g.id==="pg-ask").items.filter(([, ,t])=>!t||G.tools.includes(t)).map(([c])=>c.replace("()",""));
  const pickOpt=(v,label,cur)=>`<option value="${escH(v)}"${v===cur?" selected":""}>${escH(label)}</option>`;
  function pickVals(cur,from,to,names){ const vs=[]; for(let k=from;k<=to;k++) vs.push(String(k)); vs.push(...names); if(cur&&!vs.includes(cur)) vs.unshift(cur);
    return vs.map(v=>pickOpt(v,v==="___"?"—":v,cur)).join(""); }
  function pickRowHTML(L,i,N){ const l=L[i], r=l.r, ln=i+1, num=`<span class="pickn">${ln}</span>`, pad=`<span class="pickind" style="width:${l.ind*24}px"></span>`;
    if(r.k==="blank") return `<div class="pickrow blank" data-ln="${ln}">${num}</div>`;
    if(pickFixed(l)||r.k==="com") return `<div class="pickrow fix${G.pkSel===i?" sel":""}" data-ln="${ln}" data-i="${i}">${num}${pad}<code>${pyHTML(l.t)}</code>`+
      (r.k==="def"?`<span class="pickctl"><button data-pick-add title="Agregar una línea abajo" aria-label="Agregar una línea abajo">＋</button></span>`:"")+`</div>`;
    const T_=G.tools, cur=r.k==="call"?"call:"+r.name:r.k;
    let ks=r.k==="hole"?pickOpt("hole","— elegí —","hole"):r.k==="raw"?pickOpt("raw",r.t,"raw"):"";
    for(const [g,items] of PICK_KINDS){ const its=items.filter(([k, ,t])=>!t||T_.includes(t)||k===r.k); if(its.length) ks+=`<optgroup label="${g}">${its.map(([k,lab])=>pickOpt(k,lab,cur)).join("")}</optgroup>`; }
    const calls=N.fns.map(f=>f.name); if(r.k==="call"&&!calls.includes(r.name)) calls.push(r.name);
    if(calls.length) ks+=`<optgroup label="Tus funciones">${calls.map(n=>{ const fd=N.fns.find(x=>x.name===n); return pickOpt("call:"+n,`${n}(${fd&&fd.p?"…":""})`,cur); }).join("")}</optgroup>`;
    const fs=(k,html,lab)=>`<select class="pickf" data-pick-f="${k}" aria-label="${lab}">${html}</select>`;
    const fi=(k,v,ph,lab)=>`<input class="pickf name" data-pick-f="${k}" value="${escH(v||"")}" placeholder="${ph}" maxlength="16" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${lab}">`;
    const w=t=>`<span class="pickw">${t}</span>`, others=N.vars.filter(v=>v!==r.name);
    let f="";
    if(r.k==="rep") f=w("veces")+fs("n",pickVals(r.n,1,10,N.vars),"Cuántas veces");
    else if(r.k==="def") f=w("nombre")+fi("name",r.name,"nombre","Nombre de la función")+(T_.includes("v")||r.p?w("parámetro")+fi("p",r.p,"ninguno","Parámetro"):"");
    else if(r.k==="call"){ const fd=N.fns.find(x=>x.name===r.name); if(fd&&fd.p||r.a) f=w(escH(fd&&fd.p||"valor"))+fs("a",pickVals(r.a||"___",1,10,N.vars),"Valor"); }
    else if(r.k==="set") f=w("variable")+fi("name",r.name,"nombre","Nombre de la variable")+w("vale")+fs("v",pickVals(r.v,0,10,others),"Valor");
    else if(r.k==="inc") f=w("variable")+fi("name",r.name,"nombre","Nombre de la variable")+w("suma")+fs("n",pickVals(r.n,1,5,others),"Cuánto suma");
    else if(r.k==="while"||r.k==="if"){ const cs=pickQs().flatMap(q=>["not "+q,q]); if(!cs.includes(r.c)) cs.unshift(r.c);
      f=fs("c",cs.map(c=>pickOpt(c,c+"()",r.c)).join(""),"Pregunta"); }
    const out=f?`<code class="pickout">${pyHTML(l.t)}</code>`:r.com?`<code class="pickout">${pyHTML(r.com)}</code>`:"";
    const [lo,hi]=pickRange(L,i);
    const ctl=`<span class="pickctl"><button data-pick-ind="-1" title="Menos sangría: sale del bloque" aria-label="Menos sangría"${l.ind>lo?"":" disabled"}>←</button>`+
      `<button data-pick-ind="1" title="Más sangría: entra al bloque" aria-label="Más sangría"${l.ind<hi?"":" disabled"}>→</button>`+
      `<button data-pick-add title="Agregar una línea abajo" aria-label="Agregar una línea abajo">＋</button><button data-pick-del title="Borrar la línea" aria-label="Borrar la línea">✕</button></span>`;
    return `<div class="pickrow${r.k==="hole"?" hole":""}${G.pkSel===i?" sel":""}" data-ln="${ln}" data-i="${i}">${num}${pad}<span class="pickmain">`+
      `<select class="pickk" data-pick-k aria-label="Orden de la línea ${ln}">${ks}</select>${f}${out}</span>${ctl}</div>`; }
  function pickRender(){ const box=$("pickrows"); if(!box) return; const L=pickLines(), N=pickNames(L);
    box.innerHTML=(G.pickOnly?"":`<button class="pickadd" data-pick-add>＋ Agregar una línea arriba de todo</button>`)+L.map((_,i)=>pickRowHTML(L,i,N)).join("");
    if(G.pyBlocksLn) pyMark(G.pyBlocksLn.ln,G.pyBlocksLn.cls); }
  /* cambia la orden de la fila i. Si ahora termina en «:» (y antes no), se agrega abajo una línea para completar */
  function pickKind(L,i,v){ const l=L[i], was=pickHead(l), N=pickNames(L); let r;
    if(v.startsWith("call:")){ const n=v.slice(5), fd=N.fns.find(x=>x.name===n); r={k:"call",name:n,a:fd&&fd.p?"1":""}; }
    else if(v==="rep") r={k:"rep",n:"2"};
    else if(v==="def"){ let k=1; const nm=()=>k>1?"mi_funcion"+k:"mi_funcion"; while(N.fns.some(f=>f.name===nm())) k++; r={k:"def",name:nm(),p:""}; }
    else if(v==="set") r={k:"set",name:"largo",v:"1"};
    else if(v==="inc") r={k:"inc",name:N.vars[0]||"largo",n:"1"};
    else if(v==="while") r={k:"while",c:"not en_estrella"};
    else if(v==="if") r={k:"if",c:"celda_roja"};
    else r={k:v};
    r.com=l.r.com; l.r=r; l.t=pickBuild(r);
    if(pickHead(l)&&!was){ L.splice(i+1,0,HOLE(l.ind+1)); G.pkSel=i+1; } } /* lo próximo va adentro */
  /* agrega una línea vacía abajo de la fila i (adentro del bloque si la fila termina en «:»); i=-1: arriba de todo */
  function pickAdd(L,i){ const l=i<0?null:L[i]; L.splice(i+1,0,HOLE(!l?0:pickHead(l)?l.ind+1:l.ind)); G.pkSel=i+1; }
  /* borra la fila i (con todo lo de adentro si termina en «:»). Si era lo único adentro de un bloque, queda una línea vacía */
  function pickDel(L,i){ const l=L[i]; if(pickFixed(l)) return; let j=i+1;
    if(pickHead(l)) for(let k=i+1;k<L.length;k++){ if(L[k].r.k==="blank") continue; if(L[k].ind>l.ind) j=k+1; else break; }
    const p=pickPrev(L,i); let nx=j; while(nx<L.length&&pickSkip(L[nx])) nx++;
    const only=p>=0&&pickHead(L[p])&&(nx>=L.length||L[nx].ind<=L[p].ind);
    L.splice(i,j-i,...(only?[HOLE(L[p].ind+1)]:[])); G.pkSel=Math.min(i,L.length-1); }
  /* sangría: mueve la fila (y lo de adentro, si termina en «:») */
  function pickInd(L,i,d){ const l=L[i], [lo,hi]=pickRange(L,i), to=Math.max(lo,Math.min(hi,l.ind+d)), dd=to-l.ind; if(!dd) return;
    if(pickHead(l)) for(let k=i+1;k<L.length;k++){ if(L[k].r.k==="blank") continue; if(L[k].ind>l.ind) L[k].ind+=dd; else break; }
    l.ind=to; }
  /* fila donde va lo que se toca en la lista de comandos: la elegida, o la última que se puede cambiar */
  function pickTarget(L){ const ok=i=>i!=null&&i>=0&&i<L.length&&!pickSkip(L[i])&&(!pickFixed(L[i])||L[i].r.k==="def");
    if(ok(G.pkSel)) return G.pkSel;
    for(let i=L.length-1;i>=0;i--) if(ok(i)&&!pickFixed(L[i])) return i;
    const m=L.findIndex(l=>pickFixed(l)&&l.r.k==="def"); return m>=0?m:null; }
  /* comando de la izquierda en modo «Elegir»: llena la línea vacía elegida o agrega una abajo. Las preguntas cambian el while/if elegido */
  function pickPal(txt,inline){ const L=pickLines(); let i=pickTarget(L);
    if(inline){ const l=i!=null&&L[i];
      if(!l||(l.r.k!=="while"&&l.r.k!=="if")) return say("warn",ICO.code("#3776AB"),"Las preguntas van en un while o un if","Tocá primero la línea del while o del if");
      l.r.c=(l.r.c.startsWith("not ")?"not ":"")+txt.replace("()",""); l.t=pickBuild(l.r); return pickSave(L); }
    const r=pickRead(txt); let v=r.k;
    if(r.k==="call"){ const N=pickNames(L); if(!N.fns.length) return say("warn",ICO.code("#3776AB"),"Todavía no hay funciones","Primero creá una con def"); v="call:"+N.fns[0].name; }
    if(i==null||L[i].r.k!=="hole"){ pickAdd(L,i==null?-1:i); i=G.pkSel; }
    G.pkSel=i; pickKind(L,i,v); const l=L[i];
    if(r.k==="rep") l.r.n=r.n; if(r.k==="def"&&r.p) l.r.p=r.p; l.t=pickBuild(l.r);
    pickSave(L); }
  $("canvas").addEventListener("click",e=>{ if(!G||!G.py||!e.target.closest) return; const m=e.target.closest("[data-pymode]");
    if(m){ const p=m.dataset.pymode==="pick"; if(p===G.pick||G.busy) return; PY_PICK=G.pick=p; G.pkSel=null; SND.add(); renderProg(true); return; }
    if(!G.pick||G.busy) return; const row=e.target.closest(".pickrow[data-i]");
    if(row&&G.pkSel!==+row.dataset.i){ G.pkSel=+row.dataset.i; document.querySelectorAll("#pickrows .pickrow.sel").forEach(x=>x.classList.remove("sel")); row.classList.add("sel"); }
    const b=e.target.closest("[data-pick-add],[data-pick-del],[data-pick-ind]"); if(!b) return;
    const L=pickLines(), i=row?+row.dataset.i:-1;
    if(b.hasAttribute("data-pick-add")){ pickAdd(L,i); SND.add(); }
    else if(b.hasAttribute("data-pick-del")){ if(i<0) return; pickDel(L,i); SND.trash(); }
    else { if(i<0) return; pickInd(L,i,+b.dataset.pickInd); SND.add(); }
    pickSave(L); });
  $("canvas").addEventListener("change",e=>{ if(!G||!G.py||!G.pick||G.busy) return; const el=e.target, row=el.closest&&el.closest(".pickrow[data-i]"); if(!row) return;
    const L=pickLines(), i=+row.dataset.i, l=L[i]; G.pkSel=i;
    if(el.hasAttribute("data-pick-k")) pickKind(L,i,el.value);
    else if(el.dataset.pickF){ const k=el.dataset.pickF; let v=el.value;
      if(el.tagName==="INPUT"){ v=pickNameOk(v); if(k==="name"&&!v) return pickRender(); }
      /* si cambia el nombre de una función, también cambian sus llamadas */
      if(k==="name"&&l.r.k==="def"&&v!==l.r.name){ const old=l.r.name; L.forEach(x=>{ if(x.r.k==="call"&&x.r.name===old){ x.r.name=v; x.t=pickBuild(x.r); } }); }
      l.r[k]=v; l.t=pickBuild(l.r); }
    else return;
    SND.add(); pickSave(L); });
  $("canvas").addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.matches&&e.target.matches("input[data-pick-f]")) e.target.blur(); });
  const splitA=a=>{ a=String(a); const k=a.indexOf(":"), t=k<0?a:a.slice(k+1); return {f:k<0?null:a.slice(0,k),path:t===""?[]:t.split(".").map(Number)}; }; /* "A:0.1" = función A, bloque 0.1; sin letra = programa */
  const joinA=(f,path)=>f?f+":"+path.join("."):path.join(".");
  const badCall=(b,f)=>f&&(b.t==="call"?!(G.map.adv?b.f<=f:b.f<f):b.body&&b.body.some(x=>badCall(x,f))); /* una función solo llama a otra anterior (B a A); en los niveles avanzados también a sí misma */
  function getList(f,path){ let l=f?(f[0]==="@"?G.evs[f.slice(1)].body:G.funcs[f]):G.prog; /* «@u» = pila del evento de la flecha arriba */ for(const i of path) l=l[i].body; return l; }
  function removeAt(f,addr){ return getList(f,addr.slice(0,-1)).splice(addr[addr.length-1],1)[0]; }
  function insertAt(f,path,i,b){ getList(f,path).splice(i,0,b); }
  function newBlock(kind){ return kind.startsWith("call:")?{t:"call",f:kind[5]}:kind==="listen"?{t:"listen"}:kind==="rep"?{t:"repeat",n:2,body:[]}:kind.startsWith("ev:")?{t:"evnew",key:kind.slice(3)}:kind==="if"?{t:"if",c:G.conds[0],body:[]}:kind==="else"?{t:"else",body:[]}:ACTS[kind]?{t:kind}:{t:"move",dir:kind}; }
  
  /* ---------- eventos: bloques de inicio en la zona «Mis eventos» ---------- */
  /* en un nivel de eventos: la pila de un evento (@u, @d...) tiene hasta EVMAX acciones sueltas (sin anidar); en la raíz («al tocar») solo acciones */
  function evOk(block,f,path){ if(!G.ev) return true; if(block.t==="evnew") return false;
    if(f&&f[0]==="@") return getList(f,[]).length<EVMAX&&!path.length;
    if(f||path.length) return false;
    return block.t==="listen"?!G.prog.some(b=>b.t==="listen"):["move","paint","dance","flip"].includes(block.t); }
  const evEl=k=>document.querySelector(`#canvas .evt[data-ev="${k}"]`);
  /* agrega el evento de la tecla key al final de «Mis eventos». Libre: id nuevo y sin tecla («?»): se elige tocándolo */
  function placeEv(key){ let id=key;
    if(G.free){ let n=1; while(G.evs["e"+n]) n++; id="e"+n; }
    G.evs[id]={key:G.free?null:key,body:[]};
    changed(); SND.snap(); const el=evEl(id); if(el){ el.classList.add("fresh"); el.scrollIntoView({block:"nearest"}); const r=el.getBoundingClientRect(); sparkle(r.left+30,r.top+20); bumpEl($("count")); } }
  /* selector de tecla (niveles libres): un menú chico pegado al botón «?» con algunas teclas para tocar; también se puede apretar una tecla del
     teclado (letras, números, flechas o espacio) y Esc lo cierra */
  const PICK=["u","d","l","r","s","k:w","k:a","k:s","k:d","k:q","k:e","k:z","k:x"];
  function closeKeyMenu(){ const m=$("kmenu"); if(m) m.remove(); if(G) G.capture=null; }
  function openKeyMenu(id,btn){ closeKeyMenu(); G.capture=id;
    const m=document.createElement("div"); m.id="kmenu"; m.setAttribute("role","menu");
    m.innerHTML=`<p>Elegí una tecla <span>o apretala en el teclado</span></p><div class="kpick">${PICK.map(k=>`<button class="kpb${k==="s"?" wide":""}" data-pick="${k}">${keyLabel(k)}</button>`).join("")}</div>`;
    document.body.appendChild(m);
    const r=btn.getBoundingClientRect(), w=m.offsetWidth, h=m.offsetHeight;
    m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left))+"px"; m.style.top=(r.bottom+8+h>innerHeight?Math.max(8,r.top-h-8):r.bottom+8)+"px"; }
  function setEvKey(id,key){ closeKeyMenu(); if(!G.evs[id]) return; G.evs[id].key=key; SND.add(); changed(); }
  function tooMany(extra){ if(used()+extra<=G.max) return false;
  
    say("warn",G.rep?ICO.repeat("#D9780F"):ICO.blocks(),`¡Máximo ${G.max} bloques!`,G.ev?"Cada «al apretar» y cada acción cuentan un bloque · «al tocar» también cuenta":G.map.cls===3?"Usá una función para ahorrar bloques":G.tools.includes("i")?(G.map.norep?"Usá el si: adentro va lo que cambia":"Usá repetir y si para ahorrar bloques"):G.map.cls===2?"Usá repetir para ahorrar bloques":"El bloque «al tocar» también cuenta");
  
    bumpEl($("count"),"no"); SND.nope(); return true; }
  
  function changed(){ G.keepW=false; G.run++; releaseWait(); G.ctx=null; setBusy(false); renderProg(); resetRobot(); }
  
  function freshAt(addr){ const el=document.querySelector(`#canvas .blk[data-a="${addr}"]`); if(!el) return;
  
    el.classList.add("fresh"); const r=el.getBoundingClientRect(); sparkle(r.left+30,r.top+r.height/2); bumpEl($("count")); }
  
  
  
  /* ---------- arrastrar y soltar ---------- */
  
  let D=null;
  
  document.addEventListener("pointerdown",e=>{
  
    if(e.button!==0||!G||G.busy||SCREEN!=="game"||e.target.closest("button,input")) return;
  
    const el=e.target.closest(".blk"); if(!el||el.classList.contains("hat")||el.closest(".fnbox.lock")||el.closest(".pyblocks")) return; /* los bloques del código son solo para mirar */
  
    const inPal=!!el.closest("#pal"); if(!inPal&&!el.closest("#canvas")) return;

    e.preventDefault();

    if(!inPal&&el.dataset.ev) return; /* la cabecera de un evento no se arrastra (se borra con la ×); sus acciones sí */
  
    const r=el.getBoundingClientRect();
  
    D={inPal,kind:el.dataset.new,addr:el.dataset.a,x0:e.clientX,y0:e.clientY,ox:e.clientX-r.left,oy:e.clientY-r.top,started:false};
  
    addEventListener("pointermove",onMove); addEventListener("pointerup",onUp); addEventListener("pointercancel",onUp);
  
  });
  
  function startDrag(){
  
    if(D.inPal){ D.block=newBlock(D.kind); if(D.block.t!=="listen"&&tooMany(countBlocks([D.block]))){ D=null; return; } }
  
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
  
    D.gx=gx; D.gy=gy; D.pt=D.zone==="drop"&&D.block.t!=="evnew"?nearestPoint(gx,gy):null; showDropline(D.pt); /* un evento nuevo se suelta donde sea: no tiene punto de enganche */

  }
  
  function onUp(){
  
    removeEventListener("pointermove",onMove); removeEventListener("pointerup",onUp); removeEventListener("pointercancel",onUp);
  
    const d=D; D=null; if(!d) return;
  
    if(!d.started){
      if(d.inPal&&G.ev&&d.kind==="listen"){ /* tocar «escuchar eventos» lo pone al final del programa (debajo de «al tocar»); alcanza con uno */
        if(G.prog.some(b=>b.t==="listen")){ SND.nope(); return say("warn",ICO.key(),"Ya está «escuchar eventos»","Alcanza con uno, debajo de «al tocar»"); }
        G.prog.push({t:"listen"}); SND.snap(); changed(); freshAt(String(G.prog.length-1)); return; }
      if(d.inPal&&G.ev){
        /* eventos: tocar un «al apretar» lo pone en el primer lugar libre; tocar una acción la pone en el primer evento que tenga lugar */
        if(d.kind.startsWith("ev:")){ if(tooMany(1)) return; return placeEv(d.kind[3]); }
        const k=Object.keys(G.evs).find(x=>G.evs[x].body.length<EVMAX);
        if(!k){ SND.nope(); return say("warn",ICO.key(),Object.keys(G.evs).length?"Todos los eventos están llenos":"Primero un «al apretar»",Object.keys(G.evs).length?`Cada evento lleva hasta ${EVMAX} acciones`:"Arrastrá un evento al programa y poné las acciones adentro"); }
        if(tooMany(1)) return; G.evs[k].body.push(newBlock(d.kind)); SND.snap(); changed(); freshAt("@"+k+":"+(G.evs[k].body.length-1)); return; }
      if(d.inPal&&!tooMany(1)){ G.prog.push(newBlock(d.kind)); SND.snap(); changed(); freshAt(G.prog.length-1); } return; }

    d.ghost.remove(); document.body.classList.remove("dragging"); $("trash").classList.remove("hot"); $("pal").classList.remove("drop");

    if(d.block.t==="evnew"){ if(d.zone==="drop") placeEv(d.block.key); return; }

    let at=null;

    if(d.zone==="drop"&&d.pt&&!evOk(d.block,d.pt.f,d.pt.path)){ SND.nope(); say("warn",ICO.key(),d.block.t==="listen"?"Ahí no va":"Ahí no entra",d.block.t==="listen"?"«escuchar eventos» va debajo de «al tocar», una sola vez":`Cada evento lleva hasta ${EVMAX} acciones`); if(!d.inPal) insertAt(d.from.f,d.from.path,d.from.i,d.block); }
    else if(d.zone==="drop"&&d.pt&&!badCall(d.block,d.pt.f)){ insertAt(d.pt.f,d.pt.path,d.pt.i,d.block); at=joinA(d.pt.f,d.pt.path.concat(d.pt.i)); SND.snap(); }
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


    /* eventos libres: tocar la tecla del bloque abre el selector */
    const ksel=e.target.closest("[data-ksel]");
    if(ksel&&!G.busy){ e.stopPropagation(); return openKeyMenu(ksel.closest(".evt").dataset.ev,ksel); }
    const evdel=e.target.closest("[data-evdel]");
    if(evdel&&!G.busy){ delete G.evs[evdel.closest(".evt").dataset.ev]; SND.trash(); return changed(); }

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
      G.code=start; delete PYCODE[G.map.id]; SND.trash(); changed(); renderProg(true); return say("",ICO.code("#3776AB"),"Código inicial",G.pick?"Armá tu programa y tocá Ir":"Escribí tu programa y tocá Ir"); }
    if(G.busy||(!G.prog.length&&!Object.keys(G.evs).length&&!G.fids.some(f=>!G.lock.includes(f)&&G.funcs[f].length))) return; const b=$("clearBtn");
  
    if(!b.classList.contains("ask")){ b.classList.add("ask"); b.innerHTML=ICO.trash("#fff")+"¿Seguro?"; clearT=setTimeout(resetClear,3000); return; }

    Object.keys(G.evs).forEach(k=>delete G.evs[k]); G.prog.length=0; G.fids.forEach(f=>{ if(!G.lock.includes(f)) G.funcs[f].length=0; }); SND.trash(); changed(); say("",ICO.drag(),"Programa vacío","Arrastrá bloques para empezar"); };
  
  
  
  /* ---------- ejecución ---------- */
  
  /* pausa: frena el programa en el medio; Seguir continúa desde ahí (Inicio lo corta) */
  const PAUSE_SVG=`<svg viewBox="0 0 32 32"><rect x="8" y="6" width="5.5" height="20" rx="2" fill="#0D3049"/><rect x="18.5" y="6" width="5.5" height="20" rx="2" fill="#0D3049"/></svg>`,
    PLAY_SVG=`<svg viewBox="0 0 32 32"><path d="M10 6 L26 16 L10 26Z" fill="#1EC48C" stroke="#11986A" stroke-width="2" stroke-linejoin="round"/></svg>`;
  function pauseUI(){ const p=!!(G&&G.paused); $("icoPause").innerHTML=p?PLAY_SVG:PAUSE_SVG; $("pauseTxt").textContent=p?"Seguir":"Pausa"; $("pauseBtn").title=p?"Seguir":"Pausa"; $("pauseBtn").classList.toggle("on",p); }
  function pauseGate(id){ return new Promise(res=>{ const f=()=>{ if(!G||G.run!==id||!G.paused) return res(); setTimeout(f,80); }; f(); }); }
  $("pauseBtn").onclick=()=>{ if(!G||!G.busy) return; G.paused=!G.paused; pauseUI(); SND.add();
    if(G.paused) say("",ICO.robot(),"En pausa","Tocá Seguir para continuar · Inicio para volver a empezar"); else say("",ICO.robot(),"¡Sigue!",""); };
  pauseUI();
  function setBusy(v){ G.busy=v; document.body.classList.toggle("busy",v); $("runBtn").disabled=v; $("stepBtn").disabled=v; if(v) $("runBtn").classList.remove("ready");
    $("pauseBtn").disabled=!v; if(!v){ G.paused=false; pauseUI(); }
    const ta=$("pyta"); if(ta) ta.readOnly=v; /* mientras corre, el código no se edita (Inicio lo libera) */ }
  
  function releaseWait(){ if(G&&G.ctx&&G.ctx.waiting){ const w=G.ctx.waiting; G.ctx.waiting=null; w(); } }
  
  function waitStep(){ $("runBtn").disabled=false; $("stepBtn").disabled=false;
  
    return new Promise(r=>{ G.ctx.waiting=()=>{ $("runBtn").disabled=true; $("stepBtn").disabled=true; r(); }; }); }
  
  /* en Python, addr es el número de línea */
  function light(addr){ if(G.py) return pyMark(addr); document.querySelectorAll("#canvas .on").forEach(x=>x.classList.remove("on"));
  
    const el=document.querySelector(`#canvas .blk[data-a="${addr}"]`); if(el){ el.classList.add("on"); el.scrollIntoView({block:"nearest"}); } }
  
  function setLap(addr,k,n){ if(G.py) return pyMark(addr); const el=document.querySelector(`#canvas .rep[data-a="${addr}"]`); if(!el) return;
  
    el.classList.add("running"); el.querySelector(".lap").textContent=`${k} / ${n}`; }
  
  
  
  /* ---------- eventos: tras Ir, GENI espera y cada tecla hace la pila de acciones de sus eventos ---------- */
  const keypadState=()=>{ const el=$("keypad"); if(el) el.classList.toggle("off",!G.listen); };
  /* teclas que hay en juego: las del nivel (guiado) o las que el alumno eligió en sus eventos (libre) */
  const evKeys=()=>G.free?[...new Set(Object.values(G.evs).map(e=>e.key).filter(Boolean))]:G.keys;
  /* botones de tecla en pantalla (para tablet o sin teclado), debajo del tablero, y el botón «Ordenar» de los eventos */
  function renderKeypad(){ let el=$("keypad");
    if(!G.ev){ if(el) el.remove(); return; }
    if(!el){ el=document.createElement("div"); el.id="keypad"; $("status").before(el); }
    el.innerHTML=evKeys().map(k=>`<button class="kpb${k==="s"?" wide":""}" data-k="${k}" aria-label="${KEYNAME[k]||"tecla "+keyLabel(k)}">${keyLabel(k)}</button>`).join(""); keypadState(); }
  /* una acción de GENI (mover, pintar o bailar) con su animación */
  async function doAct(a){
    if(a.t==="move"){ const r=tryMove(G.wm,G.S,a.dir); await animate(r,a.dir); return r; }
    const r=tryAct(G.wm,G.S,ACTS[a.t]); await animateAct(r,a.t); return r; }
  /* qué pasó con una acción en modo evento. Devuelve true si hay que cortar (ganó, explotó, o se tocó el programa mientras corría).
     Chocar o equivocarse no termina: GENI sigue esperando teclas (se marca el bloque y se avisa). Pasarse del tope de acciones (map.maxAct o MAXACT)
     lo hace explotar, como en los demás niveles */
  function evAfter(r,id,last){ if(id!==G.run||!G.live) return true; G.pn++;
    if(r.k==="win"){ G.listen=G.live=false; keypadState(); finish({k:"win",S:G.S,acts:G.pn,rec:false},last); return true; }
    if(G.pn>(G.map.maxAct||MAXACT)){ G.listen=G.live=false; keypadState(); explode(); return true; }
    if(r.k==="crash"||r.k==="bad") finish0(r,last);
    else if(G.wm.rows[G.S.r][G.S.c]==="E") finish0({k:"end"},last); /* llegó a la estrella pero falta algo */
    return false; }
  /* Ir: corre «al tocar» y, al llegar al bloque «escuchar eventos», GENI espera las teclas (las apretadas mientras tanto hacen fila).
     Sin ese bloque los eventos no se escuchan: el programa corre igual, pero las teclas no hacen nada */
  function listenStart(){
    const evs=Object.values(G.evs), hasListen=G.prog.some(b=>b.t==="listen");
    if(!evs.some(e=>e.body.length)) return say("warn",ICO.key(),"Armá un evento","Arrastrá «al apretar» al programa y poné acciones adentro");
    if(G.free&&evs.some(e=>!e.key)) return say("warn",ICO.key(),"Elegí la tecla de cada evento","Tocá el «?» del bloque amarillo");
    const id=++G.run; resetRobot(); G.live=true; G.pn=0;
    if(hasListen) say("",ICO.robot(),"¡Allá va!","Cuando llegue a «escuchar eventos» podés apretar las teclas");
    else say("warn",ICO.key(),"Los eventos no se escuchan","Poné «escuchar eventos» debajo de «al tocar» para poder apretar las teclas");
    G.kq=(async()=>{ for(let i=0;i<G.prog.length;i++){ if(id!==G.run||!G.live) return; const b=G.prog[i]; light(String(i));
      if(b.t==="listen"){ G.listen=true; keypadState(); SND.add(); say("",ICO.key(),"¡Ahora apretá las teclas!","Usá el teclado o los botones de abajo · Inicio para volver a empezar"); continue; }
      const r=await doAct(b); if(evAfter(r,id,String(i))||r.k!=="ok") return; } })().catch(()=>{}); }
  function keyPress(k){ if(!G||!G.ev) return;
    if(!G.listen){ SND.nope(); return G.live&&!G.prog.some(b=>b.t==="listen")
      ?say("warn",ICO.key(),"Los eventos no se escuchan","Poné «escuchar eventos» debajo de «al tocar» y tocá Ir")
      :say("warn",ICO.robot(),"Tocá Ir primero","Después apretá las teclas para mover a GENI"); }
    const id=G.run; G.kq=G.kq.then(()=>press(k,id)).catch(()=>{}); }
  /* la tecla k hace TODA la pila de cada evento que la tenga (de arriba hacia abajo), en orden; una pila se corta si choca o se equivoca */
  async function press(k,id){ if(!G||!G.listen||id!==G.run) return;
    document.querySelectorAll("#canvas .err").forEach(x=>x.classList.remove("err"));
    const kb=document.querySelector(`#keypad [data-k="${k}"]`); if(kb){ kb.classList.add("hit"); setTimeout(()=>kb.classList.remove("hit"),220); }
    const ids=Object.keys(G.evs).filter(i=>G.evs[i].key===k&&G.evs[i].body.length);
    if(!ids.length){ SND.nope(); const [x,y]=center($("bot")); floatText(x,y-24,"¿Qué hago?","#8B5CF6");
      return say("warn",ICO.key(),"Esa tecla no tiene evento",`Arrastrá «al apretar ${keyLabel(k)}» al programa y poné una acción adentro`); }
    for(const eid of ids){ const e=G.evs[eid], ev=evEl(eid);
      for(let i=0;i<e.body.length;i++){ if(id!==G.run||!G.listen) return;
        document.querySelectorAll("#canvas .on").forEach(x=>x.classList.remove("on")); if(ev) ev.classList.add("on");
        const ae=document.querySelector(`#canvas .blk[data-a="@${eid}:${i}"]`); if(ae) ae.classList.add("on");
        const r=await doAct(e.body[i]); if(evAfter(r,id,"@"+eid+":"+i)) return; if(r.k!=="ok") break; } } }
  addEventListener("keydown",e=>{ if(!G||SCREEN!=="game"||!G.ev||e.ctrlKey||e.metaKey||e.altKey) return;
    /* selector de tecla abierto: la próxima tecla permitida queda asignada (Esc cancela; si se cerró la ventana, se olvida) */
    if(G.capture){ if(!$("kmenu")){ G.capture=null; } else { if(e.key==="Escape"){ closeKeyMenu(); return; } const c=evKeyOf(e); e.preventDefault(); if(c) setEvKey(G.capture,c); return; } }
    const t=e.target; if(t&&t.closest&&t.closest("input,textarea,[contenteditable]")) return;
    const k=evKeyOf(e); if(!k||!evKeys().includes(k)) return; e.preventDefault(); if(!e.repeat) keyPress(k); }); /* preventDefault: las flechas y el espacio no mueven la página */
  document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("#keypad .kpb"); if(b) return keyPress(b.dataset.k);
    /* menú de tecla: tocar una tecla la elige; tocar afuera lo cierra */
    const pk=e.target.closest&&e.target.closest("#kmenu [data-pick]"); if(pk&&G&&G.capture) return setEvKey(G.capture,pk.dataset.pick);
    if($("kmenu")&&!(e.target.closest&&e.target.closest("#kmenu"))) closeKeyMenu(); });
  async function run(step){

    if(G.ev&&!G.busy) return listenStart();

    if(G.ctx&&G.ctx.waiting){ if(!step) G.ctx.stepMode=false; releaseWait(); return; }
  
    if(G.busy) return;
  
    /* Python: se lee el código antes de correr; un error marca la línea y no arranca */
    if(G.py){ if(!G.code.trim()) return say("warn",ICO.code("#3776AB"),"Escribí tu programa en Python");
      const r=parsePy(G.code); if(!r.ok){ resetRobot(); return pyErr(r.ln,r.msg); } G.pyAst=r.prog; }
    else if(!G.prog.length) return say("warn",ICO.drag(),"Arrastrá bloques al programa");

    const id=++G.run; G.keepW=false; if(G.worlds&&G.map.pool){ G.worlds=pickWorlds(G.map); if(isMulti()) drawBoard(false); } /* con pool, cada intento sortea sus mundos */
    resetRobot(); if(G.worlds&&!isMulti()){ G.keepW=true; setWorld(0); }
    const ctx=G.ctx={id,stepMode:step,waiting:null,moves:0}; setBusy(true);
  
    say("",ICO.robot(),step?"Paso a paso":"¡Allá va!",step?"Tocá Paso para seguir":"");
  
    await sleep(200); if(id!==G.run) return;
    if(isMulti()) return runMulti(id,ctx); /* varios mapas: todos los robots a la vez */
  
    /* el si pregunta por la celda donde está el robot en ese momento */
  
    let res={k:"end"}, last=null;
    for(let wi=0;wi<(G.worlds?G.worlds.length:1);wi++){
    if(wi>0){ setWorld(wi); await sleep(600); if(id!==G.run) return; }
    const it=G.py?pyWalk(G.pyAst,c=>sense(G.wm,G.S,c)):walk(G.prog,c=>sense(G.wm,G.S,c),[],G.funcs); let n=0; res={k:"end"};
    for(let nx=it.next();!nx.done;nx=it.next()){ const ev=nx.value;
      if(G.paused){ await pauseGate(id); if(id!==G.run) return; }

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
  
    else if(kind==="flip"){ bot.classList.remove("flip"); void bot.offsetWidth; bot.classList.add("flip"); SND.flip();
      if(r.ok){ c.classList.add("flipped"); burst(x,y,["#FFC21A","#3B82F0","#A0673A","#FFFFFF"],16,5); floatText(x,y-24,"¡Voltereta!","#7C3AED"); } }
    else { bot.classList.remove("boogie"); void bot.offsetWidth; bot.classList.add("boogie"); SND.dance();
  
      if(r.ok){ c.classList.add("danced"); burst(x,y,["#1EC48C","#FFC21A","#FF6FB5","#FFFFFF"],16,5); floatText(x,y-24,"♪ ♫","#11986A"); } }
  
    await sleep(t); bot.classList.remove("boogie","flip");
  
    renderStatus();
  
  }
  
  async function animate(r,dir){
  
    const bot=$("bot"), t=T(), id=G.run; bot.dataset.look=dir; /* id: si se toca Parar a mitad, la animación se corta */
  
    if(r.k==="crash"&&r.why==="door"){ const [dr,dc]=DIRS[dir], d=cellEl(r.r,r.c); place(G.S,dc*.3,dr*.3); SND.locked(); setFace("triste",t*2.4);
      d.classList.remove("nokey"); void d.offsetWidth; d.classList.add("nokey"); await sleep(t*.45); place(G.S);
      bot.classList.add("shake"); setTimeout(()=>bot.classList.remove("shake"),400); const [x,y]=center(d); floatText(x,y-20,"¡Cerrada!","#B98500"); await sleep(t*.6); return; }
    if(r.k==="crash"){ const [dr,dc]=DIRS[dir]; place(G.S,dc*.32,dr*.32); SND.crash(); await sleep(t*.45); place(G.S);
  
      bot.classList.add("shake"); setTimeout(()=>bot.classList.remove("shake"),400); bumpEl($("gBoard"));
  
      const [x,y]=center(bot); burst(x+dc*G.step*.4,y+dr*G.step*.4,["#FF5A62","#FF9A2E","#FFC21A"],14,5); floatText(x,y-20,"¡Pum!","#FF5A62");
  
      if(r.why==="rock") cellEl(r.r,r.c).classList.add("flash"); await sleep(t*.5); return; }
  
    /* puerta: con la llave se abre antes de pasar */
    if(r.door){ const [dr,dc]=DIRS[dir], d=cellEl(G.S.r+dr,G.S.c+dc), [x,y]=center(d); d.classList.add("open"); SND.door(); setFace("wow",t*1.6);
      burst(x,y,["#FFC21A","#FFE27A","#FFFFFF",KCOL[DOORS[G.rows[G.S.r+dr][G.S.c+dc]]][0]],20,6); floatText(x,y-24,"¡Abierta!","#B98500"); await sleep(t*.7); if(id!==G.run) return; }
    const prev=cellEl(G.S.r,G.S.c); prev.style.setProperty("--tc",RAIN[G.trail++%RAIN.length]); prev.classList.add("trail");
    /* portal: GENI llega al portal, se lo traga el remolino y aparece girando en el otro */
    if(r.tp){ const [pr,pc]=r.tp.from, [er,ec]=r.tp.to, pin=cellEl(pr,pc), pout=cellEl(er,ec), col=PCOL[G.rows[pr][pc]];
      bot.classList.add("moving"); place({r:pr,c:pc}); SND.move(); await sleep(t); bot.classList.remove("moving"); if(id!==G.run) return;
      pin.classList.add("warping"); pout.classList.add("warping"); setFace("sorpresa",t*2.6); SND.portal();
      const [x0,y0]=center(pin); burst(x0,y0,[col[0],col[1],"#FFFFFF"],22,6); floatText(x0,y0-24,"¡Fiuuu!",col[0]);
      bot.classList.add("warpout"); await sleep(Math.max(260,t*.75)); if(id!==G.run) return;
      bot.classList.add("noanim"); G.S=r.S; place(G.S); void bot.offsetWidth; bot.classList.remove("noanim","warpout"); bot.classList.add("warpin");
      const [x1,y1]=center(pout); burst(x1,y1,[col[0],col[1],"#FFFFFF","#FFC21A"],26,7); sparkle(x1,y1);
      await sleep(Math.max(300,t*.8)); if(id!==G.run) return; bot.classList.remove("warpin"); pin.classList.remove("warping"); pout.classList.remove("warping"); renderStatus(); return; }
  
    G.S=r.S; bot.classList.add("moving"); place(G.S); SND.move();
  
    const [px,py]=center(prev); sparkle(px,py);
  
    await sleep(t); bot.classList.remove("moving");
  
    if(r.pnt){ const c=cellEl(G.S.r,G.S.c); c.classList.add("pnt"); SND.paint(); const [x,y]=center(c); burst(x,y,["#4C8DF6","#2563C9","#9CC3FF"],8,3); }
  
    if(r.bat){ const c=cellEl(G.S.r,G.S.c); c.classList.add("got"); SND.bat();
  
      const [x,y]=center(c); burst(x,y,["#1EC48C","#7BE6BD","#FFC21A","#FFFFFF"],22,6); floatText(x,y-24,"+1 ⚡","#11986A"); }
    if(r.gotKey){ const c=cellEl(G.S.r,G.S.c); c.classList.add("got"); SND.key(); setFace("wow",t*1.8);
      const [x,y]=center(c), kc=KCOL[r.gotKey]; burst(x,y,[kc[0],kc[1],"#FFFFFF","#FFC21A"],26,7); floatText(x,y-26,`¡Llave ${kc[2].toLowerCase()}!`,kc[0]==="#FFC21A"?"#B98500":kc[0]); }
  
    renderStatus();
  
  }
  
  /* con mundos, el motivo de la falla va precedido de «¡Falló en el mundo N!» */
  function finish(res,last){ if(G.worlds&&res.k!=="win"&&res.world!=null){ G.pre=`¡Falló en el mapa ${res.world+1}!`; try{ return finish0(res,last); } finally{ G.pre=""; } } return finish0(res,last); }
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
      const count=G.py?pyLines(G.code):used(), usedRep=G.map.cls===3?hasCall(G.prog):hasRepeat(G.prog), k=G.py?starsPy(G.map,{lines:count,req:!miss}):G.map.ev?starsAdv(G.map,{count,rep:false,acts:res.acts,opt:G.pathLen}):G.map.adv?starsAdv(G.map,{count,rep:hasRepeatAll(G.prog,G.funcs),acts:res.acts,opt:G.pathLen}):starsFor(G.map,count,usedRep,G.opt,G.hint,G.S.wrong);
  
      let gained=0, opened=[];
      const map=G.map, part=map.id!=="custom"&&map.part, wasDone=part&&partDone(SAVE.stars,part), lockedSec=lockedSecrets();
      if(G.map.id!=="custom"){ const old=SAVE.stars[G.map.id]||0;
        if(k>old){ const before=groupsNow(); SAVE.stars[G.map.id]=k; gained=k-old; persist(); renderTopStars();
          opened=groupsNow().filter((s,i)=>s.open&&!before[i].open).map(s=>s.g.title); } }
      let sub;
      if(G.py) sub=miss?`${ICO.code("#3776AB")} ${PY_REQ_TIP[miss]} para ganar 3 estrellas`:G.map.goal!=null&&count>G.map.goal?`${ICO.code("#3776AB")} Se puede con <b>${G.map.goal}</b> líneas`:"¡Código perfecto!";
      else if(G.map.ev){ const m=G.map; sub=count>m.goal?`${ICO.blocks()} Se puede con <b>${m.goal}</b> bloques`:res.acts>G.pathLen?"Se puede con menos pasos":"¡Eventos perfectos!"; }
      else if(G.map.adv){ const m=G.map; sub=count>m.goal?`${ICO.blocks()} Se puede con <b>${m.goal}</b> bloques`:m.rep&&!hasRepeatAll(G.prog,G.funcs)?`${ICO.repeat("#D9780F")} Probá usar repetir para ganar 3 estrellas`:res.acts>G.pathLen?"Se puede con menos pasos":"¡Recursión perfecta!"; }
      else if(G.map.cls===3&&!usedRep) sub=`${ICO.blocks()} ¿Probás con una función?`;
      else if(G.map.cls===2&&!usedRep&&!G.map.norep) sub=`${ICO.repeat("#D9780F")} ¿Probás con repetir?`;
      else if(G.S.wrong) sub=`${ICO.brush("#7E3DB0")} Pintaste ${G.S.wrong>1?G.S.wrong+" celdas que no eran rojas":"una celda que no era roja"}${G.tools.includes("n")?" · Guardá el pincel en las blancas":""}`;
      else if(G.opt!=null&&count>G.opt) sub=`${ICO.blocks()} Se puede con <b>${G.opt}</b> bloques`;
      else sub=G.worlds?"¡Funciona en todos los mapas!":G.map.need?"¡Llegó pintando!":"¡Programa perfecto!";
      if(G.hint&&k<3) sub+=" · Sin pista ganás 3 estrellas";
      if(res.left) sub+=G.py?" · Sobró código después de llegar":" · Sobraron bloques";
      const idx=MISSIONS.indexOf(G.map), nxt=MISSIONS[idx+1], gs=nxt&&groupsNow().find(s=>s.g.id===nxt.grp);
      let extra=`<div class="bigstars">${starRow(k,undefined,maxStars(G.map))}</div>`;
      if(opened.length) extra+=`<div class="unl">${ICO.unlock()} ¡Desbloqueaste «${opened.join("» y «")}»!</div>`;
      extra+=secretMsgs(lockedSec);
      /* se acaba de terminar la parte y falta su desafío: volver al menú e invitar a jugarlo */
      const ch=part&&!wasDone&&partDone(SAVE.stars,part)&&chOf(part), toCh=ch&&!SAVE.stars[ch.id];
      if(toCh) extra+=`<div class="unl">${ICO.clock()} ¡Se abrió el ${ch.title}!</div>`;
      else if(idx>=0&&gs&&gs.open&&!(PARTS.find(P=>P.id===nxt.part)?.extra&&!PARTS.find(P=>P.id===part)?.extra)) extra+=`<button class="nextbtn" data-next="${nxt.id}">Siguiente${ICO.next()}</button>`;
      say("ok",ICO.star(),hasE(G.map)?"¡Llegó!":"¡Listo!",sub,extra);
      celebrate(gained);
      if(toCh) setTimeout(()=>{ if(SCREEN!=="game"||G.map!==map) return; stopRun(); renderMenu(); show("menu"); chModal(ch); },2800);
      if(opened.length) setTimeout(()=>{ SND.unlock(); confetti(); },1600);
      return;
    }
  
    if(res.k==="crash"){ const el=!G.py&&last&&document.querySelector(`#canvas .blk[data-a="${last}"]`); el&&el.classList.add("err"); if(G.py) pyMark(last,"err");

      if(res.why==="door"){ const kc=KCOL[DOORS[G.rows[res.r][res.c]]]; return say("err",ICO.lock(kc[0]==="#FFC21A"?"#B98500":kc[0]),"¡La puerta está cerrada!",`Primero buscá la llave ${kc[2].toLowerCase()} · Mirá el bloque rojo`); }
      say("err",ICO.burst(),res.why==="out"?"¡Ahí no hay camino!":"¡Chocó!",G.py?`Mirá la línea ${last}`:"Mirá el bloque rojo"); return; }

    if(res.k==="bad"){ const el=!G.py&&last&&document.querySelector(`#canvas .blk[data-a="${last}"]`); el&&el.classList.add("err"); if(G.py) pyMark(last,"err");
  
      if(res.why==="t") return say("err",ICO.flip("#FF5A62"),"¡Ahí no va la voltereta!","Solo en las celdas de colores (amarillas, azules, marrones…)"+(G.tools.includes("e")?": usá el si no":""));
      return res.why==="p"?say("err",ICO.brush("#FF5A62"),"¡Esa celda no era roja!","Solo se pintan las rojas"+(G.tools.includes("i")?": usá el bloque si":""))
  
                          :say("err",ICO.music("#FF5A62"),"¡Ahí no se baila!","Solo en las celdas verdes"+(G.tools.includes("i")?": usá el bloque si":"")); }
  
    SND.fail();
  
    if(res.k==="long") return say("err",ICO.hourglass(),"¡Muy largo!","Revisá los números de repetir");
  
    /* Python: el programa terminó sin mover a GENI (casi siempre falta llamar a main() al final) */
    if(G.py&&!res.acts) return say("warn",ICO.question(),"GENI no se movió",G.pyAst&&G.pyAst.body.some(s=>s.k==="call")?"¿Las funciones que llamás mueven a GENI?":"Definiste funciones pero no las llamaste: escribí main() al final, sin sangría");
    const g=goalLeft(G.wm,G.S), toStar=hasE(G.map)?", después a la estrella":"";
  
    if(g.bat) return say("warn",ICO.bat(),G.nB>1?"Faltan baterías":"Falta la batería","Primero las baterías, después la estrella");
  
    if(g.red) return say("warn",ICO.brush("#FF5A62"),g.red>1?`Faltan pintar ${g.red} rojas`:"Falta pintar 1 roja",`Pintá todas las rojas${toStar}`);
  
    if(g.multi) return say("warn",ICO.flip("#7C3AED"),g.multi>1?`Faltan ${g.multi} volteretas`:"Falta 1 voltereta","En cada celda de color (que no sea roja), ¡voltereta!");
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
      say("err",ICO.burst(),"¡GENI explotó!",G.ev?`Hizo más de ${G.map.maxAct||MAXACT} movimientos con tus teclas. Tocá Ir y probá un camino más corto`:G.map.adv?"Tu función no termina nunca: ¿llega a la estrella?":`Hizo más de ${G.map.maxAct||MAXACT} movimientos. Revisá tu programa: ¿repite de más o da vueltas?`); },2750*k); }
  /* 67 BOT: al pasar el nivel hace «six seven» con las manos (solo él; con varios mapas, todos sus robots). Con «reducir movimiento», no */
  let sixT=null;
  function six67(){ if(SAVE.skin!=="mega"||RM.matches) return;
    const bots=[$("bot"),...((G&&G.B)||[]).map(b=>b.bot)].filter((b,i,a)=>b&&a.indexOf(b)===i);
    bots.forEach(b=>{ b.classList.remove("six"); void b.offsetWidth; b.classList.add("six"); });
    clearTimeout(sixT); sixT=setTimeout(()=>bots.forEach(b=>b.classList.remove("six")),1800); }
  function celebrate(gained){
  
    SND.win(); confetti(); $("gBoard").classList.add("win"); six67();
  
    const bot=$("bot"); bot.classList.add("happy"); setTimeout(()=>bot.classList.remove("happy"),2100); if(G.fun) setFace("wow",2400);
  
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
  
    const gained=Math.max(0,k-old), lockedBefore=lockedSecrets(), before=groupsNow();
  
    if(k>old) SAVE.stars[ch.id]=k; if(rec) SAVE.best[ch.id]=sec; persist();
  
    let sub=k<3?`Para ${k+1} estrellas: menos de ${fmtTime(k===2?ch.t3:ch.t2)}`:"¡Tiempo perfecto!";
  
    if(!rec) sub+=` · Tu récord: ${fmtTime(prev)}`;
  
    let extra=`<div class="bigstars">${starRow(k,undefined,maxStars(G.map))}</div>`;
  
    if(rec&&prev!=null) extra+=`<div class="unl">${ICO.clock()} ¡Nuevo récord!</div>`;
    extra+=secretMsgs(lockedBefore);
  
    /* desafío completo: no se vuelve a jugar solo; se sale al menú y se felicita */
    const opened=groupsNow().filter((s,i)=>s.open&&!before[i].open).map(s=>s.g), map=G.map;
    extra+=`<button class="nextbtn" data-chdone>Volver al menú${ICO.next()}</button>`;
  
    say("ok",ICO.star(),`¡Desafío completo en ${fmtTime(sec)}!`,sub,extra);
  
    celebrate(gained);
    CH.done={ch,k,sec,rec:rec&&prev!=null,opened};
    setTimeout(()=>{ if(SCREEN==="game"&&G.map===map&&CH&&CH.done) chDone(); },3200);
  }
  /* sale del desafío terminado y muestra la felicitación en el menú */
  function chDone(){ const d=CH&&CH.done; if(!d) return;
    stopRun(); renderMenu(); show("menu"); chCongrats(d); }
  function chCongrats({ch,k,sec,rec,opened}){
    const names=[...new Set(opened.map(g=>g.part))].map(id=>PARTS.find(P=>P.id===id)).filter(Boolean);
    const norm=names.filter(P=>!P.extra), adv=names.some(P=>P.extra);
    let msg=`<p>Terminaste el <b>${ch.title}</b> en <b>${fmtTime(sec)}</b>${rec?" · ¡nuevo récord!":""}.</p>`;
    if(norm.length) msg+=`<p>${ICO.unlock()} Se abrió ${norm.map(P=>`<b>${P.title}</b>`).join(" y ")}.</p>`;
    if(adv) msg+=`<p>${ICO.unlock()} También se abrieron los <b>Niveles avanzados</b> (opcionales, abajo de todo).</p>`;
    const dlg=openModal(`<span class="mico">${ICO.star()}</span><h2>¡Felicitaciones! Superaste la ${partName(ch.part)}</h2>`+
      `<div class="bigstars">${starRow(k)}</div>${msg}`+
      `<div class="mbtns"><button class="mbtn" data-go>Seguir${ICO.next()}</button></div>`);
    confetti(); SND.unlock&&SND.unlock();
    dlg.querySelector("[data-go]").onclick=()=>{ closeModal();
      /* llevar a la primera card que se abrió (si es de una parte normal) */
      const g=opened.find(g=>!PARTS.find(P=>P.id===g.part)?.extra), m=g&&MISSIONS.find(m=>m.grp===g.id);
      const el=m&&document.querySelector(`.card[data-id="${m.id}"]`);
      if(el){ el.scrollIntoView({block:"center",behavior:RM.matches?"auto":"smooth"}); bumpEl(el,"hey"); } };
  
  }
  
  
  
  $("runBtn").onclick=()=>run(false); $("stepBtn").onclick=()=>run(true);
  
  $("stopBtn").onclick=()=>{ if(G.done) return; stopRun(); $("runBtn").classList.toggle("ready",G.prog.length>0); say("",ICO.robot(),"Listo para empezar","Tocá Ir para probar"); };
  
  $("msg").addEventListener("click",e=>{
  
    if(CH&&e.target.closest("[data-chnext]")){ stopRun(); CH.idx++; return playLevel(); }
  
    if(CH&&e.target.closest("[data-chdone]")) return chDone();
  
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
    fixSkin(); const w=wallet();
    $("ped").innerHTML=`<svg viewBox="-50 -50 100 100" data-look="r">${robotSVG()}</svg>`;
    const face=FACES.find(f=>f.id===SAVE.face);
    $("shopName").textContent=SKINS.find(s=>s.id===SAVE.skin).name+(SAVE.face==="normal"?"":" · "+face.name);
    $("shopStars").innerHTML=starIco(true)+`Tenés <b>${w}</b> estrellas para gastar`;
    $("skins").innerHTML=SKINS.map((s,i)=>{ const own=skinOwned(s), on=SAVE.skin===s.id;
      if(!own&&s.secret) return `<button class="skin secret" data-s="${s.id}" style="--i:${i}"><svg class="prev" viewBox="-50 -50 100 100">${robotSVG({skin:s.id,face:"normal"})}</svg><b>Robot secreto</b><span class="tag">${ICO.lock("#22D3FF")}¿Cómo se gana?</span></button>`;
      return `<button class="skin${on?" on":""}${!own&&w<s.price?" poor":""}" data-s="${s.id}" style="--i:${i}"><svg class="prev" viewBox="-50 -50 100 100" data-look="r">${robotSVG({skin:s.id})}</svg><b>${s.name}</b>${promoOnly(s)?`<span class="freetag">Gratis hasta las 17:30</span>`:""}${shopTag(on,own,s.id,s.price)}</button>`; }).join("");
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
  
  /* carrusel: flechas del teclado y deslizar con el dedo */
  addEventListener("keydown",e=>{ if(SCREEN!=="menu"||WORLD||$("modal")||/INPUT|TEXTAREA/.test(document.activeElement?.tagName||"")) return;
    if(e.key==="ArrowLeft"){ e.preventDefault(); carGo(CAR-1); } else if(e.key==="ArrowRight"){ e.preventDefault(); carGo(CAR+1); } });
  { let x0=null; const v=$("worlds");
    v.addEventListener("pointerdown",e=>{ if(e.pointerType!=="mouse") x0=e.clientX; });
    v.addEventListener("pointerup",e=>{ if(x0==null) return; const dx=e.clientX-x0; x0=null; if(Math.abs(dx)>50) carGo(CAR+(dx<0?1:-1)); });
    v.addEventListener("pointercancel",()=>{ x0=null; }); }
  renderMenu();
  
  if(/[?&]test/.test(location.search)){ const box=document.createElement("div"); box.className="testbox";
  
    box.innerHTML="<h3>Autoverificación</h3>"+selfTest().map(r=>`<div>${r.ok?"✔":"✖"} ${r.title} — ${r.info}</div>`).join(""); document.body.appendChild(box); }
  
  
}
