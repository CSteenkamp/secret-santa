import type Stripe from 'stripe';
import { prisma } from '@/lib/db';

/**
 * Records a paid Checkout Session and upgrades the group to Unlimited.
 * Idempotent: the same session can be applied by the success redirect and by
 * the webhook without double-counting.
 */
export async function applyUnlimitedPurchase(session: Stripe.Checkout.Session): Promise<{ applied: boolean; reason?: string }> {
  const groupId = session.metadata?.groupId || session.client_reference_id;
  if (!groupId) return { applied: false, reason: 'no groupId on session' };

  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return { applied: false, reason: `payment_status is ${session.payment_status}` };
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { applied: false, reason: 'group not found' };

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

  await prisma.$transaction([
    prisma.group.update({ where: { id: groupId }, data: { plan: 'unlimited' } }),
    prisma.subscription.upsert({
      where: { groupId },
      update: {
        stripeCustomerId: customerId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        customerEmail: session.customer_details?.email ?? null,
        plan: 'unlimited',
        status: 'active',
        currentPeriodEnd: null,
      },
      create: {
        groupId,
        stripeCustomerId: customerId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        customerEmail: session.customer_details?.email ?? null,
        plan: 'unlimited',
        status: 'active',
      },
    }),
  ]);

  return { applied: true };
}
