-- One-time purchase details for the Unlimited upgrade
ALTER TABLE "Subscription" ADD COLUMN "stripeCheckoutSessionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "amountTotal" INTEGER;
ALTER TABLE "Subscription" ADD COLUMN "currency" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "customerEmail" TEXT;

CREATE UNIQUE INDEX "Subscription_stripeCheckoutSessionId_key" ON "Subscription"("stripeCheckoutSessionId");
