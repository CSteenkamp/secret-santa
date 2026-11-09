import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      appInfo: { name: 'Secret Santa', url: process.env.NEXTAUTH_URL },
    });
  }
  return _stripe;
}

// Price of the one-time Unlimited upgrade, in US cents.
export const UNLIMITED_PRICE_CENTS = 1000;
export const UNLIMITED_CURRENCY = 'usd';
// Stripe product tax code for downloadable software, personal use (needed by
// Managed Payments when a price is created inline).
export const UNLIMITED_TAX_CODE = 'txcd_10202000';

export const PLANS = {
  free: {
    name: 'Free',
    maxGroups: Infinity,
    maxParticipants: 10,
    maxWishlistItems: 5,
    features: [
      'Unlimited groups',
      'Up to 10 participants per group',
      'Wishlist management (5 items)',
      'Random assignment algorithm',
      'Email magic link login',
      'Multi-currency budget support',
      'Mobile-friendly design',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    price: '$10',
    priceUsd: '$10 USD',
    maxGroups: Infinity,
    maxParticipants: Infinity,
    maxWishlistItems: 5,
    features: [
      'Everything in Free',
      'Unlimited participants per group',
      'One-time payment',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Legacy groups may still carry "plus" or "pro"; both map to unlimited.
export function normalizePlan(raw: string | null | undefined): PlanType {
  if (raw === 'unlimited' || raw === 'plus' || raw === 'pro') return 'unlimited';
  return 'free';
}

export function getPlanLimits(plan: PlanType) {
  return PLANS[plan];
}

export function canAddParticipant(plan: PlanType, currentCount: number): boolean {
  return currentCount < PLANS[plan].maxParticipants;
}

export function getMaxWishlistItems(plan: PlanType): number {
  return PLANS[plan].maxWishlistItems;
}

// The Stripe Price for the Unlimited upgrade. When unset, Checkout is given an
// inline price instead, so payments still work before the product exists.
export function getUnlimitedPriceId(): string | undefined {
  return process.env.STRIPE_PRICE_UNLIMITED || undefined;
}
