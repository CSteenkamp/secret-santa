import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { applyUnlimitedPurchase } from '@/lib/billing';

export const dynamic = 'force-dynamic';

// Called by the admin dashboard after Stripe redirects back. The session is
// re-read from Stripe, so a forged session id or an unpaid session does nothing.
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isAdmin || !session.adminGroupId) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 403 });
    }
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Payments are not available right now' }, { status: 503 });
    }

    const { sessionId } = await request.json();
    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    let checkout;
    try {
      checkout = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch (err) {
      const code = (err as { code?: string; type?: string }).code;
      if (code === 'resource_missing' || (err as { type?: string }).type === 'StripeInvalidRequestError') {
        return NextResponse.json({ error: 'Unknown checkout session' }, { status: 404 });
      }
      throw err;
    }
    const groupId = checkout.metadata?.groupId || checkout.client_reference_id;

    if (groupId !== session.adminGroupId) {
      return NextResponse.json({ error: 'This payment does not belong to your group' }, { status: 403 });
    }

    const result = await applyUnlimitedPurchase(checkout);
    if (!result.applied) {
      return NextResponse.json(
        { error: 'Payment not completed yet', status: checkout.payment_status },
        { status: 402 }
      );
    }

    return NextResponse.json({ success: true, plan: 'unlimited' });
  } catch (error) {
    console.error('Stripe confirm error:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
