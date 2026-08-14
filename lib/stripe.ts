import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'dummy_stripe_secret_key_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-04-10' as any, // Using a stable API version
});
