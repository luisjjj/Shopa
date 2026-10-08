import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingIcons from "@/components/FloatingIcons";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PwaMode } from "@/components/PwaMode";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
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
  metadataBase: new URL("https://myshopa.shop"),
  title: "Shopa | Your Storefront Link",
  description:
    "Create a simple store page for your Instagram & WhatsApp business. Share one link, get paid.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  applicationName: "Shopa",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shopa",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  openGraph: {
    type: "website",
    siteName: "Shopa",
    url: "https://myshopa.shop",
    title: "Shopa | Your Storefront Link",
    description:
      "Create a simple store page for your Instagram & WhatsApp business. Share one link, get paid.",
    images: [
      {
        url: "/landing/hero-seller.jpg",
        width: 1200,
        height: 400,
        alt: "Sell on Shopa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopa | Your Storefront Link",
    description:
      "Create a simple store page for your Instagram & WhatsApp business. Share one link, get paid.",
    images: ["/landing/hero-seller.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ed7712",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const themeCookie = cookieStore.get("shopa-theme")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return (
    <html lang="en" className={initialTheme === "dark" ? "dark" : ""}>
      {supabaseUrl ? <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" /> : null}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider initialTheme={initialTheme}>
          <FloatingIcons />
          <ServiceWorkerRegistration />
          <PwaMode />
          {children}
          <PwaInstallBanner />
          <Analytics />
          <Script
            async
            src="https://www.sabilytics.com/script.js"
            data-site="ncmjvav99f1c"
            data-domain="myshopa.shop"
            strategy="afterInteractive"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
