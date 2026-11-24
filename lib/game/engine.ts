// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
import { PARTS, GROUPS, MISSIONS, CHALLENGES, NORMAL_COUNT, ED } from "./data";
import { parsePy, pyWalk, pyLines, pyMissing } from "./python";

export function timeStars(ch,sec){ return sec<=ch.t3?3:sec<=ch.t2?2:1; }
export function fmtTime(sec){ sec=Math.floor(sec); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }
export const DIRS={u:[-1,0],d:[1,0],l:[0,-1],r:[0,1]};
export const MAXSTEPS=400, MAXB=30;
/* en cualquier nivel (menos el mapa propio): si el robot pasa de MAXACT acciones (mover, pintar, bailar...) o de MAXSTEPS eventos, GENI explota. Un nivel puede subir su tope con maxAct */
export const MAXACT=30;

export function find(rows,ch){ for(let r=0;r<rows.length;r++){ const c=rows[r].indexOf(ch); if(c>=0) return [r,c]; } return null; }
export function countB(rows){ return rows.join("").split("B").length-1; }
export function cellsOf(rows,ch){ const out=[]; rows.forEach((row,r)=>[...row].forEach((x,c)=>{ if(x===ch) out.push(r+","+c); })); return out; }
export function hasE(map){ return map.rows.some(r=>r.includes("E")); }
/* pnt: celdas pintadas, dan: verdes donde bailó, wrong: pintadas que no eran rojas, pen: pincel en uso */
export function startState(map){ const R=find(map.rows,"R"); return {r:R[0],c:R[1],got:[],pnt:[],dan:[],wrong:0,pen:false,starNoBat:false}; }
/* bloques de acción y su letra en las soluciones */
export const ACTS={paint:"p",dance:"b",penon:"n",penoff:"f"};
/* pinta la celda (r,c) si se puede (la estrella no se pinta). Pintar algo que no es rojo cuenta como «wrong», salvo en llegar pintando */
export function paintCell(map,S,r,c){ const key=r+","+c, ch=map.rows[r][c];
  if(ch==="E"||S.pnt.includes(key)) return S;
  return {...S,pnt:S.pnt.concat(key),wrong:S.wrong+(ch!=="X"&&!map.need?1:0)}; }
/* lo que falta para ganar (baterías, rojas, verdes, celdas en pintar libre) */
export function goalLeft(map,S){
  return {bat:countB(map.rows)-S.got.length, red:cellsOf(map.rows,"X").filter(k=>!S.pnt.includes(k)).length,
    green:cellsOf(map.rows,"V").filter(k=>!S.dan.includes(k)).length, need:map.need?Math.max(0,map.need-S.pnt.length):0}; }
export function goalMet(map,S){ const g=goalLeft(map,S); return !g.bat&&!g.red&&!g.green&&!g.need; }

/* un movimiento: devuelve choque, ok o llegada (no modifica S) */
export function tryMove(map,S,dir){
  const rows=map.rows, [dr,dc]=DIRS[dir], r=S.r+dr, c=S.c+dc;
  if(r<0||c<0||r>=rows.length||c>=rows[0].length) return {k:"crash",why:"out",r,c};
  const ch=rows[r][c]; if(ch==="#") return {k:"crash",why:"rock",r,c};
  const got=S.got.slice(), key=r+","+c; let bat=false;
  if(ch==="B"&&!got.includes(key)){ got.push(key); bat=true; }
  let S2={...S,r,c,got}; const n0=S2.pnt.length;
  if(S.pen) S2=paintCell(map,S2,r,c); /* con el pincel en uso pinta cada celda que pisa */
  const pnt=S2.pnt.length>n0;
  if(ch==="E"){ if(goalMet(map,S2)) return {k:"win",S:S2,bat,pnt}; S2.starNoBat=true; }
  return {k:"ok",S:S2,bat,pnt};
}
/* acciones en la celda del robot: n usar pincel (y pinta donde está), f guardar pincel,
   p pintar de un toque, b bailar. En niveles «strict» pintar/bailar en la celda equivocada es error */
export function tryAct(map,S,a){
  if(a==="n"){ const S2={...paintCell(map,S,S.r,S.c),pen:true}; return {k:"ok",S:S2,ok:true,pnt:S2.pnt.length>S.pnt.length}; }
  if(a==="f") return {k:"ok",S:{...S,pen:false},ok:true};
  const key=S.r+","+S.c, ch=map.rows[S.r][S.c], S2={...S};
  if(a==="p"){ const ok=ch==="X"&&!S.pnt.includes(key);
    if(!ok&&map.strict) return {k:"bad",why:"p"};
    if(!S.pnt.includes(key)) S2.pnt=S.pnt.concat(key);
    if(!ok&&!map.need) S2.wrong=S.wrong+1;
    return {k:"ok",S:S2,ok}; }
  const ok=ch==="V"; if(!ok&&map.strict) return {k:"bad",why:"b"};
  if(ok&&!S.dan.includes(key)) S2.dan=S.dan.concat(key);
  return {k:"ok",S:S2,ok};
}
/* color de la celda del robot para el bloque si: "x" roja sin pintar, "v" verde */
export function cellColor(map,S){ const ch=map.rows[S.r][S.c]; return ch==="X"&&!S.pnt.includes(S.r+","+S.c)?"x":ch==="V"?"v":""; }

/* sensor del bloque si: "x" roja sin pintar, "v" verde (como cellColor) y de pared por dirección absoluta:
   "wu","wd","wl","wr" = hay pared o borde de ese lado; "nu","nd","nl","nr" = NO hay pared de ese lado */
export function sense(map,S,c){
  if(c==="x"||c==="v") return cellColor(map,S)===c;
  if(c==="e") return map.rows[S.r][S.c]==="E"; /* Python: en_estrella() */
  const d=DIRS[c[1]]; if(!d) return false;
  const r=S.r+d[0], k=S.c+d[1], wall=r<0||k<0||r>=map.rows.length||k>=map.rows[0].length||map.rows[r][k]==="#";
  return c[0]==="n"?!wall:wall; }

/* camino más corto (cada acción = 1 bloque) desde S: junta baterías, pinta rojas, baila en verdes y llega a la estrella si hay.
   Con pincel (tools «n») busca usarlo y guardarlo sin pintar nunca una celda que no sea roja.
   Devuelve [[fila,col,acción],...] (acción: u d l r, n/f pincel, p pintar, b bailar) */
export function shortest(map,S){
  const rows=map.rows, n=rows.length, m=rows[0].length, E=hasE(map), PEN=!!map.tools&&map.tools.includes("n");
  const bats=cellsOf(rows,"B"), tg=cellsOf(rows,"X").map(k=>[k,"p"]).concat(PEN?[]:cellsOf(rows,"V").map(k=>[k,"b"]));
  const fullB=(1<<bats.length)-1, fullT=(1<<tg.length)-1; let b0=0, t0=0;
  S.got.forEach(k=>{ const i=bats.indexOf(k); if(i>=0) b0|=1<<i; });
  tg.forEach(([k,a],i)=>{ if((a==="p"?S.pnt:S.dan).includes(k)) t0|=1<<i; });
  if(!E&&b0===fullB&&t0===fullT) return [];
  /* con pincel: pisar (r,c) pinta; devuelve el nuevo t o -1 si pintaría una celda que no es roja */
  const ink=(t,r,c)=>{ const k=r+","+c, ch=rows[r][c], i=tg.findIndex(([x])=>x===k);
    if(i>=0) return t|1<<i; return ch==="E"||S.pnt.includes(k)?t:-1; };
  const start={r:S.r,c:S.c,b:b0,t:t0,w:S.pen?1:0,prev:null}, seen=new Set([`${S.r},${S.c},${b0},${t0},${start.w}`]); let q=[start];
  while(q.length){ const nq=[];
    for(const s of q){ const next=[];
      for(const d of "udlr"){
        const r=s.r+DIRS[d][0], c=s.c+DIRS[d][1];
        if(r<0||c<0||r>=n||c>=m||rows[r][c]==="#") continue;
        const t=PEN&&s.w?ink(s.t,r,c):s.t; if(t<0) continue;
        const bi=bats.indexOf(r+","+c); next.push({r,c,b:bi>=0?s.b|1<<bi:s.b,t,w:s.w,a:d}); }
      if(PEN){ if(s.w) next.push({...s,w:0,a:"f"});
        else { const t=ink(s.t,s.r,s.c); if(t>=0) next.push({...s,t,w:1,a:"n"}); } }
      else { const ti=tg.findIndex(([k])=>k===s.r+","+s.c);
        if(ti>=0&&!(s.t>>ti&1)) next.push({r:s.r,c:s.c,b:s.b,t:s.t|1<<ti,w:0,a:tg[ti][1]}); }
      for(const x of next){ const node={...x,prev:s};
        if(x.b===fullB&&x.t===fullT&&(!E||(DIRS[x.a]&&rows[x.r][x.c]==="E"))){ const path=[]; for(let y=node;y.prev;y=y.prev) path.unshift([y.r,y.c,y.a]); return path; }
        const k=`${x.r},${x.c},${x.b},${x.t},${x.w}`; if(!seen.has(k)){ seen.add(k); nq.push(node); } } }
    q=nq; }
  return null;
}

/* recorre el programa: "loop" al empezar cada vuelta de un repetir, "if" al preguntar, y una acción por cada bloque.
   test(color) se consulta en el momento, así el si ve la celda donde está el robot */
/* funcs: {A:[...],B:[...]} cuerpos de las funciones. «call» emite {t:"call",addr,f} y recorre el cuerpo con dirección ["A",i,...]
   (dentro de una función prefix[0] es su letra). Una función puede llamar a una anterior o a sí misma (B llama a A o a B, A solo a A).
   La autollamada no termina sola: la simulación corta al llegar a la estrella o al pasarse del tope (el generador es perezoso).
   El call que no cumple la regla se emite igual pero no se expande */
export function* walk(list,test,prefix=[],funcs=null){
  const ifr=[]; /* respuesta de cada si de esta lista: el «si no» mira el bloque anterior */
  for(let i=0;i<list.length;i++){ const b=list[i], addr=prefix.concat(i);
    if(b.t==="move") yield {t:"move",addr,dir:b.dir};
    else if(ACTS[b.t]) yield {t:b.t,addr};
    else if(b.t==="call"){ yield {t:"call",addr,f:b.f}; const cur=typeof prefix[0]==="string"?prefix[0]:null;
      if(funcs&&funcs[b.f]&&(cur===null||b.f<=cur)) yield* walk(funcs[b.f],test,[b.f],funcs); }
    else if(b.t==="if"){ const ok=test(b.c); ifr[i]=ok; yield {t:"if",addr,ok}; if(ok) yield* walk(b.body,test,addr,funcs); }
    else if(b.t==="else"){ const ok=i>0&&list[i-1].t==="if"&&ifr[i-1]===false; yield {t:"else",addr,ok}; if(ok) yield* walk(b.body,test,addr,funcs); }
    else for(let k=0;k<b.n;k++){ yield {t:"loop",addr,k,n:b.n}; yield* walk(b.body,test,addr,funcs); } }
}
export function countBlocks(list){ return list.reduce((a,b)=>a+1+(b.body?countBlocks(b.body):0),0); }
/* con funciones: cada cuerpo cuenta una sola vez + los bloques del programa (cada call cuenta 1) */
export function countProgram(prog,funcs){ return countBlocks(prog)+Object.values(funcs||{}).reduce((a,l)=>a+countBlocks(l),0); }
export function hasCall(list){ return list.some(b=>b.t==="call"||(b.body&&hasCall(b.body))); }
/* el mismo programa con cada call reemplazado por el cuerpo de su función */
/* si una función ya se está expandiendo (autollamada) el call queda como está: así no se cuelga con la recursión */
export function inlineCalls(list,funcs,stack=[]){ return list.flatMap(b=>b.t==="call"?(stack.includes(b.f)?[b]:inlineCalls(funcs[b.f]||[],funcs,stack.concat(b.f))):b.body?[{...b,body:inlineCalls(b.body,funcs,stack)}]:[b]); }
export function hasRepeat(list){ return list.some(b=>b.t==="repeat"); }
/* repetir en el programa o en cualquier función (con repetir adentro de otro bloque también) */
export function hasRepeatAll(list,funcs){ const rp=l=>l.some(b=>b.t==="repeat"||(b.body&&rp(b.body))); return rp(list)||Object.values(funcs||{}).some(rp); }
export function hasIf(list){ return list.some(b=>b.t==="if"||b.t==="else"||(b.body&&hasIf(b.body))); }
/* opt y límites cuentan el bloque «al tocar» */
export function optFor(map,path){ return map.cls>=2?map.max:map.need?null:(path?path.length+1:null); }
export function limitFor(map,opt){ return map.cls>=2?map.max:map.cls===1&&opt!=null?opt+2:MAXB; }
export function starsFor(map,count,usedRep,opt,hint,wrong){
  let k=map.cls>=2?(usedRep?3:2):(opt==null||count<=opt?3:2);
  if(wrong) k=Math.min(k,2); if(hint) k--; return Math.max(1,k);
}
/* niveles avanzados (map.adv), hasta 3 estrellas como todos: 1 llegó con recursión, +1 dentro de la meta de bloques (goal) y con repetir
   si el nivel lo pide (rep), +1 por el camino más corto (acts = acciones hechas, opt = largo del camino) */
export function starsAdv(map,{count,rep,acts,opt}){
  return 1+(count<=map.goal&&(!map.rep||rep)?1:0)+(opt!=null&&acts<=opt?1:0); }
export const maxStars=m=>3;
/* niveles de Python (map.py): 1 llegó, +1 usó lo que pide el nivel (req), +1 dentro de la meta de líneas (goal) */
export function starsPy(map,{lines,req}){ return 1+(req?1:0)+(map.goal==null||lines<=map.goal?1:0); } /* todos los niveles dan hasta 3 estrellas */
/* grupos: cada parte tiene su cadena. El primero se abre al terminar las partes «after»;
   los demás al terminar el grupo anterior y juntar las estrellas pedidas (de esa parte) */
export function partDone(stars,p){ return MISSIONS.filter(m=>m.part===p).every(m=>stars[m.id]); }
export function partName(p){ return `Parte ${p} · ${PARTS.find(x=>x.id===p).title}`; }
/* una parte está «superada» cuando tiene todos sus niveles y además su desafío extra (al menos 1 estrella) */
export function chOf(p){ return CHALLENGES.find(c=>c.part===p); }
export function partCleared(stars,p){ const ch=chOf(p); return partDone(stars,p)&&(!ch||!!stars[ch.id]); }
/* qué le falta a cada parte previa: terminar sus niveles o pasar su desafío */
export function gateTxt(stars,parts,long){ const t=parts.map(p=>partDone(stars,p)?`pasá el ${chOf(p).title}`:`terminá la ${long?partName(p):"Parte "+p}`).join(" y ");
  return t[0].toUpperCase()+t.slice(1); }
/* codes: partes cuyo código (PARTS[].code) ya se ingresó en esta compu */
export function groupState(stars,codes=[]){
  let prev=null;
  return GROUPS.map(g=>{
    if(prev&&prev.g.part!==g.part) prev=null;
    const ms=MISSIONS.filter(m=>m.grp===g.id), done=ms.filter(m=>stars[m.id]).length;
    const earned=MISSIONS.filter(m=>m.part===g.part).reduce((a,m)=>a+(stars[m.id]||0),0);
    let open, prevLeft=0, gate=null, needCode=null;
    if(!prev){ const P=PARTS.find(p=>p.id===g.part), miss=P.after.filter(p=>!partCleared(stars,p)); open=!miss.length;
      if(!open) gate=miss;
      else if(P.code&&!codes.includes(P.id)){ open=false; needCode=P.id; } }
    else { gate=prev.gate; needCode=prev.needCode; prevLeft=prev.ms.length-prev.done; open=prev.open&&prevLeft===0&&earned>=g.need; }
    return prev={g,ms,done,open,prevLeft,prevTitle:prev&&prev.g.title,gate,needCode,earned}; });
}
/* notación de la solución: u d l r mover, p b n f acciones, «N(...)» repetir N veces, «?x(...)» si roja, «?v(...)» si verde,
   «?wr(...)» si pared a la derecha (condición de 2 letras: w/n = hay/no hay pared + u d l r), «!(...)» si no (del si anterior).
   Funciones (mayúscula): «A=(r r u)» define A (en cualquier lugar, se separa con «;»), «A» sola la llama.
   parseSolF devuelve {prog,funcs}; parseSol solo el programa */
export function parseSolF(s){ let i=0; const funcs={};
  function list(){ const out=[];
    while(i<s.length){ const ch=s[i];
      if(ch===" "||ch===";"){ i++; continue; }
      if(/[A-Z]/.test(ch)){ if(s[i+1]==="="){ i+=3; funcs[ch]=list(); } else { out.push({t:"call",f:ch}); i++; } continue; }
      if(ch===")"){ i++; return out; }
      if(/\d/.test(ch)){ let num=""; while(/\d/.test(s[i])) num+=s[i++]; i++; out.push({t:"repeat",n:+num,body:list()}); }
      else if(ch==="?"){ i++; let c=""; while(s[i]!=="(") c+=s[i++]; i++; out.push({t:"if",c,body:list()}); }
      else if(ch==="!"){ i+=2; out.push({t:"else",body:list()}); }
      else { const a=Object.keys(ACTS).find(k=>ACTS[k]===ch); out.push(a?{t:a}:{t:"move",dir:ch}); i++; } }
    return out; }
  const prog=list(); return {prog,funcs}; }
export function parseSol(s){ return parseSolF(s).prog; }
/* devuelve k: win (con acts = acciones hechas y rec = alguna función se llamó a sí misma), crash, bad, end
   o boom (se pasó de MAXACT acciones o de MAXSTEPS eventos: bucle infinito, repetir de más, etc.) */
/* prog puede ser un programa de Python ya leído ({py:true,body}, de parsePy): sus errores devuelven k:"pyerr" con ln y msg */
export function simulate(map,prog,funcs=null){ let S=startState(map), n=0, acts=0, rec=false; const lim=map.cls===0?Infinity:(map.maxAct||MAXACT);
  const it=prog&&prog.py?pyWalk(prog,c=>sense(map,S,c)):walk(prog,c=>sense(map,S,c),[],funcs);
  for(const ev of it){ if(++n>MAXSTEPS) return {k:"boom"};
    if(ev.t==="error") return {k:"pyerr",ln:ev.ln,msg:ev.msg};
    if(ev.t==="call"){ if(typeof ev.addr[0]==="string"&&ev.addr[0]===ev.f) rec=true; continue; }
    if((ev.t==="move"||ACTS[ev.t])&&++acts>lim) return {k:"boom"};
    /* (el conteo de acciones ahora es para todos los niveles) */
    if(ev.t==="move"){ const res=tryMove(map,S,ev.dir); if(res.k==="crash") return res; S=res.S; if(res.k==="win") return {...res,acts,rec}; }
    else if(ACTS[ev.t]){ const res=tryAct(map,S,ACTS[ev.t]); if(res.k==="bad") return res; S=res.S; } }
  return !hasE(map)&&goalMet(map,S)?{k:"win",S,acts,rec}:{k:"end",S}; }
export function maxRun(list){ const s=[...walk(list,()=>false)].filter(e=>e.t!=="loop"&&e.t!=="if"&&e.t!=="else"&&e.t!=="call").map(e=>e.t==="move"?e.dir:ACTS[e.t]).join(""); return s?Math.max(...s.match(/(.)*/g).map(x=>x.length)):0; }
/* el mismo programa sin los si (todo lo de adentro siempre): en los niveles de Si tiene que fallar */
export function stripIf(list){ return list.flatMap(b=>b.t==="if"||b.t==="else"?stripIf(b.body):b.body?[{...b,body:stripIf(b.body)}]:[b]); }
/* ===== Mundos (inicio) ===== */
/* un mapa puede traer worlds:[rows0,rows1,...] (rows = worlds[0]) y pool (más mundos de los que se muestran, show por intento) */
export function worldsOf(map){ return map.pool||map.worlds||[map.rows]; }
export function worldMap(map,rows){ return {...map,rows}; }
/* mundos de un intento: sin pool, todos en orden; con pool, el 0 más (show-1) distintos sorteados */
export function pickWorlds(map,rnd=Math.random){ const all=worldsOf(map);
  if(!map.pool||!map.show||map.show>=all.length) return all;
  const rest=all.slice(1).map(w=>[rnd(),w]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]), out=[all[0]];
  for(const w of rest){ if(out.length>=map.show) break; if(!out.some(o=>o.join("")===w.join(""))) out.push(w); }
  return out; }
/* corre el programa en cada mundo: gana solo si gana en todos; si falla devuelve el resultado con world:i */
export function simulateAll(map,prog,list=worldsOf(map),funcs=null){ let wrong=0, S=null;
  for(let i=0;i<list.length;i++){ const r=simulate(worldMap(map,list[i]),prog,funcs);
    if(r.k!=="win") return {...r,world:i};
    S=r.S; wrong=Math.max(wrong,(r.S&&r.S.wrong)||0); }
  return {k:"win",S:{...S,wrong}}; }
/* mundos válidos: mismo tamaño, robot, estrella y baterías; y ningún camino fijo (el más corto de cada mundo) sirve en todos */
function worldsCheck(m){ const ws=worldsOf(m), a=ws[0], info=[]; let ok=ws.length>=2;
  ws.forEach((w,i)=>{ const same=w.length===a.length&&w.every(r=>r.length===a[0].length)&&find(w,"R")+""===find(a,"R")+""&&find(w,"E")+""===find(a,"E")+""&&countB(w)===countB(a);
    const mm=worldMap(m,w), path=shortest(mm,startState(mm));
    let memo=false; if(path){ const flat=path.map(([,,x])=>{ const k=Object.keys(ACTS).find(q=>ACTS[q]===x); return k?{t:k}:{t:"move",dir:x}; }); memo=simulateAll(m,flat,ws).k==="win"; }
    if(!same||!path||memo) ok=false; if(!same) info.push("w"+i+" distinto"); if(!path) info.push("w"+i+" sin camino"); if(memo) info.push("w"+i+" memorizable"); });
  return {ok,info:ws.length+" mundos"+(info.length?" ✖ "+info.join(","):"")}; }
/* ===== Mundos (fin) ===== */
export function selfTest(){
  const res=[...MISSIONS,...CHALLENGES.flatMap(c=>c.levels)].map(m=>m.py?pyCheck(m):blockCheck(m));
  function blockCheck(m){ const {prog:sol,funcs:fn}=parseSolF(m.sol), sim=m.worlds?simulateAll(m,sol,undefined,fn):simulate(m,sol,fn), path=shortest(m,startState(m)), cnt=countProgram(sol,fn)+1, used=m.cls===3?hasCall(sol):hasRepeat(sol);
    const opt=optFor(m,path), lim=limitFor(m,opt), run=maxRun(sol), cond=m.tools.includes("i");
    /* todos los niveles terminan en la estrella: se gana al llegar con todo hecho */
    const best=m.adv?starsAdv(m,{count:cnt,rep:hasRepeatAll(sol,fn),acts:sim.acts,opt:path&&path.length})===3:starsFor(m,cnt,used,opt,false,sim.S&&sim.S.wrong)===3;
    let ok=hasE(m)&&sim.k==="win"&&!!path&&cnt<=lim&&best;
    if(m.cls===1) ok=ok&&!used&&(m.need||(cnt===opt&&run<=3)); else ok=ok&&used;
    /* cls 3: la versión sin funciones (call -> cuerpo) tiene que pasarse del máximo, si no la función no hace falta.
       Niveles adv: la solución tiene que ganar con una función que se llama a sí misma, sin crear funciones sin usar y sin pasarse del tope de acciones */
    if(m.adv) ok=ok&&m.tools.includes("f")&&sim.rec===true&&cnt<=m.max&&m.goal<=m.max&&!m.pre&&(!m.rep||hasRepeatAll(sol,fn))&&sim.acts<=(m.maxAct||MAXACT);
    else if(m.cls===3) ok=ok&&m.tools.includes("f")&&countBlocks(inlineCalls(sol,fn))+1>lim;
    const noIf=()=>m.worlds?simulateAll(m,stripIf(sol),undefined,fn):simulate(m,stripIf(sol),fn);
    if(cond) ok=ok&&hasIf(sol)&&noIf().k!=="win";
    if(m.worlds) ok=ok&&worldsCheck(m).ok;
    return {id:m.id,title:m.title,ok,info:`sim:${sim.k} bfs:${path?path.length:"-"} bloques:${cnt}/${lim}${m.cls===1&&!m.need?" seguidos:"+run:""}${cond?" sin si: "+noIf().k:""}${m.worlds?" "+worldsCheck(m).info:""}`}; }
  /* Python: la solución se lee sin errores, gana por el camino más corto, entra en la meta de líneas y usa lo que pide el nivel (3 estrellas).
     El código de arranque (pre) no puede ganar solo */
  function pyCheck(m){ const r=parsePy(m.sol), path=shortest(m,startState(m)), sim=r.ok?simulate(m,r.prog):{k:"pyerr",ln:r.ln,msg:r.msg};
    const lines=pyLines(m.sol), miss=r.ok?pyMissing(r.prog,m.req):"?", pre=m.pre!=null?parsePy(m.pre):null, preWin=!!(pre&&pre.ok&&simulate(m,pre.prog).k==="win");
    const ok=r.ok&&hasE(m)&&sim.k==="win"&&!!path&&sim.acts===path.length&&(m.goal==null||lines<=m.goal)&&!miss&&!preWin;
    return {id:m.id,title:m.title,ok,info:`sim:${sim.k}${sim.k==="pyerr"?" (línea "+sim.ln+": "+sim.msg+")":""} acciones:${sim.acts??"-"} bfs:${path?path.length:"-"} líneas:${lines}${m.goal!=null?"/"+m.goal:""}${miss?" falta:"+miss:""}${preWin?" ✖ el código de arranque ya gana":""}`}; }
  /* recursión: un bucle infinito explota (por acciones y por eventos), y ganar sin que una función se llame a sí misma no cuenta (rec=false) */
  const loopMap={rows:["..R..E"],adv:true,cls:3,tools:"pf",strict:true};
  const boomA=parseSolF("A=(l r A); A"), boomB=parseSolF("A=(A); A");
  const longMap={rows:["R"+".".repeat(58)+"E"],cls:1,tools:"r"}, rpt=parseSolF("10(10(r))");  res.push({id:"boom",title:"Bucle infinito o repetir de más: GENI explota",ok:simulate(loopMap,boomA.prog,boomA.funcs).k==="boom"&&simulate(loopMap,boomB.prog,boomB.funcs).k==="boom"&&simulate(longMap,rpt.prog,{}).k==="boom"&&simulate({...longMap,cls:0},rpt.prog,{}).k!=="boom",info:`A=(l r A), A=(A), 10(10(r)) en un pasillo largo; más de ${MAXACT} acciones (el mapa propio no tiene tope)`});
  const adv0=MISSIONS.find(m=>m.adv);
  if(adv0){ const p=shortest(adv0,startState(adv0)), flat=p&&p.map(([,,x])=>{ const k=Object.keys(ACTS).find(q=>ACTS[q]===x); return k?{t:k}:{t:"move",dir:x}; }), r=flat&&simulate(adv0,flat,{});
    res.push({id:"norec",title:"Ganar sin recursión no cuenta",ok:!!r&&r.k==="win"&&r.rec===false,info:"sim:"+(r?r.k:"-")+" rec:"+(r&&r.rec)}); }
  /* con 2 estrellas en todo lo anterior de la parte alcanza para abrir cada grupo */
  PARTS.forEach(p=>{ let before=0; GROUPS.filter(g=>g.part===p.id).forEach(g=>{ const ok=g.need<=before*2; res.push({id:g.id,title:"Grupo "+g.title,ok,info:`pide ${g.need}, máx ${before*3}`}); before+=MISSIONS.filter(m=>m.grp===g.id).length; }); });
  /* Python: errores en español con línea, bucle infinito que explota, def después de la llamada y la 3.ª estrella por líneas */
  if(ED.kind==="python"){ const mp={rows:["R....E"],cls:4,tools:""}, run=c=>{ const r=parsePy(c); return r.ok?simulate(mp,r.prog):{k:"pyerr",ln:r.ln,msg:r.msg}; };
    const a=run("derecha"), b=run("while True:\n    x = 1"), c=run("ir()\ndef ir():\n    derecha()"), d=run("def ir(n):\n    for i in range(n):\n        derecha()\nir(5)"), e=run("if True\n    derecha()");
    res.push({id:"py",title:"Python: errores, bucles infinitos y parámetros",ok:a.k==="pyerr"&&a.ln===1&&b.k==="boom"&&c.k==="pyerr"&&/más arriba/.test(c.msg)&&d.k==="win"&&e.k==="pyerr"&&/«:»/.test(e.msg),info:`derecha → ${a.k} · while True → ${b.k} · llamada antes del def → ${c.k} · ir(5) → ${d.k} · if sin «:» → ${e.k}`}); }
  /* regla: en cada parte los chicos hacen menos o igual cantidad de niveles que el juego normal (la edición Python tiene sus propias partes) */
  if(ED.kind!=="python") PARTS.forEach(p=>{ const n=MISSIONS.filter(m=>m.part===p.id).length; res.push({id:"cant"+p.id,title:"Cantidad de niveles de la parte "+p.id,ok:n<=NORMAL_COUNT[p.id],info:`${n} niveles (juego normal: ${NORMAL_COUNT[p.id]})`}); });
  return res;
}
