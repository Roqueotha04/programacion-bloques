// @ts-nocheck
/* Python del juego (edición ?python). No corre Python de verdad: es un subconjunto chico que se traduce a los mismos eventos que
   walk() de engine.ts (move, paint, dance, loop, if, call), así la simulación, las animaciones y selfTest son los de siempre.
   Qué entiende: def (con parámetros), llamadas, repetir(n): (el repetir de los bloques, tipo pseudocódigo; también for i in range(n) / range(a, b)), while, if / elif / else, variables (= += -=),
   números enteros, + - * // % /, comparaciones, and / or / not, True / False, pass y «...» (no hacen nada), global y comentarios (#).
   Las palabras de Python van en inglés y los comandos de GENI en español: arriba() abajo() izquierda() derecha() pintar() bailar().
   Preguntas (para if y while): en_estrella() celda_roja() celda_verde() pared_arriba() pared_abajo() pared_izquierda() pared_derecha().
   Los errores salen en español con el número de línea. Sin módulos ni DOM: lo usan engine.ts (simulate, selfTest) y ui.ts. */

export const PY_MOVES={arriba:"u",abajo:"d",izquierda:"l",derecha:"r"};
export const PY_ACTS={pintar:"paint",bailar:"dance",usar_pincel:"penon",guardar_pincel:"penoff"};
/* preguntas: devuelven la condición del sensor de engine.ts (sense) */
export const PY_SENSE={en_estrella:"e",celda_roja:"x",celda_verde:"v",pared_arriba:"wu",pared_abajo:"wd",pared_izquierda:"wl",pared_derecha:"wr"};
const KW=new Set(["def","repetir","for","in","while","if","elif","else","not","and","or","True","False","pass","global","return","range","None","break","continue","import","class","lambda"]);
const isCmd=n=>!!(PY_MOVES[n]||PY_ACTS[n]||PY_SENSE[n]);

class PyErr{ constructor(ln,msg){ this.ln=ln; this.msg=msg; } }
const err=(ln,msg)=>{ throw new PyErr(ln,msg); };

/* «¿Quisiste decir…?»: el nombre conocido más parecido (mayúsculas distintas o hasta 2 letras de diferencia) */
function dist(a,b){ const d=Array.from({length:a.length+1},(_,i)=>[i]); for(let j=1;j<=b.length;j++) d[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[a.length][b.length]; }
function sug(n,cands){ let best=null, bd=3; for(const c of cands){ const k=c.toLowerCase()===n.toLowerCase()?0:dist(n.toLowerCase(),c.toLowerCase()); if(k<bd&&c!==n){ bd=k; best=c; } }
  return best&&bd<=Math.max(1,Math.min(2,Math.floor(n.length/3)))?` ¿Quisiste decir «${best}»?`:""; }

/* ---------- lectura (líneas → árbol) ---------- */
function lex(s,ln){ const out=[]; let i=0;
  while(i<s.length){ const c=s[i];
    if(c===" "){ i++; continue; }
    if(/[A-Za-z_À-ſ]/.test(c)){ let j=i; while(j<s.length&&/[\wÀ-ſ]/.test(s[j])) j++; out.push({t:"id",v:s.slice(i,j)}); i=j; continue; }
    if(/\d/.test(c)){ let j=i; while(j<s.length&&/\d/.test(s[j])) j++;
      if(s[j]==="."||s[j]===",") { if(/\d/.test(s[j+1]||"")) err(ln,"en este juego los números son enteros (sin coma ni punto)"); }
      out.push({t:"num",v:+s.slice(i,j)}); i=j; continue; }
    if(s.startsWith("...",i)){ out.push({t:"op",v:"..."}); i+=3; continue; }
    const two=s.slice(i,i+2);
    if(["==","!=","<=",">=","+=","-=","//"].includes(two)){ out.push({t:"op",v:two}); i+=2; continue; }
    if("()+-*/%<>=:,".includes(c)){ out.push({t:"op",v:c}); i++; continue; }
    if(c==='"'||c==="'") err(ln,"en este juego no se usan textos entre comillas");
    if(c===";") err(ln,"en Python cada instrucción va en su propia línea (sin «;»)");
    err(ln,`no entiendo el símbolo «${c}»`); }
  return out; }

function exprP(toks,ln){ let p=0;
  const is=v=>!!toks[p]&&toks[p].t!=="num"&&toks[p].v===v, nx=()=>toks[p++];
  const or=()=>{ let a=and(); while(is("or")){ p++; a={k:"or",a,b:and()}; } return a; };
  const and=()=>{ let a=not(); while(is("and")){ p++; a={k:"and",a,b:not()}; } return a; };
  const not=()=>{ if(is("not")){ p++; return {k:"not",a:not()}; } return cmp(); };
  const cmp=()=>{ let a=add(); while(["==","!=","<",">","<=",">="].some(is)){ const op=nx().v; a={k:"bin",op,a,b:add()}; } return a; };
  const add=()=>{ let a=mul(); while(is("+")||is("-")){ const op=nx().v; a={k:"bin",op,a,b:mul()}; } return a; };
  const mul=()=>{ let a=un(); while(is("*")||is("//")||is("%")||is("/")){ const op=nx().v; a={k:"bin",op,a,b:un()}; } return a; };
  const un=()=>{ if(is("-")){ p++; return {k:"neg",a:un()}; } return atom(); };
  function atom(){ const t=nx(); if(!t) err(ln,"falta un valor al final de la línea");
    if(t.t==="num") return {k:"num",v:t.v};
    if(t.t==="op"&&t.v==="("){ const e=or(); if(!is(")")) err(ln,"falta cerrar el paréntesis «)»"); p++; return e; }
    if(t.t==="id"){
      if(t.v==="True"||t.v==="False") return {k:"num",v:t.v==="True"};
      if(KW.has(t.v)&&t.v!=="range") err(ln,t.v==="repetir"?"repetir va al principio de la línea: repetir(3):":`«${t.v}» no puede ir ahí`);
      if(is("(")){ p++; return {k:"callx",name:t.v,args:args()}; }
      return {k:"name",n:t.v}; }
    if(t.v==="=") err(ln,"para comparar se usa == (un solo = es para guardar un valor)");
    err(ln,`no entiendo «${t.v}» ahí`); }
  function args(){ const out=[]; if(is(")")){ p++; return out; }
    for(;;){ out.push(or()); if(is(",")){ p++; continue; } if(is(")")){ p++; return out; } err(ln,"falta cerrar el paréntesis «)»"); } }
  return {or,args,is,nx,peek:()=>toks[p],get p(){ return p; },set p(v){ p=v; }}; }

function stmt(L){ const {toks,ln}=L, P=exprP(toks,ln), t0=toks[0], w=t0.t==="id"?t0.v:null;
  const colon=()=>{ if(!P.is(":")) err(ln,"falta «:» al final de la línea"); P.p++; if(P.peek()) err(ln,"después de «:» no va nada más: seguí en la línea de abajo, con sangría"); };
  const end=()=>{ if(P.peek()) err(ln,P.peek().v===":"?"esta línea no lleva «:» al final":`sobra «${P.peek().v}» al final de la línea`); };
  const name=(t,what)=>{ if(!t||t.t!=="id"||KW.has(t.v)) err(ln,what); return t.v; };
  if(w==="def"){ P.p=1; const n=name(P.nx(),"después de def va el nombre de la función: def subir():");
    if(isCmd(n)) err(ln,`«${n}» ya es un comando de GENI: elegí otro nombre`);
    if(!P.is("(")) err(ln,`faltan los paréntesis: def ${n}():`); P.p++;
    const params=[]; if(P.is(")")) P.p++;
    else for(;;){ const q=name(P.nx(),"los parámetros son nombres: def avanzar(n):"); if(params.includes(q)) err(ln,`el parámetro «${q}» está repetido`); params.push(q);
      if(P.is(",")){ P.p++; continue; } if(P.is(")")){ P.p++; break; } err(ln,"falta cerrar el paréntesis «)»"); }
    colon(); return {k:"def",name:n,params,ln,block:true}; }
  if(w==="repetir"){ P.p=1; if(!P.is("(")) err(ln,"faltan los paréntesis con las veces: repetir(3):"); P.p++;
    const a=P.args(); if(a.length!==1) err(ln,"repetir lleva un número entre los paréntesis: repetir(3):");
    colon(); return {k:"for",v:null,args:a,ln,block:true}; }
  if(w==="for"){ P.p=1; const v=name(P.nx(),"se escribe así: for i in range(3):");
    if(!P.is("in")) err(ln,"falta «in»: for i in range(3):"); P.p++;
    if(!P.is("range")) err(ln,"en este juego el for usa range: for i in range(3):"); P.p++;
    if(!P.is("(")) err(ln,"faltan los paréntesis: range(3)"); P.p++;
    const a=P.args(); if(a.length<1||a.length>2) err(ln,"range lleva uno o dos números: range(3)");
    colon(); return {k:"for",v,args:a,ln,block:true}; }
  if(w==="while"||w==="if"||w==="elif"){ P.p=1; if(!P.peek()||P.is(":")) err(ln,`falta la pregunta: ${w} celda_roja():`); const cond=P.or(); colon(); return {k:w,cond,ln,block:true}; }
  if(w==="else"){ P.p=1; colon(); return {k:"else",ln,block:true}; }
  if(w==="pass"){ P.p=1; end(); return {k:"pass",ln}; }
  if(t0.v==="..."){ P.p=1; end(); return {k:"pass",ln}; } /* «...»: línea que no hace nada, para dejar una función vacía */
  if(w==="global"){ P.p=1; const names=[]; for(;;){ names.push(name(P.nx(),"después de global van nombres de variables")); if(P.is(",")){ P.p++; continue; } break; } end(); return {k:"global",names,ln}; }
  if(w==="return") err(ln,"en este juego no se usa return: la función termina sola al llegar al final");
  if(w==="break"||w==="continue") err(ln,`en este juego no se usa ${w}`);
  if(w==="print") err(ln,"en este juego no hay print: GENI se mueve con derecha(), arriba(), abajo() e izquierda()");
  if(w&&!KW.has(w)){ const t1=toks[1];
    if(t1&&t1.t==="op"&&["=","+=","-="].includes(t1.v)){ if(isCmd(w)) err(ln,`«${w}» es un comando de GENI: para usarlo escribí ${w}()`);
      P.p=2; if(!P.peek()) err(ln,`falta el valor después de «${t1.v}»`); const e=P.or(); end(); return {k:"set",n:w,op:t1.v,e,ln}; }
    if(t1&&t1.t==="op"&&t1.v==="("){ P.p=2; const a=P.args(); end(); return {k:"call",name:w,args:a,ln}; }
    if(t1&&t1.v==="==") err(ln,"para guardar un valor se usa un solo = (== es para comparar)");
    if(!t1) err(ln,isCmd(w)?`faltan los paréntesis: ${w}()`:`«${w}» sola no hace nada: si es una función, llamala con paréntesis: ${w}()`);
    const k=sug(w,["def","repetir","for","while","if","elif","else","pass"]); if(k) err(ln,"no entiendo esta línea."+k); }
  if(w&&KW.has(w)) err(ln,`«${w}» no se usa así en este juego`);
  err(ln,"no entiendo esta línea"); }

/* parsePy(código) → {ok:true, prog:{py:true, body}} o {ok:false, ln, msg}.
   holes:true (solo para dibujar los bloques): acepta los ___ sin completar; una línea que es solo ___ queda como {k:"hole"} */
export function parsePy(code,holes=false){
  try{
    const L=[];
    String(code).replace(/\r/g,"").split("\n").forEach((raw,i)=>{ const ln=i+1; let s=raw.replace(/\t/g,"    "); const h=s.indexOf("#"); if(h>=0) s=s.slice(0,h);
      if(!s.trim()) return;
      if(s.includes("___")&&!holes) err(ln,"completá lo que falta en el lugar de «___»");
      if(holes&&s.trim()==="___"){ L.push({ln,ind:s.length-s.trimStart().length,hole:true}); return; }
      s=s.trimEnd(); const ind=s.length-s.trimStart().length; L.push({ln,ind,toks:lex(s.trim(),ln)}); });
    let i=0;
    function block(ind,top){ const out=[]; let chain=null;
      while(i<L.length){ const l=L[i]; if(l.ind<ind) break;
        if(l.ind>ind) err(l.ln,top&&!out.length?"la primera línea va sin sangría, pegada al borde":"esta línea tiene sangría de más (o no coincide con las de arriba: usá 4 espacios por nivel)");
        const s=l.hole?{k:"hole",ln:l.ln}:stmt(l); i++;
        if(s.k==="def"&&!top) err(s.ln,"«def» va sin sangría, pegado al borde: las funciones se crean afuera de otras");
        if(s.block){ if(i>=L.length||L[i].ind<=ind) err(l.ln,"después de «:» va un bloque con sangría: dejá 4 espacios al principio de la línea de abajo"); s.body=block(L[i].ind,false); }
        if(s.k==="elif"||s.k==="else"){ if(!chain) err(s.ln,`«${s.k}» va justo después de un if, con la misma sangría`);
          if(s.k==="elif"){ const n={k:"if",cond:s.cond,body:s.body,orelse:null,ln:s.ln}; chain.orelse=[n]; chain=n; } else { chain.orelse=s.body; chain=null; }
          continue; }
        if(s.k==="if"){ s.orelse=null; chain=s; } else chain=null;
        out.push(s); }
      return out; }
    return {ok:true,prog:{py:true,body:block(0,true)}};
  }catch(e){ if(e instanceof PyErr) return {ok:false,ln:e.ln,msg:e.msg}; throw e; } }

/* ---------- ejecución (árbol → eventos) ---------- */
/* nombres locales de una función: parámetros, variables que se asignan adentro y variables del for (menos las global) */
function localNames(def){ const s=new Set(def.params), g=new Set();
  const v=list=>list.forEach(x=>{ if(x.k==="set") s.add(x.n); if(x.k==="for"&&x.v) s.add(x.v); if(x.k==="global") x.names.forEach(n=>g.add(n)); if(x.body) v(x.body); if(x.orelse) v(x.orelse); });
  v(def.body); g.forEach(n=>s.delete(n)); return s; }
function defsIn(list,out=new Set()){ list.forEach(x=>{ if(x.k==="def") out.add(x.name); if(x.body) defsIn(x.body,out); if(x.orelse) defsIn(x.orelse,out); }); return out; }

/* recorre el programa y emite eventos como walk(): {t:"move",dir} {t:"paint"} {t:"dance"} {t:"loop",k,n} (cada vuelta del for)
   {t:"if",ok} (cada pregunta de if y while) {t:"call",f} {t:"stmt"} (asignar, def, pass) y {t:"error",msg} al primer error.
   Todos llevan ln (la línea). test(cond) pregunta al sensor en el momento. Todo lo que puede no terminar (while, llamadas) emite
   un evento por vuelta, así la simulación lo corta con el tope de eventos (GENI explota) */
export function* pyWalk(prog,test){
  const glob=new Map(), funcs=new Map(), every=defsIn(prog.body);
  const E=(o)=>Object.assign({addr:[]},o);
  const num=(v,ln)=>{ if(typeof v==="boolean") return +v; if(typeof v!=="number") err(ln,"eso no es un número"); return v; };
  const truthy=v=>!!v;
  function get(n,fr,ln){
    if(fr&&fr.names.has(n)){ if(fr.loc.has(n)) return fr.loc.get(n); err(ln,`la variable «${n}» todavía no tiene valor: dale un valor antes de usarla`); }
    if(glob.has(n)) return glob.get(n);
    if(funcs.has(n)||isCmd(n)) err(ln,`«${n}» es una función: para usarla escribí ${n}()`);
    const known=[...glob.keys(),...(fr?fr.names:[])];
    err(ln,`la variable «${n}» no existe.${sug(n,known)||" Primero dale un valor, por ejemplo: "+n+" = 1"}`); }
  const setv=(n,v,fr)=>{ if(fr&&fr.names.has(n)) fr.loc.set(n,v); else glob.set(n,v); };
  function ev(e,fr,ln){
    switch(e.k){
      case "num": return e.v;
      case "name": return get(e.n,fr,ln);
      case "neg": return -num(ev(e.a,fr,ln),ln);
      case "not": return !truthy(ev(e.a,fr,ln));
      case "and": { const a=ev(e.a,fr,ln); return truthy(a)?ev(e.b,fr,ln):a; }
      case "or": { const a=ev(e.a,fr,ln); return truthy(a)?a:ev(e.b,fr,ln); }
      case "bin": { const a=num(ev(e.a,fr,ln),ln), b=num(ev(e.b,fr,ln),ln);
        switch(e.op){
          case "+": return a+b; case "-": return a-b; case "*": return a*b;
          case "/": if(b===0) err(ln,"no se puede dividir por cero"); return a/b;
          case "//": if(b===0) err(ln,"no se puede dividir por cero"); return Math.floor(a/b);
          case "%": if(b===0) err(ln,"no se puede dividir por cero"); return ((a%b)+b)%b;
          case "==": return a===b; case "!=": return a!==b; case "<": return a<b; case ">": return a>b; case "<=": return a<=b; case ">=": return a>=b; } }
      case "callx": { const n=e.name;
        if(PY_SENSE[n]){ if(e.args.length) err(ln,`${n}() va sin nada adentro de los paréntesis`); return test(PY_SENSE[n]); }
        if(PY_MOVES[n]||PY_ACTS[n]) err(ln,`${n}() es una orden: va sola en su línea`);
        if(funcs.has(n)) err(ln,`en este juego las funciones no devuelven valores: ${n}() va sola en su línea`);
        if(n==="range") err(ln,"range se usa en el for: for i in range(3):");
        err(ln,`«${n}» no es una pregunta que GENI conozca.${sug(n,Object.keys(PY_SENSE))}`); } } }
  const int=(v,ln)=>{ v=num(v,ln); if(!Number.isInteger(v)) err(ln,"repetir necesita un número entero (usá // para dividir)"); return v; };
  function* run(list,fr){ for(const s of list) yield* exec(s,fr); }
  function* exec(s,fr){ const ln=s.ln;
    switch(s.k){
      case "pass": case "global": yield E({t:"stmt",ln}); return;
      case "def": funcs.set(s.name,{...s,names:localNames(s)}); yield E({t:"stmt",ln}); return;
      case "set": { let v=ev(s.e,fr,ln); if(s.op!=="="){ const o=num(get(s.n,fr,ln),ln); v=s.op==="+="?o+num(v,ln):o-num(v,ln); }
        if(funcs.has(s.n)) err(ln,`«${s.n}» ya es el nombre de una función: usá otro nombre para la variable`);
        setv(s.n,v,fr); yield E({t:"stmt",ln}); return; }
      case "for": { const a=s.args.map(x=>int(ev(x,fr,ln),ln)), [from,to]=a.length===1?[0,a[0]]:a, n=Math.max(0,to-from);
        for(let k=0;k<n;k++){ if(s.v) setv(s.v,from+k,fr); yield E({t:"loop",ln,k,n}); yield* run(s.body,fr); }
        if(!n) yield E({t:"stmt",ln}); return; }
      case "while": for(;;){ const ok=truthy(ev(s.cond,fr,ln)); yield E({t:"if",ln,ok}); if(!ok) return; yield* run(s.body,fr); }
      case "if": { const ok=truthy(ev(s.cond,fr,ln)); yield E({t:"if",ln,ok}); if(ok) yield* run(s.body,fr); else if(s.orelse) yield* run(s.orelse,fr); return; }
      case "call": { const n=s.name;
        if(PY_MOVES[n]||PY_ACTS[n]){ if(s.args.length) err(ln,`${n}() va sin nada adentro de los paréntesis`);
          yield E(PY_MOVES[n]?{t:"move",dir:PY_MOVES[n],ln}:{t:PY_ACTS[n],ln}); return; }
        if(PY_SENSE[n]) err(ln,`${n}() es una pregunta: usala en un if o en un while`);
        const f=funcs.get(n);
        if(!f) err(ln,every.has(n)?`«${n}» todavía no existe: en Python el def tiene que estar más arriba que la llamada`:`«${n}» no existe.${sug(n,[...every,...Object.keys(PY_MOVES),...Object.keys(PY_ACTS)])}`);
        if(f.params.length!==s.args.length) err(ln,f.params.length?`${n} necesita ${f.params.length===1?"un valor":f.params.length+" valores"} entre los paréntesis: ${n}(${f.params.join(", ")})`:`${n}() va sin nada adentro de los paréntesis`);
        const vals=s.args.map(a=>ev(a,fr,ln)); yield E({t:"call",ln,f:n});
        const loc=new Map(); f.params.forEach((p,i)=>loc.set(p,vals[i]));
        yield* run(f.body,{loc,names:f.names}); return; } } }
  try{ yield* run(prog.body,null); }
  catch(e){ if(e instanceof PyErr) yield E({t:"error",ln:e.ln,msg:e.msg}); else throw e; } }

/* líneas de código: sin contar las vacías ni los comentarios */
export function pyLines(code){ return String(code).split("\n").filter(l=>{ const h=l.indexOf("#"); return (h>=0?l.slice(0,h):l).trim(); }).length; }

/* lo que pide el nivel (req) para la 2.ª estrella. Devuelve la primera que falta, o null si están todas:
   def: una función propia (además de main) que se llama · def2: una función que llama a otra · for (repetir) · while · if
   var: una variable que se guarda y se usa · var2: una variable que cambia (se asigna 2 veces o con += / -=)
   param: una función con parámetro que lo usa y se llama con un valor */
export const PY_REQ_TIP={def:"Creá una función propia (además de main) y llamala",def2:"Hacé que una función llame a otra función tuya",
  var:"Guardá el número en una variable y usala",var2:"Hacé que la variable cambie: pasos = pasos + 1",param:"Usá una función con parámetro: def avanzar(n):",
  for:"Usá repetir(…): para repetir",while:"Usá while para repetir hasta llegar",if:"Usá if para decidir"};
export function pyMissing(prog,req){ if(!req||!req.length) return null;
  const defs=[], calls=[], sets=new Map(), reads=new Set(), has={for:false,while:false,if:false};
  const ex=e=>{ if(!e) return; if(e.k==="name") reads.add(e.n); ["a","b"].forEach(k=>ex(e[k])); (e.args||[]).forEach(ex); };
  const callsIn=list=>{ const o=[]; const v=l=>l.forEach(x=>{ if(x.k==="call") o.push(x); if(x.body) v(x.body); if(x.orelse) v(x.orelse); }); v(list); return o; };
  const readsIn=list=>{ const o=new Set(); const e=x=>{ if(!x) return; if(x.k==="name") o.add(x.n); ["a","b"].forEach(k=>e(x[k])); (x.args||[]).forEach(e); };
    const v=l=>l.forEach(x=>{ e(x.e); e(x.cond); (x.args||[]).forEach(e); if(x.body) v(x.body); if(x.orelse) v(x.orelse); }); v(list); return o; };
  const v=(list,loop)=>list.forEach(x=>{
    if(x.k==="def") defs.push(x); if(x.k==="call") calls.push(x); if(x.k in has) has[x.k]=true;
    if(x.k==="set"){ const c=sets.get(x.n)||0; sets.set(x.n,c+(x.op!=="="||loop?2:1)); }
    ex(x.e); ex(x.cond); (x.args||[]).forEach(ex);
    if(x.body) v(x.body,loop||x.k==="for"||x.k==="while"); if(x.orelse) v(x.orelse,loop); });
  v(prog.body,false);
  const user=new Set(defs.map(d=>d.name).filter(n=>n!=="main")), called=new Set(calls.map(c=>c.name));
  const ok={
    def:()=>[...user].some(n=>called.has(n)),
    def2:()=>defs.some(d=>d.name!=="main"&&called.has(d.name)&&callsIn(d.body).some(c=>user.has(c.name)&&c.name!==d.name)),
    var:()=>[...sets.keys()].some(n=>reads.has(n)),
    var2:()=>[...sets].some(([n,c])=>c>=2&&reads.has(n)),
    param:()=>defs.some(d=>d.params.length&&d.params.some(p=>readsIn(d.body).has(p))&&calls.some(c=>c.name===d.name&&c.args.length)),
    for:()=>has.for, while:()=>has.while, if:()=>has.if};
  return req.find(r=>!ok[r]())||null; }

/* ---------- de Python a texto de bloque (el espejo al revés, debajo del código) ---------- */
const PREC={or:1,and:2,not:3,"==":4,"!=":4,"<":4,">":4,"<=":4,">=":4,"+":5,"-":5,"*":6,"/":6,"//":6,"%":6};
/* la expresión como se escribió (largo, pasos + 1, n * 2…) */
export function pyExprText(e,outer=0){ const wrap=(p,t)=>p<outer?`(${t})`:t;
  switch(e.k){
    case "num": return typeof e.v==="boolean"?(e.v?"True":"False"):String(e.v);
    case "name": return e.n;
    case "neg": return "-"+pyExprText(e.a,7);
    case "not": return wrap(3,"not "+pyExprText(e.a,3));
    case "and": case "or": return wrap(PREC[e.k],`${pyExprText(e.a,PREC[e.k])} ${e.k} ${pyExprText(e.b,PREC[e.k]+1)}`);
    case "bin": return wrap(PREC[e.op],`${pyExprText(e.a,PREC[e.op])} ${e.op} ${pyExprText(e.b,PREC[e.op]+1)}`);
    case "callx": return `${e.name}(${e.args.map(a=>pyExprText(a)).join(", ")})`; }
  return "?"; }
/* la pregunta de un si o un mientras, en castellano cuando es un sensor: «no en la estrella», «la celda es roja», «pared →» */
const SENSE_TXT={en_estrella:"en la estrella",celda_roja:"la celda es roja",celda_verde:"la celda es verde",pared_arriba:"pared ↑",pared_abajo:"pared ↓",pared_izquierda:"pared ←",pared_derecha:"pared →"};
export function pyCondText(e){
  if(e.k==="not") return "no "+pyCondText(e.a);
  if(e.k==="callx"&&SENSE_TXT[e.name]&&!e.args.length) return SENSE_TXT[e.name];
  if(e.k==="and"||e.k==="or") return `${pyCondText(e.a)} ${e.k==="and"?"y":"o"} ${pyCondText(e.b)}`;
  return pyExprText(e); }

/* ---------- de bloques a Python (el espejo debajo de los bloques) ---------- */
const MOVE_PY={u:"arriba",d:"abajo",l:"izquierda",r:"derecha"}, ACT_PY={paint:"pintar",dance:"bailar",penon:"usar_pincel",penoff:"guardar_pincel"};
const SENSE_PY=Object.fromEntries(Object.entries(PY_SENSE).map(([k,v])=>[v,k]));
/* nombre libre del alumno → nombre válido de Python (sin tildes ni espacios); si no sirve, funcion_a */
export function pyName(name,f){ let s=String(name||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim().replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,"");
  if(!s||/^\d/.test(s)||KW.has(s)||isCmd(s)||s==="main") s="funcion_"+String(f).toLowerCase(); return s; }
/* notes: comentarios simples para aprender a leerlo (solo en los primeros niveles, map.notes) */
export function blocksToPy(prog,funcs,names,notes){ const out=[], note=t=>{ if(notes) out.push(t); };
  const lines=(list,ind,d)=>{ if(!list.length){ out.push(ind+(notes?"...  # no hay nada aquí":"...")); return; }
    for(const b of list){
      if(b.t==="move") out.push(ind+MOVE_PY[b.dir]+"()");
      else if(ACT_PY[b.t]) out.push(ind+ACT_PY[b.t]+"()");
      else if(b.t==="call") out.push(ind+pyName(names&&names[b.f],b.f)+"()");
      else if(b.t==="repeat"){ out.push(`${ind}repetir(${b.n}):`); lines(b.body,ind+"    ",d+1); }
      else if(b.t==="if"){ const c=b.c[0]==="n"?"not "+SENSE_PY["w"+b.c[1]]:SENSE_PY[b.c]; out.push(`${ind}if ${c}():`); lines(b.body,ind+"    ",d); }
      else if(b.t==="else"){ out.push(ind+"else:"); lines(b.body,ind+"    ",d); } } };
  Object.keys(funcs||{}).sort().forEach(f=>{ note("# definimos nuestra función"); out.push(`def ${pyName(names&&names[f],f)}():`); lines(funcs[f],"    ",0); out.push(""); });
  note("# Programa principal"); out.push("def main():"); lines(prog,"    ",0);
  out.push(""); note("# lo que se ejecuta"); out.push("main()"); return out.join("\n"); }

/* colores para mostrar código (el texto se escapa; los nombres de Python no tienen caracteres de HTML) */
const PY_KW=new Set(["def","repetir","for","in","while","if","elif","else","not","and","or","True","False","pass","global"]);
const escH=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function pyHTML(code){ return String(code).split("\n").map(line=>{ const h=line.indexOf("#"), c=h>=0?line.slice(0,h):line, cm=h>=0?line.slice(h):"";
  /* pk palabra de Python, pb comando de GENI, pf función propia (nombre seguido de «(»), pn número, pc comentario */
  return c.replace(/[A-Za-z_][\w]*|\d+|[^A-Za-z_\d]+/g,(t,o)=>/^\d/.test(t)?`<span class="pn">${t}</span>`:/^[A-Za-z_]/.test(t)?(PY_KW.has(t)?`<span class="pk">${t}</span>`:isCmd(t)||t==="range"?`<span class="pb">${t}</span>`:/^\s*\(/.test(c.slice(o+t.length))?`<span class="pf">${t}</span>`:t):escH(t))+(cm?`<span class="pc">${escH(cm)}</span>`:""); }).join("\n"); }
