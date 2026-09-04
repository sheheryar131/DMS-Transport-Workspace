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
const navIcons = {
  dashboard:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
  bookings:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  checks:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  transfers:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  fleet:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l2-6a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 6"/><rect x="1" y="13" width="22" height="6" rx="1"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></svg>',
  stock:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
  staff:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  astp:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>',
  incidents:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  sil:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  integrations:'<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
};
const nav=[['dashboard','Dashboard'],['bookings','Master Bookings'],['checks','Daily Vehicle Checks'],['transfers','Transfer Forms'],['fleet','Fleet'],['stock','Stock'],['staff','Staff'],['astp','ASTP Compliance'],['incidents','Incidents'],['sil','SIL & Care'],['integrations','Integrations']];

const state = {
  current:'dashboard', loading:false, error:'',
  bookings:[], staff:[], vehicles:[], checks:[], transfers:[], incidents:[], stock:[], astp:[],
  orientation:[], silMaintenance:[], firstAid:[], silVisitors:[], notificationSettings:null,
  bookingsShowAll:false
};
const editState = {}; // pageKey -> boolean, tracks per-tab edit mode

const esc = (value='') => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtDate = v => v ? new Intl.DateTimeFormat('en-AU',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${v}T00:00:00`)) : '—';
const fmtTime = v => v ? String(v).slice(0,5) : '—';
const badge = s => `<span class="badge ${String(s||'').toLowerCase().replaceAll(' ','-').replaceAll('/','-')}">${esc(s || '—')}</span>`;
const personName = id => state.staff.find(x=>x.id===id)?.name || 'Unassigned';
const vehicleRego = id => state.vehicles.find(x=>x.id===id)?.rego || '—';
const rowStatusClass = s => {
  const v = String(s||'').toLowerCase();
  if(v.includes('complet')||v.includes('closed')||v.includes('active')) return 'row-completed';
  if(v.includes('cancel')) return 'row-cancelled';
  if(v.includes('review')) return 'row-review';
  if(v.includes('pending')||v.includes('open')) return 'row-pending';
  return '';
};

let firstLoad = true;

async function loadData(){
  if(firstLoad){ app.innerHTML = splashScreen(); }
  state.loading=true; state.error=''; if(!firstLoad) render();
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
  const {data:ns} = await supabase.from('notification_settings').select('*').eq('entity_type','vehicle_expiry').maybeSingle();
  state.notificationSettings = ns;
  state.loading=false; firstLoad=false; state.refreshedAt=Date.now(); render();
  setTimeout(()=>{ if(state.current==='dashboard') render(); }, 5000);
}

function splashScreen(){
  return `<div class="splash-screen">
    <div class="splash-ring-wrap">
      <div class="splash-ring"></div>
      <img class="splash-logo" src="https://dmsassistedtransport.com.au/wp-content/uploads/2025/09/favicon-300x300.jpg" alt="DMS" onerror="this.style.display='none'">
    </div>
    <div class="splash-text">Loading DMS Workspace…</div>
  </div>`;
}

async function refreshWithSplash(){
  const overlay = document.createElement('div');
  overlay.innerHTML = splashScreen();
  const el = overlay.firstElementChild;
  document.body.appendChild(el);
  const start = Date.now();
  await loadData();
  const elapsed = Date.now()-start;
  const wait = Math.max(0, 3000-elapsed);
  setTimeout(()=>el.remove(), wait);
}

function shell(body){
  const [title,sub] = pages[state.current];
  return `<div class="bg-blobs"></div><div class="app-shell"><aside class="sidebar">
    <div class="brand"><img class="brand-mark brand-logo" src="https://dmsassistedtransport.com.au/wp-content/uploads/2025/09/favicon-300x300.jpg" alt="DMS" onerror="this.outerHTML='<div class=&quot;brand-mark&quot;>D</div>'">DMS Workspace</div>
    <div class="nav-section">Operations</div>
    ${nav.map(([id,n])=>`<div class="nav-item ${id===state.current?'active':''}" data-page="${id}">${navIcons[id]}${n}</div>`).join('')}
  </aside><main class="main"><header class="topbar"><strong>DMS / Transport</strong><div class="top-actions"><button class="btn" id="refreshBtn">↻ Refresh</button><div class="user-chip"><div class="avatar">D</div><span>DMS Workspace</span></div></div></header>
  <div class="content"><div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div>${state.current==='bookings'?'<button class="btn primary" id="newBookingBtn">+ New booking</button>':''}</div>
  ${state.error?`<div class="error-banner">${esc(state.error)}</div>`:''}${state.loading?'<div class="loading-bar">Loading live data…</div>':''}${body}</div></main></div>`;
}

/* ===================== Generic editable-table system ===================== */

function editToggle(pageKey){
  const on = !!editState[pageKey];
  return `<button class="btn ${on?'editing':''}" data-edit-toggle="${pageKey}">${on?'✓ Done':'✎ Edit'}</button>`;
}

// cell renderers — all carry data-e* attributes read by the single generic handler
function eText(table,stateKey,id,key,value,{type='text',cast='',disabled=false}={}){
  return `<input data-etable="${table}" data-estate="${stateKey}" data-eid="${id}" data-ekey="${key}" data-ecast="${cast}" type="${type}" value="${esc(value??'')}" ${disabled?'disabled':''}>`;
}
function eSelect(table,stateKey,id,key,value,opts,{cast='',disabled=false,blank=true}={}){
  return `<select data-etable="${table}" data-estate="${stateKey}" data-eid="${id}" data-ekey="${key}" data-ecast="${cast}" ${disabled?'disabled':''}>${blank?'<option value=""></option>':''}${opts.map(o=>{
    const val = typeof o==='object'?o.value:o; const lab = typeof o==='object'?o.label:o;
    return `<option value="${esc(val)}" ${String(value??'')===String(val)?'selected':''}>${esc(lab)}</option>`;
  }).join('')}</select>`;
}
function eStaffSelect(table,stateKey,id,key,value,{disabled=false}={}){
  return eSelect(table,stateKey,id,key,value,state.staff.map(s=>({value:s.id,label:s.name})),{disabled,blank:true}).replace('<option value=""></option>','<option value="">Unassigned</option>');
}
function eExtra(table,stateKey,id,extraKey,value,{disabled=false}={}){
  return `<input data-etable="${table}" data-estate="${stateKey}" data-eid="${id}" data-eextra="${extraKey}" value="${esc(value??'')}" ${disabled?'disabled':''}>`;
}
function extraKeysOf(arr){const keys=new Set();arr.forEach(r=>Object.keys(r.extra||{}).forEach(k=>keys.add(k)));return [...keys];}

async function genericFieldChange(el){
  const table = el.dataset.etable, stateKey = el.dataset.estate, id = el.dataset.eid, cast = el.dataset.ecast, extraKey = el.dataset.eextra;
  const td = el.closest('td');
  let patch;
  if(extraKey){
    const row = state[stateKey]?.find(r=>r.id===id);
    const extra = {...(row?.extra||{}), [extraKey]: el.value};
    patch = {extra};
  } else {
    const key = el.dataset.ekey;
    let value = el.value;
    if(cast==='number') value = value===''?null:Number(value);
    else if(cast==='bool-yn') value = value===''?null:value==='YES';
    else if(value==='') value = null;
    patch = {[key]:value};
  }
  const {error} = await supabase.from(table).update(patch).eq('id',id);
  if(error){alert('Could not save: '+error.message);return;}
  const row = state[stateKey]?.find(r=>r.id===id);
  if(row) Object.assign(row, patch);
  if(td){td.classList.remove('cell-saved');void td.offsetWidth;td.classList.add('cell-saved');}
}

async function genericAddRow(table,stateKey,defaults){
  const {data,error} = await supabase.from(table).insert(defaults).select().single();
  if(error){alert('Could not add row: '+error.message);return;}
  state[stateKey].unshift(data); render();
}
async function genericDeleteRow(table,stateKey,id){
  if(!confirm('Delete this row? This cannot be undone.')) return;
  const {error} = await supabase.from(table).delete().eq('id',id);
  if(error){alert('Could not delete: '+error.message);return;}
  state[stateKey] = state[stateKey].filter(r=>r.id!==id); render();
}
async function genericAddField(table,stateKey){
  const name = prompt('New column name (e.g. "Insurance Provider"):');
  if(!name) return;
  const key = name.trim(); if(!key) return;
  for(const row of state[stateKey]){
    if(!(key in (row.extra||{}))){
      const extra = {...(row.extra||{}), [key]:''};
      const {error} = await supabase.from(table).update({extra}).eq('id',row.id);
      if(!error) row.extra = extra;
    }
  }
  render();
}
async function genericDeleteField(table,stateKey,key){
  if(!confirm(`Remove the "${key}" column for every row? This cannot be undone.`)) return;
  for(const row of state[stateKey]){
    if(row.extra && key in row.extra){
      const extra = {...row.extra}; delete extra[key];
      const {error} = await supabase.from(table).update({extra}).eq('id',row.id);
      if(!error) row.extra = extra;
    }
  }
  render();
}

function popOutField(el){
  if(el.tagName==='SELECT') return; // selects open their own dropdown, no need to pop
  const rect = el.getBoundingClientRect();
  el.classList.add('popped-field');
  el.style.left = rect.left+'px'; el.style.top = rect.top+'px'; el.style.width = Math.max(rect.width,220)+'px';
}
function unpopField(el){
  el.classList.remove('popped-field');
  el.style.left=''; el.style.top=''; el.style.width='';
}

function wireGenericTable(){
  document.querySelectorAll('[data-etable]').forEach(el=>{
    el.onchange=()=>genericFieldChange(el);
    if(el.tagName==='INPUT' || el.tagName==='SELECT'){
      el.addEventListener('focus',()=>popOutField(el));
      el.addEventListener('blur',()=>unpopField(el));
    }
  });
  document.querySelectorAll('[data-edit-toggle]').forEach(btn=>btn.onclick=()=>{
    const k=btn.dataset.editToggle; editState[k]=!editState[k]; render();
  });
  document.querySelectorAll('[data-add-row]').forEach(btn=>btn.onclick=()=>{
    const [table,stateKey] = btn.dataset.addRow.split('|');
    const defaults = JSON.parse(btn.dataset.addDefaults||'{}');
    genericAddRow(table,stateKey,defaults);
  });
  document.querySelectorAll('[data-add-field]').forEach(btn=>btn.onclick=()=>{
    const [table,stateKey] = btn.dataset.addField.split('|');
    genericAddField(table,stateKey);
  });
  document.querySelectorAll('[data-del-field]').forEach(btn=>btn.onclick=()=>{
    const [table,stateKey,key] = btn.dataset.delField.split('|');
    genericDeleteField(table,stateKey,key);
  });
  document.querySelectorAll('[data-del-row]').forEach(btn=>btn.onclick=()=>{
    const [table,stateKey,id] = btn.dataset.delRow.split('|');
    genericDeleteRow(table,stateKey,id);
  });
}

/* ===================== Dashboard ===================== */

function floatIcons(svgIcon, count, extraClass=''){
  let out='';
  for(let i=0;i<count;i++){
    const delay=(i*0.35).toFixed(2), top=10+Math.random()*60, dur=(2.2+Math.random()*1.2).toFixed(2);
    out+=`<span class="float-ic ${extraClass}" style="top:${top}%;animation-delay:${delay}s;animation-duration:${dur}s">${svgIcon}</span>`;
  }
  return out;
}
const CHECK_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12l6 6L20 6"/></svg>';
const WARN_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
const DOT_ICON='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>';

function dashboard(){
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney'}).format(new Date());
  const todays = state.bookings.filter(b=>b.booking_date===today);
  const openInc = state.incidents.filter(x=>x.status!=='Closed').length;
  const todayChecks=state.checks.filter(x=>x.check_date===today);
  const daysUntil = d => d ? Math.round((new Date(d)-new Date())/86400000) : null;
  const expiringVehicles = state.vehicles
    .map(v=>{
      const rd=daysUntil(v.rego_expiry), hd=daysUntil(v.hvis_expiry);
      const soonest = [['Registration',v.rego_expiry,rd],['HVIS',v.hvis_expiry,hd]].filter(x=>x[2]!=null && x[2]<=30 && x[2]>=0).sort((a,b)=>a[2]-b[2])[0];
      return soonest ? {rego:v.rego, label:soonest[0], date:soonest[1], days:soonest[2]} : null;
    })
    .filter(Boolean).sort((a,b)=>a.days-b.days).slice(0,5);
  const astpComplete = state.astp.filter(a=>[a.driver_application_url,a.medical_fitness_url,a.wwc_url,a.drivers_licence_url].every(Boolean)).length;
  const showN = state.bookingsShowAll ? state.bookings.length : 3;
  const recentRows = state.bookings.slice(0,showN);
  const remaining = state.bookings.length - recentRows.length;

  const animating = (Date.now()-(state.refreshedAt||0)) < 5000;
  const vehIcons = animating && state.vehicles.length>0 ? floatIcons([groupIcon('SUV'),groupIcon('LDV VAN'),groupIcon('Hatchback')][Math.floor(Math.random()*3)],4,'float-ic-blue') : '';
  const bookIcons = animating && todays.length>0 ? floatIcons(DOT_ICON,5,'float-ic-teal') : '';
  const checkIcons = animating && todayChecks.length>0 ? floatIcons(CHECK_ICON,5,'float-ic-green') : '';
  const incIcons = animating && openInc>0 ? floatIcons(WARN_ICON,4,'float-ic-red') : '';

  return `<div class="cards">
    <div class="card">${bookIcons}<div class="metric-label">Today's bookings</div><div class="metric-value">${todays.length}</div><div class="metric-sub">Live from Supabase</div></div>
    <div class="card c-blue">${vehIcons}<div class="metric-label">Fleet vehicles</div><div class="metric-value">${state.vehicles.length}</div><div class="metric-sub">${expiringVehicles.length} expiry alert${expiringVehicles.length===1?'':'s'} within 30 days</div></div>
    <div class="card">${checkIcons}<div class="metric-label">Today's checks</div><div class="metric-value">${todayChecks.length}</div><div class="metric-sub">Pre-start + post-shift</div></div>
    <div class="card c-red">${incIcons}<div class="metric-label">Open incidents</div><div class="metric-value">${openInc}</div><div class="metric-sub">Open / In Review</div></div>
  </div>
  <div class="grid-2">
    <div class="panel"><div class="panel-head"><h3>Recent bookings</h3></div>
      ${recentRows.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Booking</th><th>Passenger</th><th>Date</th><th>Driver</th><th>Status</th></tr></thead><tbody>${recentRows.map(b=>`<tr class="${rowStatusClass(b.status)}"><td><strong>${esc(b.booking_code)}</strong></td><td>${esc(b.passenger_name||'—')}</td><td>${fmtDate(b.booking_date)}</td><td>${esc(personName(b.driver_id))}</td><td>${badge(b.status)}</td></tr>`).join('')}${remaining>0?`<tr class="show-more-row"><td colspan="5"><button class="link-btn" id="showMoreBookings">Show ${remaining} more →</button></td></tr>`:(state.bookingsShowAll && state.bookings.length>3?`<tr class="show-more-row"><td colspan="5"><button class="link-btn" id="showLessBookings">Show less</button></td></tr>`:'')}</tbody></table></div>` : '<div class="empty">No bookings yet.</div>'}
    </div>
    <div class="panel"><div class="panel-head"><h3>Fleet &amp; Compliance Snapshot</h3></div><div class="panel-body">
      ${expiringVehicles.length ? expiringVehicles.map(v=>`<div class="connection"><strong>${esc(v.rego)}</strong><span class="${v.days<=7?'warn':''}" style="${v.days<=7?'':'color:var(--muted)'}">${esc(v.label)} in ${v.days}d (${fmtDate(v.date)})</span></div>`).join('') : '<div class="connection"><strong>No expiries due soon</strong><span class="ok">All clear</span></div>'}
      <div class="connection"><strong>ASTP document completeness</strong><span class="${astpComplete===state.astp.length?'ok':'warn'}">${astpComplete} / ${state.astp.length} complete</span></div>
      <div class="connection"><strong>Stock items tracked</strong><span>${state.stock.length}</span></div>
    </div></div>
  </div>`;
}

/* ===================== Master Bookings ===================== */

const BOOKING_STATUS_OPTS=['Pending','Booked','Sent to Driver','Completed','Cancelled'];
const FUNDING_OPTS=['NDIS','HCP','Private/Community Transport','Other'];

function bookingsPage(){
  const editing = !!editState.bookings;
  const extraKeys = extraKeysOf(state.bookings);
  if(!state.bookings.length) return `<div class="panel"><div class="panel-head"><h3>Master Bookings</h3><div class="col-actions">${editToggle('bookings')}</div></div><div class="empty">No bookings yet.</div></div>`;
  const cols = ['Booking','Passenger','Date / Time','Pickup','Drop-off','Driver','Vehicle','Funding','Status',...extraKeys];
  return `<div class="panel ${editing?'editing-mode':''}">
    <div class="panel-head"><h3>Master Bookings</h3><div class="col-actions">${editing?`<button class="col-add-btn" data-add-field="bookings|bookings">+ Field</button>`:''}${editToggle('bookings')}</div></div>
    <div class="table-wrap"><table class="table"><thead><tr>${cols.map(c=>{
      const isExtra = extraKeys.includes(c);
      return isExtra && editing ? `<th class="col-removable">${esc(c)}<button class="col-del-x" data-del-field="bookings|bookings|${esc(c)}">×</button></th>` : `<th>${esc(c)}</th>`;
    }).join('')}${editing?'<th></th>':''}</tr></thead><tbody>
    ${state.bookings.map(b=>`<tr class="${rowStatusClass(b.status)}">
      <td>${editing?eText('bookings','bookings',b.id,'booking_code',b.booking_code):`<strong>${esc(b.booking_code)}</strong>`}</td>
      <td>${editing?eText('bookings','bookings',b.id,'passenger_name',b.passenger_name):esc(b.passenger_name||'—')}</td>
      <td>${editing?eText('bookings','bookings',b.id,'booking_date',b.booking_date,{type:'date'})+eText('bookings','bookings',b.id,'requested_time',b.requested_time,{type:'time'}):`${fmtDate(b.booking_date)}<br>${fmtTime(b.requested_time)}`}</td>
      <td>${editing?eText('bookings','bookings',b.id,'pickup_location',b.pickup_location):esc(b.pickup_location||'—')}</td>
      <td>${editing?eText('bookings','bookings',b.id,'dropoff_location',b.dropoff_location):esc(b.dropoff_location||'—')}</td>
      <td>${eStaffSelect('bookings','bookings',b.id,'driver_id',b.driver_id,{disabled:false})}</td>
      <td>${editing?eSelect('bookings','bookings',b.id,'vehicle_id',b.vehicle_id,state.vehicles.map(v=>({value:v.id,label:v.rego})),{}):esc(vehicleRego(b.vehicle_id))}</td>
      <td>${editing?eSelect('bookings','bookings',b.id,'funding_type',b.funding_type,FUNDING_OPTS,{}):esc(b.funding_type||'—')}</td>
      <td>${eSelect('bookings','bookings',b.id,'status',b.status,BOOKING_STATUS_OPTS,{blank:false})}</td>
      ${extraKeys.map(k=>`<td>${eExtra('bookings','bookings',b.id,k,(b.extra||{})[k],{disabled:!editing})}</td>`).join('')}
      ${editing?`<td><button class="btn small danger" data-del-row="bookings|bookings|${b.id}">Del</button></td>`:''}
    </tr>`).join('')}
    </tbody></table></div></div>`;
}

function newBookingModal(){
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="bookingModal"><div class="modal"><div class="modal-head"><h3>New booking</h3><button class="icon-btn" data-close>×</button></div><form id="bookingForm" class="form-grid"><label>Booking ID<input name="booking_code" required placeholder="DMS00136"></label><label>Passenger<input name="passenger_name" required></label><label>Booking date<input name="booking_date" type="date" required></label><label>Time<input name="requested_time" type="time"></label><label class="span-2">Pickup<input name="pickup_location"></label><label class="span-2">Drop-off<input name="dropoff_location"></label><label>Funding<select name="funding_type">${FUNDING_OPTS.map(f=>`<option>${f}</option>`).join('')}</select></label><label>Driver<select name="driver_id"><option value="">Unassigned</option>${state.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label><label>Vehicle<select name="vehicle_id"><option value="">Unassigned</option>${state.vehicles.map(v=>`<option value="${v.id}">${esc(v.rego)}</option>`).join('')}</select></label><label>Status<select name="status">${BOOKING_STATUS_OPTS.map(s=>`<option>${s}</option>`).join('')}</select></label><div class="span-2 modal-actions"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">Create booking</button></div></form></div></div>`);
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.querySelector('#bookingModal')?.remove());
  document.querySelector('#bookingForm').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));Object.keys(f).forEach(k=>f[k]===''&&(f[k]=null));const {error}=await supabase.from('bookings').insert(f);if(error){alert(error.message);return;}document.querySelector('#bookingModal').remove();await loadData();};
}

/* ===================== Generic simple editable page builder (for Checks/Transfers/Incidents/Stock/Staff/ASTP) ===================== */

function editablePage({pageKey,title,table,stateKey,cols,addDefaults,rowAttrs}){
  const rows = state[stateKey];
  const editing = !!editState[pageKey];
  const extraKeys = extraKeysOf(rows);
  const allCols = [...cols, ...extraKeys.map(k=>({key:'__extra_'+k,label:k,extra:k}))];
  return `<div class="panel ${editing?'editing-mode':''}">
    <div class="panel-head"><h3>${title}</h3><div class="col-actions">
      ${editing?`<button class="col-add-btn" data-add-field="${table}|${stateKey}">+ Field</button>`:''}
      ${editing&&addDefaults!==undefined?`<button class="btn small" data-add-row="${table}|${stateKey}" data-add-defaults='${JSON.stringify(addDefaults)}'>+ Row</button>`:''}
      ${editToggle(pageKey)}
    </div></div>
    ${!rows.length?'<div class="empty">No records yet.</div>':`<div class="table-wrap"><table class="table"><thead><tr>${allCols.map(c=>{
      if(c.extra && editing) return `<th class="col-removable">${esc(c.label)}<button class="col-del-x" data-del-field="${table}|${stateKey}|${esc(c.extra)}">×</button></th>`;
      return `<th>${esc(c.label)}</th>`;
    }).join('')}${editing?'<th></th>':''}</tr></thead><tbody>
    ${rows.map(r=>`<tr ${rowAttrs?rowAttrs(r,editing):''} class="${(rowAttrs&&!editing?'clickable-check ':'')+c_rowClass(r)}">${allCols.map(c=>{
      if(c.extra) return `<td>${eExtra(table,stateKey,r.id,c.extra,(r.extra||{})[c.extra],{disabled:!editing})}</td>`;
      return `<td>${c.render(r,editing)}</td>`;
    }).join('')}${editing?`<td><button class="btn small danger" data-del-row="${table}|${stateKey}|${r.id}">Del</button></td>`:''}</tr>`).join('')}
    </tbody></table></div>`}
  </div>`;
}
function c_rowClass(r){ return rowStatusClass(r.status); }

function checksPage(){
  return editablePage({
    pageKey:'checks', title:'Daily Vehicle Checks', table:'vehicle_checks', stateKey:'checks',
    addDefaults:{check_type:'pre_start'},
    rowAttrs:(r,editing)=>editing?'':`class="clickable-check" data-detail-table="checks" data-detail-id="${r.id}"`,
    cols:[
      {label:'Type', render:(r,e)=>e?eSelect('vehicle_checks','checks',r.id,'check_type',r.check_type,[{value:'pre_start',label:'Pre-start'},{value:'post_shift',label:'Post-shift'}],{blank:false}):badge(r.check_type==='pre_start'?'Pre-start':'Post-shift')},
      {label:'Date', render:(r,e)=>e?eText('vehicle_checks','checks',r.id,'check_date',r.check_date,{type:'date'}):fmtDate(r.check_date)},
      {label:'Driver', render:(r,e)=>e?eText('vehicle_checks','checks',r.id,'driver_name',r.driver_name||personName(r.staff_id)):esc(r.driver_name||personName(r.staff_id))},
      {label:'Vehicle', render:(r,e)=>e?eText('vehicle_checks','checks',r.id,'rego',r.rego||vehicleRego(r.vehicle_id)):esc(r.rego||vehicleRego(r.vehicle_id))},
      {label:'Odometer', render:(r,e)=>e?eText('vehicle_checks','checks',r.id,'odometer',r.odometer,{type:'number',cast:'number'}):esc(r.odometer??'—')},
      {label:'Compliance', render:(r,e)=>e?'':complianceBadge(r)},
      {label:'Comments', render:(r,e)=>e?eText('vehicle_checks','checks',r.id,'comments',r.comments):esc(r.comments||'—')},
    ]
  });
}

function transfersPage(){
  return editablePage({
    pageKey:'transfers', title:'Submitted Transfer Forms', table:'transfer_logs', stateKey:'transfers',
    addDefaults:{},
    cols:[
      {label:'Booking', render:(r,e)=>e?eText('transfer_logs','transfers',r.id,'booking_code',r.booking_code):`<strong>${esc(r.booking_code||'—')}</strong>`},
      {label:'Driver', render:(r,e)=>e?eText('transfer_logs','transfers',r.id,'driver_name',r.driver_name):esc(r.driver_name||'—')},
      {label:'Vehicle', render:(r,e)=>e?eText('transfer_logs','transfers',r.id,'vehicle_used',r.vehicle_used):esc(r.vehicle_used||'—')},
      {label:'Passenger', render:(r,e)=>e?eText('transfer_logs','transfers',r.id,'passenger_name',r.passenger_name):esc(r.passenger_name||'—')},
      {label:'Collection', render:(r,e)=>e?(eText('transfer_logs','transfers',r.id,'collection_date',r.collection_date,{type:'date'})+eText('transfer_logs','transfers',r.id,'collection_time',r.collection_time,{type:'time'})):`${fmtDate(r.collection_date)} ${fmtTime(r.collection_time)}`},
      {label:'Pickup', render:(r,e)=>e?eText('transfer_logs','transfers',r.id,'pickup_location',r.pickup_location):esc(r.pickup_location||'—')},
      {label:'Drop-off', render:(r,e)=>e?eText('transfer_logs','transfers',r.id,'dropoff_location',r.dropoff_location):esc(r.dropoff_location||'—')},
    ]
  });
}

function incidentPage(){
  return editablePage({
    pageKey:'incidents', title:'Incident & Hazard Reporting', table:'incidents', stateKey:'incidents',
    addDefaults:{status:'Open'},
    cols:[
      {label:'Status', render:(r,e)=>e?eSelect('incidents','incidents',r.id,'status',r.status,['Open','In Review','Closed'],{blank:false}):badge(r.status)},
      {label:'Date / Time', render:(r,e)=>e?eText('incidents','incidents',r.id,'incident_at',r.incident_at?r.incident_at.slice(0,16):'',{type:'datetime-local'}):(r.incident_at?new Date(r.incident_at).toLocaleString('en-AU'):'—')},
      {label:'Description', render:(r,e)=>e?eText('incidents','incidents',r.id,'description',r.description):esc(r.description||'—')},
      {label:'Location', render:(r,e)=>e?eText('incidents','incidents',r.id,'location',r.location):esc(r.location||'—')},
      {label:'Participant', render:(r,e)=>e?eText('incidents','incidents',r.id,'participant_name',r.participant_name):esc(r.participant_name||'—')},
      {label:'Staff', render:(r,e)=>e?eText('incidents','incidents',r.id,'staff_name',r.staff_name):esc(r.staff_name||'—')},
    ]
  });
}

function stockPage(){
  return editablePage({
    pageKey:'stock', title:'Stock', table:'stock_items', stateKey:'stock',
    addDefaults:{name:'New item'},
    cols:[
      {label:'Item', render:(r,e)=>e?eText('stock_items','stock',r.id,'name',r.name):`<strong>${esc(r.name)}</strong>`},
      {label:'Category', render:(r,e)=>e?eText('stock_items','stock',r.id,'category',r.category):esc(r.category||'—')},
      {label:'Mandatory Qty', render:(r,e)=>e?eText('stock_items','stock',r.id,'mandatory_quantity',r.mandatory_quantity):esc(r.mandatory_quantity||'—')},
      {label:'Expiry', render:(r,e)=>e?eText('stock_items','stock',r.id,'expiry_date',r.expiry_date,{type:'date'}):fmtDate(r.expiry_date)},
      {label:'Notes', render:(r,e)=>e?eText('stock_items','stock',r.id,'notes',r.notes):esc(r.notes||'—')},
    ]
  });
}

function staffPage(){
  return editablePage({
    pageKey:'staff', title:'Staff', table:'staff', stateKey:'staff',
    addDefaults:{name:'New staff member'},
    cols:[
      {label:'Name', render:(r,e)=>e?eText('staff','staff',r.id,'name',r.name):`<strong>${esc(r.name)}</strong>`},
      {label:'Email', render:(r,e)=>e?eText('staff','staff',r.id,'email',r.email,{type:'email'}):esc(r.email||'—')},
      {label:'Phone', render:(r,e)=>e?eText('staff','staff',r.id,'phone',r.phone):esc(r.phone||'—')},
      {label:'Status', render:(r,e)=>e?eText('staff','staff',r.id,'status',r.status):badge(r.status||'Active')},
    ]
  });
}

function astpPage(){
  return editablePage({
    pageKey:'astp', title:'ASTP Staff List', table:'astp_compliance', stateKey:'astp',
    addDefaults:undefined,
    cols:[
      {label:'Staff member', render:(r)=>`<strong>${esc(personName(r.staff_id))}</strong>`},
      {label:'Driver Application', render:(r,e)=>e?eFileUpload('astp_compliance','astp',r.id,'driver_application_url',r.driver_application_url):(r.driver_application_url?fileLinkChip(r.driver_application_url):'—')},
      {label:'Medical Fitness', render:(r,e)=>e?eFileUpload('astp_compliance','astp',r.id,'medical_fitness_url',r.medical_fitness_url):(r.medical_fitness_url?fileLinkChip(r.medical_fitness_url):'—')},
      {label:'WWCC', render:(r,e)=>e?eFileUpload('astp_compliance','astp',r.id,'wwc_url',r.wwc_url):(r.wwc_url?fileLinkChip(r.wwc_url):'—')},
      {label:'Licence', render:(r,e)=>e?eFileUpload('astp_compliance','astp',r.id,'drivers_licence_url',r.drivers_licence_url):(r.drivers_licence_url?fileLinkChip(r.drivers_licence_url):'—')},
      {label:'Notes', render:(r,e)=>e?eText('astp_compliance','astp',r.id,'notes',r.notes):esc(r.notes||'—')},
    ]
  });
}

/* ===================== SIL & Care ===================== */

function silPage(){
  const sub = [
    {key:'orientation', title:'Orientation', table:'orientation_checklists',
     cols:[{label:'Participant',render:(r,e)=>e?eText('orientation_checklists','orientation',r.id,'participant_name',r.participant_name):esc(r.participant_name||'—')},
           {label:'SIL Location',render:(r,e)=>e?eText('orientation_checklists','orientation',r.id,'sil_location',r.sil_location):esc(r.sil_location||'—')},
           {label:'Support Worker',render:(r,e)=>e?eText('orientation_checklists','orientation',r.id,'support_worker_name',r.support_worker_name):esc(r.support_worker_name||'—')},
           {label:'Trainer',render:(r,e)=>e?eText('orientation_checklists','orientation',r.id,'trainer_name',r.trainer_name):esc(r.trainer_name||'—')},
           {label:'Date',render:(r,e)=>e?eText('orientation_checklists','orientation',r.id,'check_date',r.check_date,{type:'date'}):fmtDate(r.check_date)}]},
    {key:'silMaintenance', title:'Maintenance', table:'sil_maintenance_checks',
     cols:[{label:'SIL Location',render:(r,e)=>e?eText('sil_maintenance_checks','silMaintenance',r.id,'sil_location',r.sil_location):esc(r.sil_location||'—')},
           {label:'Support Worker',render:(r,e)=>e?eText('sil_maintenance_checks','silMaintenance',r.id,'support_worker_name',r.support_worker_name):esc(r.support_worker_name||'—')},
           {label:'Date',render:(r,e)=>e?eText('sil_maintenance_checks','silMaintenance',r.id,'check_date',r.check_date,{type:'date'}):fmtDate(r.check_date)},
           {label:'Outside Notes',render:(r,e)=>e?eText('sil_maintenance_checks','silMaintenance',r.id,'outside_notes',r.outside_notes):esc(r.outside_notes||'—')},
           {label:'Inside Notes',render:(r,e)=>e?eText('sil_maintenance_checks','silMaintenance',r.id,'inside_notes',r.inside_notes):esc(r.inside_notes||'—')}]},
    {key:'firstAid', title:'First Aid', table:'first_aid_checks',
     cols:[{label:'Staff',render:(r,e)=>e?eText('first_aid_checks','firstAid',r.id,'full_name',r.full_name):esc(r.full_name||'—')},
           {label:'SIL Location',render:(r,e)=>e?eText('first_aid_checks','firstAid',r.id,'sil_location',r.sil_location):esc(r.sil_location||'—')},
           {label:'Items Used',render:(r,e)=>e?eText('first_aid_checks','firstAid',r.id,'items_used',r.items_used):esc(r.items_used||'—')}]},
    {key:'silVisitors', title:'Visitors', table:'sil_visitor_checkins',
     cols:[{label:'Visitor',render:(r,e)=>e?eText('sil_visitor_checkins','silVisitors',r.id,'visitor_name',r.visitor_name):esc(r.visitor_name||'—')},
           {label:'SIL Location',render:(r,e)=>e?eText('sil_visitor_checkins','silVisitors',r.id,'sil_location',r.sil_location):esc(r.sil_location||'—')},
           {label:'Reason',render:(r,e)=>e?eText('sil_visitor_checkins','silVisitors',r.id,'reason_for_visit',r.reason_for_visit):esc(r.reason_for_visit||'—')},
           {label:'Duration',render:(r,e)=>e?eText('sil_visitor_checkins','silVisitors',r.id,'duration',r.duration):esc(r.duration||'—')},
           {label:'Date/Time',render:r=>r.visit_at?new Date(r.visit_at).toLocaleString('en-AU'):'—'}]},
  ];
  return `<div class="grid-2">${sub.map(s=>{
    const editing = !!editState[s.key];
    const rows = state[s.key];
    return `<div class="panel ${editing?'editing-mode':''}"><div class="panel-head"><h3>${s.title}</h3>${editToggle(s.key)}</div>
    ${!rows.length?'<div class="empty">No records yet.</div>':`<div class="table-wrap"><table class="table"><thead><tr>${s.cols.map(c=>`<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${s.cols.map(c=>`<td>${c.render(r,editing)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
    </div>`;
  }).join('')}</div>`;
}

/* ===================== Fleet ===================== */

const VEHICLE_STATUS_OPTS=['Pending','Completed','Missing','n/a'];
const VEHICLE_YN_OPTS=['PENDING','YES','NO'];
const VEHICLE_ASTP_OPTS=['RELIEF','PRIMARY','n/a'];
const VEHICLE_GROUP_OPTS=['SUV','Wheelchair Accessible Vehicles','LDV VAN','Hatchback','Other'];
function groupIcon(name){
  const n = String(name||'').toLowerCase();
  if(n.includes('wheelchair')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="18" r="3"/><path d="M8 18V9a2 2 0 0 1 2-2h1M8 13h6l3 5h3"/><circle cx="17" cy="5" r="1.5"/></svg>';
  if(n.includes('van')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17h2M2 8h13l4 4v5h-2"/><path d="M2 8v9h2"/><rect x="15" y="12" width="6" height="5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>';
  if(n.includes('hatch')) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 16l1.5-5.5A2 2 0 0 1 6.4 9h11.2a2 2 0 0 1 1.9 1.5L21 16"/><path d="M3 16h18v3H3z"/><circle cx="7" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13l2-6a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 6"/><rect x="1" y="13" width="22" height="6" rx="1"/><circle cx="6.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></svg>';
}

const MONDAY_GROUP_COLORS = ['#0086C0','#A25DDC','#FF7575','#00C875','#FDAB3D','#579BFC','#BB3354'];
function fleetPage(){
  const editing = !!editState.fleet;
  const extraKeys=extraKeysOf(state.vehicles);
  const groups=[...new Set(state.vehicles.map(v=>v.vehicle_group||'Unassigned'))];
  const cols=['Rego','Group','Status','Make / Model','Year','VIN','Rego Expiry','HVIS Expiry','ASTP Usage','App. Pack','Emergency Equip.','Epi-Pen','Warning Signage','Odometer','Notes',...extraKeys];
  const rowsHtml = groups.map((g,gi)=>{
    const groupColor = MONDAY_GROUP_COLORS[gi % MONDAY_GROUP_COLORS.length];
    const groupRows = state.vehicles.filter(v=>(v.vehicle_group||'Unassigned')===g).map(v=>`<tr>
      <td>${editing?eText('vehicles','vehicles',v.id,'rego',v.rego):`<strong>${esc(v.rego)}</strong>`}</td>
      <td>${editing?eSelect('vehicles','vehicles',v.id,'vehicle_group',v.vehicle_group,VEHICLE_GROUP_OPTS):esc(v.vehicle_group||'—')}</td>
      <td>${editing?eSelect('vehicles','vehicles',v.id,'status',v.status,VEHICLE_STATUS_OPTS):badge(v.status)}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'make_model',v.make_model):esc(v.make_model||'—')}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'year',v.year,{type:'number',cast:'number'}):esc(v.year||'—')}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'vin',v.vin):esc(v.vin||'—')}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'rego_expiry',v.rego_expiry,{type:'date'}):fmtDate(v.rego_expiry)}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'hvis_expiry',v.hvis_expiry,{type:'date'}):fmtDate(v.hvis_expiry)}</td>
      <td>${editing?eSelect('vehicles','vehicles',v.id,'astp_usage',v.astp_usage,VEHICLE_ASTP_OPTS):esc(v.astp_usage||'—')}</td>
      <td>${editing?eFileUpload('vehicles','vehicles',v.id,'application_pack_url',v.application_pack_url):(v.application_pack_url?fileLinkChip(v.application_pack_url):'—')}</td>
      <td>${editing?eSelect('vehicles','vehicles',v.id,'emergency_equipment_label',v.emergency_equipment==null?'':(v.emergency_equipment?'YES':'NO'),VEHICLE_YN_OPTS,{cast:'bool-yn'}):badge(v.emergency_equipment==null?'—':(v.emergency_equipment?'YES':'NO'))}</td>
      <td>${editing?eSelect('vehicles','vehicles',v.id,'epi_pen_label',v.epi_pen==null?'':(v.epi_pen?'YES':'NO'),VEHICLE_YN_OPTS,{cast:'bool-yn'}):badge(v.epi_pen==null?'—':(v.epi_pen?'YES':'NO'))}</td>
      <td>${editing?eSelect('vehicles','vehicles',v.id,'warning_signage_label',v.warning_signage==null?'':(v.warning_signage?'YES':'NO'),VEHICLE_YN_OPTS,{cast:'bool-yn'}):badge(v.warning_signage==null?'—':(v.warning_signage?'YES':'NO'))}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'current_odometer',v.current_odometer,{type:'number',cast:'number'}):esc(v.current_odometer??'—')}</td>
      <td>${editing?eText('vehicles','vehicles',v.id,'notes',v.notes):esc(v.notes||'—')}</td>
      ${extraKeys.map(k=>`<td>${eExtra('vehicles','vehicles',v.id,k,(v.extra||{})[k],{disabled:!editing})}</td>`).join('')}
      ${editing?`<td><button class="btn small danger" data-del-row="vehicles|vehicles|${v.id}">Del</button></td>`:''}
    </tr>`).join('');
    return `<tr class="group-row" style="--gcolor:${groupColor}"><td colspan="${cols.length+(editing?1:0)}" style="background:${groupColor}"><span class="group-title"><span class="group-ic">${groupIcon(g)}</span>${esc(g)} <span class="group-count">${state.vehicles.filter(v=>(v.vehicle_group||'Unassigned')===g).length}</span></span></td></tr>${groupRows}`;
  }).join('');
  return `<div class="panel ${editing?'editing-mode':''}">
    <div class="panel-head"><h3>Fleet — Asset List</h3><div class="col-actions">${editing?`<button class="col-add-btn" data-add-field="vehicles|vehicles">+ Field</button><button class="btn small" data-add-row="vehicles|vehicles" data-add-defaults='{"rego":"NEW VEHICLE","vehicle_group":"Unassigned"}'>+ Vehicle</button>`:''}${editToggle('fleet')}</div></div>
    <div class="table-wrap"><table class="table fleet-table"><thead><tr>${cols.map(c=>{
      const isExtra=extraKeys.includes(c);
      return isExtra&&editing?`<th class="col-removable">${esc(c)}<button class="col-del-x" data-del-field="vehicles|vehicles|${esc(c)}">×</button></th>`:`<th>${esc(c)}</th>`;
    }).join('')}${editing?'<th></th>':''}</tr></thead><tbody>${rowsHtml}</tbody></table></div>
  </div>`;
}

/* ===================== Payload display formatting ===================== */

const FIELD_LABELS = {
  q4_typeA:'Vehicle Registration', q5_date:'Date', q40_number:'Odometer', q42_uniqueId:'Unique ID',
  q54_fatigueManagement:'Fatigue Management', q55_emotionalWellbeing:'Emotional Wellbeing',
  q56_tripPlanning:'Trip Planning', q57_medicationAnd:'Medication and Substances',
  q58_emergencyAnd:'Emergency and Safety', q62_brakesAnd:'Brakes and Brake Lights',
  q63_tyreCondition63:'Tyres', q64_headlights64:'Headlights', q65_indicators65:'Indicators',
  q66_headlights66:'Windscreen', q67_headlights67:'Wipers - Front and Back',
  q68_headlights68:'Mirrors - Internal/External', q69_headlights69:'Fuel',
  q71_anyAdditional:'Additional Comments', q85_confirmItems85:'Stock Check',
  q86_driverName:'Driver Name', q87_driverName:'Driver Name', q86_vehicleClean:'Vehicle Clean and in Good Condition',
  q90_uploadA:'Vehicle Log Book Photo', q30_signature:'Signature', q12_driversSignature:'Driver Signature',
  q10_signature:'Signature', q9_vehicleUsed:'Vehicle Used', q38_driverName:'Driver Name',
  q43_typeA:'Passenger Name', q25_typeA25:'Booking ID', q48_typeA48:'Date of Collection',
  q44_pickupLocation:'Pickup Location', q46_dropoffLocation:'Drop-off Location', q49_timeOf:'Time of Collection',
  q50_returnRequired:'Return Booked', q51_waitTime:'Wait Time', q47_anyAdditional:'Additional Notes',
  q28_whatAre:'What Are You Reporting', q42_descriptionOf:'Description', q70_address:'Location',
  q49_staffName:'Staff Name', q69_participantsName:'Participant Name', q34_phoneNumber:'Phone Number',
  q60_typeA:'Full Name', q63_typeA63:'SIL Location', q99_trainer:'Trainer', q67_supportWorker:'Support Worker',
  q122_additionalNotes:'Additional Notes', q57_stock:'First Aid Stock Used',
};
const SYSTEM_KEYS = new Set(['path','slug','event_id','buildDate','submitDate','submitSource','timeToSubmit',
  'uploadServerUrl','newCardFormMobile','jsExecutionTracker','validatedNewRequiredFieldIDs','file','file_server',
  'temp_upload','eventObserver','eventObserverPayment','hiddenPaymentField','payment_version','payment_discount_value',
  'payment_total_checksum','payment_transaction_uuid','paymentSummary','visitedPages']);

function fieldLabel(key){
  return FIELD_LABELS[key] || key.replace(/^q\d+_?/,'').replace(/([A-Z])/g,' $1').replace(/\s+/g,' ').trim().replace(/^./,c=>c.toUpperCase()) || key;
}
function isImageUrl(s){ return typeof s==='string' && (s.startsWith('data:image') || /\.(png|jpe?g|gif|webp)(\?|$)/i.test(s)); }
function isFileUrl(s){ return typeof s==='string' && /^https?:\/\//i.test(s); }
function formatDateObj(v){
  if(v && typeof v==='object' && (v.day||v.month||v.year)){
    const d=v.day?String(v.day).padStart(2,'0'):'', m=v.month?String(v.month).padStart(2,'0'):'', y=v.year||'';
    return [d,m,y].filter(Boolean).join('/');
  }
  return null;
}
function renderPayloadValue(key,v){
  if(v==null || v==='') return '<span class="muted">—</span>';
  const dateStr = formatDateObj(v);
  if(dateStr) return esc(dateStr);
  if(isImageUrl(v)) return `<a href="${esc(v)}" target="_blank" rel="noopener"><img src="${esc(v)}" alt="${esc(fieldLabel(key))}" class="payload-thumb"></a>`;
  if(Array.isArray(v)){
    const imgs = v.filter(isImageUrl);
    if(imgs.length) return imgs.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="${esc(fieldLabel(key))}" class="payload-thumb"></a>`).join(' ');
    return esc(v.filter(Boolean).join(', ')) || '<span class="muted">—</span>';
  }
  if(typeof v==='object'){
    const vals = Object.entries(v).filter(([k])=>k!=='other').map(([,x])=>x);
    const other = v.other;
    const flat = [...vals, other].filter(x=>x!=null && x!=='');
    if(flat.some(isImageUrl)) return flat.filter(isImageUrl).map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="${esc(fieldLabel(key))}" class="payload-thumb"></a>`).join(' ');
    return esc(flat.map(String).join(', ')) || '<span class="muted">—</span>';
  }
  if(isImageUrl(v)) return `<img src="${esc(v)}" class="payload-thumb">`;
  if(isFileUrl(v)) return fileLinkChip(v);
  return esc(String(v));
}
function fileExtLabel(url){
  const m = String(url).match(/\.([a-z0-9]{2,5})(?:\?|$)/i);
  return m ? m[1].toUpperCase() : 'FILE';
}
function fileLinkChip(url){
  if(isImageUrl(url)) return `<a href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" class="payload-thumb payload-thumb-sm" onerror="this.closest('a').outerHTML='<span class=&quot;file-chip file-chip-broken&quot;>Image unavailable (login-protected)</span>'"></a>`;
  if(/\.pdf(\?|$)/i.test(url)) return pdfPreviewHtml(url);
  return `<a class="file-chip" href="${esc(url)}" target="_blank" rel="noopener"><span class="file-chip-ic">${fileExtLabel(url)}</span>Open file ↗</a>`;
}

/* Safe PDF thumbnail: fetches bytes via JS fetch() and renders page 1 to a canvas with pdf.js.
   Never navigates the browser to the raw URL, so it cannot trigger a forced download
   the way <embed>/<iframe> did. Falls back to a plain "Open file" chip if the fetch/CORS/render fails. */
const pdfThumbState = new Map(); // url -> 'pending' | 'done' | 'failed'
let pdfjsLibPromise = null;
function loadPdfJs(){
  if(!pdfjsLibPromise){
    pdfjsLibPromise = import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs').then(lib=>{
      lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';
      return lib;
    });
  }
  return pdfjsLibPromise;
}
function pdfPreviewHtml(url){
  const cid = 'pdfth_'+Math.random().toString(36).slice(2);
  return `<span class="pdf-thumb-wrap" data-pdf-url="${esc(url)}" data-pdf-cid="${cid}">
    <a class="file-chip pdf-chip-fallback" href="${esc(url)}" target="_blank" rel="noopener"><span class="file-chip-ic">PDF</span>Open file ↗</a>
    <a href="${esc(url)}" target="_blank" rel="noopener" class="pdf-canvas-link" hidden><canvas id="${cid}" class="pdf-thumb-canvas"></canvas></a>
  </span>`;
}
async function processPdfThumbs(){
  const wraps = document.querySelectorAll('[data-pdf-url]');
  for(const wrap of wraps){
    const url = wrap.dataset.pdfUrl;
    const cached = pdfThumbState.get(url);
    if(cached==='failed'){ markFailed(wrap); continue; }
    if(cached==='done'){ paintCachedThumb(wrap,url); continue; }
    if(cached==='pending') continue;
    pdfThumbState.set(url,'pending');
    renderOnePdfThumb(wrap,url);
  }
}
function markFailed(wrap){
  // Fallback chip already shows "Open file" — nothing extra to change on failure.
}
const pdfThumbDataUrls = new Map();
function paintCachedThumb(wrap,url){
  const dataUrl = pdfThumbDataUrls.get(url); if(!dataUrl) return;
  const canvasLink = wrap.querySelector('.pdf-canvas-link'); const fallback = wrap.querySelector('.pdf-chip-fallback');
  const img = new Image(); img.className='pdf-thumb-canvas'; img.src=dataUrl;
  canvasLink.innerHTML=''; canvasLink.appendChild(img); canvasLink.hidden=false; fallback.hidden=true;
}
async function renderOnePdfThumb(wrap,url){
  try{
    const lib = await loadPdfJs();
    const res = await fetch(url); if(!res.ok) throw new Error('HTTP '+res.status);
    const buf = await res.arrayBuffer();
    const pdf = await lib.getDocument({data:buf}).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({scale:1});
    const scale = 130/viewport.width;
    const scaledViewport = page.getViewport({scale});
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(scaledViewport.width); canvas.height = Math.ceil(scaledViewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({canvasContext:ctx, viewport:scaledViewport}).promise;
    const dataUrl = canvas.toDataURL('image/png');
    pdfThumbDataUrls.set(url,dataUrl);
    pdfThumbState.set(url,'done');
    document.querySelectorAll(`[data-pdf-url="${CSS.escape(url)}"]`).forEach(w=>paintCachedThumb(w,url));
  }catch(e){
    console.warn('PDF preview failed for', url, '—', e.message||e);
    pdfThumbState.set(url,'failed');
    document.querySelectorAll(`[data-pdf-url="${CSS.escape(url)}"]`).forEach(w=>markFailed(w));
  }
}


/* File upload / replace — uploads to Supabase Storage 'documents' bucket, updates the row's URL column */
function eFileUpload(table,stateKey,id,key,currentUrl){
  const inputId = `upl_${table}_${id}_${key}`.replace(/[^a-zA-Z0-9_]/g,'');
  return `<div class="file-upload-cell">
    ${currentUrl?fileLinkChip(currentUrl):'<span class="muted">No file</span>'}
    <label class="btn small file-upload-btn" for="${inputId}">${currentUrl?'Replace':'Upload'}</label>
    <input type="file" id="${inputId}" class="file-upload-input" accept="application/pdf,image/*"
      data-eupload-table="${table}" data-eupload-state="${stateKey}" data-eupload-id="${id}" data-eupload-key="${key}" data-eupload-old="${esc(currentUrl||'')}">
  </div>`;
}
async function handleFileUpload(input){
  const file = input.files?.[0]; if(!file) return;
  const table = input.dataset.euploadTable, stateKey = input.dataset.euploadState, id = input.dataset.euploadId, key = input.dataset.euploadKey, old = input.dataset.euploadOld;
  const label = input.previousElementSibling;
  const origText = label.textContent; label.textContent='Uploading…';
  const path = `${table}/${id}/${key}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g,'_')}`;
  const {error:upErr} = await supabase.storage.from('documents').upload(path,file,{upsert:true});
  if(upErr){alert('Upload failed: '+upErr.message); label.textContent=origText; return;}
  const {data:pub} = supabase.storage.from('documents').getPublicUrl(path);
  const newUrl = pub.publicUrl;
  const {error} = await supabase.from(table).update({[key]:newUrl}).eq('id',id);
  if(error){alert('Could not save new file URL: '+error.message); label.textContent=origText; return;}
  const row = state[stateKey]?.find(r=>r.id===id);
  if(row) row[key]=newUrl;
  if(old && old.includes('/documents/')){
    const oldPath = old.split('/documents/')[1];
    if(oldPath) supabase.storage.from('documents').remove([oldPath]).catch(()=>{});
  }
  render();
}




const NEGATIVE = /(missing|not working|fail|failed|fault|broken|damage|damaged|unsafe|defect|issue|problem|low|empty|expired|unavailable|not available|needs? repair)/i;
const EXPECTED_STOCK = ['gloves','surgical masks','sanitiser','cleaning supplies'];
function payloadText(v){
  if(v==null) return '';
  if(Array.isArray(v)) return v.map(payloadText).filter(Boolean).join(', ');
  if(typeof v==='object') return Object.values(v).map(payloadText).filter(Boolean).join(', ');
  return String(v).trim();
}
function checkIssues(row){
  const p=row.payload||{}; if(!Object.keys(p).length) return [];
  const issues=[]; const add=(key,label,msg)=>{if(msg&&!issues.some(x=>x.key===key&&x.message===msg))issues.push({key,label,message:msg});};
  const lower=k=>payloadText(p[k]).toLowerCase();
  if(lower('q54_fatigueManagement') && lower('q54_fatigueManagement')!=='yes') add('q54','Fatigue Management',payloadText(p.q54_fatigueManagement));
  if(lower('q55_emotionalWellbeing') && lower('q55_emotionalWellbeing')!=='yes') add('q55','Emotional Wellbeing',payloadText(p.q55_emotionalWellbeing));
  if(lower('q56_tripPlanning') && lower('q56_tripPlanning')!=='yes') add('q56','Trip Planning',payloadText(p.q56_tripPlanning));
  if(lower('q57_medicationAnd') && lower('q57_medicationAnd')!=='no') add('q57','Medication and Substances',payloadText(p.q57_medicationAnd));
  const passFields={q62_brakesAnd:'Brakes and Brake Lights',q63_tyreCondition63:'Tyres',q64_headlights64:'Headlights',q65_indicators65:'Indicators',q66_headlights66:'Windscreen',q67_headlights67:'Wipers',q68_headlights68:'Mirrors'};
  for(const [key,label] of Object.entries(passFields)){
    const v=p[key]; if(v==null) continue;
    const vals=Array.isArray(v)?v.map(x=>String(x).toLowerCase()):typeof v==='object'?Object.entries(v).filter(([k])=>k!=='other').map(([,x])=>String(x).toLowerCase()):[String(v).toLowerCase()];
    const other=typeof v==='object'&&!Array.isArray(v)?payloadText(v.other):'';
    if(vals.length && !vals.some(x=>['pass','yes','ok','okay'].includes(x))) add(key,label,payloadText(v));
    if(other) add(key,label,other);
  }
  const stock=p.q85_confirmItems85;
  if(stock){
    const selected=(Array.isArray(stock)?stock:Object.entries(stock).filter(([k])=>k!=='other').map(([,v])=>v)).map(x=>String(x).toLowerCase());
    const missing=EXPECTED_STOCK.filter(x=>!selected.includes(x));
    if(missing.length) add('q85','Stock Check',`Missing: ${missing.join(', ')}`);
  }
  return issues;
}
function complianceBadge(row){
  if(!Object.keys(row.payload||{}).length) return '<span class="muted">—</span>';
  const n=checkIssues(row).length;
  return n?`<span class="badge open">⚠ ${n} issue${n===1?'':'s'}</span>`:`<span class="badge completed">✓ Passed</span>`;
}



function genericDetailModal(table,id){
  const source={checks:state.checks,transfers:state.transfers,incidents:state.incidents,orientation:state.orientation,silMaintenance:state.silMaintenance,firstAid:state.firstAid,silVisitors:state.silVisitors}[table]||[];
  const row=source.find(x=>x.id===id); if(!row)return;
  const titles={checks:row.check_type==='pre_start'?'Pre-start Check':'Post-shift Check',transfers:'Transport Service Log',incidents:'Incident Report',orientation:'Worker Orientation Checklist',silMaintenance:'SIL / Office Maintenance Checklist',firstAid:'First Aid Checklist',silVisitors:'SIL Visitor Check In'};
  const p=row.payload||{};
  const issueSummary = table==='checks' ? (()=>{
    const issues=checkIssues(row);
    return issues.length?`<div class="issue-summary"><strong>⚠ ${issues.length} compliance issue${issues.length===1?'':'s'} found</strong>${issues.map(i=>`<div><b>${esc(i.label)}:</b> ${esc(i.message)}</div>`).join('')}</div>`:(Object.keys(p).length?'<div class="pass-summary"><strong>✓ No compliance issues detected</strong></div>':'');
  })() : '';
  const rows=Object.keys(p).filter(k=>!SYSTEM_KEYS.has(k))
    .map(k=>`<div class="answer-row"><div class="answer-label">${esc(fieldLabel(k))}</div><div class="answer-value">${renderPayloadValue(k,p[k])}</div></div>`).join('')||'<div class="empty">No detailed submission payload stored for this record.</div>';
  document.body.insertAdjacentHTML('beforeend',`<div class="compliance-modal-backdrop" id="genericDetailModal"><div class="compliance-modal"><div class="compliance-head"><div><h3>${titles[table]||'Submission'}</h3></div><button id="closeGenericDetail">×</button></div><div class="compliance-body">${issueSummary}<div class="answers-title">Complete submission</div>${rows}</div></div></div>`);
  const close=()=>document.querySelector('#genericDetailModal')?.remove();
  document.querySelector('#closeGenericDetail').onclick=close;
  document.querySelector('#genericDetailModal').onclick=e=>{if(e.target.id==='genericDetailModal')close();};
}

/* ===================== Integrations ===================== */

function integrations(){
  const ns = state.notificationSettings || {threshold_days:[30,14],recipient_email:'transport@dmscare.com.au',enabled:true};
  return `<div class="grid-2"><div class="panel"><div class="panel-head"><h3>Connections</h3></div><div class="panel-body"><div class="connection"><strong>Supabase / PostgreSQL</strong><span class="ok">Connected</span></div><div class="connection"><strong>Supabase Auth</strong><span class="ok">Connected</span></div><div class="connection"><strong>GitHub</strong><span class="ok">Source controlled</span></div><div class="connection"><strong>Netlify</strong><span class="ok">Git deploy</span></div><div class="connection"><strong>Jotform</strong><span class="ok">10 forms wired</span></div><div class="connection"><strong>Email alerts (Resend)</strong><span class="ok">Daily @ scheduled</span></div></div></div>
  <div class="panel"><div class="panel-head"><h3>Vehicle expiry alerts</h3></div><div class="panel-body">
    <form id="notifSettingsForm" class="form-grid">
      <label class="span-2">Send alerts to<input name="recipient_email" value="${esc(ns.recipient_email)}" type="email" required></label>
      <label class="span-2">Alert this many days before expiry (comma-separated, e.g. 30,14,7)<input name="threshold_days" value="${esc((ns.threshold_days||[]).join(','))}" required></label>
      <label>Enabled<select name="enabled"><option value="true" ${ns.enabled?'selected':''}>Yes</option><option value="false" ${!ns.enabled?'selected':''}>No</option></select></label>
      <div class="span-2 modal-actions"><button type="button" class="btn" id="sendTestEmailBtn">Send test check now</button><button class="btn primary" type="submit">Save settings</button></div>
    </form>
    <p class="note">Checks Registration and HVIS expiry dates on every vehicle in the Fleet daily, and emails an alert the moment a vehicle crosses one of the day thresholds above. Add or remove thresholds any time — no code changes needed.</p>
  </div></div></div>`;
}

async function updateBookingStatus(id,status){
  const {error}=await supabase.from('bookings').update({status}).eq('id',id);
  if(error){state.error=error.message;render();return;}
  const row=state.bookings.find(x=>x.id===id); if(row) row.status=status;
}

async function saveNotificationSettings(e){
  e.preventDefault();
  const f=new FormData(e.target);
  const threshold_days=f.get('threshold_days').split(',').map(s=>parseInt(s.trim(),10)).filter(n=>Number.isFinite(n)&&n>0);
  const payload={recipient_email:f.get('recipient_email'),threshold_days,enabled:f.get('enabled')==='true'};
  const {data,error}=await supabase.from('notification_settings').update(payload).eq('entity_type','vehicle_expiry').select().single();
  if(error){alert('Could not save: '+error.message);return;}
  state.notificationSettings=data;
  alert('Saved.');
}

async function sendTestEmailCheck(){
  try{
    const res=await fetch('/.netlify/functions/expiry-check-test?key=29b545104d54fe607afe6f0b6a5f73cd');
    const text=await res.text();
    let json; try{json=JSON.parse(text);}catch{json=null;}
    if(!json){alert('Unexpected response: '+text.slice(0,300));return;}
    if(!json.ok){alert('Check failed: '+json.error);return;}
    alert(`Check ran: ${json.checked} vehicles checked, ${json.matchingAlerts} matched a threshold, ${json.alertsSent} email(s) sent.\n\n${(json.details||[]).join('\n')||'No vehicles are within an alert threshold right now.'}`);
  }catch(e){alert('Could not run check: '+e.message);}
}

/* ===================== Render / wiring ===================== */

function render(){
  let body='';
  if(state.current==='dashboard') body=dashboard();
  else if(state.current==='bookings') body=bookingsPage();
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
  document.querySelector('#refreshBtn').onclick=refreshWithSplash;
  document.querySelector('#newBookingBtn')?.addEventListener('click',newBookingModal);
  document.querySelectorAll('[data-detail-table]').forEach(tr=>tr.onclick=()=>genericDetailModal(tr.dataset.detailTable,tr.dataset.detailId));
  document.querySelector('#notifSettingsForm')?.addEventListener('submit',saveNotificationSettings);
  document.querySelector('#sendTestEmailBtn')?.addEventListener('click',sendTestEmailCheck);
  document.querySelector('#showMoreBookings')?.addEventListener('click',()=>{state.bookingsShowAll=true;render();});
  document.querySelector('#showLessBookings')?.addEventListener('click',()=>{state.bookingsShowAll=false;render();});
  document.querySelectorAll('[data-eupload-table]').forEach(el=>el.onchange=()=>handleFileUpload(el));
  wireGenericTable();
  processPdfThumbs();
}

loadData();
