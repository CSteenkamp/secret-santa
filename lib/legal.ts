// Operator details shown on the legal pages. Set in the deployment ConfigMap;
// the defaults match the Realtap Stripe account that receives payments.
export const legal = {
  appName: 'Secret Santa Generator',
  siteUrl: process.env.NEXTAUTH_URL || 'https://secretsanta.realtap.app',
  operator: process.env.LEGAL_OPERATOR || 'Flippingeasy LLC, trading as Realtap',
  contactEmail: process.env.LEGAL_CONTACT_EMAIL || 'support@realtap.app',
  jurisdiction: process.env.LEGAL_JURISDICTION || 'the Republic of South Africa',
  lastUpdated: '9 November 2026',
  priceUsd: '$10',
};
