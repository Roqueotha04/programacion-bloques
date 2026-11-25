import { cookies } from "next/headers";
import { EDITIONS, type Edition, readHidden, SESSION_COOKIE, validSession, writeHidden } from "@/lib/server/profe";

async function logged() {
  return validSession((await cookies()).get(SESSION_COOKIE)?.value);
}

/* GET: ¿sigue la sesión? (para no pedir el login de nuevo) y la configuración actual */
export async function GET() {
  if (!(await logged())) return Response.json({ error: "Sesión vencida" }, { status: 401 });
  return Response.json({ ok: true, hidden: await readHidden() });
}

/* POST {edition, hidden:[4.5, 5.5]}: guarda las partes ocultas de una vista */
export async function POST(request: Request) {
  if (!(await logged())) return Response.json({ error: "Sesión vencida: volvé a entrar" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const edition = body.edition as Edition;
  if (!EDITIONS.includes(edition)) return Response.json({ error: "Vista desconocida" }, { status: 400 });
  if (!Array.isArray(body.hidden) || body.hidden.length > 50 || !body.hidden.every((n: unknown) => typeof n === "number" && Number.isFinite(n)))
    return Response.json({ error: "Lista de partes inválida" }, { status: 400 });
  try {
    await writeHidden(edition, [...new Set<number>(body.hidden)]);
  } catch (e) {
    console.error("game_config: no se pudo guardar", e);
    return Response.json({ error: "No se pudo guardar. Probá de nuevo." }, { status: 500 });
  }
  return Response.json({ ok: true, hidden: await readHidden() });
}
