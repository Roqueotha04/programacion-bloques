/* Solo servidor: configuración del profe (partes ocultas por vista) y su sesión.
   Tabla: db/game_config.sql. Variables: DATABASE_URL, PROFE_USER, PROFE_PASS, PROFE_SECRET. */
import { neon } from "@neondatabase/serverless";
import { createHmac, timingSafeEqual } from "node:crypto";

export const EDITIONS = ["normal", "chicos", "python"] as const;
export type Edition = (typeof EDITIONS)[number];
export type HiddenConfig = Record<Edition, number[]>;

export const SESSION_COOKIE = "genia-profe";
export const SESSION_HOURS = 8;

const empty = (): HiddenConfig => ({ normal: [], chicos: [], python: [] });

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  return neon(url);
}

/* nunca falla: si la base no responde, no se oculta nada y el juego anda igual */
export async function readHidden(): Promise<HiddenConfig> {
  const cfg = empty();
  try {
    const rows = await db()`select edition, hidden from game_config`;
    for (const r of rows) {
      if ((EDITIONS as readonly string[]).includes(r.edition) && Array.isArray(r.hidden))
        cfg[r.edition as Edition] = r.hidden.filter((n: unknown) => typeof n === "number");
    }
  } catch (e) {
    console.error("game_config: no se pudo leer", e);
  }
  return cfg;
}

export async function writeHidden(edition: Edition, hidden: number[]) {
  await db()`insert into game_config(edition, hidden, updated_at) values (${edition}, ${JSON.stringify(hidden)}::jsonb, now())
    on conflict (edition) do update set hidden = excluded.hidden, updated_at = now()`;
}

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkLogin(user: string, pass: string) {
  const U = process.env.PROFE_USER, P = process.env.PROFE_PASS;
  if (!U || !P) return false;
  return same(user.trim().toLowerCase(), U.toLowerCase()) && same(pass, P);
}

function sign(payload: string) {
  const secret = process.env.PROFE_SECRET;
  if (!secret) throw new Error("Falta PROFE_SECRET");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/* token = vencimiento.firma (la cookie es httpOnly: el navegador no la puede leer ni falsificar) */
export function newSession() {
  const exp = String(Date.now() + SESSION_HOURS * 3600_000);
  return exp + "." + sign(exp);
}

export function validSession(token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try { return same(sig, sign(exp)); } catch { return false; }
}
