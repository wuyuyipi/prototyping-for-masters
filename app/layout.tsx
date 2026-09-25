import type { Metadata } from "next";
import { nyghtSerif, hostGrotesk } from "./fonts";
import "./styles/globals.css";
import GlobalBackground from "./components/GlobalBackground";
import MusicPlayer from "./components/MusicPlayer";

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
        {/* Persistent background watermark and signature across all pages */}
        <GlobalBackground />

        {/* Persistent floating music player (CD icon) across all pages */}
        <MusicPlayer />

        {/* Page content with white boxes stacked above background elements */}
        <div className="page-content-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}

