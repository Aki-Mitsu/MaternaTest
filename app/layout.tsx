import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { MaternaProvider } from "@/lib/context/MaternaContext";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Materna — Postpartum Maternal Care & Newborn Intelligence",
  description: "A serene, mindful fourth-trimester companion supporting new mothers with newborn tracking, smart wake-window predictions, emotional wellness reflections, and empathetic AI guidance.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Materna",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F7F2F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F7F2F6] text-[#2C1D30] font-sans flex flex-col">
        <MaternaProvider>
          {children}
        </MaternaProvider>
      </body>
    </html>
  );
}
