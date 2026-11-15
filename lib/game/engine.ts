// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
import { PARTS, GROUPS, MISSIONS, CHALLENGES } from "./data";

export function timeStars(ch,sec){ return sec<=ch.t3?3:sec<=ch.t2?2:1; }
export function fmtTime(sec){ sec=Math.floor(sec); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }
export const DIRS={u:[-1,0],d:[1,0],l:[0,-1],r:[0,1]};
export const MAXSTEPS=400, MAXB=30;

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
export function* walk(list,test,prefix=[]){
  for(let i=0;i<list.length;i++){ const b=list[i], addr=prefix.concat(i);
    if(b.t==="move") yield {t:"move",addr,dir:b.dir};
    else if(ACTS[b.t]) yield {t:b.t,addr};
    else if(b.t==="if"){ const ok=test(b.c); yield {t:"if",addr,ok}; if(ok) yield* walk(b.body,test,addr); }
    else for(let k=0;k<b.n;k++){ yield {t:"loop",addr,k,n:b.n}; yield* walk(b.body,test,addr); } }
}
export function countBlocks(list){ return list.reduce((a,b)=>a+1+(b.body?countBlocks(b.body):0),0); }
export function hasRepeat(list){ return list.some(b=>b.t==="repeat"); }
export function hasIf(list){ return list.some(b=>b.t==="if"||(b.body&&hasIf(b.body))); }
/* opt y límites cuentan el bloque «al tocar» */
export function optFor(map,path){ return map.cls===2?map.max:map.need?null:(path?path.length+1:null); }
export function limitFor(map,opt){ return map.cls===2?map.max:map.cls===1&&opt!=null?opt+2:MAXB; }
export function starsFor(map,count,usedRep,opt,hint,wrong){
  let k=map.cls===2?(usedRep?3:2):(opt==null||count<=opt?3:2);
  if(wrong) k=Math.min(k,2); if(hint) k--; return Math.max(1,k);
}
/* grupos: cada parte tiene su cadena. El primero se abre al terminar las partes «after»;
   los demás al terminar el grupo anterior y juntar las estrellas pedidas (de esa parte) */
export function partDone(stars,p){ return MISSIONS.filter(m=>m.part===p).every(m=>stars[m.id]); }
export function partName(p){ return `Parte ${p} · ${PARTS.find(x=>x.id===p).title}`; }
export function groupState(stars){
  let prev=null;
  return GROUPS.map(g=>{
    if(prev&&prev.g.part!==g.part) prev=null;
    const ms=MISSIONS.filter(m=>m.grp===g.id), done=ms.filter(m=>stars[m.id]).length;
    const earned=MISSIONS.filter(m=>m.part===g.part).reduce((a,m)=>a+(stars[m.id]||0),0);
    let open, prevLeft=0, gate=null;
    if(!prev){ const miss=PARTS.find(p=>p.id===g.part).after.filter(p=>!partDone(stars,p)); open=!miss.length; if(!open) gate=miss.map(partName).join(" y "); }
    else { prevLeft=prev.ms.length-prev.done; open=prev.open&&prevLeft===0&&earned>=g.need; }
    return prev={g,ms,done,open,prevLeft,prevTitle:prev&&prev.g.title,gate,earned}; });
}
export function parseSol(s){ let i=0;
  function list(){ const out=[];
    while(i<s.length){ const ch=s[i];
      if(ch===" "){ i++; continue; }
      if(ch===")"){ i++; return out; }
      if(/\d/.test(ch)){ let num=""; while(/\d/.test(s[i])) num+=s[i++]; i++; out.push({t:"repeat",n:+num,body:list()}); }
      else if(ch==="?"){ const c=s[i+1]; i+=3; out.push({t:"if",c,body:list()}); }
      else { const a=Object.keys(ACTS).find(k=>ACTS[k]===ch); out.push(a?{t:a}:{t:"move",dir:ch}); i++; } }
    return out; }
  return list(); }
export function simulate(map,prog){ let S=startState(map), n=0;
  for(const ev of walk(prog,c=>cellColor(map,S)===c)){ if(++n>MAXSTEPS) return {k:"long"};
    if(ev.t==="move"){ const res=tryMove(map,S,ev.dir); if(res.k==="crash") return res; S=res.S; if(res.k==="win") return res; }
    else if(ACTS[ev.t]){ const res=tryAct(map,S,ACTS[ev.t]); if(res.k==="bad") return res; S=res.S; } }
  return !hasE(map)&&goalMet(map,S)?{k:"win",S}:{k:"end",S}; }
export function maxRun(list){ const s=[...walk(list,()=>false)].filter(e=>e.t!=="loop"&&e.t!=="if").map(e=>e.t==="move"?e.dir:ACTS[e.t]).join(""); return s?Math.max(...s.match(/(.)\1*/g).map(x=>x.length)):0; }
/* el mismo programa sin los si (todo lo de adentro siempre): en los niveles de Si tiene que fallar */
export function stripIf(list){ return list.flatMap(b=>b.t==="if"?stripIf(b.body):b.body?[{...b,body:stripIf(b.body)}]:[b]); }
export function selfTest(){
  const res=[...MISSIONS,...CHALLENGES.flatMap(c=>c.levels)].map(m=>{ const sol=parseSol(m.sol), sim=simulate(m,sol), path=shortest(m,startState(m)), cnt=countBlocks(sol)+1, used=hasRepeat(sol);
    const opt=optFor(m,path), lim=limitFor(m,opt), run=maxRun(sol), cond=m.tools.includes("i");
    /* todos los niveles terminan en la estrella: se gana al llegar con todo hecho */
    let ok=hasE(m)&&sim.k==="win"&&!!path&&cnt<=lim&&starsFor(m,cnt,used,opt,false,sim.S&&sim.S.wrong)===3;
    if(m.cls===1) ok=ok&&!used&&(m.need||(cnt===opt&&run<=3)); else ok=ok&&used;
    if(cond) ok=ok&&hasIf(sol)&&simulate(m,stripIf(sol)).k!=="win";
    return {id:m.id,title:m.title,ok,info:`sim:${sim.k} bfs:${path?path.length:"-"} bloques:${cnt}/${lim}${m.cls===1&&!m.need?" seguidos:"+run:""}${cond?" sin si: "+simulate(m,stripIf(sol)).k:""}`}; });
  /* con 2 estrellas en todo lo anterior de la parte alcanza para abrir cada grupo */
  PARTS.forEach(p=>{ let before=0; GROUPS.filter(g=>g.part===p.id).forEach(g=>{ const ok=g.need<=before*2; res.push({id:g.id,title:"Grupo "+g.title,ok,info:`pide ${g.need}, máx ${before*3}`}); before+=MISSIONS.filter(m=>m.grp===g.id).length; }); });
  return res;
}
