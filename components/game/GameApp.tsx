"use client";

import { useEffect } from "react";
import { boot } from "@/lib/game/boot";
import { EditorScreen } from "./EditorScreen";
import { MenuScreen } from "./MenuScreen";
import { PlayScreen } from "./PlayScreen";
import { ShopScreen } from "./ShopScreen";
import { Sky } from "./Sky";
import { TopBar } from "./TopBar";

export function GameApp() {
  useEffect(() => {
    boot();
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
