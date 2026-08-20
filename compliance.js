import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://iqujgnetlzbpgidomilk.supabase.co',
  'sb_publishable_4k0wUmBakikPasxjc1i_Sg_gxMudkEL'
);

const LABELS = {
  q4_typeA:'Vehicle Registration', q5_date:'Date', q40_number:'Odometer', q42_uniqueId:'Unique ID',
  q54_fatigueManagement:'Fatigue Management', q55_emotionalWellbeing:'Emotional Wellbeing',
  q56_tripPlanning:'Trip Planning', q57_medicationAnd:'Medication and Substances',
  q58_emergencyAnd:'Emergency and Safety', q62_brakesAnd:'Brakes and Brake Lights',
  q63_tyreCondition63:'Tyres', q64_headlights64:'Headlights', q65_indicators65:'Indicators',
  q66_headlights66:'Windscreen', q67_headlights67:'Wipers - Front and Back',
  q68_headlights68:'Mirrors - Internal/External', q69_headlights69:'Fuel',
  q71_anyAdditional:'Additional Comments', q85_confirmItems85:'Stock Check', q86_driverName:'Driver Name',
  q30_signature:'Signature'
};

const SYSTEM_KEYS = new Set(['path','slug','event_id','buildDate','submitDate','submitSource','timeToSubmit','uploadServerUrl','newCardFormMobile','jsExecutionTracker','validatedNewRequiredFieldIDs']);
const NEGATIVE = /(missing|not working|fail|failed|fault|broken|damage|damaged|unsafe|defect|issue|problem|low|empty|expired|unavailable|not available|needs? repair)/i;

function text(v){
  if(v == null) return '';
  if(Array.isArray(v)) return v.map(text).filter(Boolean).join(', ');
  if(typeof v === 'object') return Object.entries(v).map(([k,val])=>k==='other' ? text(val) : text(val)).filter(Boolean).join(', ');
  return String(v).trim();
}

function displayValue(key,v){
  if(key==='q30_signature') return v ? 'Signature captured' : '—';
  if(key==='q5_date' && v && typeof v==='object') return `${v.day || ''}/${v.month || ''}/${v.year || ''}`;
  return text(v) || '—';
}

function issueList(row){
  const p=row.payload || {};
  if(!p || Object.keys(p).length<=2 && p.monday_item_id) return [];
  const issues=[];
  const add=(key,label,msg)=>{ if(msg && !issues.some(x=>x.key===key && x.message===msg)) issues.push({key,label,message:msg}); };
  const val=k=>p[k];
  const lower=k=>text(val(k)).toLowerCase();

  if(lower('q54_fatigueManagement') && lower('q54_fatigueManagement')!=='yes') add('q54_fatigueManagement','Fatigue Management',text(val('q54_fatigueManagement')));
  if(lower('q55_emotionalWellbeing') && lower('q55_emotionalWellbeing')!=='yes') add('q55_emotionalWellbeing','Emotional Wellbeing',text(val('q55_emotionalWellbeing')));
  if(lower('q56_tripPlanning') && lower('q56_tripPlanning')!=='yes') add('q56_tripPlanning','Trip Planning',text(val('q56_tripPlanning')));
  if(lower('q57_medicationAnd') && lower('q57_medicationAnd')!=='no') add('q57_medicationAnd','Medication and Substances',text(val('q57_medicationAnd')));

  const passFields={
    q62_brakesAnd:'Brakes and Brake Lights', q63_tyreCondition63:'Tyres', q64_headlights64:'Headlights',
    q65_indicators65:'Indicators', q66_headlights66:'Windscreen', q67_headlights67:'Wipers - Front and Back',
    q68_headlights68:'Mirrors - Internal/External'
  };
  for(const [key,label] of Object.entries(passFields)){
    const v=val(key); if(v==null) continue;
    const s=text(v);
    const objOther=typeof v==='object' && !Array.isArray(v) ? text(v.other) : '';
    const selected=Array.isArray(v) ? v.map(x=>String(x).toLowerCase()) : Object.values(v||{}).map(x=>String(x).toLowerCase());
    if(selected.length && !selected.includes('pass') && !selected.some(x=>x==='yes')) add(key,label,s);
    if(objOther && NEGATIVE.test(objOther)) add(key,label,objOther);
    if(typeof v==='string' && NEGATIVE.test(v)) add(key,label,v);
  }

  const emergency=val('q58_emergencyAnd');
  if(emergency && typeof emergency==='object' && !Array.isArray(emergency) && emergency.other && NEGATIVE.test(text(emergency.other))) add('q58_emergencyAnd','Emergency and Safety',text(emergency.other));
  const stock=val('q85_confirmItems85');
  if(stock && typeof stock==='object' && !Array.isArray(stock) && stock.other && NEGATIVE.test(text(stock.other))) add('q85_confirmItems85','Stock Check',text(stock.other));
  if(lower('q69_headlights69') && !['yes','pass','full','ok','okay'].includes(lower('q69_headlights69')) && NEGATIVE.test(text(val('q69_headlights69')))) add('q69_headlights69','Fuel',text(val('q69_headlights69')));
  return issues;
}

function statusBadge(row){
  if(row.source_submission_id?.startsWith('monday:')) return '<span class="comp-badge legacy">Legacy record</span>';
  const issues=issueList(row);
  return issues.length ? `<span class="comp-badge issue">⚠ Issues Found (${issues.length})</span>` : '<span class="comp-badge pass">✓ Passed</span>';
}

function detailRows(row){
  const p=row.payload || {};
  const issues=issueList(row);
  const issueKeys=new Set(issues.map(i=>i.key));
  const preferred=Object.keys(LABELS).filter(k=>k in p);
  const extras=Object.keys(p).filter(k=>k.startsWith('q') && !preferred.includes(k) && !SYSTEM_KEYS.has(k));
  return [...preferred,...extras].map(key=>{
    const isIssue=issueKeys.has(key);
    const label=LABELS[key] || key.replace(/^q\d+_?/,'').replace(/([A-Z])/g,' $1').trim() || key;
    return `<div class="answer-row ${isIssue?'answer-issue':''}"><div class="answer-label">${escapeHtml(label)}</div><div class="answer-value">${escapeHtml(displayValue(key,p[key]))}${isIssue?'<span class="answer-flag">Issue</span>':''}</div></div>`;
  }).join('') || '<div class="empty">Detailed Jotform answers are not available for this migrated Monday record.</div>';
}

function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function openModal(row){
  const issues=issueList(row);
  document.body.insertAdjacentHTML('beforeend',`<div class="compliance-modal-backdrop" id="complianceModal"><div class="compliance-modal"><div class="compliance-head"><div><h3>${row.check_type==='pre_start'?'Pre-start Check':'Post-shift Check'}</h3><p>${escapeHtml(row.driver_name || 'Unknown driver')} · ${escapeHtml(row.rego || 'No vehicle')} · ${escapeHtml(row.check_date || '')}</p></div><button id="closeCompliance">×</button></div><div class="compliance-body">${issues.length?`<div class="issue-summary"><strong>⚠ ${issues.length} compliance issue${issues.length===1?'':'s'} found</strong>${issues.map(i=>`<div><b>${escapeHtml(i.label)}:</b> ${escapeHtml(i.message)}</div>`).join('')}</div>`:'<div class="pass-summary"><strong>✓ No compliance issues detected</strong></div>'}<div class="answers-title">Complete submission</div>${detailRows(row)}</div></div></div>`);
  const close=()=>document.querySelector('#complianceModal')?.remove();
  document.querySelector('#closeCompliance').onclick=close;
  document.querySelector('#complianceModal').onclick=e=>{if(e.target.id==='complianceModal') close();};
}

let decorating=false;
async function decorateChecks(){
  if(decorating) return;
  const title=document.querySelector('.page-title h1')?.textContent?.trim();
  if(title!=='Daily Vehicle Checks') return;
  const table=document.querySelector('.content table');
  if(!table || table.dataset.complianceDecorated==='1') return;
  decorating=true;
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){decorating=false;return;}
  const {data,error}=await supabase.from('vehicle_checks').select('*').order('created_at',{ascending:false}).limit(500);
  if(error){decorating=false;return;}
  const rows=[...table.querySelectorAll('tbody tr')];
  const head=table.querySelector('thead tr');
  const th=document.createElement('th'); th.textContent='Compliance'; head.appendChild(th);
  rows.forEach((tr,i)=>{
    const row=data?.[i]; if(!row) return;
    const td=document.createElement('td'); td.innerHTML=statusBadge(row); tr.appendChild(td);
    tr.classList.add('clickable-check'); tr.title='Open full check'; tr.addEventListener('click',()=>openModal(row));
  });
  table.dataset.complianceDecorated='1'; decorating=false;
}

const observer=new MutationObserver(()=>decorateChecks());
observer.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(decorateChecks,500);
