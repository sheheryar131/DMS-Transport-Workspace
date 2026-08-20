/** Jotform webhook receiver. Read-only with respect to Jotform. */
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const expected = process.env.JOTFORM_WEBHOOK_SECRET;
  if (expected && url.searchParams.get('key') !== expected) return new Response('Unauthorized', { status: 401 });
  let rawRequest = null;
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const body = await req.json(); rawRequest = body.rawRequest ? JSON.parse(body.rawRequest) : body;
    } else {
      const text = await req.text(); const params = new URLSearchParams(text); const raw = params.get('rawRequest');
      rawRequest = raw ? JSON.parse(raw) : Object.fromEntries(params.entries());
    }
  } catch { return Response.json({ ok:false, error:'Invalid payload' }, { status:400 }); }
  const formId = String(rawRequest?.formID || rawRequest?.form_id || rawRequest?.formId || '');
  const submissionId = String(rawRequest?.submissionID || rawRequest?.submission_id || rawRequest?.submissionId || '');
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Jotform webhook received', { formId, submissionId });
    return Response.json({ ok:true, mode:'dry-run', formId, submissionId });
  }
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/jotform_submissions`, {
    method:'POST', headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'content-type':'application/json',prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({form_id:formId,submission_id:submissionId || crypto.randomUUID(),payload:rawRequest,received_at:new Date().toISOString()})
  });
  if (!res.ok) return Response.json({ok:false,error:await res.text()},{status:500});
  return Response.json({ok:true,formId,submissionId});
};
