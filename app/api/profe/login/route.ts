import { cookies } from "next/headers";
import { checkLogin, newSession, readHidden, SESSION_COOKIE, SESSION_HOURS } from "@/lib/server/profe";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const user = typeof body.user === "string" ? body.user : "";
  const pass = typeof body.pass === "string" ? body.pass : "";
  if (!checkLogin(user, pass)) return Response.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  (await cookies()).set(SESSION_COOKIE, newSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/profe", maxAge: SESSION_HOURS * 3600,
  });
  return Response.json({ ok: true, hidden: await readHidden() });
}
