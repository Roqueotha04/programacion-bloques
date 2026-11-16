<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Programa con GENI

Juego para el aula: el alumno arma un programa arrastrando bloques y lleva a GENI hasta la estrella. No hay cuentas ni menús nuevos. El producto es este juego, en español.

## Partes

Partes, siempre en este orden (**Mundos y Si están comentadas en `data.ts` de momento: no se ven**; el extra «Funciones avanzadas» ocupa la parte 6) (el número de parte es el orden del menú; `data.ts` ordena partes, grupos, niveles y desafíos por número de parte):

| N.º | Parte | Se abre con | Qué enseña |
| --- | --- | --- | --- |
| 1 | Secuencia | — | Mover el robot, baterías. |
| 2 | Pintar | Parte 1 | Pincel (usar y guardar). |
| 3 | Bailar | Parte 2 | Pintar de un toque y bailar (rojas: pintar, verdes: bailar), con baterías. Sin repetir. |
| 4 | Repetir | Parte 3 + código del profe (`genIArepetir`) | Bloque repetir; incluye niveles de repetir con baile y pintura. |
| 5 | Funciones | Parte 2 | Funciones con nombre libre: se definen y se llaman. |
| ~~6~~ | Mundos *(oculta)* | Partes 2 y 4 | Cada nivel trae varios mapas y el programa tiene que ganar en todos (`si`, `si no`, paredes). |
| ~~7~~ | Si *(oculta)* | Partes 2 y 4 | Condicional por color de celda. Siempre es la última. |

- **Parte 6 «Funciones avanzadas» (`extra:true`)**: no cuenta para abrir otras partes. Se abre al superar la parte 5 y no está en `?chicos`. Son niveles `adv` (grupos `Y`, `Z` y `N`): hay que ganar con una función que se llama a sí misma (la recursión corta al llegar a la estrella). Dan hasta **3 estrellas** como todos (`starsAdv`: llegar con recursión, meta de bloques, camino más corto). **En cualquier nivel** (menos «Mi mapa») más de `MAXACT` (30) acciones, o 400 eventos, devuelve `boom`: GENI se marea y explota. `selfTest` valida que cada solución use recursión, el `boom` y que ganar sin recursión no cuenta. Los ids `v1`–`v9` no se renombran. Mundos y Si (partes 6 y 7 anteriores) y sus desafíos `x5` y `x8` están comentados en `data.ts`.
- Cada parte tiene grupos de niveles y un desafío extra con cronómetro (3 niveles seguidos). El desafío **no cuenta** como nivel de la parte.
- Una parte se supera con todos sus niveles **y** su desafío extra (al menos 1 estrella). Al terminar el último nivel de una parte se invita a jugar el desafío.
- Edades pensadas (solo orientativo, no hay selector): 6 a 8 → Secuencia, Pintar, Bailar, Repetir; 9 a 12 → Funciones; 13 a 15 → Mundos.

## Edición chicos (`?chicos`, 6 a 8 años)

- Es **la única variante por edad** y la única URL de edición. No agregues otras URLs de edición salvo que te lo pidan.
- `applyKids()` en `data.ts` deja solo los niveles listados en `KIDS.missions`, saca las partes que quedan sin niveles (Funciones, Mundos, Si) y suma 30 s a los desafíos. Sus partes 3 y 4 son Bailar y Repetir. Guarda en `robot-bloques-chicos`. Se combina con `?profe` y `?test`.
- `KIDS.need` fija las estrellas que pide cada grupo en esta edición (2 por nivel anterior de la parte).
- `KIDS_EXTRA` son niveles que solo existen en esta edición (van justo después del nivel `after`): hoy `r1` y `r2`, los pasillos simples de Repetir.
- **Regla de cantidad: en cada parte, los chicos de 6 a 8 hacen menos o igual cantidad de niveles que el resto, nunca más.** Los niveles exclusivos de `KIDS_EXTRA` cuentan. Lo que se agrega o se saca para el juego normal **no** se le agrega o saca automáticamente a los chicos: la lista `KIDS.missions` se decide aparte. `selfTest` lo controla (`NORMAL_COUNT` en `data.ts`: niveles por parte del juego normal) y falla si los chicos pasan al resto en alguna parte.
- Los ids de nivel son únicos en todo el juego (en chicos un id repetido trae a otra parte).

## Reglas del juego

- Estrellas (1–3) según bloques usados, pista y errores. Progreso en `localStorage` (`robot-bloques-v2`; con `?profe` usa `robot-bloques-profe`). Las estrellas se guardan por id de nivel y el código del profe por número de parte (`SAVE.codes`): **no renombres ids de nivel ni renumeres partes sin migrar el guardado** (hay una migración en `ui.ts`: el código de Repetir pasó de la parte 3 a la 4).
- **Códigos** (botón «Código» arriba a la izquierda del menú): `CLASS_CODES` en `data.ts`. `nivel1-clase2` y `nivel2-clase2` marcan Secuencia y Pintar (niveles y desafío) con 3 estrellas; `nivel3-clase2` marca Secuencia, Pintar y Repetir (Bailar queda sin hacer). Las estrellas se acreditan al taller y repetir el código no suma dos veces. Los tres dan por ingresado el código de Repetir (así se hacen Bailar y Repetir de corrido). Funciones pide `funcionesGENia`. El mismo cuadro acepta los códigos de cada parte.
- Taller: diseños, caras (guiño, enojado, cool) y dos colores (cuerpo y detalle). Editor de mapa propio, borrar progreso (doble toque).
- `?profe` abre todo y muestra códigos. `?test` corre `selfTest()` del motor.
- Pantallas: menú, juego, editor, taller. Se muestran y ocultan con `.hidden` en el DOM. No son rutas de Next.js.

## Cómo se arman los niveles

- `data.ts`: `PARTS`, `GROUPS` (cada grupo fija `cls`, `tools`, `strict`, `need`), `MISSIONS`, `CHALLENGES`. Los niveles heredan `cls/tools/strict/part` de su grupo.
- `cls 1`: meta de bloques; la solución `sol` tiene que ser el camino mínimo (`shortest()`) y sin más de 3 movimientos iguales seguidos. `cls 2`: máximo de bloques (`max`) y hay que usar repetir. `cls 3`: máximo de bloques y hay que usar una función.
- `tools`: `r` repetir, `n` pincel, `p` pintar de un toque, `b` bailar, `i` si, `e` si no, `f` funciones. `strict`: pintar o bailar en la celda equivocada es error.
- Notación de `sol` (`parseSol` en `engine.ts`): `u d l r` mover, `p b n f` acciones, `N(...)` repetir, `?x(...)` si, `!(...)` si no, `A=(...)` define función y `A` la llama.
- Funciones: bloque `call`, `walk(list,test,prefix,funcs)`, nombre libre del alumno (siempre escapado al mostrarlo). Una función solo llama a otra anterior (B llama a A). No se guardan en `localStorage`.
- Mundos: `worlds` (el mundo 0 es `rows`), `pool`/`show` para sortear, `reveal` para mostrar los mundos antes de correr.
- `selfTest()` valida todo: la solución gana, cabe en el máximo, y además que la función sea necesaria (cls 3), que sin `si` falle y que ningún camino fijo sirva en todos los mundos (Mundos). Cada grupo respeta `need <= 2 × niveles anteriores de la parte`.

## Arquitectura (no romperla)

Next.js es la cáscara. El juego sigue siendo JS de DOM, no un rewrite en React.

| Dónde | Qué |
| --- | --- |
| `app/page.tsx` | Monta `GameApp`. |
| `components/game/*` | Markup estático con los **mismos `id`** del original. |
| `lib/game/ui.ts` | Menú, arrastre, run, tienda, editor. Se bootea **una sola vez**. |
| `lib/game/engine.ts` | Simulación pura, sin DOM. |
| `lib/game/data.ts` | `PARTS`, `GROUPS`, `MISSIONS`, `CHALLENGES`, `KIDS`. |
| `lib/game/save.ts` | Claves y `freshSave()`. |
| `app/game.css` | Estilo del juego. Tailwind no se aplica: su reset cambia botones y títulos. |

`GameApp` llama `boot()` en un `useEffect` vacío. Hay un flag de módulo para no bootear dos veces (Strict Mode). Un re-render de React que pise `innerHTML` borra el juego: no pongas estado de React sobre esos nodos.

`lib/game/data.ts`, `engine.ts` y `ui.ts` son código extraído. No los reescribas en componentes React. Cambiá reglas del juego ahí, con el mismo estilo.

## Cómo trabajar

- Buenas prácticas de **este** Next.js (App Router, archivos en `app/`). Antes de APIs nuevas, leé `node_modules/next/dist/docs/`. Mantené el estilo actual: cáscara React mínima, juego en `lib/game`, CSS propio, español.
- Después de cada feature: `npm run build`. Tiene que terminar bien. El recuento de `selfTest` tiene que seguir verde, en el juego normal **y** en `?chicos`.
- **Nunca** levantes el proyecto (`next dev`, `npm run dev`, `next start`). No es un paso de verificación. Para correr `selfTest` sin servidor: transpilá `data.ts` y `engine.ts` con el `typescript` del repo en una carpeta temporal y llamá a `selfTest()` con Node (probalo también con `applyKids()` aplicado).
- Si usás subagentes o worktrees, creá los worktrees desde el estado actual del árbol (los cambios sin commitear no están en `HEAD`).
- No dejes HTML suelto en la raíz (`index.html`, `index.legacy.html`). Vercel lo toma como sitio estático, busca `/index.html` y da 404. El deploy es Next.js (`vercel.json`).
- No agregues usuarios, i18n, ni pantallas que el juego no tenga. Las variantes por edad van por URL, no por selector ni rutas.
- No uses Tailwind en el juego. No conviertas las pantallas en rutas.
- Commits y push solo si te los piden.
