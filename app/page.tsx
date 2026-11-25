import { connection } from "next/server";
import { GameApp } from "@/components/game/GameApp";
import { readHidden } from "@/lib/server/profe";

export default async function Home() {
  await connection(); /* la configuración del profe se lee en cada visita */
  return <GameApp hidden={await readHidden()} />;
}
