import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  getStripe,
  isStripeConfigured,
  getUnlimitedPriceId,
  normalizePlan,
  UNLIMITED_PRICE_CENTS,
  UNLIMITED_CURRENCY,
  UNLIMITED_TAX_CODE,
} from '@/lib/stripe';

export const dynamic = 'force-dynamic';

function siteUrl(request: NextRequest): string {
  return (process.env.NEXTAUTH_URL || request.nextUrl.origin).replace(/\/$/, '');
}

// Starts a Stripe Checkout for the one-time Unlimited upgrade of the admin's group.
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isAdmin || !session.adminGroupId) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 403 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Payments are not available right now' }, { status: 503 });
    }

    const groupId = session.adminGroupId;
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    if (normalizePlan(group.plan) === 'unlimited') {
      return NextResponse.json({ error: 'This group already has the Unlimited plan' }, { status: 400 });
    }

    const base = siteUrl(request);
    const priceId = getUnlimitedPriceId();

    const checkout = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: UNLIMITED_CURRENCY,
                unit_amount: UNLIMITED_PRICE_CENTS,
                product_data: {
                  name: 'Secret Santa Unlimited',
                  description: `Unlimited participants for the group "${group.name}" (one-time)`,
                  tax_code: UNLIMITED_TAX_CODE,
                },
              },
            },
      ],
      client_reference_id: groupId,
      metadata: { groupId, plan: 'unlimited', app: 'secret-santa' },
      success_url: `${base}/admin/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/admin/dashboard?checkout=cancelled`,
    });

    if (!checkout.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
