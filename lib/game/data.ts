// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
/* partes = cards del menú. after: partes que hay que superar (niveles + desafío extra) para abrirla.
   code: código que da el profe para abrirla (sin importar mayúsculas, espacios ni tildes) */
export const PARTS=[
 {id:1,title:"Secuencia",sub:"un bloque después del otro",c:"#3B82F0",l:"#DCE9FF",after:[]},
 {id:2,title:"Pintar",sub:"usar el pincel y guardarlo",c:"#A35BD6",l:"#F0E1FF",after:[1]},
 {id:3,title:"Bailar",sub:"pintar, bailar y juntar baterías",c:"#EC4899",l:"#FCE0EF",after:[2]},
 {id:4,title:"Repetir",sub:"el bloque que repite",c:"#FF9A2E",l:"#FFE2C2",after:[3],code:"genIArepetir"},
 {id:5,title:"Funciones",sub:"poné nombre a un grupo de pasos",c:"#5B6CF0",l:"#E3E6FF",after:[2],code:"funcionesGENia"},
//  /* la parte 6 (Mundos) se agrega más abajo; la 7 (Si) va última */
//  {id:7,title:"Si",sub:"el robot mira la celda y decide",c:"#14B8A6",l:"#CCF5EF",after:[2,4]}
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
 {id:"D",part:4,cls:2,tools:"r",title:"Repetir",sub:"pocos bloques, muchos pasos",need:0,c:"#FF9A2E",l:"#FFE2C2"},
 {id:"E",part:4,cls:2,tools:"r",title:"Repetir con batería",sub:"repetir y juntar",need:8,c:"#FF6FB5",l:"#FFDCEC"},
 {id:"F",part:4,cls:2,tools:"r",title:"Repetir con 2 baterías",sub:"el gran desafío",need:12,c:"#E64C55",l:"#FFD9DB"},
//  {id:"J",part:7,cls:2,tools:"rpi",strict:true,title:"Si es roja",sub:"pintá solo las rojas",need:0,c:"#14B8A6",l:"#CCF5EF"},
//  {id:"K",part:7,cls:2,tools:"rpbi",strict:true,title:"Rojo y verde",sub:"rojas: pintar · verdes: bailar",need:6,c:"#0EA5E9",l:"#D3F0FC"},
 /* ===== Bailar (inicio) ===== */
 {id:"L",part:3,cls:1,tools:"b",strict:true,title:"Bailar",sub:"bailá en la celda verde",need:0,c:"#EC4899",l:"#FCE0EF"},
 {id:"M",part:3,cls:1,tools:"pb",strict:true,title:"Pintar y bailar",sub:"rojas: pintar · verdes: bailar",need:3,c:"#D946EF",l:"#F8DDFB"},
 {id:"W",part:3,cls:1,tools:"pb",strict:true,title:"Con batería",sub:"pintá, bailá y juntá la batería",need:8,c:"#F472B6",l:"#FFE0EE"},
 {id:"R",part:4,cls:2,tools:"rpb",strict:true,title:"Repetir, pintar y bailar",sub:"repetí el baile y la pintura",need:12,c:"#6366F1",l:"#E0E1FF"},
 /* ===== Bailar (fin) ===== */
 /* ===== Funciones (inicio) ===== */
 {id:"O",part:5,cls:3,tools:"rf",title:"Primeras funciones",sub:"un grupo de pasos con nombre",need:0,c:"#5B6CF0",l:"#E3E6FF"},
 {id:"P",part:5,cls:3,tools:"rpbf",strict:true,title:"Funciones y colores",sub:"pintar y bailar con funciones",need:6,c:"#8B6CF0",l:"#E6DFFF"},
 {id:"Q",part:5,cls:3,tools:"rpbf",strict:true,title:"Armá tu función",sub:"armala desde cero",need:12,c:"#3E6FA8",l:"#D7E6F8"}
 /* ===== Funciones (fin) ===== */
];
/* ===== Repetir avanzado (inicio) ===== */
/* PARTE 4.5: repetir avanzado, opcional para los que terminan Repetir rápido. Se abre al superar la parte 4, no cuenta para abrir
   otras partes y no tiene desafío. No está en la edición chicos. */
PARTS.push({id:4.5,title:"Repetir avanzado",sub:"repetir con colores, baterías y repetir adentro",c:"#F97316",l:"#FFE4CC",after:[4],extra:true});
GROUPS.push(
 {id:"I",part:4.5,cls:2,tools:"rpb",strict:true,title:"Repetir con todo",sub:"pintar, bailar y juntar adentro del repetir",need:0,c:"#F97316",l:"#FFE4CC"},
 {id:"X",part:4.5,cls:2,tools:"rpb",strict:true,title:"Mapas grandes",sub:"un repetir adentro de otro",need:8,c:"#DC2626",l:"#FFD9D9"});
/* ===== Repetir avanzado (fin) ===== */
/* ===== Funciones avanzadas (inicio) ===== */
/* PARTE 5.5: funciones avanzadas (recursión). Se abre al superar la parte 5, no cuenta para abrir otras partes. No está en la edición chicos.
   (Mundos y Si, antes partes 6 y 7, están comentadas de momento) */
PARTS.push({id:5.5,title:"Funciones avanzadas",sub:"una función que se llama a sí misma",c:"#7C3AED",l:"#EDE4FF",after:[5],extra:true});
GROUPS.push(
 {id:"Y",part:5.5,cls:3,adv:true,tools:"pf",strict:true,title:"Se llama a sí misma",sub:"la función se repite hasta llegar a la estrella",need:0,c:"#7C3AED",l:"#EDE4FF"},
 {id:"Z",part:5.5,cls:3,adv:true,tools:"rpbf",strict:true,title:"Recursión con todo",sub:"repetir, pintar y bailar",need:6,c:"#C026D3",l:"#FAE1FD"},
 {id:"N",part:5.5,cls:3,adv:true,tools:"rpbf",strict:true,title:"Para pensar",sub:"un arranque, dos carriles y una serpiente",need:10,c:"#0EA5E9",l:"#D3F0FC"});
/* ===== Funciones avanzadas (fin) ===== */
// /* ===== Mundos (inicio) ===== */
// /* el mapa cambia: cada nivel trae worlds (rows = worlds[0], mismo tamaño, robot y estrella) y el programa tiene que ganar en TODOS.
//    reveal: se muestran las miniaturas de los mundos antes de correr. conds: condiciones del bloque si. pool+show: se sortean show mundos del pool */
// PARTS.push({id:6,title:"Mundos",sub:"el mapa cambia y tu programa decide",c:"#6366F1",l:"#E0E1FF",after:[2,4]});
// GROUPS.push(
//  {id:"S",part:6,cls:2,tools:"rpbie",strict:true,title:"El mapa cambia",sub:"las celdas cambian de lugar",need:0,c:"#6366F1",l:"#E0E1FF"},
//  {id:"T",part:6,cls:2,tools:"rie",strict:true,title:"Paredes",sub:"el robot siente las paredes",need:6,c:"#0EA5E9",l:"#D3F0FC"},
//  {id:"U",part:6,cls:2,tools:"rpbie",strict:true,title:"Mundos sorpresa",sub:"cada vez salen mundos distintos",need:12,c:"#EC4899",l:"#FFDCEC"});
// /* ===== Mundos (fin) ===== */
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
 {id:"e1",grp:"E",tools:"rp",strict:true,title:"Ida y vuelta pintando",max:8,rows:["R.....X",".######",".#.....",".#.##..","E#....."],sol:"6(r) p 6(l) 4(d)"},
 {id:"e2",grp:"E",title:"Escalera a la batería",max:6,rows:["##.#...","#..B..E","##..#.#","#..#..#","R.#...."],sol:"3(r u) 3(r)"},
 {id:"f1",grp:"F",tools:"rb",strict:true,title:"Dos puntas y baile",max:8,rows:["B..R..V","######.","######.","#.....E"],sol:"3(l) 6(r) b 3(d)"},
//  {id:"j1",grp:"J",title:"Solo las rojas",max:5,rows:["#.##.#.#","RX.XX.XE","#.#..#.#"],sol:"7(r ?x(p))"},
//  {id:"j2",grp:"J",title:"Escalera roja",max:7,rows:["####XE","###X.#","##..##","#X.###","R.####"],sol:"4(r u ?x(p)) r"},
//  {id:"j3",grp:"J",title:"Bajar y doblar",max:9,rows:["R#....","X#.#..","X#...#",".#.#..","X#....","..XX.E"],sol:"5(d ?x(p)) 5(r ?x(p))"},
//  {id:"k1",grp:"K",title:"A bailar",max:5,rows:["##.#.##","R.VV.VE","#.##..#"],sol:"6(r ?v(b))"},
//  {id:"k2",grp:"K",title:"Rojo y verde",max:7,rows:["#.#..#.#","RXV.XXVE","#..#.#.."],sol:"7(r ?x(p) ?v(b))"},
//  {id:"k3",grp:"K",title:"Escalera de colores",max:8,rows:["R.####","#X.###","##V.##","###..#","####X.","#####E"],sol:"5(r d ?x(p) ?v(b))"},
 /* ===== Bailar (inicio) ===== */
 {id:"l1",grp:"L",title:"El primer baile",rows:["#####","#...#","R.V.E","#...#","#####"],sol:"r r b r r"},
 {id:"l2",grp:"L",title:"Dos bailes",rows:["#.###","R.V.#","#.#V.","###.E"],sol:"r r b r d b d r"},
 {id:"m1",grp:"M",title:"Pintar y bailar",rows:["#####","RXV.E","#####"],sol:"r p r b r r"},
 {id:"m2",grp:"M",title:"Roja y verde",rows:["R.X.#","#.#V.","#...E"],sol:"r r p r d b d r"},
 {id:"m3",grp:"M",title:"Dos y dos",rows:["R.X#...","#.V.#.#","#.#X.V.","...#.#E"],sol:"r r p d b r d p r r b r d"},
 {id:"m4",grp:"M",title:"La pista de baile",rows:["R.X#.","#.V.#","..#XE","#V..."],sol:"r r p d b l d d b r r u p r"},
 {id:"w1",grp:"W",title:"Baile con batería",rows:["R.#..","#.V.B","#.#.#","..#.E"],sol:"r d r b r r l d d r"},
 {id:"w2",grp:"W",title:"La fiesta",rows:["R.X#.","#.#V.","#B.XE","#.#V."],sol:"r r p l d d r r u b d d b u p r"},
 {id:"r4",grp:"R",title:"Escalera de baile",max:9,rows:["####.E","###.V#","##.X##","#.V###","RX####"],sol:"2(r p u r b u) r"},
 /* ===== Bailar (fin) ===== */
 /* ===== Funciones (inicio) =====
    cls 3: máximo de bloques (el «al tocar» cuenta) y hay que usar una función. sol: «A=(r r u); A A» define y llama.
    pre: cuerpos ya armados; lock: funciones que no se pueden editar; fns: cuántas funciones hay (1 por defecto) */
 {id:"o1",grp:"O",title:"Llamá a la función",max:7,pre:{A:"r r u"},lock:["A"],rows:["######E","####...","##...##","R..####"],sol:"A=(r r u); A A A"},
 {id:"o2",grp:"O",title:"Falta un bloque",max:7,pre:{A:"r r"},rows:["R..####","##...##","####...","######E"],sol:"A=(r r d); A A A"},
 {id:"o4",grp:"O",title:"Tu primera función",max:7,rows:["######","#####E","###...","R...##"],sol:"A=(r r u); r A A"},
 {id:"p2",grp:"P",title:"La función que pinta",max:10,rows:["##..X..XE","R.X######"],sol:"A=(r r p); A u A r A r"},
 {id:"p3",grp:"P",title:"La función que baila",max:10,rows:["######V.R","EV..V..##"],sol:"A=(l l b); A d A l A l"},
 {id:"q1",grp:"P",title:"Arreglá la función",max:11,pre:{A:"d p"},rows:["R####",".####","X.###","#.###","#X..#","###.#","###XE"],sol:"A=(d d p); A r A r r A r"},
 {id:"o3",grp:"Q",title:"Función y pasos",max:10,rows:["#########","########E","####.....","##...####","##.######","R..######"],sol:"A=(r r u); A u A r r A"},
 {id:"p1",grp:"Q",title:"Función en repetir",max:9,rows:["########.","######..E","####.#.##","##.....##","##.######","R..######"],sol:"A=(r r u); 2(A u A d)"},
// q2 y q3 sacados de momento (Funciones quedó en 8 niveles)
// {id:"q2",grp:"Q",title:"Una llama a otra",max:10,fns:2,rows:["RX####","#.X.X#","####.X","#####E"],sol:"A=(r p); B=(A d A); B r B d"},
// {id:"q3",grp:"Q",title:"Gran final",max:12,rows:["####.#VE","##..X.X#","R.X#####"],sol:"A=(r r p); 2(A u) d A u b r"},
 /* ===== Funciones (fin) ===== */
 /* ===== Repetir avanzado (inicio) ===== */
 {id:"ra1",grp:"I",title:"Pasillo de colores",max:7,rows:["########","RXVXVXVE","########"],sol:"3(r p r b) r"},
 {id:"ra2",grp:"I",title:"Escalera bailarina",max:7,rows:["####E","###V.","##V.#","#V.##","R.###"],sol:"3(r u b) r u"},
 {id:"ra3",grp:"I",title:"Torres de baterías",max:9,rows:["##B#B#B#","##.#.#.#","R......E"],sol:"3(2(r) 2(u) 2(d)) r"},
 {id:"ra4",grp:"I",title:"Montaña de colores",max:10,rows:["###X.###","##X.V.##","#X.##V.#","R.####VE"],sol:"3(r u p) 3(r d b) r"},
 {id:"ra5",grp:"X",title:"Escalones de baile",max:8,rows:["R..V######","###.######","###...V###","######.###","######...V","#########.","#########E"],sol:"3(3(r) b 2(d))"},
 {id:"ra6",grp:"X",title:"Repetir adentro",max:6,rows:["R..B...","#.#.###","#...#..","##....B","#..###.","#..#...","#.....E"],sol:"2(3(r) 3(d))"},
 {id:"ra7",grp:"X",title:"El gran recorrido",max:9,rows:["R.B.#####","###.#####","###V.B.##","######.##","######V.E"],sol:"2(3(r) 2(d) b) 2(r)"},
 /* ===== Repetir avanzado (fin) ===== */
 /* ===== Funciones avanzadas (inicio) =====
    adv: hay que ganar con una función que se llama a sí misma (la recursión termina al llegar a la estrella). El alumno crea las
    funciones desde cero (sin pre). goal: bloques de la meta (la 2.ª estrella), max = goal + 2.
    rep: el nivel pide usar repetir para la 2.ª estrella. Estrellas (hasta 3, como todos): 1 llegó con recursión, +1 dentro de la meta
    de bloques (y con repetir si el nivel lo pide), +1 por el camino más corto */
 {id:"v1",grp:"Y",title:"El eco",goal:5,max:7,rows:["###########","R.........E","###########"],sol:"A=(r r A); A"},
 {id:"v2",grp:"Y",title:"La escalera sin fin",goal:5,max:7,rows:["R.#####","#..####","##..###","###..##","####..#","#####.E"],sol:"A=(r d A); A"},
 {id:"v3",grp:"Y",title:"El collar rojo",goal:6,max:8,rows:["###########","RX.X.X.X.XE","###########"],sol:"A=(r p r A); A"},
 {id:"v4",grp:"Z",title:"Escalera de fiesta",goal:6,max:8,rows:["RV#####","#.V####","##.V###","###.V##","####.V#","#####.E"],sol:"A=(r b d A); A"},
 {id:"v5",grp:"Z",title:"La ola",goal:7,max:9,rep:true,rows:["R...#########","###X...######","######X...###","#########X..E"],sol:"A=(3(r) d p A); A"},
 {id:"v6",grp:"Z",title:"Gran final recursivo",goal:9,max:11,rep:true,fns:2,rows:["RXX#####","##VXX###","####VXX#","######VE"],sol:"A=(r p); B=(2(A) d b B); B"},
 /* arranque irregular y después la recursión; dos carriles (hay que descubrir el ciclo); serpiente: repetir adentro de la recursión */
 {id:"v7",grp:"N",title:"Primero el arranque",goal:10,max:12,rows:["R..########","##.########","##..X######","####..X####","######..X##","########..E"],sol:"r r d A; A=(d r r p A)"},
 {id:"v8",grp:"N",title:"Dos carriles",goal:12,max:14,rows:["RX...X...XE","...V...V..."],sol:"r A; A=(p r r d b r r u A)"},
 {id:"v9",grp:"N",title:"La serpiente",goal:13,max:15,rep:true,rows:["RXX","##.","XX.",".##",".XX","##.","EX."],sol:"C=(2(r p) 2(d) 2(l p) 2(d) C); C"}
 /* ===== Funciones avanzadas (fin) ===== */
].map(m=>{ const g=GROUPS.find(x=>x.id===m.grp); return Object.assign(m,{cls:g.cls,part:g.part,tools:m.tools??g.tools,strict:m.strict??!!g.strict,adv:!!g.adv}); });
// /* ===== Mundos (inicio) ===== */
// const MUNDOS=[
//  {id:"s1",grp:"S",title:"Las rojas cambian",max:5,reveal:true,conds:["x"],sol:"7(r ?x(p))",
//   worlds:[
//     ["########","########","RX.XX..E","########",".##.##.#"],
//     ["########","########","R.X..XXE","########","##.##.##"]]},
//  {id:"s2",grp:"S",title:"Rojas y verdes",max:7,reveal:true,conds:["x","v"],sol:"7(r ?x(p) ?v(b))",
//   worlds:[
//     ["########","########","RXV.XV.E","########",".##.##.#"],
//     ["########","########","R.XVV.XE","########","##.##.##"],
//     ["........","########","RVX.X.VE","########","#.##.##."]]},
//  {id:"s3",grp:"S",title:"Escalera sorpresa",max:8,reveal:false,conds:["x","v"],sol:"5(r d ?x(p) ?v(b))",
//   worlds:[
//     ["R.####","#X.###","##V.#.","###X.#",".###..","##.##E"],
//     ["R.####","#V.##.",".#X.##","###..#","##.#X.",".##.#E"],
//     ["R.#...","#..#.#","##X.##","..#V.#","#.##V.","#.###E"]]},
//  {id:"t1",grp:"T",title:"Pasillo con codos",max:6,reveal:true,conds:["wr","nr","wd","nd"],sol:"10(?wr(d) !(r))",
//   worlds:[
//     ["R.######","#...##.#","###...##","#####..E"],
//     ["R...####","###.####",".##....#","######.E"],
//     ["R####...",".....###","####....","....###E"]]},
//  {id:"t2",grp:"T",title:"Gravedad",max:6,reveal:true,conds:["wr","nr","wd","nd"],sol:"10(?wd(r) !(d))",
//   worlds:[
//     ["R######",".##.##.","...####","##.....",".#####E"],
//     ["R..####","##.##.#",".#.####","##.....","######E"],
//     ["R#.....","..##.##","#..#.##",".#..###","#.#...E"]]},
//  {id:"t3",grp:"T",title:"Arriba o abajo",max:9,reveal:false,conds:["wr","nr","wd","nd","wu","nu"],sol:"11(?wr(?wd(u) !(d)) !(r))",
//   worlds:[
//     ["###...##","#...#..#","R.####.E","########",".##.##.#"],
//     ["########","##.##.##","R#####.E",".......#","##..####"],
//     ["###.....","...#####","R#...##E","#.##....","#.######"]]},
//  {id:"u1",grp:"U",title:"Mundo sorpresa",max:10,reveal:false,conds:["x","v","wr","nr","wd","nd"],show:3,sol:"10(?wr(d) !(r) ?x(p) ?v(b))",
//   worlds:[
//     ["R.######","#V#.##.#","#X######","#.V.XX.E"],
//     ["R.######","#.######","#VXV..##","#####XXE"],
//     ["R#......",".######.","V.XV.XX#","######.E"],
//     ["RV######","#.VXX...","#######X","#######E"],
//     ["RV######","#..#####",".#.XXVX#","######.E"]]},
//  {id:"u2",grp:"U",title:"La gran sorpresa",max:11,reveal:false,conds:["x","wr","nr","wd","nd","wu","nu"],show:3,sol:"11(?wr(?wd(u) !(d)) !(r) ?x(p))",
//   worlds:[
//     ["########","########","R#.X..XE",".X.#..##","###.##.#"],
//     ["########","##.##.##","R.#.###E","#..###X.","##...XX#"],
//     [".###.XX#","#..X.#..","R.#####E","##.....#","#.##.##."],
//     ["########","..XX.X..","R###..#E","########",".##.##.#"],
//     ["########","########","RX..XX.E","....####","#####.##"]]}
// ].map(m=>{ const g=GROUPS.find(x=>x.id===m.grp); if(m.show) m.pool=m.worlds; return Object.assign(m,{rows:m.worlds[0],cls:g.cls,part:g.part,tools:g.tools,strict:!!g.strict}); });
// MISSIONS.push(...MUNDOS);
// /* ===== Mundos (fin) ===== */
/* orden: por número de parte (Secuencia, Pintar, Bailar, Repetir, Funciones, Mundos, Si); el sort es estable */
const byPart=(a,b)=>a.part-b.part;
PARTS.sort((a,b)=>a.id-b.id); GROUPS.sort(byPart); MISSIONS.sort(byPart);
function numberMissions(){ PARTS.forEach(p=>MISSIONS.filter(m=>m.part===p.id).forEach((m,i)=>m.num=i+1)); } /* numeración dentro de cada parte */
numberMissions();
export const NORMAL_COUNT={}; PARTS.forEach(p=>NORMAL_COUNT[p.id]=MISSIONS.filter(m=>m.part===p.id).length); /* niveles por parte del juego normal */
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
 {id:"x2",part:4,cls:2,tools:"rpb",strict:true,title:"Desafío de repetir",t3:150,t2:240,levels:[
   {title:"La gran escalera",max:6,rows:["R..#...","##B#.#.","#....##","#.##.#.","#..#B..","#.###..","...#..E"],sol:"3(2(r) 2(d))"},
   {title:"La montaña bailarina",max:8,rows:["R.####E","#..#...","##.....","###V.##"],sol:"3(r d) b 3(r u)"},
   {title:"Dos pasillos",max:10,rows:["RXVXV","####V","####V","####E"],sol:"2(r p r b) 2(d b) d"}]},
//  {id:"x5",part:7,cls:2,tools:"rpbi",strict:true,title:"Desafío del si",t3:150,t2:240,levels:[
//    {title:"Pasillo de colores",max:7,rows:["#.#..#.#.#","RXV.XX.VXE","#..#.#..#."],sol:"9(r ?x(p) ?v(b))"},
//    {title:"Escalera de colores",max:8,rows:["####E","###X.","##X.#","#V.##","R.###"],sol:"4(r u ?x(p) ?v(b))"},
//    {title:"Dos pasillos",max:10,rows:["RX.VX####","####.####","####.V.XX","########.","########E"],sol:"2(4(r ?x(p) ?v(b)) 2(d))"}]},
 /* ===== Bailar (inicio) ===== */
 {id:"x6",part:3,cls:1,tools:"pb",strict:true,title:"Desafío de bailar",t3:150,t2:240,levels:[
   {title:"Zigzag de baile",rows:["R.V.#.","#.#.V.","#..#.E"],sol:"r r b r d r b d r"},
   {title:"Batería y baile",rows:["R.X.#","#.#V.","#B..E"],sol:"r d d u u r p r d b d r"},
   {title:"La gran fiesta",rows:["R.#B..","#X#.#V","#V..X.","#.#.#E"],sol:"r d p d b r r u u d d r p r u b d d"}]},
 /* ===== Bailar (fin) ===== */
 /* ===== Funciones (inicio) ===== */
 {id:"x7",part:5,cls:3,tools:"rpbf",strict:true,title:"Desafío de funciones",t3:150,t2:240,levels:[
   {title:"Pintar con función",max:10,rows:["EX..X..##","######X.R"],sol:"A=(l l p); A u A l A l"},
   {title:"Bailar con función",max:10,rows:["R.V######","##..V..VE"],sol:"A=(r r b); A d A r A r"},
   {title:"Colores con función",max:12,rows:["####.#XE","##..V.V#","R.V#####"],sol:"A=(r r b); 2(A u) d A u p r"}]}
 /* ===== Funciones (fin) ===== */
];
// /* ===== Mundos (inicio) ===== */
// CHALLENGES.push({id:"x8",part:6,cls:2,tools:"rpbie",strict:true,title:"Desafío de mundos",t3:150,t2:240,levels:[
//    {title:"Pasillo cambiante",max:5,reveal:true,conds:["x"],sol:"8(r ?x(p))",
//     worlds:[
//     [".........","#########","RXX..X.XE","#########","#.##.##.#"],
//     ["#########","#########","R..XX..XE","#########",".##.##.##"],
//     ["#########","#########","RX.X.X..E","#########","##.##.##."]]},
//    {title:"Verdes en la bajada",max:8,reveal:true,conds:["wd","nd","v"],sol:"10(?wd(r) !(d) ?v(b))",
//     worlds:[
//     ["R.V####","##.##.#",".#.####","##V....","######E"],
//     ["R###...","..V.###","###.###","..#V.##","#.##..E"],
//     ["R######","V##.##.","..#####","#...V.#",".####.E"]]},
//    {title:"Subir o bajar",max:9,reveal:false,conds:["wr","nr","wd","nd","wu","nu"],sol:"11(?wr(?nd(d) !(u)) !(r))",
//     worlds:[
//     ["###.....","...#.###","R#..##.E","#.#....#","#.#####."],
//     ["########","###.####","R.###..E","#.....##",".##..#.#"],
//     ["########","#####...","R#....#E","...#####","#####.##"]]}]});
// CHALLENGES.filter(c=>c.id==="x8").forEach(c=>c.levels.forEach(m=>m.rows=m.worlds[0]));
// /* ===== Mundos (fin) ===== */
CHALLENGES.sort(byPart);
CHALLENGES.forEach(ch=>ch.levels.forEach((m,i)=>Object.assign(m,{id:ch.id+"-"+(i+1),num:i+1,cls:ch.cls,part:ch.part,tools:ch.tools,strict:!!ch.strict,ch:ch.id})));
/* edición chicos (?chicos, 6 a 8 años): solo estos niveles (Secuencia 3,4,5,6,7,9, Pintar 4 a 8, Bailar menos el más largo, y de
   Repetir los 4 primeros, «Dos puntas» no, el 9 sí, más los de repetir con baile y pintura), las partes sin niveles desaparecen y los desafíos
   dan extra segundos más para cada estrella. need: estrellas que pide cada grupo en esta edición (2 por nivel anterior de la parte).
   EXTRA: niveles que solo existen en esta edición (f2, r2 y r5), van justo después del nivel `after`.
   REGLA: en cada parte los chicos tienen menos o igual cantidad de niveles que el juego normal (lo controla selfTest con NORMAL_COUNT) */
/* códigos de clase (botón «Código» del menú): marcan como superadas, con 3 estrellas, todas las partes de `parts` (niveles y desafío extra).
   Las estrellas cuentan para comprar en el taller. unlock: partes cuyo código del profe se da por ingresado (Repetir: así se hace Bailar y Repetir de corrido).
   Los códigos de cada parte (PARTS[].code: genIArepetir, funcionesGENia) también se aceptan ahí. Se ignoran las partes que no existen en la edición */
export const CLASS_CODES=[
  {code:"nivel1-clase2",parts:[1,2],unlock:[4]},
  {code:"nivel2-clase2",parts:[1,2,3],unlock:[4]},
  {code:"nivel3-clase2",parts:[1,2,4],unlock:[4]}
];
/* «Repetir adentro» (f2) y «Dos pasillos» (r5) salieron del juego normal (Repetir quedó en 8 niveles; r5 pasó al desafío) pero siguen en chicos */
export const KIDS_EXTRA=[
  {after:"f1",m:{id:"f2",grp:"F",title:"Repetir adentro",max:6,rows:["R..B...","#.#.###","#...#..","##....B","#..###.","#..#...","#.....E"],sol:"2(3(r) 3(d))"}},
  {after:"f2",m:{id:"r2",grp:"R",title:"Baile cada dos",max:6,rows:["##########","R.V.V.V.VE","##########"],sol:"4(r r b) r"}},
  {after:"r4",m:{id:"r5",grp:"R",title:"Dos pasillos",max:10,rows:["RXVXV","####V","####V","####E"],sol:"2(r p r b) 2(d b) d"}}
];
/* desafíos propios de esta edición: reemplazan al del mismo id (el de Repetir sigue como antes, sin pintar ni bailar) */
export const KIDS_CHALLENGES=[
 {id:"x2",part:4,cls:2,tools:"r",title:"Desafío de repetir",t3:150,t2:240,levels:[
   {title:"Escalones dobles",max:5,rows:["R..####","##...##","####...","######E"],sol:"3(r r d)"},
   {title:"Subir y bajar",max:7,rows:["####B.###","###....##","##..##..#","#..####..","R.######E"],sol:"4(r u) 4(r d)"},
   {title:"La gran escalera",max:6,rows:["R..#...","##B#.#.","#....##","#.##.#.","#..#B..","#.###..","...#..E"],sol:"3(2(r) 2(d))"}]}
];
/* ===== Portales y llaves (inicio) =====
   PARTES 5 «Portales» y 6 «Llaves» de la edición chicos: solo existen ahí (kidsOnly: no se comparan con el juego normal en la regla
   de cantidad; en el juego normal el 5 es Funciones y el 6 Mundos, que los chicos no tienen). Portales se abre al superar Repetir y
   Llaves al superar Portales. Mapas: «O»/«U» portales (de a pares), «k»/«j»/«c» llaves (dorada, rosa, celeste) que abren «K»/«J»/«C»
   (ver engine.ts). No hay bloques nuevos: lo nuevo está en el mapa. Los 2 últimos niveles de cada parte usan repetir simple.
   icon: ícono de la tarjeta del menú. tip = [título, ayuda] del cartel. Los ids (pt…, ll…, ge…, xpt, xll) no se renombran */
export const KIDS_PARTS={
 parts:[
  {id:5,title:"Portales",sub:"entrás por uno y salís por el otro",c:"#06B6D4",l:"#CFF6FC",after:[4],kidsOnly:true,icon:"portal"},
  {id:6,title:"Llaves",sub:"cada llave abre la puerta de su color",c:"#F5B800",l:"#FFF3C4",after:[5],kidsOnly:true,icon:"key"}],
 groups:[
  {id:"PO",part:5,cls:1,tools:"",title:"Primeros portales",sub:"entrás por uno y salís por el otro",need:0,c:"#06B6D4",l:"#CFF6FC"},
  {id:"PB",part:5,cls:1,tools:"",title:"Portales y baterías",sub:"viajes más largos para juntar baterías",need:6,c:"#1EC48C",l:"#D2F6E8"},
  {id:"PR",part:5,cls:2,tools:"r",title:"Portales con repetir",sub:"el repetir sigue del otro lado",need:12,c:"#8B5CF6",l:"#EDE4FF"},
  {id:"LK",part:6,cls:1,tools:"",title:"Primeras llaves",sub:"la llave abre la puerta",need:0,c:"#F5B800",l:"#FFF3C4"},
  {id:"LC",part:6,cls:1,tools:"",title:"Llaves de colores",sub:"dorada, rosa y celeste",need:6,c:"#FF6FB5",l:"#FFDCEC"},
  {id:"LX",part:6,cls:2,tools:"r",title:"Gran escape",sub:"llaves, portales y repetir",need:12,c:"#E64C55",l:"#FFD9DB"}],
 missions:[
  /* Portales */
  {id:"pt1",grp:"PO",title:"Primer portal",rows:["R.##","#O##","####","O..E"],sol:"r d r r r",
   tip:["¡Un portal mágico!","Entrá por un portal y salís por el otro del mismo color"]},
  {id:"pt2",grp:"PO",title:"El atajo",rows:["R.....","O####.","#####.","#####.","####OE"],sol:"d r",
   tip:["¿Caminar o usar el portal?","Por el portal llegás con muchos menos bloques"]},
  {id:"pt3",grp:"PO",title:"¿Azul o naranja?",rows:["O.R.U","#####","O.#U.","..#.E"],sol:"r r d r",
   tip:["Dos portales distintos","Cada portal te lleva al otro de su mismo color: ¿cuál llega a la estrella?"]},
  {id:"pt4",grp:"PB",title:"La batería del otro lado",rows:["R...#B","##O.#.","E...#O"],sol:"r r d u u d d d l l",
   tip:["¡Los portales van y vuelven!","Cruzá a buscar la batería y volvé por el mismo portal"]},
  {id:"pt5",grp:"PB",title:"Dos portales, una batería",rows:["R.#B..",".##.#.","O.#U#.","###.#.","E.U..O"],sol:"d d l l l u u d d l l",
   tip:["Azul y naranja","Usá los dos portales para llegar a la batería y a la estrella"]},
  {id:"pt6",grp:"PB",title:"El gran viaje",rows:["R.O#.B","##.#..","B.U#U.",".####O","E....."],sol:"r r u u u d d l l l d d",
   tip:["Dos baterías, dos portales","Juntá las dos baterías antes de ir a la estrella"]},
  {id:"ge1",grp:"PR",title:"Pasillo mágico",max:4,rows:["R.....O","#######","O..B..E"],sol:"12(r)",
   tip:["¡Usá repetir!","El portal no corta el repetir: del otro lado GENI sigue avanzando"]},
  {id:"pt7",grp:"PR",title:"Escalera mágica",max:7,rows:["R.#####","#..####","##..###","###O###","#######","O.B..E#"],sol:"3(r d) 5(r)",
   tip:["Escalera y portal","Repetí la escalera hasta el portal y seguí del otro lado"]},
  /* Llaves */
  {id:"ll1",grp:"LK",title:"Primera llave",rows:["Rk###","#.###","#.K.E"],sol:"r d d r r r",
   tip:["¡Una puerta con llave!","Pasá por la llave y la puerta se abre sola"]},
  {id:"ll2",grp:"LK",title:"Ir a buscar la llave",rows:["..k#E","R..#K",".#...","....."],sol:"u r r d d r r u u",
   tip:["La llave está lejos","Primero buscá la llave, después andá a la puerta"]},
  {id:"ll4",grp:"LK",title:"Llave y batería",rows:["Rk#B.","#.#.#","#...K","####.","##E.."],sol:"r d d r r u u d d r d d l l",
   tip:["Llave, batería y estrella","La batería no está detrás de la puerta: ¿qué buscás primero?"]},
  {id:"ll3",grp:"LC",title:"Dos puertas",rows:["Rk.#E","##K#J","#j..."],sol:"r r d d l r r r u u",
   tip:["Llave dorada y llave rosa","Cada llave abre la puerta de su color: ¿cuál va primero?"]},
  {id:"ll5",grp:"LC",title:"Tres colores",rows:["Rk#.c","#.#J.","#.K.C","##j#E"],sol:"r d d r d u r u u r d d d",
   tip:["¡La llave celeste!","Dorada, rosa y celeste: cada una abre el camino a la siguiente"]},
  {id:"ll6",grp:"LC",title:"Puertas y batería",rows:["R.k#..","##.#B.","#j..J.","####.#","##EK.."],sol:"r r d d l r r r u d d d l l",
   tip:["Dos llaves y una batería","La batería está detrás de la puerta rosa"]},
  {id:"ll7",grp:"LX",title:"Escalera de llaves",max:6,rows:["Rk#####","#.K####","##.j###","###.J##","####..E"],sol:"4(r d) 2(r)",
   tip:["¡Usá repetir!","La escalera pasa por las llaves y las puertas: repetí el escalón"]},
  {id:"ge2",grp:"LX",title:"Gran escape",max:7,rows:["R.#####","#..####","##.U###","#######","U.j.J.E"],sol:"2(r d) 7(r)",
   tip:["¡El gran escape!","Escalera, portal, llave y puerta: usá repetir"]}],
 challenges:[
  {id:"xpt",part:5,cls:1,tools:"",title:"Desafío de portales",t3:150,t2:240,levels:[
   {title:"Portal rápido",rows:["R.#..","#O#.E","###.#","O...."],sol:"r d r r r u u r"},
   {title:"La batería escondida",rows:["B.O#R","##.#.","E..#O"],sol:"d d l l r r u d d d l l"},
   {title:"Dos colores",rows:["RU#..E","..#.##","O.#.O.","##B.#U"],sol:"d d l d l r u u u r r"}]},
  {id:"xll",part:6,cls:1,tools:"",title:"Desafío de llaves",t3:150,t2:240,levels:[
   {title:"La llave del rincón",rows:["R.k","##.","EK."],sol:"r r d d l l"},
   {title:"La llave celeste",rows:["R.#c.","..#.#","C....","E####"],sol:"d r d r r u u d d l l l d"},
   {title:"Todo junto",rows:["R.U#E","####K","U.#..","k...#"],sol:"r r d r r r u r u u"}]}]};
/* ===== Portales y llaves (fin) ===== */
export const KIDS={missions:["a3","a4","b1","b2","b3","c1","h1","h2","h3","h4","h5","l1","l2","m1","m2","m3","w1","w2","d1","d2","d3","d4","f2","r2","r4","r5"],need:{B:4,C:10,H:0,F:8,R:10},extra:30};
/* edición activa: "normal", "chicos" (applyKids) o "python" (applyPython). selfTest la mira para sus reglas */
export const ED={kind:"normal"};
export function applyKids(){
  ED.kind="chicos";
  const keep=(arr,f)=>arr.splice(0,arr.length,...arr.filter(f));
  KIDS_EXTRA.forEach(({after,m})=>{ const g=GROUPS.find(x=>x.id===m.grp), i=MISSIONS.findIndex(x=>x.id===after);
    MISSIONS.splice(i+1,0,Object.assign({},m,{cls:g.cls,part:g.part,tools:g.tools,strict:!!g.strict})); });
  keep(MISSIONS,m=>KIDS.missions.includes(m.id));
  keep(GROUPS,g=>MISSIONS.some(m=>m.grp===g.id));
  keep(PARTS,p=>GROUPS.some(g=>g.part===p.id));
  keep(CHALLENGES,c=>PARTS.some(p=>p.id===c.part));
  /* Portales y Llaves: las partes que solo existen en esta edición (van después de Repetir) */
  const KP=KIDS_PARTS; PARTS.push(...KP.parts); GROUPS.push(...KP.groups);
  MISSIONS.push(...KP.missions.map(m=>{ const g=KP.groups.find(x=>x.id===m.grp); return Object.assign(m,{cls:g.cls,part:g.part,tools:g.tools,strict:!!g.strict,adv:false}); }));
  KP.challenges.forEach(ch=>{ ch.levels.forEach((m,j)=>Object.assign(m,{id:ch.id+"-"+(j+1),num:j+1,cls:ch.cls,part:ch.part,tools:ch.tools,strict:false,ch:ch.id})); CHALLENGES.push(ch); });
  KIDS_CHALLENGES.forEach(ch=>{ const i=CHALLENGES.findIndex(c=>c.id===ch.id); if(i<0) return;
    ch.levels.forEach((m,j)=>Object.assign(m,{id:ch.id+"-"+(j+1),num:j+1,cls:ch.cls,part:ch.part,tools:ch.tools,strict:!!ch.strict,ch:ch.id}));
    CHALLENGES[i]=ch; });
  GROUPS.forEach(g=>{ if(g.id in KIDS.need) g.need=KIDS.need[g.id]; });
  CHALLENGES.forEach(c=>{ c.t3+=KIDS.extra; c.t2+=KIDS.extra; });
  numberMissions();
}

/* ===== Edición Python (inicio) =====
   ?python, para 13 a 15 años que ya programaron con bloques (VEXcode: secuencias, giros, bucles, «mientras»). Reemplaza todas las
   partes del juego por estas, guarda en robot-bloques-python y se combina con ?profe y ?test. Va de a poco:
   - Parte 1 «Bloques y Python»: secuencia, pintar, bailar y repetir con bloques; debajo se arma solo el mismo programa en Python
     (el espejo), así se acostumbran a leer main() y for antes de escribir.
   - Parte 2 «Funciones»: los niveles de Funciones del juego de 9 a 12 (con el espejo: def) y al final una función que llama a otra.
   - Parte 3 «Escribí en Python»: ya escriben el código: completar, el main con funciones hechas, el for, crear funciones, colores
     y funciones que llaman funciones.
   - Parte 4 «Variables y parámetros»: variables (y que cambian) y def avanzar(n).
   - Parte 4.5 «Mientras» (extra): while e if con preguntas (en_estrella(), celda_roja(), pared_derecha()).
   Niveles de bloques (grupo con blocks:true): las reglas de siempre (cls y tools del grupo; max, pre, lock y fns del nivel).
   notes:true pone comentarios de ayuda en el espejo (solo los 3 primeros niveles; después se acostumbran a leerlo sin ayuda).
   Niveles de código: pre = código de arranque (con ___ para completar; no puede ganar solo), sol = solución, goal = meta de líneas
   (sin vacías ni comentarios), req = lo que hay que usar para la 2.ª estrella (ver pyMissing), tip = [título, ayuda] del cartel.
   Estrellas (starsPy): 1 llegó, +1 usó lo que pide req, +1 dentro de goal. selfTest: la sol gana por el camino más corto y saca 3.
   tools de código: f def, r for, v variables, w while, i if, p pintar, b bailar (arman la lista de comandos de la izquierda).
   Los ids (pa…, pf…, py…, xp…) no se renombran: las estrellas se guardan por id */
const MAIN0="def main():\n    ...\n\nmain()\n";
export const PY_PARTS=[
 {id:1,title:"Bloques y Python",sub:"secuencia, pintar, bailar y repetir: mirá cómo queda el código",c:"#3776AB",l:"#DCE9F7",after:[],py:true},
 {id:2,title:"Funciones",sub:"crear y llamar funciones (def)",c:"#5B6CF0",l:"#E3E6FF",after:[1],py:true},
 {id:3,title:"Escribí en Python",sub:"ahora el código lo escribís vos",c:"#A35BD6",l:"#F0E1FF",after:[2],py:true},
 {id:4,title:"Variables y parámetros",sub:"guardar números y pasárselos a las funciones",c:"#C99400",l:"#FFF4C7",after:[3],py:true},
 {id:4.5,title:"Mientras",sub:"while e if: repetir hasta llegar y decidir",c:"#0EA5E9",l:"#D3F0FC",after:[4],extra:true,py:true}];
export const PY_GROUPS=[
 {id:"PA",part:1,blocks:true,cls:1,tools:"pb",strict:true,title:"Bloques y código",sub:"mover, pintar y bailar",need:0,c:"#3776AB",l:"#DCE9F7"},
 {id:"PH",part:1,blocks:true,cls:2,tools:"rpb",strict:true,title:"Repetir es for",sub:"el bloque repetir se escribe for",need:4,c:"#FF9A2E",l:"#FFE2C2"},
 {id:"PI",part:2,blocks:true,cls:3,tools:"rf",title:"Primeras funciones",sub:"un grupo de pasos con nombre",need:0,c:"#5B6CF0",l:"#E3E6FF"},
 {id:"PK",part:2,blocks:true,cls:3,tools:"rpbf",strict:true,title:"Funciones y colores",sub:"pintar y bailar con funciones",need:6,c:"#8B6CF0",l:"#E6DFFF"},
 {id:"PL",part:2,blocks:true,cls:3,tools:"rpbf",strict:true,title:"Armá tu función",sub:"armala desde cero",need:12,c:"#3E6FA8",l:"#D7E6F8"},
 {id:"PM",part:2,blocks:true,cls:3,tools:"rpbf",strict:true,title:"Una llama a otra",sub:"funciones adentro de funciones",need:14,c:"#C026D3",l:"#FAE1FD"},
 {id:"PB",part:3,tools:"rf",title:"Completá y llamá",sub:"el código ya está casi listo",need:0,c:"#3776AB",l:"#DCE9F7"},
 {id:"PC",part:3,tools:"rfp",strict:true,title:"for y def",sub:"repetir y crear funciones escribiendo",need:4,c:"#FF9A2E",l:"#FFE2C2"},
 {id:"PJ",part:3,tools:"rfpb",strict:true,title:"Funciones con colores",sub:"pintar y bailar desde el código",need:8,c:"#A35BD6",l:"#F0E1FF"},
 {id:"PD",part:3,tools:"rfpb",strict:true,title:"Una llama a otra",sub:"funciones que usan funciones",need:12,c:"#C99400",l:"#FFF4C7"},
 {id:"PE",part:4,tools:"rfv",title:"Variables",sub:"un nombre que guarda un número",need:0,c:"#FF9A2E",l:"#FFE2C2"},
 {id:"PF",part:4,tools:"rfvpb",strict:true,title:"Parámetros",sub:"def avanzar(n):",need:4,c:"#E64C55",l:"#FFD9DB"},
 {id:"PG",part:4.5,tools:"rfvwipb",strict:true,title:"Mientras",sub:"while not en_estrella():",need:0,c:"#0EA5E9",l:"#D3F0FC"}];
export const PY_MISSIONS=[
 /* Parte 1: secuencia, pintar, bailar y repetir con bloques (espejo en Python) */
 {id:"pa1",grp:"PA",notes:true,title:"Tus bloques en Python",rows:["#####","R.#..","#...E","#####"],sol:"r d r r r",
  tip:["Abajo está tu programa en Python","Cada bloque que ponés aparece escrito: derecha(), abajo()… · Llevá a GENI a la estrella"]},
 {id:"pa2",grp:"PA",notes:true,title:"pintar() y bailar()",rows:["#####","RXV.E","#####"],sol:"r p r b r r",
  tip:["Rojas: pintar · Verdes: bailar","Mirá abajo: en Python se escriben pintar() y bailar()"]},
 {id:"pa3",grp:"PH",notes:true,title:"Repetir es for",max:3,rows:["#######","R.....E","#######"],sol:"6(r)",
  tip:["¡Usá el bloque repetir!","En Python, repetir 6 veces se escribe: for i in range(6):"]},
 {id:"pa4",grp:"PH",title:"for que pinta",max:5,rows:["########","RXXXXXXE","########"],sol:"6(r p) r",
  tip:["Repetí moverte y pintar","Mirá abajo: lo que está adentro del for va con sangría (más a la derecha)"]},
 {id:"pa5",grp:"PH",title:"Escalera bailarina",max:7,rows:["####E","###V.","##V.#","#V.##","R.###"],sol:"3(r u b) r u"},
 {id:"pa6",grp:"PH",title:"Un for adentro de otro",max:6,rows:["R..B...","#.#.###","#...#..","##....B","#..###.","#..#...","#.....E"],sol:"2(3(r) 3(d))",
  tip:["Un repetir adentro de otro","Mirá abajo: el for de adentro usa j y tiene más sangría"]},
 /* Parte 2: funciones con bloques (los niveles de Funciones de 9 a 12) y al final una función que llama a otra */
 {id:"pf1",grp:"PI",title:"Llamá a la función",max:7,pre:{A:"r r u"},lock:["A"],rows:["######E","####...","##...##","R..####"],sol:"A=(r r u); A A A",
  tip:["¡Llamá a la función para ahorrar bloques!","Mirá abajo: la función se crea con def y se llama con su nombre y ()"]},
 {id:"pf2",grp:"PI",title:"Falta un bloque",max:7,pre:{A:"r r"},rows:["R..####","##...##","####...","######E"],sol:"A=(r r d); A A A"},
 {id:"py1",grp:"PI",title:"Tu primera función",max:7,rows:["######","#####E","###...","R...##"],sol:"A=(r r u); r A A"},
 {id:"pa7",grp:"PK",title:"La función que pinta",max:10,rows:["##..X..XE","R.X######"],sol:"A=(r r p); A u A r A r"},
 {id:"pf3",grp:"PK",title:"La función que baila",max:10,rows:["######V.R","EV..V..##"],sol:"A=(l l b); A d A l A l"},
 {id:"pf4",grp:"PK",title:"Arreglá la función",max:11,pre:{A:"d p"},rows:["R####",".####","X.###","#.###","#X..#","###.#","###XE"],sol:"A=(d d p); A r A r r A r"},
 {id:"pf5",grp:"PL",title:"Función y pasos",max:10,rows:["#########","########E","####.....","##...####","##.######","R..######"],sol:"A=(r r u); A u A r r A"},
 {id:"pa8",grp:"PL",title:"Función adentro del for",max:9,rows:["########.","######..E","####.#.##","##.....##","##.######","R..######"],sol:"A=(r r u); 2(A u A d)"},
 {id:"pf6",grp:"PM",title:"Una llama a otra",max:9,fns:2,rows:["########E","####.....","##...####","R..######"],sol:"A=(r r); B=(A u); B B A B",
  tip:["Una función puede llamar a otra","La función B usa a la A: mirá abajo cómo queda en Python"]},
 {id:"pf7",grp:"PM",title:"Rojas de dos en dos",max:10,fns:2,rows:["RX####","#.X.X#","####.X","#####E"],sol:"A=(r p); B=(A d A); B r B d"},
 /* Parte 3: escriben el código */
 {id:"py2",grp:"PB",title:"Completá el código",goal:9,req:["def"],rows:["R..####","##...##","####...","######E"],
  pre:"def escalon():\n    derecha()\n    derecha()\n    ___\n\ndef main():\n    escalon()\n    escalon()\n    ___\n\nmain()\n",
  sol:"def escalon():\n    derecha()\n    derecha()\n    abajo()\n\ndef main():\n    escalon()\n    escalon()\n    escalon()\n\nmain()\n",
  tip:["¡Ahora escribís vos!","Cambiá cada ___ por lo que falta y tocá Ir"]},
 {id:"py3",grp:"PB",title:"Llamá a las funciones",goal:14,req:["def"],rows:["######...E","######.###","###....###","###.######","R...######"],
  pre:"def avanzar():\n    derecha()\n    derecha()\n    derecha()\n\ndef subir():\n    arriba()\n    arriba()\n\ndef main():\n    ...\n\nmain()\n",
  sol:"def avanzar():\n    derecha()\n    derecha()\n    derecha()\n\ndef subir():\n    arriba()\n    arriba()\n\ndef main():\n    avanzar()\n    subir()\n    avanzar()\n    subir()\n    avanzar()\n\nmain()\n",
  tip:["Escribí el main","Las funciones ya están: adentro de main() llamalas en orden, una por línea"]},
 {id:"py16",grp:"PC",title:"Escribí el for",goal:6,req:["for"],rows:["########","RXXXXXXE","########"],pre:MAIN0,
  sol:"def main():\n    for i in range(6):\n        derecha()\n        pintar()\n    derecha()\n\nmain()\n",
  tip:["El mismo pasillo de la parte 1, ahora escrito","for i in range(6): y abajo, con sangría, lo que se repite"]},
 {id:"py4",grp:"PC",title:"Tu primera función escrita",goal:12,req:["def"],rows:["#########","########E","####.....","##...####","##.######","R..######"],pre:MAIN0,
  sol:"def escalon():\n    derecha()\n    derecha()\n    arriba()\n\ndef main():\n    escalon()\n    arriba()\n    escalon()\n    derecha()\n    derecha()\n    escalon()\n\nmain()\n",
  tip:["Creá tu propia función","Buscá los pasos que se repiten · def nombre(): arriba de main"]},
 {id:"py5",grp:"PJ",title:"La función que pinta",goal:12,req:["def"],rows:["##..X..XE","R.X######"],pre:MAIN0,
  sol:"def pintar_dos():\n    derecha()\n    derecha()\n    pintar()\n\ndef main():\n    pintar_dos()\n    arriba()\n    pintar_dos()\n    derecha()\n    pintar_dos()\n    derecha()\n\nmain()\n",
  tip:["Pintá las rojas con una función","pintar() pinta la celda donde está GENI"]},
 {id:"py6",grp:"PJ",title:"Pintar y bailar",goal:15,req:["def"],rows:["RXX###","##VXX#","####VE"],pre:MAIN0,
  sol:"def pinta():\n    derecha()\n    pintar()\n\ndef baila():\n    abajo()\n    bailar()\n\ndef main():\n    pinta()\n    pinta()\n    baila()\n    pinta()\n    pinta()\n    baila()\n    derecha()\n\nmain()\n",
  tip:["Rojas: pintar() · Verdes: bailar()","Podés crear más de una función"]},
 {id:"py7",grp:"PD",title:"Una llama a otra",goal:12,req:["def2"],rows:["########E","####.....","##...####","R..######"],
  pre:"def dos():\n    derecha()\n    derecha()\n\ndef escalon():\n    ___  # llamá a dos()\n    arriba()\n\ndef main():\n    escalon()\n    escalon()\n    dos()\n    escalon()\n\nmain()\n",
  sol:"def dos():\n    derecha()\n    derecha()\n\ndef escalon():\n    dos()\n    arriba()\n\ndef main():\n    escalon()\n    escalon()\n    dos()\n    escalon()\n\nmain()\n",
  tip:["Una función puede llamar a otra","escalon() usa a dos(): por eso dos() va más arriba"]},
 {id:"py8",grp:"PD",title:"Filas rojas",goal:14,req:["def2"],rows:["RXXX###","###.###","###.XXX","######E"],pre:MAIN0,
  sol:"def pinta():\n    derecha()\n    pintar()\n\ndef fila():\n    pinta()\n    pinta()\n    pinta()\n\ndef main():\n    fila()\n    abajo()\n    abajo()\n    fila()\n    abajo()\n\nmain()\n",
  tip:["Armá una función con otra adentro","Primero la función chica, después la que la usa, al final main()"]},
 /* Parte 4: variables y parámetros */
 {id:"py9",grp:"PE",title:"Guardá un número",goal:9,req:["var"],rows:["R.....#","#####.#","E.....#"],
  pre:"largo = ___\n\ndef main():\n    for i in range(largo):\n        derecha()\n    abajo()\n    abajo()\n    ___\n\nmain()\n",
  sol:"largo = 5\n\ndef main():\n    for i in range(largo):\n        derecha()\n    abajo()\n    abajo()\n    for i in range(largo):\n        izquierda()\n\nmain()\n",
  tip:["Una variable guarda un número","largo = 5 · después usás largo donde iría el 5"]},
 {id:"py10",grp:"PE",title:"La variable crece",goal:8,req:["var2"],rows:["######E","###....","#...###","R.#####"],
  pre:"def main():\n    pasos = 1\n    for i in range(3):\n        for j in range(pasos):\n            derecha()\n        arriba()\n        ___  # que pasos sea uno más\n\nmain()\n",
  sol:"def main():\n    pasos = 1\n    for i in range(3):\n        for j in range(pasos):\n            derecha()\n        arriba()\n        pasos = pasos + 1\n\nmain()\n",
  tip:["La variable cambia","Cada escalón es más largo: pasos = pasos + 1"]},
 {id:"py11",grp:"PF",title:"Funciones con parámetros",goal:10,req:["param"],rows:["######...E","####...###","R....#####"],
  pre:"def avanzar(n):\n    for i in range(n):\n        derecha()\n\ndef main():\n    avanzar(4)\n\nmain()\n",
  sol:"def avanzar(n):\n    for i in range(n):\n        derecha()\n\ndef main():\n    avanzar(4)\n    arriba()\n    avanzar(2)\n    arriba()\n    avanzar(3)\n\nmain()\n",
  tip:["n es un parámetro","avanzar(4) camina 4 · avanzar(2) camina 2"]},
 {id:"py12",grp:"PF",title:"Filas de cada largo",goal:12,req:["param"],rows:["RXXX####","###.XX##","#####.XE"],pre:MAIN0,
  sol:"def fila(n):\n    for i in range(n):\n        derecha()\n        pintar()\n\ndef main():\n    fila(3)\n    abajo()\n    fila(2)\n    abajo()\n    fila(1)\n    derecha()\n\nmain()\n",
  tip:["Creá una función con parámetro","def fila(n): pinta n rojas seguidas"]},
 /* Parte 4.5: mientras */
 {id:"py13",grp:"PG",title:"Hasta la estrella",goal:4,req:["while"],rows:["#############","R...........E","#############"],pre:MAIN0,
  sol:"def main():\n    while not en_estrella():\n        derecha()\n\nmain()\n",
  tip:["Mientras no llegues, avanzá","while not en_estrella(): repite hasta llegar"]},
 {id:"py14",grp:"PG",title:"Si es roja, pintá",goal:6,req:["while","if"],rows:["##########","R.XX.X.XXE","##########"],pre:MAIN0,
  sol:"def main():\n    while not en_estrella():\n        derecha()\n        if celda_roja():\n            pintar()\n\nmain()\n",
  tip:["while + if","Avanzá y preguntá: if celda_roja(): pintar()"]},
 {id:"py15",grp:"PG",title:"Seguí el camino",goal:7,req:["while","if"],rows:["R..#####","##.....#","######.#","######.E"],pre:MAIN0,
  sol:"def main():\n    while not en_estrella():\n        if pared_derecha():\n            abajo()\n        else:\n            derecha()\n\nmain()\n",
  tip:["Si hay pared, bajá","if pared_derecha(): … else: …"]}];
/* desafíos: xpr (repetir) y xp0 (funciones) son de bloques, con el espejo; xp1 y xp2 son de código. Los ids no cambian aunque cambie la parte */
export const PY_CHALLENGES=[
 {id:"xpr",part:1,blocks:true,cls:2,tools:"rpb",strict:true,title:"Desafío de repetir",t3:150,t2:240,levels:[
   {title:"La gran escalera",max:6,rows:["R..#...","##B#.#.","#....##","#.##.#.","#..#B..","#.###..","...#..E"],sol:"3(2(r) 2(d))"},
   {title:"La montaña bailarina",max:8,rows:["R.####E","#..#...","##.....","###V.##"],sol:"3(r d) b 3(r u)"},
   {title:"Dos pasillos",max:10,rows:["RXVXV","####V","####V","####E"],sol:"2(r p r b) 2(d b) d"}]},
 {id:"xp0",part:2,blocks:true,cls:3,tools:"rpbf",strict:true,title:"Desafío de funciones",t3:150,t2:240,levels:[
   {title:"Pintar con función",max:10,rows:["EX..X..##","######X.R"],sol:"A=(l l p); A u A l A l"},
   {title:"Bailar con función",max:10,rows:["R.V######","##..V..VE"],sol:"A=(r r b); A d A r A r"},
   {title:"Colores con función",max:12,rows:["####.#XE","##..V.V#","R.V#####"],sol:"A=(r r b); 2(A u) d A u p r"}]},
 {id:"xp1",part:3,tools:"rfpb",strict:true,title:"Desafío de escribir en Python",t3:300,t2:480,levels:[
   {title:"La escalera",rows:["...#E","..#..",".#..#","#..#.","R.#.."],pre:MAIN0,sol:"def escalon():\n    derecha()\n    arriba()\n\ndef main():\n    escalon()\n    escalon()\n    escalon()\n    escalon()\n\nmain()\n"},
   {title:"Pasillo pintado",rows:["#########","R.X.X.X.E","#########"],pre:MAIN0,sol:"def dos():\n    derecha()\n    derecha()\n    pintar()\n\ndef main():\n    dos()\n    dos()\n    dos()\n    derecha()\n    derecha()\n\nmain()\n"},
   {title:"Baile en zigzag",rows:["RV####","#.V###","##.V##","###.V#","####.E"],pre:MAIN0,sol:"def paso():\n    derecha()\n    bailar()\n    abajo()\n\ndef main():\n    paso()\n    paso()\n    paso()\n    paso()\n    derecha()\n\nmain()\n"}]},
 {id:"xp2",part:4,tools:"rfvpb",strict:true,title:"Desafío de variables",t3:300,t2:480,levels:[
   {title:"Avanzar n",rows:["R...#####","###..####","####....E"],pre:MAIN0,sol:"def avanzar(n):\n    for i in range(n):\n        derecha()\n\ndef main():\n    avanzar(3)\n    abajo()\n    avanzar(1)\n    abajo()\n    avanzar(4)\n\nmain()\n"},
   {title:"Ida y vuelta",rows:["R....#","####.#","E....#"],pre:MAIN0,sol:"largo = 4\n\ndef main():\n    for i in range(largo):\n        derecha()\n    abajo()\n    abajo()\n    for i in range(largo):\n        izquierda()\n\nmain()\n"},
   {title:"Filas que crecen",rows:["RX#####","#.XX###","###.XXX","######E"],pre:MAIN0,sol:"def fila(n):\n    for i in range(n):\n        derecha()\n        pintar()\n\ndef main():\n    largo = 1\n    for i in range(3):\n        fila(largo)\n        abajo()\n        largo = largo + 1\n\nmain()\n"}]}];
/* pasa a la edición Python: reemplaza partes, grupos, niveles y desafíos, y saca los códigos de clase (son del juego de bloques) */
export function applyPython(){
  ED.kind="python";
  const put=(arr,items)=>arr.splice(0,arr.length,...items);
  put(PARTS,PY_PARTS); put(GROUPS,PY_GROUPS);
  put(MISSIONS,PY_MISSIONS.map(m=>{ const g=GROUPS.find(x=>x.id===m.grp);
    return Object.assign(m,{part:g.part,cls:g.blocks?g.cls:4,py:!g.blocks,tools:m.tools??g.tools,strict:m.strict??!!g.strict,adv:false}); }));
  put(CHALLENGES,PY_CHALLENGES); CHALLENGES.forEach(ch=>ch.levels.forEach((m,i)=>Object.assign(m,{id:ch.id+"-"+(i+1),num:i+1,cls:ch.blocks?ch.cls:4,py:!ch.blocks,part:ch.part,tools:ch.tools,strict:!!ch.strict,ch:ch.id})));
  CLASS_CODES.length=0;
  numberMissions();
}
/* ===== Edición Python (fin) ===== */

/* ===== Configuración del profe (inicio) =====
   El profe entra con usuario y contraseña (botón «Configuración», solo con ?profe) y oculta partes por vista. Se guarda en la base
   (tabla game_config, ver lib/server/profe.ts) y page.tsx la pasa a boot(). EDITION_PARTS: partes de cada vista para el panel
   (se calcula acá, antes de applyKids/applyPython). */
const partRow=p=>({id:p.id,title:p.title,extra:!!p.extra});
const KIDS_GRPS=new Set([...MISSIONS.filter(m=>KIDS.missions.includes(m.id)).map(m=>m.grp),...KIDS_EXTRA.filter(x=>KIDS.missions.includes(x.m.id)).map(x=>x.m.grp)]);
export const EDITION_PARTS={
  normal:PARTS.map(partRow),
  chicos:PARTS.filter(p=>GROUPS.some(g=>g.part===p.id&&KIDS_GRPS.has(g.id))).map(partRow).concat(KIDS_PARTS.parts.map(partRow)),
  python:PY_PARTS.map(partRow)};
/* oculta partes de la edición activa. Las que dependían de una oculta pasan a pedir lo que pedía ella (no quedan trabadas).
   mark (modo profe): no saca nada, solo marca p.hidden para mostrar «oculta» en el menú */
export function hideParts(ids,mark){
  const hid=PARTS.filter(p=>ids.includes(p.id)); if(!hid.length) return;
  if(mark){ hid.forEach(p=>p.hidden=true); return; }
  const byId=new Map(PARTS.map(p=>[p.id,p]));
  const expand=(after,seen=new Set())=>after.flatMap(a=>{ if(seen.has(a)) return []; seen.add(a);
    const P=byId.get(a); return P&&ids.includes(a)?expand(P.after,seen):[a]; });
  PARTS.forEach(p=>{ p.after=[...new Set(expand(p.after))]; });
  const keep=(arr,f)=>arr.splice(0,arr.length,...arr.filter(f));
  keep(PARTS,p=>!ids.includes(p.id));
  keep(GROUPS,g=>!ids.includes(g.part));
  keep(MISSIONS,m=>!ids.includes(m.part));
  keep(CHALLENGES,c=>!ids.includes(c.part));
}
/* ===== Configuración del profe (fin) ===== */
