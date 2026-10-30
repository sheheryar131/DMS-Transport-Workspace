/**
 * Fetches a Jotform-hosted image (signature / photo) on the server and returns the bytes with CORS enabled,
 * so the browser can embed it into a PDF. Browsers can't read these images directly (no CORS headers).
 * Locked down: requires x-webhook-secret, and only jotform.com upload URLs are allowed.
 */
const ALLOWED = /^(?:[a-z0-9-]+\.)*jotform\.com$/i;

export default async (req) => {
  const secret = process.env.JOTFORM_WEBHOOK_SECRET;
  if (!secret || req.headers.get('x-webhook-secret') !== secret) return new Response('Unauthorized', { status: 401 });
  const target = new URL(req.url).searchParams.get('url') || '';
  let u;
  try { u = new URL(target); } catch { return new Response('Bad url', { status: 400 }); }
  if (u.protocol !== 'https:' || !ALLOWED.test(u.hostname) || !u.pathname.startsWith('/uploads/')) return new Response('Host or path not allowed', { status: 403 });
  const headers = {};
  if (process.env.JOTFORM_API_KEY) headers.APIKEY = process.env.JOTFORM_API_KEY;
  const res = await fetch(u.toString(), { headers, redirect: 'follow' });
  if (!res.ok) return new Response(`Upstream ${res.status}`, { status: 502 });
  const type = res.headers.get('content-type') || 'application/octet-stream';
  if (!/^image\//i.test(type)) return new Response('Not an image', { status: 415 });
  const buf = await res.arrayBuffer();
  if (buf.byteLength > 8 * 1024 * 1024) return new Response('Too large', { status: 413 });
  return new Response(buf, { headers: { 'content-type': type, 'cache-control': 'private, max-age=3600' } });
};
