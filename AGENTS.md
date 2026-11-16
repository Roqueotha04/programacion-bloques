<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Programa con GENI

Juego para el aula: el alumno arma un programa arrastrando bloques y lleva a GENI hasta la estrella. No hay cuentas ni menús nuevos. La única variante por edad es la edición chicos (`?chicos`). El producto es este juego, en español.

## Qué hace el juego

- Siete partes: Secuencia, Pintar, Repetir, Si, Bailar (6 a 8 años), Funciones (9 a 12) y Mundos (13 a 15). Cada una tiene grupos de niveles y un desafío extra con cronómetro. Funciones: el alumno define funciones con nombre libre y las llama (`call`, `cls 3`, `walk(..., funcs)`). Mundos: cada nivel trae varios `worlds` y el programa tiene que ganar en todos (bloque `si no`, condiciones de pared, `selfTest` verifica que no se pueda memorizar).
- Estrellas (1–3) según bloques usados, pista y errores. Progreso en `localStorage` (`robot-bloques-v2`; con `?profe` usa `robot-bloques-profe`).
- Taller: diseños, caras (guiño, enojado, cool) y dos colores (cuerpo y detalle). Editor de mapa propio, borrar progreso (doble toque).
- `?profe` abre todo y muestra códigos. `?test` corre `selfTest()` del motor.
- `?chicos` (6 a 8 años): `applyKids()` en `data.ts` deja solo los niveles de `KIDS` (Secuencia 3,4,5,6,7,9, Pintar 4 a 8 y Bailar completo), saca Repetir, Si, Funciones y Mundos, y suma 30 s a los desafíos. Guarda en `robot-bloques-chicos`. Se combina con `?profe` y `?test`.
- Desbloqueo: una parte se supera con todos sus niveles **y** su desafío extra (al menos 1 estrella). Parte 3 pide el código del profe (`genIArepetir`). Al terminar el último nivel de una parte se invita a jugar el desafío.

Pantallas: menú, juego, editor, taller. Se muestran y ocultan con `.hidden` en el DOM. No son rutas de Next.js.

## Arquitectura (no romperla)

Next.js es la cáscara. El juego sigue siendo JS de DOM, no un rewrite en React.

| Dónde | Qué |
| --- | --- |
| `app/page.tsx` | Monta `GameApp`. |
| `components/game/*` | Markup estático con los **mismos `id`** del original. |
| `lib/game/ui.ts` | Menú, arrastre, run, tienda, editor. Se bootea **una sola vez**. |
| `lib/game/engine.ts` | Simulación pura, sin DOM. |
| `lib/game/data.ts` | `PARTS`, `GROUPS`, `MISSIONS`, `CHALLENGES`. |
| `lib/game/save.ts` | Claves y `freshSave()`. |
| `app/game.css` | Estilo del juego. Tailwind no se aplica: su reset cambia botones y títulos. |

`GameApp` llama `boot()` en un `useEffect` vacío. Hay un flag de módulo para no bootear dos veces (Strict Mode). Un re-render de React que pise `innerHTML` borra el juego: no pongas estado de React sobre esos nodos.

`lib/game/data.ts`, `engine.ts` y `ui.ts` son código extraído. No los reescribas en componentes React. Cambiá reglas del juego ahí, con el mismo estilo.

## Cómo trabajar

- Buenas prácticas de **este** Next.js (App Router, archivos en `app/`). Antes de APIs nuevas, leé `node_modules/next/dist/docs/`. Mantené el estilo actual: cáscara React mínima, juego en `lib/game`, CSS propio, español.
- Después de cada feature: `npm run build`. Tiene que terminar bien. Si hay `?test`, el recuento de `selfTest` tiene que seguir verde.
- **Nunca** levantes el proyecto (`next dev`, `npm run dev`, `next start`). No es un paso de verificación.
- No dejes HTML suelto en la raíz (`index.html`, `index.legacy.html`). Vercel lo toma como sitio estático, busca `/index.html` y da 404. El deploy es Next.js (`vercel.json`).
- No agregues usuarios, i18n, ni pantallas que el juego no tenga. Las variantes por edad van por URL, no por selector ni rutas.
- No uses Tailwind en el juego. No conviertas las pantallas en rutas.
- Commits y push solo si te los piden.
