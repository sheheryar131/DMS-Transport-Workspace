import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://yioqasfpmqvhmxrlpzyu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3Fhc2ZwbXF2aG14cmxwenl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDgwNjAsImV4cCI6MjEwMzI4NDA2MH0.RjBYJJQjhT-LHZhP5CH9rnx81QH4ZLEYdfLPSwWNyjM';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const app = document.querySelector('#app');
const pages = {
  dashboard:['Dashboard','Transport operations overview'],
  bookings:['Master Bookings','Requests → Bookings → Sent to Driver → Completed'],
  checks:['Daily Vehicle Checks','Pre-start and post-shift submissions'],
  transfers:['Submitted Transfer Forms','Completed Transport Service Logs'],
  fleet:['Fleet','Vehicle register and compliance'],
  stock:['Stock','Transport stock register'],
  staff:['Staff','Staff directory'],
  astp:['ASTP Staff List','Driver compliance and documents'],
  incidents:['Incident & Hazard Reporting','Open → In Review → Closed'],
  integrations:['Integrations','Jotform, Supabase and automation status'],
  sil:['SIL & Care Compliance','Orientation, maintenance, first aid and visitor logs']
};
const nav=[['dashboard','⌂','Dashboard'],['bookings','▦','Master Bookings'],['checks','✓','Daily Vehicle Checks'],['transfers','⇄','Transfer Forms'],['fleet','▣','Fleet'],['stock','□','Stock'],['staff','♙','Staff'],['astp','◎','ASTP Compliance'],['incidents','!','Incidents'],['sil','⌘','SIL & Care'],['integrations','⚙','Integrations']];

const state = {
  current:'dashboard', loading:false, error:'',
  bookings:[], staff:[], vehicles:[], checks:[], transfers:[], incidents:[], stock:[], astp:[],
  orientation:[], silMaintenance:[], firstAid:[], silVisitors:[]
};

const esc = (value='') => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtDate = v => v ? new Intl.DateTimeFormat('en-AU',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${v}T00:00:00`)) : '—';
const fmtTime = v => v ? String(v).slice(0,5) : '—';
const badge = s => `<span class="badge ${String(s).toLowerCase().replaceAll(' ','-')}">${esc(s || '—')}</span>`;
const personName = id => state.staff.find(x=>x.id===id)?.name || 'Unassigned';
const vehicleRego = id => state.vehicles.find(x=>x.id===id)?.rego || '—';

async function loadData(){
  state.loading=true; state.error=''; render();
  const queries = await Promise.all([
    supabase.from('bookings').select('*').order('booking_date',{ascending:false}).limit(500),
    supabase.from('staff').select('*').order('name'),
    supabase.from('vehicles').select('*').order('rego'),
    supabase.from('vehicle_checks').select('*').order('created_at',{ascending:false}).limit(500),
    supabase.from('transfer_logs').select('*').order('created_at',{ascending:false}).limit(500),
    supabase.from('incidents').select('*').order('created_at',{ascending:false}).limit(500),
    supabase.from('stock_items').select('*').order('name'),
    supabase.from('astp_compliance').select('*').order('created_at',{ascending:false}),
    supabase.from('orientation_checklists').select('*').order('created_at',{ascending:false}).limit(200),
    supabase.from('sil_maintenance_checks').select('*').order('created_at',{ascending:false}).limit(200),
    supabase.from('first_aid_checks').select('*').order('created_at',{ascending:false}).limit(200),
    supabase.from('sil_visitor_checkins').select('*').order('created_at',{ascending:false}).limit(200)
  ]);
  const err = queries.find(q=>q.error)?.error;
  if(err) state.error=err.message;
  [state.bookings,state.staff,state.vehicles,state.checks,state.transfers,state.incidents,state.stock,state.astp,state.orientation,state.silMaintenance,state.firstAid,state.silVisitors] = queries.map(q=>q.data||[]);
  state.loading=false; render();
}

function shell(body){
  const [title,sub] = pages[state.current];
  return `<div class="app-shell"><aside class="sidebar">
    <div class="brand"><div class="brand-mark">D</div>DMS Workspace</div>
    <div class="workspace-switch"><small>Workspace</small><strong>Transport</strong></div>
    <div class="nav-section">Operations</div>
    ${nav.map(([id,ic,n])=>`<div class="nav-item ${id===state.current?'active':''}" data-page="${id}"><span>${ic}</span>${n}</div>`).join('')}
  </aside><main class="main"><header class="topbar"><strong>DMS / Transport</strong><div class="top-actions"><button class="btn" id="refreshBtn">↻ Refresh</button><div class="user-chip"><div class="avatar">D</div><span>DMS Workspace</span></div></div></header>
  <div class="content"><div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div>${state.current==='bookings'?'<button class="btn primary" id="newBookingBtn">+ New booking</button>':''}</div>
  ${state.error?`<div class="error-banner">${esc(state.error)}</div>`:''}${state.loading?'<div class="loading-bar">Loading live data…</div>':''}${body}</div></main></div>`;
}

function bookingRows(limit){
  const rows=(limit?state.bookings.slice(0,limit):state.bookings);
  if(!rows.length) return `<div class="empty">No bookings yet.</div>`;
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Booking</th><th>Passenger</th><th>Date / Time</th><th>Pickup</th><th>Drop-off</th><th>Driver</th><th>Vehicle</th><th>Funding</th><th>Status</th></tr></thead><tbody>${rows.map(b=>`<tr><td><strong>${esc(b.booking_code)}</strong></td><td>${esc(b.passenger_name||'—')}</td><td>${fmtDate(b.booking_date)}<br>${fmtTime(b.requested_time)}</td><td>${esc(b.pickup_location||'—')}</td><td>${esc(b.dropoff_location||'—')}</td><td>${esc(personName(b.driver_id))}</td><td>${esc(vehicleRego(b.vehicle_id))}</td><td>${esc(b.funding_type||'—')}</td><td><select class="status-select" data-booking-status="${b.id}">${['Pending','Booked','Sent to Driver','Completed','Cancelled'].map(s=>`<option ${b.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`;
}

function dashboard(){
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney'}).format(new Date());
  const todays = state.bookings.filter(b=>b.booking_date===today);
  const openInc = state.incidents.filter(x=>x.status!=='Closed').length;
  const todayChecks=state.checks.filter(x=>x.check_date===today);
  const expiring=state.vehicles.filter(v=>[v.rego_expiry,v.hvis_expiry].some(d=>d && (new Date(d)-new Date())/86400000<=30 && new Date(d)>=new Date())).length;
  return `<div class="cards"><div class="card"><div class="metric-label">Today's bookings</div><div class="metric-value">${todays.length}</div><div class="metric-sub">Live from Supabase</div></div><div class="card"><div class="metric-label">Fleet vehicles</div><div class="metric-value">${state.vehicles.length}</div><div class="metric-sub">${expiring} expiry alert${expiring===1?'':'s'} within 30 days</div></div><div class="card"><div class="metric-label">Today's checks</div><div class="metric-value">${todayChecks.length}</div><div class="metric-sub">Pre-start + post-shift</div></div><div class="card"><div class="metric-label">Open incidents</div><div class="metric-value">${openInc}</div><div class="metric-sub">Open / In Review</div></div></div>
  <div class="grid-2"><div class="panel"><div class="panel-head"><h3>Recent bookings</h3></div>${bookingRows(8)}</div><div class="panel"><div class="panel-head"><h3>System status</h3></div><div class="panel-body"><div class="connection"><strong>Supabase database</strong><span class="ok">Connected</span></div><div class="connection"><strong>Authentication</strong><span class="ok">Active</span></div><div class="connection"><strong>Jotform ingestion</strong><span class="warn">Not switched on yet</span></div><div class="connection"><strong>Monday migration</strong><span>${state.bookings.length||state.staff.length||state.vehicles.length?'In progress':'Pending import'}</span></div></div></div></div>`;
}

function simpleTable(headers, rows){
  if(!rows.length) return `<div class="empty">No records yet.</div>`;
  return `<div class="table-wrap"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}
function checksPage(){return `<div class="panel">${simpleTable(['Type','Date','Driver','Vehicle','Odometer','Comments'],state.checks.map(x=>`<tr><td>${badge(x.check_type==='pre_start'?'Pre-start':'Post-shift')}</td><td>${fmtDate(x.check_date)}</td><td>${esc(x.driver_name||personName(x.staff_id))}</td><td>${esc(x.rego||vehicleRego(x.vehicle_id))}</td><td>${esc(x.odometer??'—')}</td><td>${esc(x.comments||'—')}</td></tr>`))}</div>`}
function transfersPage(){return `<div class="panel">${simpleTable(['Booking','Driver','Vehicle','Passenger','Collection','Pickup','Drop-off'],state.transfers.map(x=>`<tr class="clickable-check" data-detail-table="transfers" data-detail-id="${x.id}"><td><strong>${esc(x.booking_code||'—')}</strong></td><td>${esc(x.driver_name||'—')}</td><td>${esc(x.vehicle_used||'—')}</td><td>${esc(x.passenger_name||'—')}</td><td>${fmtDate(x.collection_date)} ${fmtTime(x.collection_time)}</td><td>${esc(x.pickup_location||'—')}</td><td>${esc(x.dropoff_location||'—')}</td></tr>`))}</div>`}
function fleetPage(){return `<div class="panel">${simpleTable(['Registration','Make / Model','Status','Rego Expiry','HVIS Expiry','ASTP','Odometer'],state.vehicles.map(x=>`<tr><td><strong>${esc(x.rego)}</strong></td><td>${esc(x.make_model||'—')}</td><td>${badge(x.status||'—')}</td><td>${fmtDate(x.rego_expiry)}</td><td>${fmtDate(x.hvis_expiry)}</td><td>${esc(x.astp_usage||'—')}</td><td>${esc(x.current_odometer??'—')}</td></tr>`))}</div>`}
function staffPage(){return `<div class="panel">${simpleTable(['Staff member','Email','Phone','Status'],state.staff.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.email||'—')}</td><td>${esc(x.phone||'—')}</td><td>${badge(x.status||'Active')}</td></tr>`))}</div>`}
function astpPage(){return `<div class="panel">${simpleTable(['Staff member','Driver Application','Medical Fitness','WWCC','Licence','Notes'],state.astp.map(x=>`<tr><td><strong>${esc(personName(x.staff_id))}</strong></td><td>${x.driver_application_url?'✓':'—'}</td><td>${x.medical_fitness_url?'✓':'—'}</td><td>${x.wwc_url?'✓':'—'}</td><td>${x.drivers_licence_url?'✓':'—'}</td><td>${esc(x.notes||'—')}</td></tr>`))}</div>`}
function stockPage(){return `<div class="panel">${simpleTable(['Stock item','Mandatory Quantity','Expiry','Notes'],state.stock.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.mandatory_quantity||'—')}</td><td>${fmtDate(x.expiry_date)}</td><td>${esc(x.notes||'—')}</td></tr>`))}</div>`}
function incidentPage(){return `<div class="panel">${simpleTable(['Status','Date / Time','Type / Description','Location','Participant','Staff'],state.incidents.map(x=>`<tr class="clickable-check" data-detail-table="incidents" data-detail-id="${x.id}"><td>${badge(x.status)}</td><td>${x.incident_at?new Date(x.incident_at).toLocaleString('en-AU'):'—'}</td><td>${esc(x.description||'—')}</td><td>${esc(x.location||'—')}</td><td>${esc(x.participant_name||'—')}</td><td>${esc(x.staff_name||'—')}</td></tr>`))}</div>`}

function genericDetailModal(table,id){
  const source={transfers:state.transfers,incidents:state.incidents,orientation:state.orientation,silMaintenance:state.silMaintenance,firstAid:state.firstAid,silVisitors:state.silVisitors}[table]||[];
  const row=source.find(x=>x.id===id); if(!row)return;
  const titles={transfers:'Transport Service Log',incidents:'Incident Report',orientation:'Worker Orientation Checklist',silMaintenance:'SIL / Office Maintenance Checklist',firstAid:'First Aid Checklist',silVisitors:'SIL Visitor Check In'};
  const p=row.payload||{};
  const rows=Object.keys(p).filter(k=>!['path','slug','event_id','buildDate','submitDate','submitSource','timeToSubmit','uploadServerUrl','newCardFormMobile','jsExecutionTracker','validatedNewRequiredFieldIDs'].includes(k))
    .map(k=>`<div class="answer-row"><div class="answer-label">${esc(k.replace(/^q\d+_?/,'').replace(/([A-Z])/g,' $1').trim()||k)}</div><div class="answer-value">${esc(typeof p[k]==='object'?JSON.stringify(p[k]):String(p[k]??'—'))}</div></div>`).join('')||'<div class="empty">No detailed submission payload stored for this record.</div>';
  document.body.insertAdjacentHTML('beforeend',`<div class="compliance-modal-backdrop" id="genericDetailModal"><div class="compliance-modal"><div class="compliance-head"><div><h3>${titles[table]||'Submission'}</h3></div><button id="closeGenericDetail">×</button></div><div class="compliance-body"><div class="answers-title">Complete submission</div>${rows}</div></div></div>`);
  const close=()=>document.querySelector('#genericDetailModal')?.remove();
  document.querySelector('#closeGenericDetail').onclick=close;
  document.querySelector('#genericDetailModal').onclick=e=>{if(e.target.id==='genericDetailModal')close();};
}
function integrations(){return `<div class="grid-2"><div class="panel"><div class="panel-head"><h3>Connections</h3></div><div class="panel-body"><div class="connection"><strong>Supabase / PostgreSQL</strong><span class="ok">Connected</span></div><div class="connection"><strong>Supabase Auth</strong><span class="ok">Connected</span></div><div class="connection"><strong>GitHub</strong><span class="ok">Source controlled</span></div><div class="connection"><strong>Netlify</strong><span class="ok">Git deploy</span></div><div class="connection"><strong>Jotform</strong><span class="warn">Existing forms untouched</span></div></div></div><div class="panel"><div class="panel-head"><h3>Planned data flow</h3></div><div class="panel-body"><strong>Jotform App → existing Jotform → secure webhook → Supabase → Workspace</strong><p class="note">Jotform ingestion remains disabled until the database import and a controlled test submission are verified.</p></div></div></div>`}

function newBookingModal(){
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="bookingModal"><div class="modal"><div class="modal-head"><h3>New booking</h3><button class="icon-btn" data-close>×</button></div><form id="bookingForm" class="form-grid"><label>Booking ID<input name="booking_code" required placeholder="DMS00136"></label><label>Passenger<input name="passenger_name" required></label><label>Booking date<input name="booking_date" type="date" required></label><label>Time<input name="requested_time" type="time"></label><label class="span-2">Pickup<input name="pickup_location"></label><label class="span-2">Drop-off<input name="dropoff_location"></label><label>Funding<select name="funding_type"><option>NDIS</option><option>HCP</option><option>Private</option><option>Other</option></select></label><label>Driver<select name="driver_id"><option value="">Unassigned</option>${state.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label><label>Vehicle<select name="vehicle_id"><option value="">Unassigned</option>${state.vehicles.map(v=>`<option value="${v.id}">${esc(v.rego)}</option>`).join('')}</select></label><label>Status<select name="status">${['Pending','Booked','Sent to Driver','Completed','Cancelled'].map(s=>`<option>${s}</option>`).join('')}</select></label><div class="span-2 modal-actions"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">Create booking</button></div></form></div></div>`);
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.querySelector('#bookingModal')?.remove());
  document.querySelector('#bookingForm').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));Object.keys(f).forEach(k=>f[k]===''&&(f[k]=null));const {error}=await supabase.from('bookings').insert(f);if(error){alert(error.message);return;}document.querySelector('#bookingModal').remove();await loadData();};
}

async function updateBookingStatus(id,status){
  const {error}=await supabase.from('bookings').update({status}).eq('id',id);
  if(error){state.error=error.message;render();return;}
  const row=state.bookings.find(x=>x.id===id); if(row) row.status=status;
}

function silPage(){
  const tabs=[
    ['Orientation',state.orientation.map(x=>`<tr class="clickable-check" data-detail-table="orientation" data-detail-id="${x.id}"><td>${esc(x.participant_name||'—')}</td><td>${esc(x.sil_location||'—')}</td><td>${esc(x.support_worker_name||'—')}</td><td>${esc(x.trainer_name||'—')}</td><td>${fmtDate(x.check_date)}</td></tr>`),['Participant','SIL Location','Support Worker','Trainer','Date']],
    ['Maintenance',state.silMaintenance.map(x=>`<tr class="clickable-check" data-detail-table="silMaintenance" data-detail-id="${x.id}"><td>${esc(x.sil_location||'—')}</td><td>${esc(x.support_worker_name||'—')}</td><td>${fmtDate(x.check_date)}</td><td>${esc(x.outside_notes||'—')}</td><td>${esc(x.inside_notes||'—')}</td></tr>`),['SIL Location','Support Worker','Date','Outside Notes','Inside Notes']],
    ['First Aid',state.firstAid.map(x=>`<tr class="clickable-check" data-detail-table="firstAid" data-detail-id="${x.id}"><td>${esc(x.full_name||'—')}</td><td>${esc(x.sil_location||'—')}</td><td>${esc(x.items_used||'—')}</td></tr>`),['Staff','SIL Location','Items Used']],
    ['Visitors',state.silVisitors.map(x=>`<tr class="clickable-check" data-detail-table="silVisitors" data-detail-id="${x.id}"><td>${esc(x.visitor_name||'—')}</td><td>${esc(x.sil_location||'—')}</td><td>${esc(x.reason_for_visit||'—')}</td><td>${esc(x.duration||'—')}</td><td>${x.visit_at?new Date(x.visit_at).toLocaleString('en-AU'):'—'}</td></tr>`),['Visitor','SIL Location','Reason','Duration','Date/Time']],
  ];
  return `<div class="grid-2">${tabs.map(([title,rows,headers])=>`<div class="panel"><div class="panel-head"><h3>${title}</h3></div>${simpleTable(headers,rows)}</div>`).join('')}</div>`;
}

function render(){
  let body='';
  if(state.current==='dashboard') body=dashboard();
  else if(state.current==='bookings') body=`<div class="panel">${bookingRows()}</div>`;
  else if(state.current==='checks') body=checksPage();
  else if(state.current==='transfers') body=transfersPage();
  else if(state.current==='fleet') body=fleetPage();
  else if(state.current==='stock') body=stockPage();
  else if(state.current==='staff') body=staffPage();
  else if(state.current==='astp') body=astpPage();
  else if(state.current==='incidents') body=incidentPage();
  else if(state.current==='sil') body=silPage();
  else body=integrations();
  app.innerHTML=shell(body);
  document.querySelectorAll('[data-page]').forEach(x=>x.onclick=()=>{state.current=x.dataset.page;render()});
  document.querySelector('#refreshBtn').onclick=loadData;
  document.querySelector('#newBookingBtn')?.addEventListener('click',newBookingModal);
  document.querySelectorAll('[data-booking-status]').forEach(s=>s.onchange=()=>updateBookingStatus(s.dataset.bookingStatus,s.value));
  document.querySelectorAll('[data-detail-table]').forEach(tr=>tr.onclick=()=>genericDetailModal(tr.dataset.detailTable,tr.dataset.detailId));
}

loadData();