/**
 * One-off / repeatable backfill: pulls historical Jotform submissions for ONE form
 * and routes them into the workspace tables (idempotent — upserts on source_submission_id).
 *
 * POST /.netlify/functions/jotform-backfill   body: {"form":"<jotform form id>"}
 * Header x-webhook-secret must equal JOTFORM_WEBHOOK_SECRET.
 *
 * Source of data:
 *  - If JOTFORM_API_KEY is set (Netlify env var): reads every submission from the Jotform API.
 *  - Otherwise: re-routes whatever raw payloads are already stored in `jotform_submissions`.
 * Set JOTFORM_API_BASE=https://eu-api.jotform.com if the Jotform account is in the EU region.
 */
import { FORM_IDS, route, sbUpsert } from './jotform-webhook.mjs';

const FORM_TABLE = {
  [FORM_IDS.PRE_START]: 'vehicle_checks',
  [FORM_IDS.POST_SHIFT]: 'vehicle_checks',
  [FORM_IDS.BOOKING]: 'bookings',
  [FORM_IDS.BOOKING_NDIS_HCP]: 'bookings',
  [FORM_IDS.TRANSPORT_SERVICE_LOG]: 'transfer_logs',
  [FORM_IDS.INCIDENT]: 'incidents',
  [FORM_IDS.ORIENTATION]: 'orientation_checklists',
  [FORM_IDS.SIL_MAINTENANCE]: 'sil_maintenance_checks',
  [FORM_IDS.FIRST_AID]: 'first_aid_checks',
  [FORM_IDS.SIL_VISITOR]: 'sil_visitor_checkins',
  [FORM_IDS.FEEDBACK]: 'feedback_submissions',
  [FORM_IDS.MEDICATION_CHECK]: 'medication_checks',
  [FORM_IDS.MAINTENANCE_REGISTER]: 'maintenance_register',
};

const sbHeaders = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' };
};

// Convert a Jotform API submission into the same shape the webhook's rawRequest has (q{id}_{name} keys).
function toRawRequest(sub) {
  const out = { formID: sub.form_id, submissionID: sub.id };
  for (const [qid, a] of Object.entries(sub.answers || {})) {
    if (!a || !a.name) continue;
    const v = a.answer;
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
    out[`q${qid}_${a.name}`] = v;
  }
  return out;
}

async function fetchAllFromJotform(formId) {
  const base = process.env.JOTFORM_API_BASE || 'https://api.jotform.com';
  const all = [];
  for (let offset = 0; offset < 5000; offset += 100) {
    const url = `${base}/form/${formId}/submissions?apiKey=${encodeURIComponent(process.env.JOTFORM_API_KEY)}&limit=100&offset=${offset}&orderby=created_at&direction=ASC`;
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.responseCode >= 400) throw new Error(`Jotform API ${res.status}: ${json.message || 'error'}`);
    const page = json.content || [];
    all.push(...page);
    if (page.length < 100) break;
  }
  return all.filter((s) => s.status !== 'DELETED');
}

async function fetchStored(formId) {
  const base = process.env.SUPABASE_URL;
  const rows = await fetch(`${base}/rest/v1/jotform_submissions?form_id=eq.${formId}&select=form_id,submission_id,payload,received_at&order=received_at.asc&limit=1000`, { headers: sbHeaders() }).then((r) => r.json());
  return rows.map((r) => ({ id: r.submission_id, created_at: r.received_at, raw: r.payload }));
}

async function setCreatedAt(table, submissionId, iso) {
  if (!iso) return;
  const base = process.env.SUPABASE_URL;
  await fetch(`${base}/rest/v1/${table}?source_submission_id=eq.${encodeURIComponent(submissionId)}`, {
    method: 'PATCH',
    headers: { ...sbHeaders(), prefer: 'return=minimal' },
    body: JSON.stringify({ created_at: iso }),
  }).catch(() => {});
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const secret = process.env.JOTFORM_WEBHOOK_SECRET;
  if (!secret || req.headers.get('x-webhook-secret') !== secret) return new Response('Unauthorized', { status: 401 });

  const { form } = await req.json().catch(() => ({}));
  const formId = String(form || '');
  const table = FORM_TABLE[formId];
  if (!table) return Response.json({ ok: false, error: 'Unknown form id' }, { status: 400 });

  const useApi = !!process.env.JOTFORM_API_KEY;
  let items;
  try {
    if (useApi) {
      const subs = await fetchAllFromJotform(formId);
      items = subs.map((s) => ({ id: s.id, created_at: s.created_at ? new Date(s.created_at.replace(' ', 'T') + 'Z').toISOString() : null, raw: toRawRequest(s) }));
    } else {
      items = await fetchStored(formId);
    }
  } catch (e) {
    return Response.json({ ok: false, form: formId, source: useApi ? 'jotform-api' : 'stored', error: String(e) }, { status: 502 });
  }

  let routed = 0;
  const errors = [];
  for (const it of items) {
    try {
      if (useApi) {
        await sbUpsert('jotform_submissions', 'submission_id', [{ form_id: formId, submission_id: String(it.id), payload: it.raw, received_at: it.created_at || new Date().toISOString() }]);
      }
      await route(formId, String(it.id), it.raw, { silent: true });
      await setCreatedAt(table, String(it.id), it.created_at);
      routed++;
    } catch (e) {
      errors.push(`${it.id}: ${String(e).slice(0, 160)}`);
    }
  }
  return Response.json({ ok: errors.length === 0, form: formId, source: useApi ? 'jotform-api' : 'stored', found: items.length, routed, errors: errors.slice(0, 5) });
};
