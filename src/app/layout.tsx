import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
const inter = Inter({
  variable: "--font-geist-sans", // Keeping variable name for compatibility but using Inter
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloka Protocol | The autonomous run club",
  description: "The run club that replaces its own organizer. An autonomous on-chain agent that runs Cloka without a human touching anything.",
  keywords: ["blockchain", "run club", "autonomous agent", "GOAT network", "web3", "fitness", "x402"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceMono.variable} antialiased bg-black text-white selection:bg-[#FF4500]/30 selection:text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
