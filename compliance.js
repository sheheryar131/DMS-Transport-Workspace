import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://yioqasfpmqvhmxrlpzyu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3Fhc2ZwbXF2aG14cmxwenl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDgwNjAsImV4cCI6MjEwMzI4NDA2MH0.RjBYJJQjhT-LHZhP5CH9rnx81QH4ZLEYdfLPSwWNyjM'
);

const LABELS = {
  q4_typeA:'Vehicle Registration', q5_date:'Date', q40_number:'Odometer', q42_uniqueId:'Unique ID',
  q54_fatigueManagement:'Fatigue Management', q55_emotionalWellbeing:'Emotional Wellbeing',
  q56_tripPlanning:'Trip Planning', q57_medicationAnd:'Medication and Substances',
  q58_emergencyAnd:'Emergency and Safety', q62_brakesAnd:'Brakes and Brake Lights',
  q63_tyreCondition63:'Tyres', q64_headlights64:'Headlights', q65_indicators65:'Indicators',
  q66_headlights66:'Windscreen', q67_headlights67:'Wipers - Front and Back',
  q68_headlights68:'Mirrors - Internal/External', q69_headlights69:'Fuel',
  q71_anyAdditional:'Additional Comments', q85_confirmItems85:'Stock Check',
  q86_driverName:'Driver Name', q87_driverName:'Driver Name', q86_vehicleClean:'Vehicle Clean and in Good Condition',
  q90_uploadA:'Vehicle Log Book Photo', q30_signature:'Signature'
};

const SYSTEM_KEYS = new Set(['path','slug','event_id','buildDate','submitDate','submitSource','timeToSubmit','uploadServerUrl','newCardFormMobile','jsExecutionTracker','validatedNewRequiredFieldIDs','file','file_server','temp_upload','uploadA']);
const NEGATIVE = /(missing|not working|fail|failed|fault|broken|damage|damaged|unsafe|defect|issue|problem|low|empty|expired|unavailable|not available|needs? repair)/i;
const EXPECTED_STOCK = ['gloves','surgical masks','sanitiser','cleaning supplies'];

let cache=[];
let renderTimer=null;
let rendering=false;

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function text(v){
  if(v == null) return '';
  if(Array.isArray(v)) return v.map(text).filter(Boolean).join(', ');
  if(typeof v === 'object') return Object.values(v).map(text).filter(Boolean).join(', ');
  return String(v).trim();
}
function fmtDate(v){
  if(!v) return '—';
  try{return new Intl.DateTimeFormat('en-AU',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${v}T00:00:00`));}
  catch{return v;}
}
function payloadRego(row){return row.rego || text(row.payload?.q4_typeA) || '—';}
function payloadOdo(row){return (row.odometer ?? Number(row.payload?.q40_number || 0)) || '—';}
function payloadDriver(row){return row.driver_name || text(row.payload?.q87_driverName) || text(row.payload?.q86_driverName) || '—';}

function issueList(row){
  const p=row.payload || {};
  if(row.source_submission_id?.startsWith('monday:')) return [];
  const issues=[];
  const add=(key,label,msg)=>{if(msg&&!issues.some(x=>x.key===key&&x.message===msg))issues.push({key,label,message:msg});};
  const lower=k=>text(p[k]).toLowerCase();

  if(lower('q54_fatigueManagement') && lower('q54_fatigueManagement')!=='yes') add('q54_fatigueManagement','Fatigue Management',text(p.q54_fatigueManagement));
  if(lower('q55_emotionalWellbeing') && lower('q55_emotionalWellbeing')!=='yes') add('q55_emotionalWellbeing','Emotional Wellbeing',text(p.q55_emotionalWellbeing));
  if(lower('q56_tripPlanning') && lower('q56_tripPlanning')!=='yes') add('q56_tripPlanning','Trip Planning',text(p.q56_tripPlanning));
  if(lower('q57_medicationAnd') && lower('q57_medicationAnd')!=='no') add('q57_medicationAnd','Medication and Substances',text(p.q57_medicationAnd));
  if(lower('q86_vehicleClean') && lower('q86_vehicleClean')!=='yes') add('q86_vehicleClean','Vehicle Clean and in Good Condition',text(p.q86_vehicleClean));

  const passFields={q62_brakesAnd:'Brakes and Brake Lights',q63_tyreCondition63:'Tyres',q64_headlights64:'Headlights',q65_indicators65:'Indicators',q66_headlights66:'Windscreen',q67_headlights67:'Wipers - Front and Back',q68_headlights68:'Mirrors - Internal/External'};
  for(const [key,label] of Object.entries(passFields)){
    const v=p[key]; if(v==null) continue;
    const vals=Array.isArray(v)?v.map(x=>String(x).toLowerCase()):typeof v==='object'?Object.entries(v).filter(([k])=>k!=='other').map(([,x])=>String(x).toLowerCase()):[String(v).toLowerCase()];
    const other=typeof v==='object'&&!Array.isArray(v)?text(v.other):'';
    if(vals.length && !vals.some(x=>['pass','yes','ok','okay'].includes(x))) add(key,label,text(v));
    if(other) add(key,label,other);
    else if(typeof v==='string'&&NEGATIVE.test(v)) add(key,label,v);
  }

  const emergency=p.q58_emergencyAnd;
  if(emergency && typeof emergency==='object' && !Array.isArray(emergency) && text(emergency.other)) add('q58_emergencyAnd','Emergency and Safety',text(emergency.other));

  const stock=p.q85_confirmItems85;
  if(stock){
    const selected=(Array.isArray(stock)?stock:Object.entries(stock).filter(([k])=>k!=='other').map(([,v])=>v)).map(x=>String(x).toLowerCase());
    const missing=EXPECTED_STOCK.filter(x=>!selected.includes(x));
    const other=typeof stock==='object'&&!Array.isArray(stock)?text(stock.other):'';
    if(missing.length) add('q85_confirmItems85','Stock Check',`Missing: ${missing.join(', ')}`);
    if(other) add('q85_confirmItems85','Stock Check',other);
  }

  if(lower('q69_headlights69') && !['yes','pass','full','ok','okay'].includes(lower('q69_headlights69')) && NEGATIVE.test(text(p.q69_headlights69))) add('q69_headlights69','Fuel',text(p.q69_headlights69));
  return issues;
}

function statusBadge(row){
  if(row.source_submission_id?.startsWith('monday:')) return '<span class="comp-badge legacy">Legacy record</span>';
  const n=issueList(row).length;
  return n?`<span class="comp-badge issue">⚠ Issues Found (${n})</span>`:'<span class="comp-badge pass">✓ Passed</span>';
}

function displayValue(key,v){
  if(key==='q30_signature') return v?'Signature captured':'—';
  if(key==='q5_date'&&v&&typeof v==='object') return `${v.day||''}/${v.month||''}/${v.year||''}`;
  return text(v)||'—';
}
function detailRows(row){
  const p=row.payload||{}; const issues=issueList(row); const issueKeys=new Set(issues.map(i=>i.key));
  const preferred=Object.keys(LABELS).filter(k=>k in p);
  const extras=Object.keys(p).filter(k=>k.startsWith('q')&&!preferred.includes(k)&&!SYSTEM_KEYS.has(k));
  return [...preferred,...extras].map(key=>{
    const label=LABELS[key]||key.replace(/^q\d+_?/,'').replace(/([A-Z])/g,' $1').trim()||key;
    const isIssue=issueKeys.has(key);
    return `<div class="answer-row ${isIssue?'answer-issue':''}"><div class="answer-label">${esc(label)}</div><div class="answer-value">${esc(displayValue(key,p[key]))}${isIssue?'<span class="answer-flag">Issue</span>':''}</div></div>`;
  }).join('')||'<div class="empty">Detailed Jotform answers are not available for this migrated Monday record.</div>';
}
function attachmentHtml(row){
  const p=row.payload||{};
  const urls=Array.isArray(p.uploadA)?p.uploadA.filter(Boolean):[];
  if(!urls.length) return '';
  return `<div class="answers-title">Attachments / Evidence</div><div class="attachment-grid">${urls.map((u,i)=>`<a class="attachment-card" href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Vehicle evidence ${i+1}"><span>Open full image</span></a>`).join('')}</div>`;
}
function openModal(row){
  const issues=issueList(row);
  document.body.insertAdjacentHTML('beforeend',`<div class="compliance-modal-backdrop" id="complianceModal"><div class="compliance-modal"><div class="compliance-head"><div><h3>${row.check_type==='pre_start'?'Pre-start Check':'Post-shift Check'}</h3><p>${esc(payloadDriver(row))} · ${esc(payloadRego(row))} · ${esc(fmtDate(row.check_date))}</p></div><button id="closeCompliance">×</button></div><div class="compliance-body">${issues.length?`<div class="issue-summary"><strong>⚠ ${issues.length} compliance issue${issues.length===1?'':'s'} found</strong>${issues.map(i=>`<div><b>${esc(i.label)}:</b> ${esc(i.message)}</div>`).join('')}</div>`:'<div class="pass-summary"><strong>✓ No compliance issues detected</strong></div>'}${attachmentHtml(row)}<div class="answers-title">Complete submission</div>${detailRows(row)}</div></div></div>`);
  const close=()=>document.querySelector('#complianceModal')?.remove();
  document.querySelector('#closeCompliance').onclick=close;
  document.querySelector('#complianceModal').onclick=e=>{if(e.target.id==='complianceModal')close();};
}

function filteredRows(){
  const date=document.querySelector('#checkDateFilter')?.value||'';
  const vehicle=(document.querySelector('#checkVehicleFilter')?.value||'').toLowerCase().trim();
  const driver=(document.querySelector('#checkDriverFilter')?.value||'').toLowerCase().trim();
  const search=(document.querySelector('#checkSearchFilter')?.value||'').toLowerCase().trim();
  return cache.filter(row=>{
    const hay=[row.check_type,row.check_date,payloadDriver(row),payloadRego(row),payloadOdo(row),row.comments,text(row.payload)].join(' ').toLowerCase();
    return (!date||row.check_date===date)&&(!vehicle||payloadRego(row).toLowerCase().includes(vehicle))&&(!driver||payloadDriver(row).toLowerCase().includes(driver))&&(!search||hay.includes(search));
  });
}
function renderRows(){
  const tbody=document.querySelector('#enhancedChecksBody'); if(!tbody)return;
  const rows=filteredRows();
  tbody.innerHTML=rows.length?rows.map(row=>`<tr class="clickable-check" data-check-id="${row.id}"><td><span class="badge ${row.check_type==='pre_start'?'pre-start':'post-shift'}">${row.check_type==='pre_start'?'Pre-start':'Post-shift'}</span></td><td>${esc(fmtDate(row.check_date))}</td><td>${esc(payloadDriver(row))}</td><td>${esc(payloadRego(row))}</td><td>${esc(payloadOdo(row))}</td><td>${statusBadge(row)}</td><td>${esc(row.comments||'—')}</td><td><button class="mini-delete" data-delete-id="${row.id}" title="Delete row">Del</button></td></tr>`).join(''):'<tr><td colspan="8" class="empty">No matching vehicle checks.</td></tr>';
  tbody.querySelectorAll('tr[data-check-id]').forEach(tr=>tr.onclick=e=>{if(e.target.closest('[data-delete-id]'))return;const row=cache.find(x=>x.id===tr.dataset.checkId);if(row)openModal(row);});
  tbody.querySelectorAll('[data-delete-id]').forEach(btn=>btn.onclick=async e=>{
    e.stopPropagation(); const id=btn.dataset.deleteId; const row=cache.find(x=>x.id===id); if(!row)return;
    if(!confirm(`Delete this ${row.check_type==='pre_start'?'pre-start':'post-shift'} check for ${payloadDriver(row)}?`))return;
    btn.disabled=true; const {error}=await supabase.from('vehicle_checks').delete().eq('id',id);
    if(error){alert(error.message);btn.disabled=false;return;}
    cache=cache.filter(x=>x.id!==id); renderRows();
  });
}

async function renderEnhancedChecks(){
  if(rendering)return;
  const title=document.querySelector('.page-title h1')?.textContent?.trim(); if(title!=='Daily Vehicle Checks')return;
  const panel=document.querySelector('.content .panel'); if(!panel)return;
  rendering=true;
  const {data:{session}}=await supabase.auth.getSession(); if(!session){rendering=false;return;}
  const {data,error}=await supabase.from('vehicle_checks').select('*').order('created_at',{ascending:false}).limit(500);
  if(error){rendering=false;return;}
  cache=data||[];
  panel.innerHTML=`<div class="check-filterbar"><input id="checkDateFilter" type="date"><input id="checkVehicleFilter" placeholder="Vehicle / rego"><input id="checkDriverFilter" placeholder="Driver"><input id="checkSearchFilter" placeholder="Search all fields"><button class="btn" id="clearCheckFilters">Clear</button></div><div class="table-wrap"><table class="table enhanced-checks"><thead><tr><th>Type</th><th>Date</th><th>Driver</th><th>Vehicle</th><th>Odometer</th><th>Compliance</th><th>Comments</th><th></th></tr></thead><tbody id="enhancedChecksBody"></tbody></table></div>`;
  ['checkDateFilter','checkVehicleFilter','checkDriverFilter','checkSearchFilter'].forEach(id=>document.querySelector(`#${id}`).addEventListener('input',renderRows));
  document.querySelector('#clearCheckFilters').onclick=()=>{['checkDateFilter','checkVehicleFilter','checkDriverFilter','checkSearchFilter'].forEach(id=>document.querySelector(`#${id}`).value='');renderRows();};
  renderRows(); rendering=false;
}

const observer=new MutationObserver(()=>{clearTimeout(renderTimer);renderTimer=setTimeout(renderEnhancedChecks,120);});
observer.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(renderEnhancedChecks,300);
