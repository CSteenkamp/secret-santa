import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Secret Santa Generator – Online Gift Exchange Organizer",
  description:
    "Free Secret Santa generator for families, friends and offices. Draw names online, share one invite link, collect wishlists. No sign-up, free for up to 10 people.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Free Secret Santa Generator – Online Gift Exchange Organizer",
    description:
      "Draw names online, share one invite link and collect wishlists. Free for groups up to 10, no sign-up required.",
    url: "/",
    type: "website",
  },
};

export default function Home() {
  const webAppStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Secret Santa Generator",
    "description": "Free online Secret Santa generator to organize gift exchanges for families, friends, and offices. Create groups, manage wishlists, and automatically assign Secret Santa partners.",
    "url": "https://secretsanta.wagnerway.co.za",
    "applicationCategory": "Lifestyle",
    "operatingSystem": "All",
    "offers": [
      {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free plan — up to 10 participants per group"
      },
      {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "USD",
        "description": "Unlimited plan — unlimited participants, one-time payment"
      }
    ],
    "featureList": [
      "Create unlimited Secret Santa groups",
      "Automatic random assignment algorithm",
      "Wishlist management with links",
      "Email magic link authentication",
      "Code-based simple login",
      "Mobile responsive design",
      "Multi-currency budget support",
      "No registration required"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Secret Santa Generator",
      "url": "https://secretsanta.wagnerway.co.za"
    },
    "screenshot": "https://secretsanta.wagnerway.co.za/opengraph-image",
    "softwareVersion": "2.1"
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a Secret Santa generator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Secret Santa generator is a free online tool that randomly assigns gift-giving partners within a group. Each person is secretly assigned another person to buy a gift for, making holiday gift exchanges fun, fair, and surprising. Our Secret Santa app handles the entire process digitally."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Secret Santa Generator work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply create a group, add participants with their names and optional emails, share the invite code, and click generate. Our algorithm randomly assigns each person a unique gift recipient, ensuring no one gets themselves and everyone has exactly one person to buy for."
        }
      },
      {
        "@type": "Question",
        "name": "Is this Secret Santa app free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our Secret Santa generator is free for groups of up to 10 participants. If you need more than 10 people in a group, you can unlock unlimited participants with a one-time $10 payment."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to create an account or register?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No registration is required. Group admins set a password during group creation, and participants receive unique login codes. You can also optionally use email magic links for passwordless login."
        }
      },
      {
        "@type": "Question",
        "name": "How many people can participate in a Secret Santa group?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You need a minimum of 3 people to generate assignments. The free plan supports up to 10 participants per group. For larger groups, you can unlock unlimited participants with a one-time $10 payment."
        }
      },
      {
        "@type": "Question",
        "name": "Can I set a gift budget for the group?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Admins can set a gift budget with multi-currency support including USD, EUR, GBP, ZAR, and many more. The budget is displayed to all participants so everyone knows the spending limit."
        }
      },
      {
        "@type": "Question",
        "name": "How do wishlists work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each participant can add up to 5 items to their wishlist, including item names and direct links to products. When Secret Santas are assigned, each giver can see their recipient's wishlist for gift inspiration."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use this for office Secret Santa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Our Secret Santa generator is perfect for office gift exchanges. The admin creates a group, shares the invite code with coworkers, and everyone can join, create wishlists, and discover their Secret Santa assignment."
        }
      },
      {
        "@type": "Question",
        "name": "Is the Secret Santa assignment truly random?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our algorithm uses a secure random assignment system that ensures every participant is randomly assigned a unique recipient. No one is assigned to themselves, and every person receives exactly one gift."
        }
      },
      {
        "@type": "Question",
        "name": "Can assignments be regenerated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, admins can delete existing assignments and regenerate new ones at any time from the admin dashboard. This is useful if participants change or if you want a fresh set of assignments."
        }
      },
      {
        "@type": "Question",
        "name": "Is my Secret Santa assignment kept secret?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Each participant can only see their own assignment when they log in. The admin can see all assignments for management purposes, but regular participants only see who they are buying for."
        }
      },
      {
        "@type": "Question",
        "name": "Does this work on mobile phones?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our Secret Santa app is fully responsive and works perfectly on smartphones, tablets, and desktop computers. Participants can manage their wishlists and check assignments from any device."
        }
      }
    ]
  };

  const howToStructuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Organize a Secret Santa Gift Exchange Online",
    "description": "Step-by-step guide to creating and managing a Secret Santa gift exchange using our free online generator.",
    "totalTime": "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "Create Your Secret Santa Group",
        "text": "Visit the Secret Santa Generator and click 'Create New Group'. Enter your group name, year, and set an admin password. You'll receive a unique invite code to share with participants.",
        "url": "https://secretsanta.wagnerway.co.za/create",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Add Participants and Share Invite Codes",
        "text": "As an admin, add all participants to your group with their names and optional email addresses. Share the group invite code and individual login codes with each person so they can join and create their wishlists.",
        "url": "https://secretsanta.wagnerway.co.za/admin/dashboard",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Generate Secret Santa Assignments",
        "text": "Once all participants have joined and created their wishlists, click 'Generate Assignments' in the admin dashboard. The algorithm will randomly assign each person a Secret Santa recipient. Everyone can then log in to see who they're buying for and view their recipient's wishlist.",
        "url": "https://secretsanta.wagnerway.co.za/admin/dashboard",
        "position": 3
      }
    ]
  };

  const faqs = [
    {
      q: "What is a Secret Santa generator?",
      a: "A Secret Santa generator is a free online tool that randomly assigns gift-giving partners within a group. Each person is secretly assigned another person to buy a gift for, making holiday gift exchanges fun, fair, and surprising. Our Secret Santa app handles the entire process digitally, from group creation to wishlist management and random assignments."
    },
    {
      q: "How does the Secret Santa Generator work?",
      a: "It's simple! Create a group and set an admin password. Then add participants with their names and optional email addresses. Share the invite code with your group. Each person logs in to create their wishlist. When everyone is ready, the admin clicks one button to generate random assignments. Each participant then sees who they're buying for and can view their recipient's wishlist."
    },
    {
      q: "Is this Secret Santa app free?",
      a: "Yes, our Secret Santa generator is free for groups of up to 10 participants. You get unlimited groups, wishlist management, and random assignments at no cost. If you need more than 10 people in a group, you can unlock unlimited participants with a one-time $10 payment."
    },
    {
      q: "Do I need to create an account or register?",
      a: "No registration is required! Group admins set a password during group creation, and participants receive unique login codes. You can also optionally use email magic links for passwordless login, making it even easier to participate."
    },
    {
      q: "How many people can participate in a Secret Santa group?",
      a: "You need a minimum of 3 people to generate assignments. The free plan supports up to 10 participants per group. For larger groups like office parties, you can unlock unlimited participants with a one-time $10 payment."
    },
    {
      q: "Can I set a gift budget for my Secret Santa group?",
      a: "Absolutely! Admins can set a gift budget with multi-currency support including USD, EUR, GBP, ZAR, CAD, AUD, and many more currencies. The budget is displayed to all participants so everyone knows the spending limit for their gift."
    },
    {
      q: "How do wishlists work in the Secret Santa app?",
      a: "Each participant can add up to 5 items to their personal wishlist, including item names and direct links to products online. When Secret Santa assignments are generated, each gift giver can see their assigned recipient's wishlist, making it easy to choose the perfect gift."
    },
    {
      q: "Can I use this for an office Secret Santa?",
      a: "Our Secret Santa generator is perfect for office gift exchanges! The organizer creates a group, shares the invite code with coworkers via email or Slack, and everyone can join at their convenience. The digital format means no awkward paper draws and remote team members can participate too."
    },
    {
      q: "Is the Secret Santa assignment truly random and fair?",
      a: "Yes, our algorithm uses a cryptographically secure random assignment system that ensures every participant is randomly assigned a unique recipient. No one is assigned to themselves, and every person both gives and receives exactly one gift. The assignments are completely unbiased."
    },
    {
      q: "Can Secret Santa assignments be regenerated?",
      a: "Yes! Admins can delete existing assignments and regenerate new random ones at any time from the admin dashboard. This is useful if participants change, if someone accidentally sees another's assignment, or if you simply want a fresh set of pairings."
    },
    {
      q: "Is my Secret Santa assignment kept private and secret?",
      a: "Absolutely. Each participant can only see their own Secret Santa assignment when they log in with their unique code. Other participants cannot see who is buying for whom. The admin can view all assignments for management purposes, but regular participants only see their own assigned recipient."
    },
    {
      q: "Does this Secret Santa app work on mobile phones and tablets?",
      a: "Yes! Our Secret Santa app is fully responsive and works beautifully on smartphones, tablets, and desktop computers. Participants can create wishlists, check their assignments, and manage their Secret Santa experience from any device with a web browser."
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData) }}
      />

      <div className="min-h-screen bg-santa-dark text-santa-snow overflow-x-hidden">
        {/* Hero Section */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-[10%] text-4xl animate-twinkle">*</div>
            <div className="absolute top-20 left-[30%] text-2xl animate-twinkle" style={{ animationDelay: '0.5s' }}>*</div>
            <div className="absolute top-8 left-[50%] text-3xl animate-twinkle" style={{ animationDelay: '1s' }}>*</div>
            <div className="absolute top-16 left-[70%] text-2xl animate-twinkle" style={{ animationDelay: '1.5s' }}>*</div>
            <div className="absolute top-12 left-[90%] text-4xl animate-twinkle" style={{ animationDelay: '0.3s' }}>*</div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="text-7xl mb-6">🎅</div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 font-display">
                <span className="text-santa-red">Secret</span>{" "}
                <span className="text-santa-green">Santa</span>{" "}
                <span className="text-santa-gold">Generator</span>
              </h1>
              <p className="text-lg sm:text-2xl md:text-3xl text-santa-gold mb-4 font-semibold">
                Free Online Gift Exchange Organizer
              </p>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Create magical Secret Santa experiences for your family, friends, or office.
                Our free secret santa app handles everything &mdash; from random assignments to wishlist management.
                No registration required, just pure holiday fun!
              </p>

              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-300 mb-10" aria-label="Key benefits">
                <li>✅ No sign-up or app download</li>
                <li>✅ Free for groups up to 10</li>
                <li>✅ One invite link for everyone</li>
                <li>✅ Wishlists with product links</li>
                <li>✅ Works on any phone</li>
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                <Link
                  href="/create"
                  className="group bg-gradient-to-br from-santa-green to-santa-green-dark p-8 rounded-2xl card-glow transition-all duration-300 hover:scale-105"
                >
                  <div className="text-5xl mb-4">🎄</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create New Group</h2>
                  <p className="text-green-100 mb-3 text-sm">
                    Start a new Secret Santa event for your family, friends, or coworkers
                  </p>
                  <span className="text-santa-gold font-semibold group-hover:underline">
                    Get Started &rarr;
                  </span>
                </Link>

                <Link
                  href="/join"
                  className="group bg-gradient-to-br from-santa-red to-santa-red-dark p-8 rounded-2xl card-glow transition-all duration-300 hover:scale-105"
                >
                  <div className="text-5xl mb-4">🎁</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Join Existing Group</h2>
                  <p className="text-red-100 mb-3 text-sm">
                    Have an invite code? Join your family&apos;s or office gift exchange group
                  </p>
                  <span className="text-santa-gold font-semibold group-hover:underline">
                    Join Now &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-santa-gold/30 to-transparent"></div>
        </header>

        {/* How It Works Section */}
        <section className="py-20 bg-[#151528]" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 id="how-it-works-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
                How It Works &mdash; <span className="text-santa-gold">Simple as 1, 2, 3!</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Organize your online gift exchange in minutes with our free secret santa generator
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center p-8 bg-santa-dark rounded-2xl border border-santa-green/20 card-glow">
                <div className="w-16 h-16 bg-santa-green/20 rounded-full flex items-center justify-center text-2xl font-bold text-santa-green mx-auto mb-5 border-2 border-santa-green/40">1</div>
                <h3 className="text-xl font-bold text-santa-green mb-3">Create Your Group</h3>
                <p className="text-gray-400">
                  Set up a new Secret Santa group with a name, year, and admin password. Add participants with names and optional email addresses. Each person gets a unique login code.
                </p>
              </div>

              <div className="text-center p-8 bg-santa-dark rounded-2xl border border-santa-red/20 card-glow">
                <div className="w-16 h-16 bg-santa-red/20 rounded-full flex items-center justify-center text-2xl font-bold text-santa-red mx-auto mb-5 border-2 border-santa-red/40">2</div>
                <h3 className="text-xl font-bold text-santa-red mb-3">Share &amp; Create Wishlists</h3>
                <p className="text-gray-400">
                  Share the invite code with your group. Everyone logs in using their code or email magic link to create a wishlist with gift ideas and product links.
                </p>
              </div>

              <div className="text-center p-8 bg-santa-dark rounded-2xl border border-santa-gold/20 card-glow">
                <div className="w-16 h-16 bg-santa-gold/20 rounded-full flex items-center justify-center text-2xl font-bold text-santa-gold mx-auto mb-5 border-2 border-santa-gold/40">3</div>
                <h3 className="text-xl font-bold text-santa-gold mb-3">Generate Assignments</h3>
                <p className="text-gray-400">
                  One click randomly assigns Secret Santas. Everyone logs in to discover who they&apos;re buying for and view their recipient&apos;s wishlist. It&apos;s that simple!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-santa-dark" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 id="features-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
                Why Choose Our <span className="text-santa-red">Secret Santa</span> App?
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The easiest way to organize a family gift exchange or office Secret Santa
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="p-6 bg-[#151528] rounded-2xl border border-white/5 card-glow">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-santa-gold mb-2">Smart Random Assignment</h3>
                <p className="text-gray-400 text-sm">
                  Our secret santa generator uses a secure algorithm ensuring everyone gets exactly one recipient with no duplicates or self-assignments. Truly random and fair every time.
                </p>
              </div>

              <div className="p-6 bg-[#151528] rounded-2xl border border-white/5 card-glow">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-santa-gold mb-2">Wishlist Manager</h3>
                <p className="text-gray-400 text-sm">
                  Each participant creates a wishlist with up to 5 items including direct product links. Your Secret Santa sees exactly what you want &mdash; no more guessing games!
                </p>
              </div>

              <div className="p-6 bg-[#151528] rounded-2xl border border-white/5 card-glow">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-bold text-santa-gold mb-2">Private &amp; Secure</h3>
                <p className="text-gray-400 text-sm">
                  Each group is completely isolated with unique invite codes. Choose between simple login codes or email magic links. Your Secret Santa assignment stays secret.
                </p>
              </div>

              <div className="p-6 bg-[#151528] rounded-2xl border border-white/5 card-glow">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-lg font-bold text-santa-gold mb-2">Multi-Currency Budgets</h3>
                <p className="text-gray-400 text-sm">
                  Set a gift budget in any currency &mdash; USD, EUR, GBP, ZAR, and more. Everyone knows the spending limit so the gift exchange is fair and comfortable for all.
                </p>
              </div>

              <div className="p-6 bg-[#151528] rounded-2xl border border-white/5 card-glow">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-santa-gold mb-2">Works Everywhere</h3>
                <p className="text-gray-400 text-sm">
                  Fully responsive design works beautifully on phones, tablets, and desktops. Manage your Secret Santa organizer from anywhere, anytime &mdash; perfect for remote teams.
                </p>
              </div>

              <div className="p-6 bg-[#151528] rounded-2xl border border-white/5 card-glow">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-lg font-bold text-santa-gold mb-2">No Registration Required</h3>
                <p className="text-gray-400 text-sm">
                  No sign-ups, no accounts needed. Free for groups up to 10 people. Need more? Unlock unlimited participants for a one-time $10 payment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-[#151528]" aria-labelledby="pricing-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="pricing-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
              <span className="text-santa-gold">Simple</span> Pricing
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Free for groups up to 10 people. One simple upgrade for bigger groups.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free Tier */}
              <div className="bg-santa-dark rounded-2xl border-2 border-white/10 p-8 card-glow">
                <div className="text-4xl mb-3">🎁</div>
                <div className="text-santa-green text-sm font-semibold uppercase tracking-wider mb-2">Free</div>
                <div className="text-5xl font-bold text-white mb-2">$0</div>
                <p className="text-gray-400 mb-6">No credit card needed</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-green mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Up to 10 participants per group</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-green mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Unlimited groups</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-green mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Wishlist management (5 items)</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-green mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Random assignments</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-green mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Email magic link login</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-green mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Multi-currency budgets</span>
                  </li>
                </ul>

                <Link
                  href="/create"
                  className="block w-full bg-santa-green text-white py-3 rounded-xl font-bold text-lg hover:bg-santa-green-dark transition-colors"
                >
                  Get Started &rarr;
                </Link>
              </div>

              {/* Unlimited Tier */}
              <div className="bg-santa-dark rounded-2xl border-2 border-santa-gold/30 p-8 card-glow relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-santa-gold text-santa-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Best Value</div>
                <div className="text-4xl mb-3">🏆</div>
                <div className="text-santa-gold text-sm font-semibold uppercase tracking-wider mb-2">Unlimited</div>
                <div className="text-5xl font-bold text-white mb-2">$10</div>
                <p className="text-gray-400 mb-6">One-time payment</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-gold mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Everything in Free</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-gold mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Unlimited participants per group</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-santa-gold mr-3 mt-0.5 flex-shrink-0">&#10003;</span> <span>Pay once, use forever</span>
                  </li>
                </ul>

                <Link
                  href="/create"
                  className="block w-full bg-santa-gold text-santa-dark py-3 rounded-xl font-bold text-lg hover:bg-santa-gold-dark transition-colors text-center"
                >
                  Create a Group &rarr;
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  Upgrade any group from its admin dashboard. Secure checkout by Stripe. See our{" "}
                  <Link href="/refunds" className="underline hover:text-santa-gold">refund policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {/* Guides: evergreen content for organisers searching how to run a Secret Santa */}
        <section className="py-20 bg-[#151528]" aria-labelledby="guides-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 id="guides-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
                How to Run a <span className="text-santa-green">Secret Santa</span> That Actually Works
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
                Quick, practical answers to the questions every organizer asks, whether it&apos;s a family draw or an office gift exchange.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <article className="bg-santa-dark/60 p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-santa-gold mb-3">Secret Santa rules, in 30 seconds</h3>
                <p className="text-gray-400 leading-relaxed">
                  Everyone in the group is secretly matched with one other person to buy a gift for. Nobody draws themselves,
                  everyone gives exactly one gift and receives exactly one, and the giver stays anonymous until the reveal.
                  Agree a budget up front so gifts feel fair, set a date for the exchange, and ask people to add a few wishlist
                  ideas so nobody has to guess. Our generator enforces the no-self-draw rule automatically.
                </p>
              </article>

              <article className="bg-santa-dark/60 p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-santa-gold mb-3">Organizing an office Secret Santa</h3>
                <p className="text-gray-400 leading-relaxed">
                  Keep it opt-in and keep the budget modest: $10 to $25 works for most teams. Create the group, paste the
                  join link into Slack, Teams or an email, and send each colleague their personal code. People who join late
                  can be added right up until you generate the draw. For teams larger than 10 people, the one-time Unlimited
                  upgrade removes the participant cap for that group.
                </p>
              </article>

              <article className="bg-santa-dark/60 p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-santa-gold mb-3">Virtual Secret Santa for remote teams and far-flung families</h3>
                <p className="text-gray-400 leading-relaxed">
                  Because the draw happens online, nobody needs to be in the same room. Each person logs in from their phone,
                  sees only their own match, and can open their recipient&apos;s wishlist links to order a gift straight to their
                  door. Set the budget in the currency your group actually uses, from ZAR and GBP to USD and EUR.
                </p>
              </article>

              <article className="bg-santa-dark/60 p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold text-santa-gold mb-3">Secret Santa gift ideas that land</h3>
                <p className="text-gray-400 leading-relaxed">
                  The best gifts come from the wishlist, so nudge everyone to add three to five items with links. If a
                  wishlist is empty, safe bets under most budgets are good coffee or tea, a quality notebook, cosy socks,
                  a board game, a scented candle, or a voucher for a local coffee shop. Check the budget the organizer set
                  before you shop; it is shown on your wishlist page.
                </p>
              </article>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/create"
                className="inline-block bg-santa-green text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-santa-green-dark transition-colors hover:scale-105 transform duration-300"
              >
                Start your Secret Santa group, it&apos;s free &rarr;
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-santa-dark" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 id="faq-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
                Frequently Asked <span className="text-santa-red">Questions</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Everything you need to know about our free Secret Santa generator
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-[#151528] rounded-xl border border-white/5 overflow-hidden"
                >
                  <summary className="cursor-pointer p-6 flex items-center justify-between font-semibold text-santa-snow hover:text-santa-gold transition-colors">
                    <span className="pr-4">{faq.q}</span>
                    <span className="text-santa-gold flex-shrink-0 text-xl group-open:rotate-45 transition-transform duration-200">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-santa-red-dark via-santa-red to-santa-green" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-white font-display">
              Ready to Create Your Secret Santa Magic?
            </h2>
            <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
              Set up your group in about two minutes. Free for up to 10 people, no account needed, and everyone gets one link to join.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="bg-white text-santa-red px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-santa-snow transition-colors hover:scale-105 transform duration-300 min-h-[48px]"
              >
                🎄 Create New Group
              </Link>
              <Link
                href="/join"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-santa-green transition-all hover:scale-105 transform duration-300 min-h-[48px]"
              >
                🎁 Join Existing Group
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0F0F1E] py-12 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold mb-3">
                  <span className="text-santa-red">Secret</span>{" "}
                  <span className="text-santa-green">Santa</span>{" "}
                  <span className="text-santa-gold">🎅</span>
                </div>
                <p className="text-gray-500 text-sm">
                  The free online Secret Santa generator for organizing magical gift exchanges with your loved ones.
                </p>
              </div>

              <div>
                <h3 className="text-santa-gold font-semibold mb-3">Quick Links</h3>
                <nav aria-label="Footer navigation">
                  <ul className="space-y-2">
                    <li><Link href="/create" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Create Group</Link></li>
                    <li><Link href="/join" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Join Group</Link></li>
                    <li><Link href="/login" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Participant Login</Link></li>
                    <li><a href="#pricing-heading" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Pricing</a></li>
                  </ul>
                </nav>
                <h3 className="text-santa-gold font-semibold mb-3 mt-6">Legal</h3>
                <nav aria-label="Legal">
                  <ul className="space-y-2">
                    <li><Link href="/terms" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Terms of Service</Link></li>
                    <li><Link href="/privacy" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Privacy Policy</Link></li>
                    <li><Link href="/refunds" className="text-gray-400 hover:text-santa-gold transition-colors text-sm">Refund Policy</Link></li>
                  </ul>
                </nav>
              </div>

              <div>
                <h3 className="text-santa-gold font-semibold mb-3">About</h3>
                <p className="text-gray-500 text-sm">
                  Built with love for the holiday season. Our secret santa app makes gift exchange organizing effortless and fun for families, friend groups, and offices worldwide.
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 text-center">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Secret Santa Generator &bull; Free Online Gift Exchange Tool &bull;{" "}
                <a href="https://secretsanta.wagnerway.co.za" className="text-santa-gold hover:text-santa-gold-dark transition-colors">
                  secretsanta.wagnerway.co.za
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
