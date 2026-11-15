import type { Metadata } from "next";
import "./globals.css";
import "./game.css";

export const metadata: Metadata = {
  title: "Programación por bloques",
  description:
    "Arrastrá los bloques, armá el programa y llevá al robot hasta la estrella.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
