/**
 * Manual trigger for the "Send test check now" button in Integrations.
 * Not scheduled, so it's directly callable over HTTP (unlike expiry-check-scheduled).
 * Requires the same webhook secret as the Jotform endpoint, so it can't be
 * spammed by anyone who just finds the URL.
 */
import { runExpiryCheck } from './_expiry-check-core.mjs';

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('key') !== process.env.JOTFORM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  const result = await runExpiryCheck();
  return Response.json(result);
};
