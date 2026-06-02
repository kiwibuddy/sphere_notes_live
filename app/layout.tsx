import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Instrument_Serif } from "next/font/google";
import { SessionProvider } from "@/lib/session/SessionProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SphereNotes Live",
  description:
    "Real-time companion app for live classroom teaching — Biblical Worldview",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${instrumentSerif.variable} font-sans`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
