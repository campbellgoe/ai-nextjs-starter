import Navigation from '@/components/Navigation'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { AppProvider } from '@/contexts/AppContext'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interfaces",
  description: "Ask in Chat or Generate challenges from a given prompt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <>
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </>
        </AppProvider>
        <footer className="p-8">Learn with AI App by <Link className="hover:underline hover:scale-105" href="https://massless.ltd">MASSLESS LTD.</Link> | All rights reserved | Copyright &copy; 2025</footer>
      </body>
    </html>
  );
}
