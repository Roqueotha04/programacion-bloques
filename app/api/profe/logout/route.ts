import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/server/profe";

export async function POST() {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/api/profe", maxAge: 0 });
  return Response.json({ ok: true });
}
