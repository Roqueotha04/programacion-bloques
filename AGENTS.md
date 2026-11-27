<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Programa con GENI

Juego para el aula: el alumno arma un programa arrastrando bloques y lleva a GENI hasta la estrella. No hay cuentas ni menús nuevos. El producto es este juego, en español.

## Mundos (carrusel de inicio)

El inicio es el encabezado «Programa con GENI» (Taller, «Mapa propio» —página aparte, `WORLD="map"`—, estrellas y borrar progreso) y debajo un **carrusel de mundos** chico y cuadrado (un mundo por vez: número, nombre, dibujo propio `worldArt` en `ui.ts`, flechas, puntos, deslizar o flechas del teclado). Tocar el dibujo o «Jugar» abre la página del mundo con sus partes. Cada edición tiene sus mundos (`NORMAL_WORLDS`, `KIDS_WORLDS`, `PY_WORLDS` en `data.ts`; `setWorlds` le pone `world` a cada parte). `theme` da el aspecto (`body[data-world]` en `game.css`) y el dibujo.

- **Los mundos se eligen libres.** Adentro, la primera parte de cada mundo está abierta (`after:[]`) y las demás van en orden. Repetir y Funciones **ya no piden código**.
- `lock:true` = bloqueado para los alumnos, sin código («Próximamente»; `?profe` lo abre). Un mundo sin partes en la edición no se abre nunca.
- Normal: 1 Secuencia (1, 2, 3) · 2 Optimización (4, 4.5, 5, 5.5) · 3 Condicionales (6, 7, 7.5, 8) · 4 Eventos (9, 10, 11, `lock`).
- Chicos: 1 Secuencia (1, 2, 3) · 2 Optimización (4) · 3 Portales (5 Portales, 6 Llaves) · 4 Eventos (`lock`, sin niveles).
- Python: 1 Secuencia (1, 1.5, 1.7, 2) · 2 Funciones (3, 4, 5, 5.5, `lock`) · 3 Eventos (`lock`, sin niveles).

## Partes

Partes, siempre en este orden (Si, Si avanzado, Colores con repetir y Si no forman el mundo Condicionales, todo con colores, sin paredes; Eventos son las partes 9, 10 y 11; los extras «Repetir avanzado» y «Funciones avanzadas» son las partes 4.5 y 5.5) (el número de parte es el orden del menú; `data.ts` ordena partes, grupos, niveles y desafíos por número de parte):

| N.º | Parte | Se abre con | Qué enseña |
| --- | --- | --- | --- |
| 1 | Secuencia | — | Mover el robot, baterías. |
| 2 | Pintar | Parte 1 | Pincel (usar y guardar). |
| 3 | Bailar | Parte 2 | Pintar de un toque y bailar (rojas: pintar, verdes: bailar), con baterías. Sin repetir. |
| 4 | Repetir | — (primera de Optimización) | Bloque repetir; incluye niveles de repetir con baile y pintura. |
| 4.5 | Repetir avanzado *(extra)* | Parte 4 | Niveles opcionales de repetir más difíciles (colores, baterías, repetir adentro). |
| 5 | Funciones | Parte 4 | Funciones con nombre libre: se definen y se llaman. |
| 5.5 | Funciones avanzadas *(extra)* | Parte 5 | Recursión: una función que se llama a sí misma. |
| 6 | Si | — (primera de Condicionales) | Muy simple: 2 mapas por nivel y una sola celda que cambia (roja o no). Solo pintar: primero sin repetir (pasillo, pasillo que dobla, pasillo para abajo), después un repetir mínimo (escalera, pasillo). |
| 7 | Si avanzado | Parte 6 | Rojas y verdes sin repetir (`norep`): la celda es roja en un mapa y verde en el otro; después dos celdas que cambian. 7 niveles. |
| 7.5 | Colores con repetir | Parte 7 | No es extra: los dos si adentro del repetir en pasillos y escaleras (bajar, subir, larga, pasillo + bajada). 7 niveles. |
| 8 | Si no | Parte 7.5 | Con colores: «si es roja, pintá; si no, bailá» y el color como señal («si es roja, pintá y bajá; si no, seguí»). 6 niveles. |

- **Parte 4.5 «Repetir avanzado» (`extra:true`)**: opcional, para los que terminan Repetir rápido. Se abre al superar la parte 4, no cuenta para abrir otras partes, no tiene desafío y no está en `?chicos`. 7 niveles `ra1`–`ra7` (grupos `I` y `X`, `cls 2`, `tools:"rpb"`, `strict`).
- **Parte 5.5 «Funciones avanzadas» (`extra:true`)**: no cuenta para abrir otras partes. Se abre al superar la parte 5 y no está en `?chicos`. Son niveles `adv` (grupos `Y`, `Z` y `N`): hay que ganar con una función que se llama a sí misma (la recursión corta al llegar a la estrella). Dan hasta **3 estrellas** como todos (`starsAdv`: llegar con recursión, meta de bloques, camino más corto). **En cualquier nivel** (menos «Mi mapa») más de `MAXACT` (30) acciones, o 400 eventos, devuelve `boom`: GENI se marea y explota. `selfTest` valida que cada solución use recursión, el `boom` y que ganar sin recursión no cuenta. Los ids `v1`–`v9` no se renombran.
- Cada parte tiene grupos de niveles y un desafío extra con cronómetro (3 niveles seguidos). El desafío **no cuenta** como nivel de la parte.
- Página de cada mundo (`renderMenu` en `ui.ts`), de arriba abajo: las partes normales del mundo, la sección «Desafíos» con los desafíos de esas partes (una card por desafío, en grilla como los niveles) y al final, si el mundo tiene partes `extra`, «Niveles avanzados»: una card grande «Opcional», plegada (`ADV_OPEN` por mundo), que muestra esas partes al tocarla (trabada hasta que alguna se abre). El botón «Siguiente» nunca pasa de una parte normal a una `extra`: al terminar la parte se va al desafío.
- Una parte se supera con todos sus niveles **y** su desafío extra (al menos 1 estrella). Al terminar el último nivel de una parte se invita a jugar el desafío.
- Edades pensadas (solo orientativo, no hay selector): 6 a 8 → Secuencia, Pintar, Bailar, Repetir; 9 a 12 → Funciones; 13 a 15 → Mundos, o la edición Python si ya programaron con bloques.

## Edición chicos (`?chicos`, 6 a 8 años)

- Hay **dos ediciones por URL**: `?chicos` y `?python` (abajo). No agregues otras URLs de edición salvo que te lo pidan.
- `applyKids()` en `data.ts` deja solo los niveles listados en `KIDS.missions`, saca las partes que quedan sin niveles (Funciones, Mundos, Si) y suma 30 s a los desafíos. Sus partes 3 y 4 son Bailar y Repetir. Guarda en `robot-bloques-chicos`. Se combina con `?profe` y `?test`.
- `KIDS.need` fija las estrellas que pide cada grupo en esta edición (2 por nivel anterior de la parte).
- `KIDS_EXTRA` son niveles que solo existen en esta edición (van justo después del nivel `after`): hoy `f2` «Repetir adentro», `r2` «Baile cada dos» y `r5` «Dos pasillos» (f2 y r5 salieron del juego normal, que tiene 8 niveles de Repetir).
- **Partes 5 «Portales» y 6 «Llaves» (solo chicos, `KIDS_PARTS` en `data.ts`, `kidsOnly:true`)**: Portales se abre al superar Repetir y Llaves al superar Portales. Lo nuevo está en el mapa, no hay bloques nuevos: portales `O` (azul) y `U` (naranja), siempre de a pares (pisar uno lleva al otro; al salir no vuelve a entrar), llaves `k` (dorada), `j` (rosa) y `c` (celeste) que se agarran solas al pasar y abren las puertas `K`, `J` y `C` (sin la llave, la puerta es una pared). Cada parte tiene 8 niveles (dos grupos `cls 1` más largos y con baterías, y un grupo de 2 con repetir simple) y su desafío: Portales = grupos `PO`, `PB`, `PR`, niveles `pt1`–`pt7` y `ge1`, desafío `xpt`; Llaves = grupos `LK`, `LC`, `LX`, niveles `ll1`–`ll7` y `ge2`, desafío `xll`. En Portales no hay llaves (se enseñan después). Animaciones: remolino del portal, GENI entra girando y sale del otro, llave que flota, candado que tiembla o salta, y caras de un momento (`wow`, `sorpresa`, `triste`: no se compran en el taller). Los ids 5 y 6 son Funciones y Mundos en el juego normal; acá son otras partes (los chicos no tienen esas).
- **Regla de cantidad: en cada parte, los chicos de 6 a 8 hacen menos o igual cantidad de niveles que el resto, nunca más.** La excepción son las partes `kidsOnly` (hoy «Portales» y «Llaves»), que no existen en el juego normal. Los niveles exclusivos de `KIDS_EXTRA` cuentan. Lo que se agrega o se saca para el juego normal **no** se le agrega o saca automáticamente a los chicos: la lista `KIDS.missions` se decide aparte. `selfTest` lo controla (`NORMAL_COUNT` en `data.ts`: niveles por parte del juego normal) y falla si los chicos pasan al resto en alguna parte.
- Los ids de nivel son únicos en todo el juego (en chicos un id repetido trae a otra parte).

## Edición Python (`?python`, 13 a 15 años del plan viejo)

- Para los que ya programaron con bloques (VEXcode): escriben **Python** para mover a GENI. `applyPython()` en `data.ts` **reemplaza** todas las partes por `PY_PARTS`, `PY_GROUPS`, `PY_MISSIONS` y `PY_CHALLENGES`, y vacía `CLASS_CODES`. Guarda en `robot-bloques-python`. Se combina con `?profe` y `?test` (sirve `?python&profe` o `?python?profe`, igual que `?chicos?profe`) y tiene prioridad sobre `?chicos`. `ED.kind` dice qué edición está activa.
- Partes (van de a poco, primero con bloques y después armando lo mismo en código): **1 «Secuencia»** (bloques: mover, pintar y bailar, con el espejo: debajo de los bloques se arma solo el mismo programa en Python, así se acostumbran a leer `main()`); **1.5 «Repetir»** (bloques con espejo: `repetir(n):`, con colores y uno adentro de otro; desafío `xpr`); **1.7 «Repetir avanzado»** (`extra`, sin desafío: bloques, copiados de `ra…` con ids `pr…`); **2 «Armá el código»** (`pick:"only"`: arman el código **eligiendo cada línea con selects**, sin escribir, con lo de las partes 1 y 1.5: completar `___`, el `main`, `repetir`, `pintar()` y `bailar()`, ids `pc…`); **3 «Funciones»** (bloques con espejo: los niveles de Funciones de 9 a 12, copiados con ids `pf…`, y al final 2 de una función que llama a otra, `fns:2`); **4 «Escribí funciones»** (completar, el `main` con funciones hechas, crear funciones, colores y funciones que llaman funciones); **5 «Variables y parámetros»**; **5.5 «Mientras»** (`extra`, sin desafío: `while`, `if`). Desafíos: `xpr` (repetir, bloques), `xpc` (parte 2, con selects), `xp0` (funciones, bloques), `xp1` y `xp2` (código). Los ids no se renombran aunque cambie la parte. Ojo: la configuración del profe guarda partes ocultas por número (lo que antes era 1.5 ahora es 1.7).
- **Modo «Elegir»** (`pick…` en `ui.ts`): cada línea es una fila con un select de la orden (y selects o campos para el número, el nombre o la pregunta). El programa sigue siendo el texto `G.code`, así que corre, cuenta líneas y marca errores igual. La sangría la pone el juego (4 espacios; ← → solo dejan las que valen en Python); `def main():` y el `main()` final no se tocan. En la parte 2 (`pick:"only"` en la parte, pasa a sus niveles y su desafío) es el único modo; en los demás niveles de código hay un botón «Elegir / Escribir» (se recuerda entre niveles, en memoria).
- **El repetir se escribe `repetir(n):`** (tipo pseudocódigo), no `for i in range(n):`: así sale en el espejo, en la lista de comandos y en las soluciones. El parser igual entiende `for i in range(n):` (es el mismo nodo `for`, sin variable).
- `lib/game/python.ts`: subconjunto de Python que se traduce a los mismos eventos que `walk()`, así `simulate`, las animaciones y `selfTest` son los de siempre. **No es Python de verdad** (no hay Pyodide): `parsePy` (código → árbol, errores en español con número de línea y «¿Quisiste decir…?»), `pyWalk` (árbol → eventos), `pyLines`, `pyMissing`, `blocksToPy` (espejo) y `pyHTML` (colores). Palabras de Python en inglés (menos `repetir`); comandos de GENI en español (`arriba() abajo() izquierda() derecha() pintar() bailar()`), preguntas `en_estrella() celda_roja() celda_verde() pared_arriba/abajo/izquierda/derecha()`. Respeta la semántica de Python que se enseña: el `def` tiene que estar antes de la llamada, las variables de una función son locales (`global` existe) y la sangría es de 4 espacios.
- Nivel de código (`py:true`, `cls 4`): `pre` código de arranque (con `___` para completar; no puede ganar solo), `sol`, `goal` meta de **líneas** (sin vacías ni comentarios), `req` lo que hay que usar (`def`, `def2`, `var`, `var2`, `param`, `for`, `while`, `if`) y `tip` el cartel. Estrellas (`starsPy`): 1 llegó, +1 `req`, +1 dentro de `goal`. `blocks:true` es un nivel de bloques normal (`cls 3`) que muestra abajo el mismo programa en Python. Comentarios de ayuda (`# definimos nuestra función`, `# Programa principal`, `# lo que se ejecuta`) **solo en los 3 primeros niveles** (`notes:true`, en el espejo); después el código va sin comentarios. Lo vacío se marca con `...` (no con `pass`, aunque `pass` también se entiende). Los niveles de bloques (`blocks:true` en el grupo) usan las reglas de siempre (`cls`, `tools`, `max`). Todo `while` o llamada emite eventos, así un bucle infinito explota con el tope de siempre.
- `selfTest` (con `?python&test`): cada `sol` se lee sin errores, gana por el camino más corto, entra en `goal` y cumple `req`; el `pre` no gana solo; y un chequeo de errores, `while True` y parámetros. La regla de cantidad de chicos no aplica.
- Vista: en niveles de código la columna de bloques es una lista de comandos (tocar = escribir en el cursor, con la sangría de la línea); el programa es un editor claro con colores de sintaxis (un `textarea` transparente sobre un `<pre>` con `pyHTML`), números de línea, Tab = 4 espacios y Enter que mantiene la sangría. Debajo, **«Así se ve en bloques»**: el código dibujado con los mismos bloques del juego, chicos y solo para mirar (el espejo al revés); se actualiza al escribir y, al correr, se ilumina a la vez la línea y su bloque. Los errores marcan la línea en rojo. El código vive en memoria por nivel (`PYCODE`), como los bloques.

## Reglas del juego

- Estrellas (1–3) según bloques usados, pista y errores. Progreso en `localStorage` (`robot-bloques-v2`; con `?profe` usa `robot-bloques-profe`). Las estrellas se guardan por id de nivel y el código del profe por número de parte (`SAVE.codes`): **no renombres ids de nivel ni renumeres partes sin migrar el guardado** (hay una migración en `ui.ts`: el código de Repetir pasó de la parte 3 a la 4).
- **Códigos** (botón «Código» arriba a la izquierda del menú): `CLASS_CODES` en `data.ts`. `nivel1-clase2` marca Secuencia y Pintar (niveles y desafío) con 3 estrellas; `nivel2-clase2` marca Secuencia, Pintar y Bailar (así se empieza directo con Repetir); `nivel3-clase2` marca Secuencia, Pintar y Repetir (Bailar queda sin hacer). Las estrellas se acreditan al taller y repetir el código no suma dos veces. Los tres dan por ingresado el código de Repetir (así se hacen Bailar y Repetir de corrido). Ninguna parte pide código hoy (el cuadro sigue aceptando `PARTS[].code` si se vuelve a poner).
- Taller: diseños, caras (guiño, enojado, cool) y dos colores (cuerpo y detalle). Editor de mapa propio, borrar progreso (doble toque).
- `?profe` abre todo y muestra códigos. `?test` corre `selfTest()` del motor.
- **Configuración del profe** (botón «Configuración» en el menú, solo con `?profe`): login con usuario y contraseña y un interruptor por parte en cada vista (Normal, Chicos, Python). Lo oculto desaparece para los alumnos de esa vista; con `?profe` se ve marcado «Oculta para alumnos» y con `?test` no se oculta nada. `hideParts()` en `data.ts` saca la parte (con sus grupos, niveles y desafío) y las que dependían de ella pasan a pedir lo que pedía la oculta (no quedan trabadas). `EDITION_PARTS` lista las partes de cada vista para el panel. Se guarda en Postgres (tabla `game_config`, una fila por vista con `hidden` jsonb, ver `db/game_config.sql`); `app/page.tsx` la lee en el servidor y la pasa a `boot(hidden)`. Si la base falla, no se oculta nada. Es el único login: no agregues cuentas de alumnos.
- Pantallas: menú, juego, editor, taller. Se muestran y ocultan con `.hidden` en el DOM. No son rutas de Next.js.

## Cómo se arman los niveles

- `data.ts`: `PARTS`, `GROUPS` (cada grupo fija `cls`, `tools`, `strict`, `need`), `MISSIONS`, `CHALLENGES`. Los niveles heredan `cls/tools/strict/part` de su grupo.
- `cls 1`: meta de bloques; la solución `sol` tiene que ser el camino mínimo (`shortest()`) y sin más de 3 movimientos iguales seguidos. `cls 2`: máximo de bloques (`max`) y hay que usar repetir (salvo `norep:true`, en el grupo o el nivel: los primeros de Condicionales). `cls 3`: máximo de bloques y hay que usar una función.
- `tools`: `r` repetir, `n` pincel, `p` pintar de un toque, `b` bailar, `i` si, `e` si no, `f` funciones. `strict`: pintar o bailar en la celda equivocada es error.
- Mapas: `.` libre, `#` caja, `R` robot, `E` estrella, `B` batería, `X` roja, `V` verde; en chicos, `O`/`U` portales y `k`/`j`/`c` llaves de las puertas `K`/`J`/`C`. `selfTest` controla que los portales vayan de a pares.
- Notación de `sol` (`parseSol` en `engine.ts`): `u d l r` mover, `p b n f` acciones, `N(...)` repetir, `?x(...)` si, `!(...)` si no, `A=(...)` define función y `A` la llama.
- Funciones: bloque `call`, `walk(list,test,prefix,funcs)`, nombre libre del alumno (siempre escapado al mostrarlo). Una función solo llama a otra anterior (B llama a A). No se guardan en `localStorage`.
- Condicionales: `worlds` (el mundo 0 es `rows`), `pool`/`show` para sortear, `reveal` para mostrar los mapas antes de correr. En el si siempre se elige el color (roja o verde) tocándolo; `conds` (en el grupo, el nivel o el desafío) cambia las opciones (paredes en «Si no»). Ids: niveles `ci1`–`ci5`, `cv1`–`cv7`, `ca1`–`ca7`, `cs1`–`cs6`; desafíos `xsi`, `xsa`, `xsb`, `xsn` (los viejos `s…`, `t…`, `u…`, `j…`, `k…`, `x5`, `x8` se sacaron).
- **Eventos (parte 9, Mundo 4, experimental)**: niveles `ev1`–`ev5` (grupos `EV` y `EW`, `cls 2`, `tools` con `k`, solo juego normal). Los bloques «al apretar [tecla]» son **bloques de inicio** (igual jerarquía que «al tocar»): van en la zona **«Mis eventos»** debajo del programa (como «Mis funciones»; `evsHTML` en `ui.ts`): se arrastran o tocan desde la paleta y se agregan al final (`G.evs[id]={key,body}` en `ui.ts`, `EVS` por nivel, no se guarda en localStorage; el orden en que se pusieron decide quién corre primero si dos comparten tecla). Cada uno lleva su **pila de hasta `EVMAX` (3) acciones** (direcciones `@id:0`, se arrastran como las de las funciones; `getList`/`evOk`) y se borra con la ×. Parte 9: un evento por tecla y la tecla es fija (el usado se apaga en la paleta). Libres (partes 10 y 11): el evento nace con «?» y se toca para elegir la tecla en un menú chico (`openKeyMenu`, también acepta apretar una tecla). No corre solo: **Ir** corre «al tocar» (`G.live`) y los eventos **solo se escuchan si el programa tiene el bloque «escuchar eventos»** (`{t:"listen"}`, uno solo, debajo de «al tocar»; al llegar a él GENI espera las teclas, `G.listen`; no cuenta como bloque de la meta; sin él las teclas no hacen nada y se avisa); cada tecla (flechas y espacio, `KEYMAP`, o botones `#keypad`) hace toda la pila de su evento (`press`). `keys` = teclas del nivel (`u d l r s`). `sol` = `tecla:acciones` (una letra por acción, ej. `r:rp s:r`) y `play` = teclas que ganan (`parseEv`, `simulateKeys`, `evCheck` en `engine.ts`). `goal` = bloques de la meta («al tocar» + cada evento + cada acción), `max = goal + 2`. Estrellas por `starsAdv` (1 llegó, +1 dentro de `goal`, +1 sin acciones de más). Chocar o equivocarse no termina: GENI sigue esperando teclas. El cartel «Próximamente» del Mundo 3 (inventario y portal) sigue. **Explosión**: en modo eventos más de `maxAct` (por nivel, si no `MAXACT`) acciones hacen explotar a GENI (`evAfter` → `explode`). **Parte 10 «Eventos libres»** (`evl1`–`evl5`, grupos `EL` y `EM`, `free:true`, `evmax`): el alumno elige la tecla de cada evento tocando el «?» (`openKeyMenu`: tocar una tecla del menú o apretar una —letras, números, flechas, espacio—; `evKeyOf` da el código: flechas `u d l r`, espacio `s`, resto `k:a`). Los eventos tienen id propio (`e1`, `e2`…) y varios pueden compartir tecla (corren de arriba hacia abajo); el control en pantalla muestra solo las teclas elegidas. `sol` de los niveles libres usa solo `u d l r s`. **Parte 11 «Llaves y portales»** (`lq1`–`lq5`, grupos `LP` y `LQ`, Mundo 4, se abre al superar la 10): puzzles en mapas grandes (hasta 11×11) con eventos libres y la mecánica de llaves, puertas y portales de siempre (`k j c` abren `K J C`; portales `O` y `U`). Los mapas necesitan sus llaves/portales (generados con verificación: sin puertas o sin portales no se resuelven). `maxAct` alto (45–70) porque los caminos son largos; `sol` con `u:u d:d l:l r:r` (más `s:p` si hay rojas).
- `selfTest()` valida todo: la solución gana, cabe en el máximo, y además que la función sea necesaria (cls 3), que sin `si` falle y que ningún camino fijo sirva en todos los mundos (Mundos). Cada grupo respeta `need <= 2 × niveles anteriores de la parte`.

## Arquitectura (no romperla)

Next.js es la cáscara. El juego sigue siendo JS de DOM, no un rewrite en React.

| Dónde | Qué |
| --- | --- |
| `app/page.tsx` | Monta `GameApp`. |
| `components/game/*` | Markup estático con los **mismos `id`** del original. |
| `lib/game/ui.ts` | Menú, arrastre, run, tienda, editor. Se bootea **una sola vez**. |
| `lib/game/engine.ts` | Simulación pura, sin DOM. |
| `lib/game/python.ts` | Python de la edición `?python` (parser e intérprete), sin DOM. |
| `lib/game/data.ts` | `PARTS`, `GROUPS`, `MISSIONS`, `CHALLENGES`, `KIDS`. |
| `lib/game/save.ts` | Claves y `freshSave()`. |
| `lib/server/profe.ts` | Solo servidor: base (`DATABASE_URL`, driver `@neondatabase/serverless`), login (`PROFE_USER`, `PROFE_PASS`) y sesión firmada (`PROFE_SECRET`, cookie httpOnly de 8 h). |
| `app/api/profe/*` | `login`, `logout` y `config` (GET: sesión y configuración; POST: guarda las partes ocultas de una vista). |
| `app/game.css` | Estilo del juego. Tailwind no se aplica: su reset cambia botones y títulos. |

`GameApp` llama `boot()` en un `useEffect` vacío. Hay un flag de módulo para no bootear dos veces (Strict Mode). Un re-render de React que pise `innerHTML` borra el juego: no pongas estado de React sobre esos nodos.

`lib/game/data.ts`, `engine.ts` y `ui.ts` son código extraído. No los reescribas en componentes React. Cambiá reglas del juego ahí, con el mismo estilo.

## Cómo trabajar

- Buenas prácticas de **este** Next.js (App Router, archivos en `app/`). Antes de APIs nuevas, leé `node_modules/next/dist/docs/`. Mantené el estilo actual: cáscara React mínima, juego en `lib/game`, CSS propio, español.
- Después de cada feature: `npm run build`. Tiene que terminar bien. El recuento de `selfTest` tiene que seguir verde, en el juego normal, en `?chicos` **y** en `?python`.
- **Nunca** levantes el proyecto (`next dev`, `npm run dev`, `next start`). No es un paso de verificación. Para correr `selfTest` sin servidor: transpilá `data.ts`, `engine.ts` y `python.ts` con el `typescript` del repo en una carpeta temporal y llamá a `selfTest()` con Node (probalo también con `applyKids()` y con `applyPython()` aplicados).
- Si usás subagentes o worktrees, creá los worktrees desde el estado actual del árbol (los cambios sin commitear no están en `HEAD`).
- No dejes HTML suelto en la raíz (`index.html`, `index.legacy.html`). Vercel lo toma como sitio estático, busca `/index.html` y da 404. El deploy es Next.js (`vercel.json`).
- No agregues usuarios (más allá del login del profe), i18n, ni pantallas que el juego no tenga. Las variantes por edad van por URL, no por selector ni rutas.
- No uses Tailwind en el juego. No conviertas las pantallas en rutas.
- Commits y push solo si te los piden.
