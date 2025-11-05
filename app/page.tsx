import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Secret Santa Generator - Organize Gift Exchanges Online | Secret Santa App",
  description: "Free online Secret Santa generator for families, friends, and offices. Create gift exchange groups, manage wishlists, and automatically assign Secret Santa partners. No registration required!",
  keywords: "secret santa, gift exchange, christmas gifts, holiday gift exchange, secret santa generator, family gift exchange, office secret santa, free secret santa app, online gift exchange, wishlist manager",
  openGraph: {
    title: "Free Secret Santa Generator - Organize Gift Exchanges Online",
    description: "Create and manage Secret Santa gift exchanges for your family, friends, or office. Free, easy to use, and no registration required!",
    url: "https://santa.wagnerway.co.za",
    siteName: "Secret Santa Generator",
    type: "website",
    images: [
      {
        url: "https://santa.wagnerway.co.za/og-image.png",
        width: 1200,
        height: 630,
        alt: "Secret Santa Generator - Free Online Gift Exchange"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Secret Santa Generator - Organize Gift Exchanges Online",
    description: "Create and manage Secret Santa gift exchanges for your family, friends, or office. Free, easy to use, and no registration required!",
    images: ["https://santa.wagnerway.co.za/og-image.png"]
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
    canonical: "https://santa.wagnerway.co.za"
  }
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Secret Santa Generator",
    "description": "Free online tool to organize Secret Santa gift exchanges for families, friends, and offices",
    "url": "https://santa.wagnerway.co.za",
    "applicationCategory": "Lifestyle",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Create unlimited Secret Santa groups",
      "Automatic random assignment",
      "Wishlist management",
      "Email and code-based login",
      "Mobile responsive design",
      "No registration required"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Secret Santa Generator"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-red-600 mb-6">
              Free Secret Santa Generator
            </h1>
            <p className="text-2xl md:text-3xl text-gray-800 mb-4 font-semibold">
              Organize Perfect Gift Exchanges Online
            </p>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create magical Secret Santa experiences for your family, friends, or office.
              Our free online tool handles everything - from random assignments to wishlist management.
              No registration required, just pure holiday fun!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Link
                href="/create"
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-green-200"
              >
                <div className="text-green-600 text-6xl mb-4">🎄</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Create New Group</h2>
                <p className="text-gray-700 mb-4">
                  Start a new Secret Santa event for your family, friends, or coworkers
                </p>
                <div className="text-green-600 font-semibold group-hover:underline text-lg">
                  Get Started →
                </div>
              </Link>

              <Link
                href="/join"
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-red-200"
              >
                <div className="text-red-600 text-6xl mb-4">🎁</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Join Existing Group</h2>
                <p className="text-gray-700 mb-4">
                  Have an invite code? Join your family&apos;s or office Secret Santa group
                </p>
                <div className="text-red-600 font-semibold group-hover:underline text-lg">
                  Join Now →
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Secret Santa Generator?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The easiest way to organize gift exchanges for any group size
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Automatic Assignment</h3>
                <p className="text-gray-600">
                  Smart algorithm ensures everyone gets exactly one person to buy for, with no duplicates or self-assignments
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Wishlist Management</h3>
                <p className="text-gray-600">
                  Participants can create wishlists with links to specific items, making gift selection easy and thoughtful
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Private & Secure</h3>
                <p className="text-gray-600">
                  Each group is completely isolated with unique codes. Optional email login or simple code-based access
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Completely Free</h3>
                <p className="text-gray-600">
                  No hidden fees, no premium features, no registration required. Just a simple, free tool for everyone
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Friendly</h3>
                <p className="text-gray-600">
                  Works perfectly on phones, tablets, and computers. Manage your Secret Santa anywhere, anytime
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Any Group Size</h3>
                <p className="text-gray-600">
                  Perfect for small families or large offices. Support for unlimited participants in each group
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-r from-green-50 to-red-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works - Simple as 1, 2, 3!
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Group</h3>
                <p className="text-gray-600">
                  Set up a new Secret Santa group, add participants with names and optional email addresses, and get unique login codes
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl font-bold text-red-600 mx-auto mb-4">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Share & Create Wishlists</h3>
                <p className="text-gray-600">
                  Send login codes to participants. Everyone logs in to create their wishlist with gift ideas and links
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Generate Assignments</h3>
                <p className="text-gray-600">
                  Click one button to randomly assign Secret Santas. Everyone sees who they&apos;re buying for and their wishlist!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-green-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Create Your Secret Santa Magic?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of families, friends, and offices who trust our free Secret Santa generator
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                🎄 Start New Group
              </Link>
              <Link
                href="/join"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-red-600 transition-colors"
              >
                🎁 Join Existing Group
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2024 Secret Santa Generator • Free Online Gift Exchange Tool •
              <a href="https://santa.wagnerway.co.za" className="text-green-400 hover:text-green-300 ml-1">
                santa.wagnerway.co.za
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
