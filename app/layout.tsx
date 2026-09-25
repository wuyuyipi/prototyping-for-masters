import type { Metadata } from "next";
import { nyghtSerif, hostGrotesk } from "./fonts";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Yiping Dong | Prototypes",
  description: "Yiping Dong's personal prototyping workspace for SVA Masters Workshop",
  icons: {
    icon: "/img/Y.svg",
    shortcut: "/img/Y.svg",
    apple: "/img/Y.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nyghtSerif.variable} ${hostGrotesk.variable}`}>
      <body className={hostGrotesk.className}>
        <img 
          src="/img/bg-paint-effect.svg" 
          alt="" 
          className="fixed-bg-paint" 
          aria-hidden="true" 
        />
        {children}
      </body>
    </html>
  );
}

