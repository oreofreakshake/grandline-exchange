import type { Metadata } from "next";
import { Balsamiq_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const balsamiqSans = Balsamiq_Sans({
  variable: "--font-balsamiq-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Grandline Exchange",
  description:
    "Grandline Exchange is a platform for trading Grandline products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${balsamiqSans.variable} ${spaceMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
