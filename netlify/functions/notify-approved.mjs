/**
 * Fired by a Supabase Database Webhook on UPDATE of public.profiles.
 * Best-effort email to the newly-approved user letting them know they can
 * log in now. This will silently fail to deliver until Resend has a
 * verified sending domain for arbitrary recipients — that's expected and
 * non-fatal; the admin should let the person know directly in the meantime.
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

export default async (req) => {
  if (req.headers.get('x-webhook-secret') !== process.env.JOTFORM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  let body;
  try { body = await req.json(); } catch { return new Response('Bad request', { status: 400 }); }
  const record = body.record || {};
  const old = body.old_record || {};
  if (!(old.approved === false && record.approved === true)) {
    return Response.json({ ok: true, skipped: 'not an approval transition' });
  }

  let email = null;
  try {
    const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${record.id}`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const user = await userRes.json();
    email = user?.email || null;
  } catch {}
  if (!email) return Response.json({ ok: false, error: 'could not look up user email' });

  const name = record.first_name || 'there';
  try {
    await sendEmail(
      email,
      "You're approved for DMS Workspace",
      `<p>Hi ${name},</p><p>Your DMS Workspace account has been approved. You can now log in at
       <a href="https://dms-transport-workspace.netlify.app">dms-transport-workspace.netlify.app</a> with your email and password.</p>`
    );
    return Response.json({ ok: true, emailed: email });
  } catch (e) {
    return Response.json({ ok: true, emailFailed: String(e) });
  }
};
