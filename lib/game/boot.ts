"use client";

import { boot as bootUi } from "./ui";

export function boot(hidden?: Record<string, number[]>) {
  bootUi(hidden);
}
