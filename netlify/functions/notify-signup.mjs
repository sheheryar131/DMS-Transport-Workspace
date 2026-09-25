/**
 * Fired by a Supabase Database Webhook on INSERT into public.profiles.
 * Emails the admin inbox (transport@dmscare.com.au) so a new sign-up can be
 * approved. Uses transport@dmscare.com.au as the recipient specifically
 * because that's the one address our current Resend setup can reliably
 * deliver to (no verified sending domain yet for arbitrary recipients).
 */
async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'DMS Workspace <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend send failed: ${await res.text()}`);
}

async function sbInsert(table, row) {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  await fetch(`${base}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(row),
  }).catch(() => {});
}

export default async (req) => {
  if (req.headers.get('x-webhook-secret') !== process.env.JOTFORM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  let body;
  try { body = await req.json(); } catch { return new Response('Bad request', { status: 400 }); }
  const record = body.record || {};
  if (!record.id) return Response.json({ ok: false, error: 'no record.id in payload' });

  let email = 'unknown';
  try {
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${record.id}`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const user = await userRes.json();
    if (user?.email) email = user.email;
  } catch {}

  const name = `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'A new user';
  await sbInsert('notifications', {
    type: 'new_signup',
    title: `${name} signed up`,
    body: email,
    related_id: record.id,
  });
  try {
    await sendEmail(
      'transport@dmscare.com.au',
      `New DMS Workspace sign-up: ${name}`,
      `<p><strong>${name}</strong> (${email}) just signed up for DMS Workspace and is waiting for approval.</p>
       <p>Log in, open your profile menu (top right), and approve or decline them from the Pending Approvals list.</p>`
    );
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
  return Response.json({ ok: true });
};
