/**
 * Runs daily. Checks vehicle rego/HVIS expiry dates against configurable
 * thresholds (notification_settings.threshold_days) and emails
 * notification_settings.recipient_email via Resend when a vehicle crosses
 * a threshold. notification_log prevents duplicate emails for the same
 * vehicle/field/threshold/expiry_date combination (so renewing a
 * registration resets alerts, but re-running the job daily does not spam).
 */

async function sbGet(path) {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${base}/rest/v1/${path}`, { headers: { apikey: key, authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Supabase GET ${path} failed: ${await res.text()}`);
  return res.json();
}

async function sbInsert(table, row) {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${base}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  return res.ok;
}

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

function daysUntil(dateStr) {
  const target = new Date(dateStr + 'T00:00:00Z');
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  return Math.round((target - today) / 86400000);
}

export default async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY) {
    console.log('Expiry check skipped: missing required env vars');
    return new Response('skipped', { status: 200 });
  }

  const settingsRows = await sbGet('notification_settings?entity_type=eq.vehicle_expiry&enabled=eq.true&limit=1');
  const settings = settingsRows[0];
  if (!settings) return new Response('no active settings', { status: 200 });

  const thresholds = settings.threshold_days || [30, 14];
  const vehicles = await sbGet('vehicles?select=id,rego,make_model,rego_expiry,hvis_expiry');

  const alerts = [];
  for (const v of vehicles) {
    for (const [field, label] of [['rego_expiry', 'Registration'], ['hvis_expiry', 'HVIS Inspection']]) {
      const dateVal = v[field];
      if (!dateVal) continue;
      const days = daysUntil(dateVal);
      if (days < 0) continue;
      for (const t of thresholds) {
        if (days === t) {
          alerts.push({ vehicle: v, field, label, days, dateVal });
        }
      }
    }
  }

  let sentCount = 0;
  for (const a of alerts) {
    const logged = await sbInsert('notification_log', {
      vehicle_id: a.vehicle.id, field: a.field, expiry_date: a.dateVal, threshold_days: a.days,
    });
    if (!logged) continue; // already sent for this exact combination (unique constraint)
    const subject = `⚠ ${a.vehicle.rego} — ${a.label} expires in ${a.days} days`;
    const html = `<p><strong>${a.vehicle.rego}</strong> (${a.vehicle.make_model || 'vehicle'})</p>
      <p>${a.label} expires on <strong>${a.dateVal}</strong> — that's ${a.days} days from today.</p>
      <p>Log into the DMS Transport Workspace to update this once renewed.</p>`;
    try {
      await sendEmail(settings.recipient_email, subject, html);
      sentCount++;
    } catch (e) {
      console.error('Email send failed', e);
    }
  }

  return Response.json({ ok: true, checked: vehicles.length, alertsSent: sentCount });
};
