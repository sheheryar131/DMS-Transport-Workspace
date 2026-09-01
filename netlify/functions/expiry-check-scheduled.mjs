import { runExpiryCheck } from './_expiry-check-core.mjs';

export default async () => {
  const result = await runExpiryCheck();
  return Response.json(result);
};
