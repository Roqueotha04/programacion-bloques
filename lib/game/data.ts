// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
/* partes = cards del menú. after: partes que hay que superar (niveles + desafío extra) para abrirla.
   code: código que da el profe para abrirla (sin importar mayúsculas, espacios ni tildes) */
export const PARTS=[
 {id:1,title:"Secuencia",sub:"un bloque después del otro",c:"#3B82F0",l:"#DCE9FF",after:[]},
 {id:2,title:"Pintar",sub:"usar el pincel y guardarlo",c:"#A35BD6",l:"#F0E1FF",after:[1]},
 {id:3,title:"Repetir",sub:"el bloque que repite",c:"#FF9A2E",l:"#FFE2C2",after:[1],code:"genIArepetir"},
 {id:4,title:"Si",sub:"el robot mira la celda y decide",c:"#14B8A6",l:"#CCF5EF",after:[2,3]},
 /* ===== Parte 5 Bailar (inicio) ===== */
 {id:5,title:"Bailar",sub:"pintar, bailar y repetir",c:"#EC4899",l:"#FCE0EF",after:[2]},
 /* ===== Parte 5 Bailar (fin) ===== */
 /* ===== Parte 6 Funciones (inicio) ===== */
 {id:6,title:"Funciones",sub:"poné nombre a un grupo de pasos",c:"#5B6CF0",l:"#E3E6FF",after:[2]}
 /* ===== Parte 6 Funciones (fin) ===== */
];
/* cls: reglas (1 = meta de bloques, 2 = máximo de bloques).
   tools: bloques extra (r repetir, n pincel, p pintar de un toque, b bailar, i si).
   strict: pintar o bailar en la celda equivocada es error. need: estrellas de la parte para abrir el grupo */
export const GROUPS=[
 {id:"A",part:1,cls:1,tools:"",title:"Primeros pasos",sub:"sin baterías",need:0,c:"#3B82F0",l:"#DCE9FF"},
 {id:"B",part:1,cls:1,tools:"",title:"Con batería",sub:"primero la batería, después la estrella",need:8,c:"#1EC48C",l:"#D2F6E8"},
 {id:"C",part:1,cls:1,tools:"",title:"Dos baterías",sub:"juntá las dos",need:16,c:"#8B6CF0",l:"#E6DFFF"},
 {id:"G",part:2,cls:1,tools:"n",title:"Llegar pintando",sub:"el pincel pinta todo por donde pasa",need:0,c:"#A35BD6",l:"#F0E1FF"},
 {id:"H",part:2,cls:1,tools:"n",title:"Solo las rojas",sub:"guardá el pincel en las blancas",need:6,c:"#FF4F7A",l:"#FFDCE5"},
 {id:"D",part:3,cls:2,tools:"r",title:"Repetir",sub:"pocos bloques, muchos pasos",need:0,c:"#FF9A2E",l:"#FFE2C2"},
 {id:"E",part:3,cls:2,tools:"r",title:"Repetir con batería",sub:"repetir y juntar",need:8,c:"#FF6FB5",l:"#FFDCEC"},
 {id:"F",part:3,cls:2,tools:"r",title:"Repetir con 2 baterías",sub:"el gran desafío",need:14,c:"#E64C55",l:"#FFD9DB"},
 {id:"J",part:4,cls:2,tools:"rpi",strict:true,title:"Si es roja",sub:"pintá solo las rojas",need:0,c:"#14B8A6",l:"#CCF5EF"},
 {id:"K",part:4,cls:2,tools:"rpbi",strict:true,title:"Rojo y verde",sub:"rojas: pintar · verdes: bailar",need:6,c:"#0EA5E9",l:"#D3F0FC"},
 /* ===== Parte 5 Bailar (inicio) ===== */
 {id:"L",part:5,cls:1,tools:"b",strict:true,title:"Bailar",sub:"bailá en la celda verde",need:0,c:"#EC4899",l:"#FCE0EF"},
 {id:"M",part:5,cls:1,tools:"pb",strict:true,title:"Pintar y bailar",sub:"rojas: pintar · verdes: bailar",need:2,c:"#D946EF",l:"#F8DDFB"},
 {id:"N",part:5,cls:2,tools:"rpb",strict:true,title:"Repetir simple",sub:"repetí el baile",need:5,c:"#6366F1",l:"#E0E1FF"},
 /* ===== Parte 5 Bailar (fin) ===== */
 /* ===== Parte 6 Funciones (inicio) ===== */
 {id:"O",part:6,cls:3,tools:"rf",title:"Primeras funciones",sub:"un grupo de pasos con nombre",need:0,c:"#5B6CF0",l:"#E3E6FF"},
 {id:"P",part:6,cls:3,tools:"rpbf",strict:true,title:"Funciones y colores",sub:"repetir, pintar y bailar con funciones",need:6,c:"#8B6CF0",l:"#E6DFFF"},
 {id:"Q",part:6,cls:3,tools:"rpbf",strict:true,title:"Dos funciones",sub:"una función puede llamar a otra",need:12,c:"#3E6FA8",l:"#D7E6F8"}
 /* ===== Parte 6 Funciones (fin) ===== */
];
/* ===== Parte 7 Mundos (inicio) ===== */
/* el mapa cambia: cada nivel trae worlds (rows = worlds[0], mismo tamaño, robot y estrella) y el programa tiene que ganar en TODOS.
   reveal: se muestran las miniaturas de los mundos antes de correr. conds: condiciones del bloque si. pool+show: se sortean show mundos del pool */
PARTS.push({id:7,title:"Mundos",sub:"el mapa cambia y tu programa decide",c:"#6366F1",l:"#E0E1FF",after:[2,3]});
GROUPS.push(
 {id:"S",part:7,cls:2,tools:"rpbie",strict:true,title:"El mapa cambia",sub:"las celdas cambian de lugar",need:0,c:"#6366F1",l:"#E0E1FF"},
 {id:"T",part:7,cls:2,tools:"rie",strict:true,title:"Paredes",sub:"el robot siente las paredes",need:6,c:"#0EA5E9",l:"#D3F0FC"},
 {id:"U",part:7,cls:2,tools:"rpbie",strict:true,title:"Mundos sorpresa",sub:"cada vez salen mundos distintos",need:12,c:"#EC4899",l:"#FFDCEC"});
/* ===== Parte 7 Mundos (fin) ===== */
export const MISSIONS=[
 {id:"a1",grp:"A",title:"Primer paseo",rows:[".....","..#..","R....","..E..","....."],sol:"r r d"},
 {id:"a2",grp:"A",title:"La esquina",rows:[".....","#....",".##E.",".##..","R...."],sol:"r r r u u"},
 {id:"a3",grp:"A",title:"Esquivar las cajas",rows:["#...#","..#..","R.#.E","..#..","#...#"],sol:"u r u r r d d r"},
 {id:"a4",grp:"A",title:"Zigzag",rows:["R.#..","#..#.",".#..#","..#..","...#E"],sol:"r d r d r d r d"},
 {id:"b1",grp:"B",title:"Primero la batería",rows:["..B..","##.##","R...E",".#.#.","....."],sol:"r r u u d d r r"},
 {id:"b2",grp:"B",title:"La batería de arriba",rows:[".B.#.",".#...","R..#E","..#..","#...."],sol:"u u r r d r r d"},
 {id:"b3",grp:"B",title:"La batería del medio",rows:["E.#..",".#..#","..B..","#..#.","R.#.."],sol:"r u u r l l u u"},
 {id:"b4",grp:"B",title:"El laberinto",rows:[".#...","B..#E","#.#..","..#.#","R...."],sol:"u r u u l r r u r r d"},
 {id:"c1",grp:"C",title:"Abajo y arriba",rows:["..#.B",".#...","R..#E","...#.","B#..."],sol:"d d u u r r u r u r d d"},
 {id:"c2",grp:"C",title:"El gran recorrido",rows:["B.#...","..#.#.","R...#E","..#...","#...#B"],sol:"u u d r d r r d r r d u u"},
 {id:"g1",grp:"G",title:"Primer pincelazo",need:3,rows:["..#..","R...E","..#.."],sol:"n r r r r"},
 {id:"g2",grp:"G",title:"Caminito pintado",need:5,rows:[".#...","R..#.","#...E"],sol:"n r r d r r"},
 {id:"g3",grp:"G",title:"Pintar y juntar",need:6,rows:["..B..","R.#.E","....."],sol:"n u r r r d r"},
 {id:"h1",grp:"H",title:"Tres rojas",rows:["..#..","RXXXE","..#.."],sol:"r n r r r"},
 {id:"h2",grp:"H",title:"Rojas y blancas",rows:["#.#.#..","RXX.XXE","#...#.."],sol:"r n r f r r n r r"},
 {id:"h3",grp:"H",title:"Bajar pintando",rows:["R.#..","X.#..","X..XE","#.#.."],sol:"d n d f r r r n r"},
 {id:"h4",grp:"H",title:"Rojas y batería",rows:[".B#..","X..#E","R.#X.","....."],sol:"u n f u r d d d r r u n f r u"},
 {id:"h5",grp:"H",title:"La gran mancha",rows:["..#...","XX..#.","..#XX.","R..#.X","#....X","...#.E"],sol:"u u n r f r r d n r f d r n d d"},
 {id:"d1",grp:"D",title:"El pasillo largo",max:3,rows:["..#...#","#######","R.....E","#######","#...#.."],sol:"6(r)"},
 {id:"d2",grp:"D",title:"La vuelta grande",max:5,rows:["R......",".#####.",".#...#.",".#.#.#.",".#...#.",".#####.","......E"],sol:"6(r) 6(d)"},
 {id:"d3",grp:"D",title:"La escalera",max:4,rows:["...#E","..#..",".#..#","#..#.","R.#.."],sol:"4(r u)"},
 {id:"d4",grp:"D",title:"Pasillo y escalera",max:6,rows:[".....#E","....#..","####..#","R....#."],sol:"3(r) 3(r u)"},
 {id:"e1",grp:"E",title:"Ida y vuelta",max:7,rows:["R.....B",".######",".#.....",".#.##..","E#....."],sol:"6(r) 6(l) 4(d)"},
 {id:"e2",grp:"E",title:"Escalera a la batería",max:6,rows:["##.#...","#..B..E","##..#.#","#..#..#","R.#...."],sol:"3(r u) 3(r)"},
 {id:"e3",grp:"E",title:"La montaña",max:7,rows:["R.####E","#..#...","##.....","###B.##"],sol:"3(r d) 3(r u)"},
 {id:"f1",grp:"F",title:"Dos puntas",max:7,rows:["B..R..B","######.","######.","#.....E"],sol:"3(l) 6(r) 3(d)"},
 {id:"f2",grp:"F",title:"Repetir adentro",max:6,rows:["R..B...","#.#.###","#...#..","##....B","#..###.","#..#...","#.....E"],sol:"2(3(r) 3(d))"},
 {id:"j1",grp:"J",title:"Solo las rojas",max:5,rows:["#.##.#.#","RX.XX.XE","#.#..#.#"],sol:"7(r ?x(p))"},
 {id:"j2",grp:"J",title:"Escalera roja",max:7,rows:["####XE","###X.#","##..##","#X.###","R.####"],sol:"4(r u ?x(p)) r"},
 {id:"j3",grp:"J",title:"Bajar y doblar",max:9,rows:["R#....","X#.#..","X#...#",".#.#..","X#....","..XX.E"],sol:"5(d ?x(p)) 5(r ?x(p))"},
 {id:"k1",grp:"K",title:"A bailar",max:5,rows:["##.#.##","R.VV.VE","#.##..#"],sol:"6(r ?v(b))"},
 {id:"k2",grp:"K",title:"Rojo y verde",max:7,rows:["#.#..#.#","RXV.XXVE","#..#.#.."],sol:"7(r ?x(p) ?v(b))"},
 {id:"k3",grp:"K",title:"Escalera de colores",max:8,rows:["R.####","#X.###","##V.##","###..#","####X.","#####E"],sol:"5(r d ?x(p) ?v(b))"},
 /* ===== Parte 5 Bailar (inicio) ===== */
 {id:"l1",grp:"L",title:"El primer baile",rows:["#####","#...#","R.V.E","#...#","#####"],sol:"r r b r r"},
 {id:"m1",grp:"M",title:"Pintar y bailar",rows:["#####","RXV.E","#####"],sol:"r p r b r r"},
 {id:"m2",grp:"M",title:"Dos y dos",rows:["RXV..","###VX","####E"],sol:"r p r b r d b r p d"},
 {id:"n1",grp:"N",title:"Pasillo de baile",max:5,rows:["#######","R....VE","#######"],sol:"5(r) b r"},
 {id:"n2",grp:"N",title:"Baile cada dos",max:6,rows:["######","R.V.VE","######"],sol:"2(r r b) r"},
 {id:"n3",grp:"N",title:"Pintar y bailar",max:7,rows:["######","RXVXVE","######"],sol:"2(r p r b) r"},
 /* ===== Parte 5 Bailar (fin) ===== */
 /* ===== Parte 6 Funciones (inicio) =====
    cls 3: máximo de bloques (el «al tocar» cuenta) y hay que usar una función. sol: «A=(r r u); A A» define y llama.
    pre: cuerpos ya armados; lock: funciones que no se pueden editar; fns: cuántas funciones hay (1 por defecto) */
 {id:"o1",grp:"O",title:"Llamá a la función",max:7,pre:{A:"r r u"},lock:["A"],rows:["######E","####...","##...##","R..####"],sol:"A=(r r u); A A A"},
 {id:"o2",grp:"O",title:"Falta un bloque",max:7,pre:{A:"r r"},rows:["R..####","##...##","####...","######E"],sol:"A=(r r d); A A A"},
 {id:"o3",grp:"O",title:"Tu primera función",max:10,rows:["#########","########E","####.....","##...####","##.######","R..######"],sol:"A=(r r u); A u A r r A"},
 {id:"p1",grp:"P",title:"Función en repetir",max:9,rows:["########.","######..E","####.#.##","##.....##","##.######","R..######"],sol:"A=(r r u); 2(A u A d)"},
 {id:"p2",grp:"P",title:"La función que pinta",max:10,rows:["##..X..XE","R.X######"],sol:"A=(r r p); A u A r A r"},
 {id:"p3",grp:"P",title:"La función que baila",max:10,rows:["######V.R","EV..V..##"],sol:"A=(l l b); A d A l A l"},
 {id:"q1",grp:"Q",title:"Arreglá la función",max:11,pre:{A:"d p"},rows:["R####",".####","X.###","#.###","#X..#","###.#","###XE"],sol:"A=(d d p); A r A r r A r"},
 {id:"q2",grp:"Q",title:"Una llama a otra",max:10,fns:2,rows:["RX####","#.X.X#","####.X","#####E"],sol:"A=(r p); B=(A d A); B r B d"},
 {id:"q3",grp:"Q",title:"Gran final",max:12,rows:["####.#VE","##..X.X#","R.X#####"],sol:"A=(r r p); 2(A u) d A u b r"}
 /* ===== Parte 6 Funciones (fin) ===== */
].map(m=>{ const g=GROUPS.find(x=>x.id===m.grp); return Object.assign(m,{cls:g.cls,part:g.part,tools:g.tools,strict:!!g.strict}); });
/* ===== Parte 7 Mundos (inicio) ===== */
const MUNDOS=[
 {id:"s1",grp:"S",title:"Las rojas cambian",max:5,reveal:true,conds:["x"],sol:"7(r ?x(p))",
  worlds:[
    ["########","########","RX.XX..E","########",".##.##.#"],
    ["########","########","R.X..XXE","########","##.##.##"]]},
 {id:"s2",grp:"S",title:"Rojas y verdes",max:7,reveal:true,conds:["x","v"],sol:"7(r ?x(p) ?v(b))",
  worlds:[
    ["########","########","RXV.XV.E","########",".##.##.#"],
    ["########","########","R.XVV.XE","########","##.##.##"],
    ["........","########","RVX.X.VE","########","#.##.##."]]},
 {id:"s3",grp:"S",title:"Escalera sorpresa",max:8,reveal:false,conds:["x","v"],sol:"5(r d ?x(p) ?v(b))",
  worlds:[
    ["R.####","#X.###","##V.#.","###X.#",".###..","##.##E"],
    ["R.####","#V.##.",".#X.##","###..#","##.#X.",".##.#E"],
    ["R.#...","#..#.#","##X.##","..#V.#","#.##V.","#.###E"]]},
 {id:"t1",grp:"T",title:"Pasillo con codos",max:6,reveal:true,conds:["wr","nr","wd","nd"],sol:"10(?wr(d) !(r))",
  worlds:[
    ["R.######","#...##.#","###...##","#####..E"],
    ["R...####","###.####",".##....#","######.E"],
    ["R####...",".....###","####....","....###E"]]},
 {id:"t2",grp:"T",title:"Gravedad",max:6,reveal:true,conds:["wr","nr","wd","nd"],sol:"10(?wd(r) !(d))",
  worlds:[
    ["R######",".##.##.","...####","##.....",".#####E"],
    ["R..####","##.##.#",".#.####","##.....","######E"],
    ["R#.....","..##.##","#..#.##",".#..###","#.#...E"]]},
 {id:"t3",grp:"T",title:"Arriba o abajo",max:9,reveal:false,conds:["wr","nr","wd","nd","wu","nu"],sol:"11(?wr(?wd(u) !(d)) !(r))",
  worlds:[
    ["###...##","#...#..#","R.####.E","########",".##.##.#"],
    ["########","##.##.##","R#####.E",".......#","##..####"],
    ["###.....","...#####","R#...##E","#.##....","#.######"]]},
 {id:"u1",grp:"U",title:"Mundo sorpresa",max:10,reveal:false,conds:["x","v","wr","nr","wd","nd"],show:3,sol:"10(?wr(d) !(r) ?x(p) ?v(b))",
  worlds:[
    ["R.######","#V#.##.#","#X######","#.V.XX.E"],
    ["R.######","#.######","#VXV..##","#####XXE"],
    ["R#......",".######.","V.XV.XX#","######.E"],
    ["RV######","#.VXX...","#######X","#######E"],
    ["RV######","#..#####",".#.XXVX#","######.E"]]},
 {id:"u2",grp:"U",title:"La gran sorpresa",max:11,reveal:false,conds:["x","wr","nr","wd","nd","wu","nu"],show:3,sol:"11(?wr(?wd(u) !(d)) !(r) ?x(p))",
  worlds:[
    ["########","########","R#.X..XE",".X.#..##","###.##.#"],
    ["########","##.##.##","R.#.###E","#..###X.","##...XX#"],
    [".###.XX#","#..X.#..","R.#####E","##.....#","#.##.##."],
    ["########","..XX.X..","R###..#E","########",".##.##.#"],
    ["########","########","RX..XX.E","....####","#####.##"]]}
].map(m=>{ const g=GROUPS.find(x=>x.id===m.grp); if(m.show) m.pool=m.worlds; return Object.assign(m,{rows:m.worlds[0],cls:g.cls,part:g.part,tools:g.tools,strict:!!g.strict}); });
MISSIONS.push(...MUNDOS);
/* ===== Parte 7 Mundos (fin) ===== */
function numberMissions(){ PARTS.forEach(p=>MISSIONS.filter(m=>m.part===p.id).forEach((m,i)=>m.num=i+1)); } /* numeración dentro de cada parte */
numberMissions();
/* desafíos extra: 3 niveles seguidos con cronómetro (no hay límite de tiempo, solo se mide).
   Estrellas por el tiempo total: hasta t3 segundos = 3, hasta t2 = 2, más = 1.
   El reloj se pausa entre nivel y nivel. Se abre al terminar todos los niveles de la parte. */
export const CHALLENGES=[
 {id:"x1",part:1,cls:1,tools:"",title:"Desafío de secuencia",t3:150,t2:240,levels:[
   {title:"Calentando motores",rows:["R..#..","##.#.#","#.....","#.##..","#...#E"],sol:"r r d d r r d r d"},
   {title:"La batería escondida",rows:["...#.E",".#.#..",".#B.#.","R..#..","##...#","......"],sol:"r r u d d r r u r u u u"},
   {title:"Dos baterías",rows:["..#..B",".B..#.","#.#...","R..#.#","#.#...","...#.E"],sol:"r u u r r u r r d d l d d r d"}]},
 {id:"x4",part:2,cls:1,tools:"n",title:"Desafío de pintar",t3:150,t2:240,levels:[
   {title:"Rojas en fila",rows:["R.XX.","#.#X.","XX...","E...."],sol:"r r n r d f d l l n l d"},
   {title:"Rojas y estrella",rows:["..X#E","XX#..","R..XX","##..."],sol:"u n r f u r n f l d d r r n r f u u"},
   {title:"La gran pintada",rows:["..#.B","XXX..","R.#.#","#....","EXX.."],sol:"u n r r f r u r d l d d d l n l l"}]},
 {id:"x2",part:3,cls:2,tools:"r",title:"Desafío de repetir",t3:150,t2:240,levels:[
   {title:"Escalones dobles",max:5,rows:["R..####","##...##","####...","######E"],sol:"3(r r d)"},
   {title:"Subir y bajar",max:7,rows:["####B.###","###....##","##..##..#","#..####..","R.######E"],sol:"4(r u) 4(r d)"},
   {title:"La gran escalera",max:6,rows:["R..#...","##B#.#.","#....##","#.##.#.","#..#B..","#.###..","...#..E"],sol:"3(2(r) 2(d))"}]},
 {id:"x5",part:4,cls:2,tools:"rpbi",strict:true,title:"Desafío del si",t3:150,t2:240,levels:[
   {title:"Pasillo de colores",max:7,rows:["#.#..#.#.#","RXV.XX.VXE","#..#.#..#."],sol:"9(r ?x(p) ?v(b))"},
   {title:"Escalera de colores",max:8,rows:["####E","###X.","##X.#","#V.##","R.###"],sol:"4(r u ?x(p) ?v(b))"},
   {title:"Dos pasillos",max:10,rows:["RX.VX####","####.####","####.V.XX","########.","########E"],sol:"2(4(r ?x(p) ?v(b)) 2(d))"}]},
 /* ===== Parte 5 Bailar (inicio) ===== */
 {id:"x6",part:5,cls:2,tools:"rpb",strict:true,title:"Desafío de bailar",t3:150,t2:240,levels:[
   {title:"Baile en fila",max:6,rows:["#########","R.V.V.VE.","#########"],sol:"3(r r b) r"},
   {title:"Escalera de baile",max:9,rows:["####VE","###X.#","##V.##","#X.###","R.####"],sol:"2(r u p r u b) r"},
   {title:"Dos pasillos",max:10,rows:["RXVXV","####V","####V","####E"],sol:"2(r p r b) 2(d b) d"}]},
 /* ===== Parte 5 Bailar (fin) ===== */
 /* ===== Parte 6 Funciones (inicio) ===== */
 {id:"x7",part:6,cls:3,tools:"rpbf",strict:true,title:"Desafío de funciones",t3:150,t2:240,levels:[
   {title:"Pintar con función",max:10,rows:["EX..X..##","######X.R"],sol:"A=(l l p); A u A l A l"},
   {title:"Bailar con función",max:10,rows:["R.V######","##..V..VE"],sol:"A=(r r b); A d A r A r"},
   {title:"Colores con función",max:12,rows:["####.#XE","##..V.V#","R.V#####"],sol:"A=(r r b); 2(A u) d A u p r"}]}
 /* ===== Parte 6 Funciones (fin) ===== */
];
/* ===== Parte 7 Mundos (inicio) ===== */
CHALLENGES.push({id:"x8",part:7,cls:2,tools:"rpbie",strict:true,title:"Desafío de mundos",t3:150,t2:240,levels:[
   {title:"Pasillo cambiante",max:5,reveal:true,conds:["x"],sol:"8(r ?x(p))",
    worlds:[
    [".........","#########","RXX..X.XE","#########","#.##.##.#"],
    ["#########","#########","R..XX..XE","#########",".##.##.##"],
    ["#########","#########","RX.X.X..E","#########","##.##.##."]]},
   {title:"Verdes en la bajada",max:8,reveal:true,conds:["wd","nd","v"],sol:"10(?wd(r) !(d) ?v(b))",
    worlds:[
    ["R.V####","##.##.#",".#.####","##V....","######E"],
    ["R###...","..V.###","###.###","..#V.##","#.##..E"],
    ["R######","V##.##.","..#####","#...V.#",".####.E"]]},
   {title:"Subir o bajar",max:9,reveal:false,conds:["wr","nr","wd","nd","wu","nu"],sol:"11(?wr(?nd(d) !(u)) !(r))",
    worlds:[
    ["###.....","...#.###","R#..##.E","#.#....#","#.#####."],
    ["########","###.####","R.###..E","#.....##",".##..#.#"],
    ["########","#####...","R#....#E","...#####","#####.##"]]}]});
CHALLENGES.filter(c=>c.id==="x8").forEach(c=>c.levels.forEach(m=>m.rows=m.worlds[0]));
/* ===== Parte 7 Mundos (fin) ===== */
CHALLENGES.forEach(ch=>ch.levels.forEach((m,i)=>Object.assign(m,{id:ch.id+"-"+(i+1),num:i+1,cls:ch.cls,part:ch.part,tools:ch.tools,strict:!!ch.strict,ch:ch.id})));
/* edición chicos (?chicos, 6 a 8 años): solo estos niveles (Secuencia 3,4,5,6,7,9 y Pintar 4 a 8),
   las partes sin niveles desaparecen y los desafíos dan extra segundos más para cada estrella.
   need: estrellas que pide cada grupo en esta edición (2 por nivel anterior de la parte) */
export const KIDS={missions:["a3","a4","b1","b2","b3","c1","h1","h2","h3","h4","h5","l1","m1","m2","n1","n2","n3"],need:{B:4,C:10,H:0,M:2,N:6},extra:30};
export function applyKids(){
  const keep=(arr,f)=>arr.splice(0,arr.length,...arr.filter(f));
  keep(MISSIONS,m=>KIDS.missions.includes(m.id));
  keep(GROUPS,g=>MISSIONS.some(m=>m.grp===g.id));
  keep(PARTS,p=>GROUPS.some(g=>g.part===p.id));
  keep(CHALLENGES,c=>PARTS.some(p=>p.id===c.part));
  GROUPS.forEach(g=>{ if(g.id in KIDS.need) g.need=KIDS.need[g.id]; });
  CHALLENGES.forEach(c=>{ c.t3+=KIDS.extra; c.t2+=KIDS.extra; });
  numberMissions();
}
