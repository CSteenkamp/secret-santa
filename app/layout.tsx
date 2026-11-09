import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

// Cloudflare Web Analytics (cookie-less, no personal data). Token is public by design.
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || "9ccd9881df7746f29bd870afad039cfc";

export const metadata: Metadata = {
  title: {
    default: "Free Secret Santa Generator – Online Gift Exchange Organizer",
    template: "%s | Secret Santa Generator",
  },
  description:
    "Free Secret Santa generator for families, friends and offices. Draw names online, share one invite link, collect wishlists. No sign-up, free for up to 10 people.",
  keywords: [
    "secret santa generator",
    "free secret santa",
    "online secret santa",
    "secret santa app",
    "office secret santa",
    "gift exchange organizer",
    "secret santa wishlist",
    "draw names online",
  ],
  applicationName: "Secret Santa Generator",
  authors: [{ name: "Secret Santa Generator" }],
  creator: "Secret Santa Generator",
  metadataBase: new URL("https://secretsanta.wagnerway.co.za"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Secret Santa Generator",
    title: "Free Secret Santa Generator – Online Gift Exchange Organizer",
    description:
      "Draw names online, share one invite link and collect wishlists. Free for groups up to 10, no sign-up required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Secret Santa Generator – Online Gift Exchange Organizer",
    description: "Draw names online, share one invite link and collect wishlists. Free for up to 10 people.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EF4444" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Secret Santa" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <SiteFooter />
        {CF_BEACON_TOKEN && (
          <Script
            id="cf-web-analytics"
            strategy="afterInteractive"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`}
          />
        )}
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
