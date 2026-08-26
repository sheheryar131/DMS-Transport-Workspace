/**
 * Jotform webhook receiver + router.
 * Every submission is always stored raw in `jotform_submissions` (compliance evidence, section 8 of brief).
 * Then it is routed into the correct operational table based on which form sent it.
 * Field matching is label-based (not tied to Jotform's internal qN_ prefixes, which shift over time):
 * we normalize both the visible question label and the payload key (lowercase, strip punctuation)
 * and match on that, the same way `q4_typeA` was resolved to "Vehicle Registration" originally.
 */

const FORM_IDS = {
  PRE_START: '252788179633068',
  POST_SHIFT: '253006995325864',
  BOOKING: '252950383396870',
  BOOKING_NDIS_HCP: '253346438293867',
  TRANSPORT_SERVICE_LOG: '252861403243047',
  INCIDENT: '252867927039067',
};

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

function findKey(payload, label) {
  const target = norm(label);
  if (!target) return null;
  const keys = Object.keys(payload);
  let found = keys.find((k) => norm(k.replace(/^q\d+_/, '')) === target);
  if (found) return found;
  found = keys.find((k) => {
    const nk = norm(k.replace(/^q\d+_/, ''));
    return nk && (nk.startsWith(target) || target.startsWith(nk));
  });
  return found || null;
}

function raw(payload, label) {
  const k = findKey(payload, label);
  return k ? payload[k] : undefined;
}

function text(v) {
  if (v == null) return null;
  if (Array.isArray(v)) return v.filter(Boolean).join(', ') || null;
  if (typeof v === 'object') {
    const vals = Object.entries(v).filter(([k]) => k !== 'other').map(([, x]) => x);
    const other = v.other;
    const joined = [...vals, other].filter(Boolean).join(', ');
    return joined || null;
  }
  const s = String(v).trim();
  return s || null;
}

function num(v) {
  const t = text(v);
  if (t == null) return null;
  const n = Number(String(t).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function bool(v) {
  const t = text(v);
  if (t == null) return null;
  return /^(yes|y|true|required)/i.test(t);
}

function dateVal(v) {
  if (v == null) return null;
  if (typeof v === 'object' && (v.year || v.month || v.day)) {
    const y = v.year, m = String(v.month || '1').padStart(2, '0'), d = String(v.day || '1').padStart(2, '0');
    if (y) return `${y}-${m}-${d}`;
  }
  const t = text(v);
  if (!t) return null;
  const parsed = new Date(t);
  return isNaN(parsed) ? null : parsed.toISOString().slice(0, 10);
}

function timeVal(v) {
  if (v == null) return null;
  if (typeof v === 'object' && (v.hour != null || v.minute != null)) {
    let h = Number(v.hour || 0);
    const min = String(v.minute || 0).padStart(2, '0');
    if (/pm/i.test(v.ampm || '') && h < 12) h += 12;
    if (/am/i.test(v.ampm || '') && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  }
  const t = text(v);
  if (!t) return null;
  const m = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  if (/pm/i.test(m[3] || '') && h < 12) h += 12;
  if (/am/i.test(m[3] || '') && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

function field(payload, label, transform = text) {
  return transform(raw(payload, label));
}

function shortCode(prefix, submissionId) {
  return `${prefix}-${String(submissionId).slice(-8)}`;
}

// ---- per-form mapping ----

function mapVehicleCheck(payload, checkType) {
  return {
    check_type: checkType,
    check_date: field(payload, 'Date', dateVal),
    driver_name: field(payload, 'Driver Name'),
    rego: field(payload, 'Select Vehicle Registration'),
    odometer: field(payload, checkType === 'pre_start' ? 'Odometer - Start' : 'Odometer - End', num),
    comments: field(payload, 'Any additional comments'),
    payload,
  };
}

function mapBooking(payload, formId, submissionId) {
  const isNdis = formId === FORM_IDS.BOOKING_NDIS_HCP;
  const code = field(payload, 'Quote Number') || shortCode('DMS', submissionId);
  const notesParts = [
    field(payload, 'Mobility Requirements'),
    field(payload, 'How would you like to confirm payment?'),
    field(payload, 'Wait Time Fee') ? `Wait fee: $${field(payload, 'Wait Time Fee')}` : null,
  ].filter(Boolean);
  return {
    booking_code: code,
    source_form_id: formId,
    source_submission_id: submissionId,
    submission_date: new Date().toISOString(),
    booking_date: field(payload, 'Date of Booking', dateVal) || field(payload, 'Date and Time of Booking', dateVal),
    requested_time: field(payload, 'Collection Time', timeVal),
    passenger_name: field(payload, "Passenger's Name") || field(payload, 'Passenger Name'),
    passenger_email: field(payload, 'Email Address'),
    passenger_phone: field(payload, 'Contact Number'),
    pickup_location: field(payload, 'Pickup Address'),
    dropoff_location: field(payload, 'Drop-off Address'),
    return_required: field(payload, 'Return Required?', bool),
    wait_time_minutes: field(payload, 'Wait Time', num),
    funding_type: isNdis ? (field(payload, 'Funding Type') || 'NDIS/HCP') : field(payload, 'Transport Type'),
    vehicle_type: field(payload, 'Vehicle Requirements') || field(payload, 'Please select the vehicle type required for this trip.'),
    quoted_cost: field(payload, 'Quoted Amount', num) || field(payload, 'quote_amount', num),
    status: isNdis ? 'Needs Review' : 'Pending',
    notes: notesParts.join(' | ') || null,
  };
}

function mapTransferLog(payload, formId, submissionId) {
  return {
    source_form_id: formId,
    source_submission_id: submissionId,
    booking_code: field(payload, 'Booking ID'),
    driver_name: field(payload, 'Driver Name'),
    vehicle_used: field(payload, 'Vehicle Used'),
    passenger_name: field(payload, "Passenger's Name"),
    pickup_location: field(payload, 'Pickup Location'),
    dropoff_location: field(payload, 'Drop-off Location'),
    collection_date: field(payload, 'Date of Collection', dateVal),
    collection_time: field(payload, 'Time of Collection', timeVal),
    return_booked: field(payload, 'Return Booked (if required)'),
    wait_time: field(payload, 'Wait Time'),
    notes: field(payload, 'Any additional notes or changes?'),
    payload,
  };
}

function mapIncident(payload, formId, submissionId) {
  const code = field(payload, 'Unique ID') || shortCode('INC', submissionId);
  const descParts = [field(payload, 'What are you reporting?'), field(payload, 'Description of Incident/Hazard')].filter(Boolean);
  return {
    source_form_id: formId,
    source_submission_id: submissionId,
    incident_code: code,
    status: 'Open',
    incident_at: (() => {
      const d = raw(payload, 'Date and Time of Incident');
      const dt = dateVal(d);
      const tm = timeVal(d);
      if (!dt) return null;
      return new Date(`${dt}T${tm || '00:00'}:00`).toISOString();
    })(),
    location: field(payload, 'Location of Incident'),
    description: descParts.join(' — ') || null,
    actions_taken: field(payload, 'Actions Taken'),
    participant_name: field(payload, "Participant's Name (if required)"),
    staff_name: field(payload, 'Staff Name'),
    payload,
  };
}

// ---- supabase helpers ----

async function sbUpsert(table, conflictCol, rows) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${base}/rest/v1/${table}?on_conflict=${conflictCol}`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table} upsert failed: ${await res.text()}`);
}

async function sbUpdate(table, matchCol, matchVal, patch) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  await fetch(`${base}/rest/v1/${table}?${matchCol}=eq.${encodeURIComponent(matchVal)}`, {
    method: 'PATCH',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
}

async function route(formId, submissionId, payload) {
  if (formId === FORM_IDS.PRE_START) {
    await sbUpsert('vehicle_checks', 'source_submission_id', [{ source_form_id: formId, source_submission_id: submissionId, ...mapVehicleCheck(payload, 'pre_start') }]);
  } else if (formId === FORM_IDS.POST_SHIFT) {
    await sbUpsert('vehicle_checks', 'source_submission_id', [{ source_form_id: formId, source_submission_id: submissionId, ...mapVehicleCheck(payload, 'post_shift') }]);
  } else if (formId === FORM_IDS.BOOKING || formId === FORM_IDS.BOOKING_NDIS_HCP) {
    await sbUpsert('bookings', 'source_submission_id', [mapBooking(payload, formId, submissionId)]);
  } else if (formId === FORM_IDS.TRANSPORT_SERVICE_LOG) {
    const row = mapTransferLog(payload, formId, submissionId);
    await sbUpsert('transfer_logs', 'source_submission_id', [row]);
    if (row.booking_code) await sbUpdate('bookings', 'booking_code', row.booking_code, { status: 'Completed' });
  } else if (formId === FORM_IDS.INCIDENT) {
    await sbUpsert('incidents', 'source_submission_id', [mapIncident(payload, formId, submissionId)]);
  }
  // Unrecognized forms: kept in jotform_submissions only (raw), no routing.
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const expected = process.env.JOTFORM_WEBHOOK_SECRET;
  if (expected && url.searchParams.get('key') !== expected) return new Response('Unauthorized', { status: 401 });

  let rawRequest = null;
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await req.json();
      rawRequest = body.rawRequest ? JSON.parse(body.rawRequest) : body;
    } else {
      const bodyText = await req.text();
      const params = new URLSearchParams(bodyText);
      const rawField = params.get('rawRequest');
      rawRequest = rawField ? JSON.parse(rawField) : Object.fromEntries(params.entries());
    }
  } catch {
    return Response.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const formId = String(rawRequest?.formID || rawRequest?.form_id || rawRequest?.formId || '');
  const submissionId = String(rawRequest?.submissionID || rawRequest?.submission_id || rawRequest?.submissionId || crypto.randomUUID());

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Jotform webhook received (dry-run, no Supabase configured)', { formId, submissionId });
    return Response.json({ ok: true, mode: 'dry-run', formId, submissionId });
  }

  try {
    await sbUpsert('jotform_submissions', 'submission_id', [{ form_id: formId, submission_id: submissionId, payload: rawRequest, received_at: new Date().toISOString() }]);
    await route(formId, submissionId, rawRequest);
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }

  return Response.json({ ok: true, formId, submissionId });
};
