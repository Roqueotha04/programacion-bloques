import { cookies } from "next/headers";
import { checkLogin, newSession, readHidden, SESSION_COOKIE, SESSION_HOURS } from "@/lib/server/profe";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const user = typeof body.user === "string" ? body.user : "";
  const pass = typeof body.pass === "string" ? body.pass : "";
  const res = checkLogin(user, pass);
  if (res === "config") {
    console.error("Login del profe: faltan PROFE_USER, PROFE_PASS o PROFE_SECRET en las variables de entorno");
    return Response.json({ error: "Falta configurar el usuario del profe en el servidor (variables PROFE_USER, PROFE_PASS y PROFE_SECRET)" }, { status: 500 });
  }
  if (res === "bad") return Response.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  (await cookies()).set(SESSION_COOKIE, newSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/profe", maxAge: SESSION_HOURS * 3600,
  });
  return Response.json({ ok: true, hidden: await readHidden() });
}
