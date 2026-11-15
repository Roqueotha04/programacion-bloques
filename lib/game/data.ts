// @ts-nocheck
/* Código extraído del juego original. No reescribir en React. */
/* partes = cards del menú. after: partes que hay que superar (niveles + desafío extra) para abrirla.
   code: código que da el profe para abrirla (sin importar mayúsculas, espacios ni tildes) */
export const PARTS=[
 {id:1,title:"Secuencia",sub:"un bloque después del otro",c:"#3B82F0",l:"#DCE9FF",after:[]},
 {id:2,title:"Pintar",sub:"usar el pincel y guardarlo",c:"#A35BD6",l:"#F0E1FF",after:[1]},
 {id:3,title:"Repetir",sub:"el bloque que repite",c:"#FF9A2E",l:"#FFE2C2",after:[1],code:"genIArepetir"},
 {id:4,title:"Si",sub:"el robot mira la celda y decide",c:"#14B8A6",l:"#CCF5EF",after:[2,3]}
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
 {id:"K",part:4,cls:2,tools:"rpbi",strict:true,title:"Rojo y verde",sub:"rojas: pintar · verdes: bailar",need:6,c:"#0EA5E9",l:"#D3F0FC"}
];
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
 {id:"k3",grp:"K",title:"Escalera de colores",max:8,rows:["R.####","#X.###","##V.##","###..#","####X.","#####E"],sol:"5(r d ?x(p) ?v(b))"}
].map(m=>{ const g=GROUPS.find(x=>x.id===m.grp); return Object.assign(m,{cls:g.cls,part:g.part,tools:g.tools,strict:!!g.strict}); });
PARTS.forEach(p=>MISSIONS.filter(m=>m.part===p.id).forEach((m,i)=>m.num=i+1)); /* numeración dentro de cada parte */
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
   {title:"Dos pasillos",max:10,rows:["RX.VX####","####.####","####.V.XX","########.","########E"],sol:"2(4(r ?x(p) ?v(b)) 2(d))"}]}
];
CHALLENGES.forEach(ch=>ch.levels.forEach((m,i)=>Object.assign(m,{id:ch.id+"-"+(i+1),num:i+1,cls:ch.cls,part:ch.part,tools:ch.tools,strict:!!ch.strict,ch:ch.id})));
