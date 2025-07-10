"use client";

import NextAuthSessionProvider from "@/components/SessionProvider";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from 'react-hot-toast';
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
          <Toaster />
          <NextThemesProvider
            attribute="class"
          >
            {children}
          </NextThemesProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
