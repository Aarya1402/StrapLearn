import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

import { getCurrentUser } from "@/lib/server-auth";
import { ShellSwitcher } from "@/components/ShellSwitcher";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StrapLearn — Enterprise LMS",
  description: "Multi-tenant Learning Management System for Corporate Training",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jakarta.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "boost"]}
        >
          {/* MODULE 3 — Auth context available throughout the entire app */}
          <AuthProvider>
            <ShellSwitcher user={user ? { username: user.username, role_type: user.role_type } : null}>
              {children}
            </ShellSwitcher>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
