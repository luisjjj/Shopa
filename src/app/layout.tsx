import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingIcons from "@/components/FloatingIcons";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shopa — Your Storefront Link",
  description:
    "Create a simple store page for your Instagram & WhatsApp business. Share one link, get paid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const themeCookie = cookieStore.get("shopa-theme")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html lang="en" className={initialTheme === "dark" ? "dark" : ""}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider initialTheme={initialTheme}>
          <FloatingIcons />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
