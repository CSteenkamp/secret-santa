import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Secret Santa Generator - Free Online Gift Exchange Organizer",
    template: "%s | Secret Santa Generator",
  },
  description: "Free Secret Santa generator for families, friends & offices. Create gift exchange groups, manage wishlists, and automatically assign Secret Santa partners. No registration required!",
  keywords: "secret santa generator, free secret santa, online gift exchange, secret santa app, family gift exchange, office secret santa, wishlist manager, secret santa organizer",
  authors: [{ name: "Secret Santa Generator" }],
  creator: "Secret Santa Generator",
  metadataBase: new URL("https://secretsanta.wagnerway.co.za"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://secretsanta.wagnerway.co.za",
    siteName: "Secret Santa Generator",
    title: "Secret Santa Generator - Free Online Gift Exchange",
    description: "Create and manage Secret Santa gift exchanges for your family, friends, or office. Free, easy to use, and no registration required!",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Secret Santa Generator - Free Online Gift Exchange",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Santa Generator - Free Online Gift Exchange",
    description: "Create and manage Secret Santa gift exchanges for free!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://secretsanta.wagnerway.co.za",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎅</text></svg>" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EF4444" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Secret Santa" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
