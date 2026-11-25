"use client";

import { useEffect } from "react";
import { boot } from "@/lib/game/boot";
import { EditorScreen } from "./EditorScreen";
import { MenuScreen } from "./MenuScreen";
import { PlayScreen } from "./PlayScreen";
import { ShopScreen } from "./ShopScreen";
import { Sky } from "./Sky";
import { TopBar } from "./TopBar";

/* hidden: partes que el profe ocultó en cada vista (se lee en el servidor, app/page.tsx). Solo se usa al bootear. */
export function GameApp({ hidden }: { hidden?: Record<string, number[]> }) {
  useEffect(() => {
    boot(hidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <canvas id="conf" />
      <Sky />
      <TopBar />
      <MenuScreen />
      <PlayScreen />
      <EditorScreen />
      <ShopScreen />
    </>
  );
}
