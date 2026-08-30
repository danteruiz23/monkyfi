(function(){
  const c = document.getElementById('circuitCanvas');
  if(!c) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ c.style.display='none'; return; }
  const ctx = c.getContext('2d', { alpha: true });
  let w, h, nodes, raf = 0, running = false, last = 0;
  const isMobile = () => window.matchMedia('(max-width:980px), (pointer:coarse)').matches;
  function size(){
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.75);
    w = c.width = Math.floor(c.offsetWidth * dpr);
    h = c.height = Math.floor(c.offsetHeight * dpr);
    return dpr;
  }
  function init(){
    const dpr = size();
    const area = w * h;
    const density = isMobile() ? 90000 : 50000;
    const count = Math.max(isMobile() ? 14 : 24, Math.min(isMobile() ? 36 : 70, Math.floor(area / density)));
    nodes = Array.from({length: count}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx:(Math.random()-.5)*(isMobile()?0.18:0.25),
      vy:(Math.random()-.5)*(isMobile()?0.18:0.25),
      r: Math.random()*1.4+0.5
    }));
    c._dpr = dpr;
  }
  function draw(ts){
    if(!running) return;
    const targetFps = isMobile() ? 24 : 40;
    const minDelta = 1000 / targetFps;
    if(ts - last < minDelta){ raf = requestAnimationFrame(draw); return; }
    last = ts;
    const dpr = c._dpr || 1;
    ctx.clearRect(0,0,w,h);
    const max = (isMobile() ? 110 : 160) * dpr;
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<max){
          const o = (1-d/max)*0.35;
          ctx.strokeStyle = `rgba(79,169,232,${o})`;
          ctx.lineWidth = 0.6*dpr;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    for(const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if(n.x<0||n.x>w) n.vx*=-1;
      if(n.y<0||n.y>h) n.vy*=-1;
      ctx.fillStyle = 'rgba(79,169,232,.9)';
      ctx.beginPath();ctx.arc(n.x,n.y,n.r*dpr,0,Math.PI*2);ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }
  function start(){
    if(running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(draw);
  }
  function stop(){
    running = false;
    if(raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  window.addEventListener('resize', () => { init(); });
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stop(); else start();
  });
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if(e.isIntersecting) start(); else stop(); });
  }, { threshold: 0.05 });
  io.observe(c);
  init();
})();

const revObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); revObs.unobserve(e.target); } });
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

function i18nT(key){
  try{
    if(window.MonkyfiI18n && typeof window.MonkyfiI18n.t === 'function') return window.MonkyfiI18n.t(key);
  }catch(_){}
  return key;
}
function intakeSubmitHtml(){
  return '<span data-i18n="intake.submit">' + i18nT('intake.submit') + '</span> <span class="arr">&#8594;</span>';
}

const fab = document.getElementById('chatFab');
const panel = document.getElementById('chatPanel');
const body = document.getElementById('chatBody');
const input = document.getElementById('chatInput');
const sendBtn = document.getElementById('chatSend');
let lastFocus = null;

function chatFocusables(){
  return Array.from(panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
}
function trapChatFocus(e){
  if(e.key === 'Escape'){ e.preventDefault(); closeChat(); return; }
  if(e.key !== 'Tab') return;
  const list = chatFocusables();
  if(!list.length) return;
  const first = list[0], last = list[list.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
function openChat(){
  lastFocus = document.activeElement;
  panel.hidden = false;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  fab.style.display = 'none';
  fab.setAttribute('aria-expanded', 'true');
  document.addEventListener('keydown', trapChatFocus);
  setTimeout(()=>input.focus(), 280);
}
function closeChat(){
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  fab.setAttribute('aria-expanded', 'false');
  document.removeEventListener('keydown', trapChatFocus);
  setTimeout(()=>{
    panel.hidden = true;
    fab.style.display = 'flex';
    if(lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    else fab.focus();
  }, 250);
}
window.openChat = openChat;
window.closeChat = closeChat;

const history = [];
function escapeHtml(str){ const d = document.createElement('div'); d.appendChild(document.createTextNode(str)); return d.innerHTML; }
function append(role, text){
  const div = document.createElement('div');
  div.className = 'msg ' + (role==='user' ? 'user' : 'bot');
  const bub = document.createElement('div');
  bub.className = 'msg-bubble';
  const safe = escapeHtml(text);
  bub.innerHTML = safe.replace(/\n/g,'<br>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  div.appendChild(bub);
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return div;
}
function appendTyping(){
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="msg-bubble" style="padding:0"><div class="typing"><span></span><span></span><span></span></div></div>';
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function removeTyping(){ const t = document.getElementById('typing-indicator'); if(t) t.remove(); }

function removeIntakeSendCta(){
  const wrap = document.getElementById('chatIntakeSendWrap');
  if(wrap) wrap.remove();
}
function showIntakeSendCta(){
  if(!window.MonkyfiIntake || typeof window.MonkyfiIntake.canSubmit !== 'function') return;
  if(!window.MonkyfiIntake.canSubmit()) return;
  if(document.getElementById('chatIntakeSendWrap')) return;
  const wrap = document.createElement('div');
  wrap.className = 'chat-cta';
  wrap.id = 'chatIntakeSendWrap';
  const hint = document.createElement('p');
  hint.className = 'chat-cta-hint';
  hint.setAttribute('data-i18n', 'chat.intake.confirmHint');
  hint.textContent = i18nT('chat.intake.confirmHint');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chat-cta-btn';
  btn.id = 'chatIntakeSend';
  btn.setAttribute('data-i18n', 'chat.intake.send');
  btn.textContent = i18nT('chat.intake.send');
  btn.addEventListener('click', submitIntakeFromChat);
  wrap.appendChild(hint);
  wrap.appendChild(btn);
  body.appendChild(wrap);
  body.scrollTop = body.scrollHeight;
}
async function submitIntakeFromChat(){
  const btn = document.getElementById('chatIntakeSend');
  if(!window.MonkyfiIntake || typeof window.MonkyfiIntake.submitFromChat !== 'function') return;
  if(btn){
    btn.disabled = true;
    btn.textContent = i18nT('chat.intake.sending');
  }
  try{
    const result = await window.MonkyfiIntake.submitFromChat();
    if(result && result.ok){
      removeIntakeSendCta();
      const msg = i18nT('chat.intake.sent');
      append('bot', msg);
      history.push({ role: 'assistant', content: msg });
      return;
    }
    if(result && result.error === 'incomplete'){
      append('bot', i18nT('chat.intake.incomplete'));
    } else {
      append('bot', i18nT('chat.intake.sendError'));
    }
  }catch(err){
    console.error('chat intake submit:', err);
    append('bot', i18nT('chat.intake.sendError'));
  }
  if(btn){
    btn.disabled = false;
    btn.textContent = i18nT('chat.intake.send');
  }
}

async function sendMessage(){
  const text = input.value.trim();
  if(!text) return;
  input.value=''; sendBtn.disabled=true;
  append('user', text);
  history.push({role:'user', content:text});
  document.getElementById('chatSuggestions').style.display='none';
  appendTyping();
  try{
    const payload = { messages: history };
    try{
      if(window.MonkyfiI18n && typeof window.MonkyfiI18n.getLang === 'function'){
        payload.lang = window.MonkyfiI18n.getLang();
      }
      if(window.MonkyfiIntake && typeof window.MonkyfiIntake.snapshot === 'function'){
        payload.intake = window.MonkyfiIntake.snapshot();
      }
    }catch(_){}
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if(!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    const reply = (data && data.text) ? data.text : '';
    if(!reply) throw new Error('empty reply');
    removeTyping();
    history.push({role:'assistant', content:reply});
    append('bot', reply);
    if(data && data.intake && window.MonkyfiIntake && typeof window.MonkyfiIntake.apply === 'function'){
      window.MonkyfiIntake.apply(data.intake);
      if(data.intake.ready_to_submit) showIntakeSendCta();
      else if(!window.MonkyfiIntake.canSubmit()) removeIntakeSendCta();
    }
  }catch(err){
    console.error('chat error:', err);
    removeTyping();
    append('bot', i18nT('chat.error'));
  }
  sendBtn.disabled=false;
  input.focus();
}
window.sendMessage = sendMessage;
function sendSuggestion(text){ input.value = text; sendMessage(); }
window.sendSuggestion = sendSuggestion;
function focusIntakeForm(){
  var form = document.getElementById('intakeForm');
  var el = document.getElementById('iq-name');
  if(form){
    try{ form.scrollIntoView({ behavior: 'smooth', block: 'start' }); }catch(_){}
  }
  if(el){
    setTimeout(function(){
      try{ el.focus({ preventScroll: true }); }catch(_){ try{ el.focus(); }catch(__){} }
    }, 280);
  }
}
window.focusIntakeForm = focusIntakeForm;
function startIntakeChat(){
  openChat();
  var alreadyAsked = history.some(function(m){ return m.role === 'user'; });
  if(alreadyAsked) return;
  var text = i18nT('chat.chip4.full');
  if(!text || text === 'chat.chip4.full'){
    text = "I'd like to complete the Book an AI Assessment intake with you.";
  }
  setTimeout(function(){
    if(typeof sendSuggestion === 'function') sendSuggestion(text);
  }, 300);
}
window.startIntakeChat = startIntakeChat;
/* Voice intake (ElevenLabs) is on standby until further notice. Kept so it can be re-enabled. */
function startIntakeVoice(){
  if(typeof closeChat === 'function') closeChat();
  var widget = document.querySelector('elevenlabs-convai');
  if(!widget) return;
  function begin(){
    if(typeof widget.startConversation === 'function'){
      try{ widget.startConversation(); }catch(_){}
    }
  }
  if(window.customElements && typeof customElements.whenDefined === 'function'){
    if(customElements.get('elevenlabs-convai')) begin();
    else customElements.whenDefined('elevenlabs-convai').then(begin);
  } else {
    begin();
  }
}
window.startIntakeVoice = startIntakeVoice;
input.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } });

const intakeForm = document.getElementById('intakeForm');
if(intakeForm){
  let intakeSubmitting = false;
  let currentStep = 0;
  const TOTAL_STEPS = 3;

  function toggleOtherField(selectId, wrapId, inputId, requiredWhenShown){
    const sel = document.getElementById(selectId);
    const wrap = document.getElementById(wrapId);
    const input = document.getElementById(inputId);
    if(!sel || !wrap || !input) return;
    const show = sel.value === 'Other';
    wrap.hidden = !show;
    input.required = !!(show && requiredWhenShown);
    if(!show) input.value = '';
  }
  function wireOther(selectId, wrapId, inputId, requiredWhenShown){
    const sel = document.getElementById(selectId);
    if(!sel) return;
    sel.addEventListener('change', function(){
      toggleOtherField(selectId, wrapId, inputId, requiredWhenShown);
      updateStepValidity();
    });
    toggleOtherField(selectId, wrapId, inputId, requiredWhenShown);
  }
  wireOther('iq-segment', 'iq-segment-other-wrap', 'iq-segment-other', true);
  wireOther('iq-issue', 'iq-issue-other-wrap', 'iq-issue-other', false);

  function syncCheckVisual(label){
    const input = label.querySelector('input[type="checkbox"]');
    if(!input) return;
    label.classList.toggle('is-on', !!input.checked);
  }
  function syncAllChecks(){
    intakeForm.querySelectorAll('.f-check').forEach(syncCheckVisual);
  }
  intakeForm.querySelectorAll('.f-check input[type="checkbox"]').forEach(function(cb){
    cb.addEventListener('change', function(){
      syncCheckVisual(cb.closest('.f-check'));
      updateStepValidity();
    });
  });
  syncAllChecks();

  const emailInput = document.getElementById('iq-email');
  const emailHint = document.getElementById('iq-email-hint');
  function emailOk(val){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim());
  }
  function phoneOk(val){
    const raw = String(val || '').trim();
    if(!raw) return true;
    const digits = raw.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15 && /^[+()[\]\d.\-\s]+$/.test(raw);
  }
  if(emailInput){
    emailInput.addEventListener('input', function(){
      const v = emailInput.value.trim();
      if(emailHint) emailHint.classList.toggle('show', v.length > 0 && !emailOk(v));
      updateStepValidity();
    });
  }

  // Autofill often skips `input` events — re-check validity on these too
  ['change','blur','keyup'].forEach(function(evt){
    intakeForm.addEventListener(evt, function(){ updateStepValidity(); }, true);
  });
  setTimeout(updateStepValidity, 300);
  setTimeout(updateStepValidity, 1000);

  function clearIntakeErrors(){
    intakeForm.querySelectorAll('.f-field.is-error').forEach(function(field){
      field.classList.remove('is-error');
      field.querySelectorAll('.f-input,.f-select,.f-textarea').forEach(function(el){
        el.removeAttribute('aria-invalid');
      });
      var err = field.querySelector('.f-field-error');
      if(err) err.textContent = '';
    });
  }
  function setFieldError(inputId, message){
    var input = document.getElementById(inputId);
    if(!input){
      // explore field has no single input
      if(inputId === 'iq-explore'){
        var explore = document.getElementById('iq-explore');
        var field = explore && explore.closest('.f-field');
        if(field){
          field.classList.add('is-error');
          var err = document.getElementById('iq-explore-error');
          if(err) err.textContent = message;
        }
        return explore;
      }
      return null;
    }
    var field = input.closest('.f-field');
    if(!field) return null;
    field.classList.add('is-error');
    input.setAttribute('aria-invalid', 'true');
    var err = field.querySelector('.f-field-error');
    if(err) err.textContent = message;
    return input;
  }

  intakeForm.addEventListener('input', function(e){
    var field = e.target.closest('.f-field');
    if(field && field.classList.contains('is-error') && e.target.matches('.f-input,.f-select,.f-textarea')){
      field.classList.remove('is-error');
      e.target.removeAttribute('aria-invalid');
      var err = field.querySelector('.f-field-error');
      if(err) err.textContent = '';
    }
    updateStepValidity();
  });
  intakeForm.addEventListener('change', function(e){
    if(e.target.matches('.f-select, input[type="checkbox"]')){
      var field = e.target.closest('.f-field');
      if(field && field.classList.contains('is-error')){
        field.classList.remove('is-error');
        e.target.removeAttribute('aria-invalid');
        var err = field.querySelector('.f-field-error');
        if(err) err.textContent = '';
      }
    }
    updateStepValidity();
  });

  function isStepValid(step){
    if(step === 0){
      const name = (document.getElementById('iq-name').value || '').trim();
      const email = (document.getElementById('iq-email').value || '').trim();
      const phone = (document.getElementById('iq-phone').value || '').trim();
      return name.length > 0 && emailOk(email) && phoneOk(phone);
    }
    if(step === 1){
      const company = (document.getElementById('iq-company').value || '').trim();
      const segment = document.getElementById('iq-segment').value;
      const size = document.getElementById('iq-size').value;
      const segOther = (document.getElementById('iq-segment-other').value || '').trim();
      const issue = document.getElementById('iq-issue').value;
      const issueOther = (document.getElementById('iq-issue-other').value || '').trim();
      if(!company || !segment || !size) return false;
      if(segment === 'Other' && !segOther) return false;
      if(issue === 'Other' && !issueOther) return false;
      return true;
    }
    if(step === 2){
      const interests = intakeForm.querySelectorAll('input[name="interest"]:checked');
      const human = document.getElementById('iq-human');
      return interests.length > 0 && !!(human && human.checked);
    }
    return false;
  }

  function updateStepValidity(){
    const valid = isStepValid(currentStep);
    const cont = document.getElementById('intakeContinue');
    const sub = document.getElementById('intakeSubmit');
    if(cont) cont.disabled = !valid || currentStep >= TOTAL_STEPS - 1;
    if(sub){
      sub.disabled = !isStepValid(2);
    }
  }

  function showStep(step){
    currentStep = step;
    intakeForm.querySelectorAll('.intake-step').forEach(function(el){
      const n = Number(el.getAttribute('data-step'));
      const on = n === step;
      el.classList.toggle('active', on);
      el.hidden = !on;
    });
    intakeForm.querySelectorAll('.intake-progress .bar').forEach(function(bar){
      const n = Number(bar.getAttribute('data-step'));
      bar.classList.toggle('active', n <= step);
    });
    const back = document.getElementById('intakeBack');
    const cont = document.getElementById('intakeContinue');
    const sub = document.getElementById('intakeSubmit');
    if(back) back.hidden = step === 0;
    if(cont) cont.hidden = step >= TOTAL_STEPS - 1;
    if(sub) sub.hidden = step < TOTAL_STEPS - 1;
    updateStepValidity();
  }

  document.getElementById('intakeBack').addEventListener('click', function(){
    if(currentStep > 0) showStep(currentStep - 1);
  });
  document.getElementById('intakeContinue').addEventListener('click', function(){
    if(!isStepValid(currentStep)) return;
    if(currentStep < TOTAL_STEPS - 1) showStep(currentStep + 1);
  });

  function resolveChoice(value, otherValue){
    if(value !== 'Other') return value;
    const detail = (otherValue || '').toString().trim();
    return detail ? ('Other — ' + detail) : 'Other';
  }
  function trackEvent(name){
    try{
      if(typeof window.va === 'function') window.va('event', { name: name });
    }catch(_){}
  }
  function showIntakeStatus(el, kind, text){
    el.className = 'intake-status ' + kind;
    el.textContent = text;
    try{
      if(kind === 'ok'){
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }catch(_){}
  }
  function showSuccess(name, email){
    const steps = document.getElementById('intakeSteps');
    const nav = document.getElementById('intakeNav');
    const note = document.getElementById('intakeNote');
    const progress = document.getElementById('intakeProgress');
    const success = document.getElementById('intakeSuccess');
    const title = document.getElementById('intakeThanksTitle');
    const body = document.getElementById('intakeThanksBody');
    if(steps) steps.hidden = true;
    if(nav) nav.hidden = true;
    if(note) note.hidden = true;
    if(progress) progress.hidden = true;
    if(success){
      success.hidden = false;
      success.classList.add('show');
    }
    const first = (name || '').trim().split(/\s+/)[0] || '';
    if(title){
      title.textContent = first
        ? i18nT('intake.thanks.title').replace('{name}', first)
        : i18nT('intake.thanks.titleGeneric');
    }
    if(body){
      body.textContent = i18nT('intake.thanks.body').replace('{email}', email || '');
    }
  }

  let chatNotes = '';
  let intakeDone = false;
  function fieldVal(id){
    const el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function setFieldVal(id, value){
    const el = document.getElementById(id);
    if(!el || value == null) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function snapshotIntake(){
    const interests = Array.from(intakeForm.querySelectorAll('input[name="interest"]:checked')).map(function(el){ return el.value; });
    const data = {};
    const name = fieldVal('iq-name'); if(name) data.name = name;
    const email = fieldVal('iq-email'); if(email) data.email = email;
    const phone = fieldVal('iq-phone'); if(phone && phoneOk(phone)) data.phone = phone;
    const company = fieldVal('iq-company'); if(company) data.company = company;
    const segment = fieldVal('iq-segment'); if(segment) data.segment = segment;
    const segmentOther = fieldVal('iq-segment-other'); if(segmentOther) data.segment_other = segmentOther;
    const size = fieldVal('iq-size'); if(size) data.size = size;
    const issue = fieldVal('iq-issue'); if(issue) data.issue = issue;
    const issueOther = fieldVal('iq-issue-other'); if(issueOther) data.issue_other = issueOther;
    if(interests.length) data.interests = interests;
    if(chatNotes) data.notes = chatNotes;
    return data;
  }
  function applyIntake(fields){
    if(intakeDone || !fields || typeof fields !== 'object') return;
    if(fields.name) setFieldVal('iq-name', fields.name);
    if(fields.email) setFieldVal('iq-email', fields.email);
    if(fields.phone) setFieldVal('iq-phone', fields.phone);
    if(fields.company) setFieldVal('iq-company', fields.company);
    if(fields.segment) setFieldVal('iq-segment', fields.segment);
    if(fields.segment_other) setFieldVal('iq-segment-other', fields.segment_other);
    if(fields.size) setFieldVal('iq-size', fields.size);
    if(fields.issue) setFieldVal('iq-issue', fields.issue);
    if(fields.issue_other) setFieldVal('iq-issue-other', fields.issue_other);
    if(Array.isArray(fields.interests)){
      intakeForm.querySelectorAll('input[name="interest"]').forEach(function(cb){
        cb.checked = fields.interests.indexOf(cb.value) !== -1;
        const label = cb.closest('.f-check');
        if(label) syncCheckVisual(label);
      });
    }
    if(typeof fields.notes === 'string' && fields.notes.trim()) chatNotes = fields.notes.trim().slice(0, 500);
    const phoneEl = document.getElementById('iq-phone');
    if(fields.ready_to_submit && phoneEl && phoneEl.value && !phoneOk(phoneEl.value)){
      setFieldVal('iq-phone', '');
    }
    let step = 0;
    if(fields.company || fields.segment || fields.size || fields.issue) step = 1;
    if(fields.interests || fields.ready_to_submit) step = 2;
    if(step > currentStep) showStep(step);
    else updateStepValidity();
  }
  function canSubmitIntake(){
    if(intakeDone || intakeSubmitting) return false;
    const human = document.getElementById('iq-human');
    return isStepValid(0) && isStepValid(1) && (intakeForm.querySelectorAll('input[name="interest"]:checked').length > 0) && !!(human);
  }
  async function runIntakeSubmit(opts){
    const fromChat = !!(opts && opts.fromChat);
    const status = document.getElementById('intakeStatus');
    const btn = document.getElementById('intakeSubmit');
    if(intakeForm.botcheck && intakeForm.botcheck.checked) return { ok: false, error: 'spam' };
    const fd = new FormData(intakeForm);
    const interests = fd.getAll('interest');
    clearIntakeErrors();
    var firstErrorInput = null;
    function markError(inputId, message){
      var el = setFieldError(inputId, message);
      if(el && !firstErrorInput) firstErrorInput = el;
    }

    if(!(fd.get('name') || '').toString().trim()) markError('iq-name', i18nT('intake.js.reqName'));
    const emailVal = String(fd.get('email') || '').trim();
    if(!emailVal) markError('iq-email', i18nT('intake.js.reqEmail'));
    else if(!emailOk(emailVal)) markError('iq-email', i18nT('intake.js.badEmail'));
    const phoneVal = String(fd.get('phone') || '').trim();
    if(phoneVal && !phoneOk(phoneVal)) markError('iq-phone', i18nT('intake.js.badPhone'));
    if(!(fd.get('company') || '').toString().trim()) markError('iq-company', i18nT('intake.js.reqCompany'));
    if(!fd.get('segment')) markError('iq-segment', i18nT('intake.js.reqSegment'));
    if(!fd.get('size')) markError('iq-size', i18nT('intake.js.reqSize'));
    if(fd.get('segment') === 'Other' && !String(fd.get('segment_other') || '').trim()){
      markError('iq-segment-other', i18nT('intake.js.specSegment'));
    }
    if(fd.get('issue') === 'Other' && !String(fd.get('issue_other') || '').trim()){
      markError('iq-issue-other', i18nT('intake.js.specIssue'));
    }
    if(!interests.length) markError('iq-explore', i18nT('intake.js.reqExplore'));
    const humanOk = document.getElementById('iq-human') && document.getElementById('iq-human').checked;
    if(!humanOk) markError('iq-human', i18nT('intake.js.captcha'));

    if(firstErrorInput){
      const stepEl = firstErrorInput.closest('.intake-step');
      if(stepEl) showStep(Number(stepEl.getAttribute('data-step')) || 0);
      showIntakeStatus(status,'err', i18nT('intake.js.fixErrors'));
      try{ firstErrorInput.focus({ preventScroll: true }); }catch(_){}
      try{ firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }catch(_){}
      return { ok: false, error: 'incomplete' };
    }

    const segment = resolveChoice(fd.get('segment'), fd.get('segment_other'));
    const size = fd.get('size');
    const issueRaw = fd.get('issue');
    const issue = issueRaw ? resolveChoice(issueRaw, fd.get('issue_other')) : '(not specified)';
    const source = fromChat ? 'Website chatbot' : 'Website form';
    fd.set('segment', segment);
    fd.set('size', size);
    fd.set('issue', issue);
    fd.set('interests', interests.join(', ') || '(none selected)');
    fd.set('phone', phoneVal || '(not provided)');
    fd.set('intake_source', source);
    const messageLines = [
      'New AI Assessment request from monkyfi.com',
      'Source: ' + source,
      '', 'Company: ' + fd.get('company'), 'Operation type: ' + segment,
      'Company size: ' + size, 'Biggest issue: ' + issue,
      'Phone: ' + (phoneVal || '(not provided)'),
      'Interested in: ' + (interests.join(', ') || '(none selected)')
    ];
    if(chatNotes) messageLines.push('Notes: ' + chatNotes);
    fd.set('message', messageLines.join('\n'));
    intakeSubmitting = true;
    if(btn){
      btn.disabled = true;
      btn.innerHTML = '<span>' + i18nT('intake.js.sending') + '</span>';
    }
    status.className = 'intake-status';
    status.textContent = '';
    const payload = Object.fromEntries(fd);
    delete payload.human_check;
    delete payload.botcheck;
    delete payload['h-captcha-response'];
    try{
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch('https://api.web3forms.com/submit', {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));
      if(!res.ok || !data.success) throw new Error(data.message || ('API ' + res.status));
      trackEvent(fromChat ? 'Intake Submit Success Chat' : 'Intake Submit Success');
      intakeDone = true;
      showSuccess(String(fd.get('name') || ''), emailVal);
      showIntakeStatus(status,'ok', i18nT('intake.js.ok'));
      intakeForm.reset();
      chatNotes = '';
      clearIntakeErrors();
      toggleOtherField('iq-segment', 'iq-segment-other-wrap', 'iq-segment-other', true);
      toggleOtherField('iq-issue', 'iq-issue-other-wrap', 'iq-issue-other', false);
      syncAllChecks();
      intakeSubmitting = false;
      return { ok: true };
    }catch(err){
      console.error('web3forms error:', err);
      const msg = (err && err.message) ? String(err.message) : i18nT('intake.js.fail');
      if(err && err.name === 'AbortError'){
        showIntakeStatus(status,'err', i18nT('intake.js.timeout'));
        intakeSubmitting = false;
        if(btn){ btn.disabled = false; btn.innerHTML = intakeSubmitHtml(); }
        return { ok: false, error: 'timeout' };
      } else if(/rate|too may|too many/i.test(msg)){
        showIntakeStatus(status,'err', i18nT('intake.js.rate'));
        intakeSubmitting = false;
        if(btn){ btn.disabled = false; btn.innerHTML = intakeSubmitHtml(); }
        return { ok: false, error: 'rate' };
      } else {
        const bodyLines = [
          'Name: ' + fd.get('name'), 'Email: ' + fd.get('email'),
          'Phone: ' + (phoneVal || '(not provided)'),
          'Company: ' + fd.get('company'),
          'Operation: ' + segment, 'Size: ' + size, 'Biggest issue: ' + issue,
          'Interested in: ' + (interests.join(', ') || '(none selected)')
        ];
        if(chatNotes) bodyLines.push('Notes: ' + chatNotes);
        const mail = 'mailto:hello@monkyfi.com?subject=' + encodeURIComponent('AI Assessment Request — ' + fd.get('company')) + '&body=' + encodeURIComponent(bodyLines.join('\n'));
        window.location.href = mail;
        showIntakeStatus(status,'ok', i18nT('intake.js.mailOpened'));
        intakeSubmitting = false;
        if(btn){ btn.disabled = false; btn.innerHTML = intakeSubmitHtml(); }
        return { ok: true, fallback: 'mailto' };
      }
    }
  }

  intakeForm.addEventListener('submit', async function(e){
    e.preventDefault();
    if(intakeSubmitting) return;
    if(currentStep !== TOTAL_STEPS - 1){
      if(isStepValid(currentStep)) showStep(Math.min(currentStep + 1, TOTAL_STEPS - 1));
      return;
    }
    await runIntakeSubmit({ fromChat: false });
  });

  async function submitIntakeFromFormChat(){
    if(intakeSubmitting || intakeDone) return { ok: false, error: 'busy' };
    if(!isStepValid(0) || !isStepValid(1) || intakeForm.querySelectorAll('input[name="interest"]:checked').length === 0){
      return { ok: false, error: 'incomplete' };
    }
    const human = document.getElementById('iq-human');
    if(human){
      human.checked = true;
      const label = human.closest('.f-check');
      if(label) syncCheckVisual(label);
    }
    showStep(2);
    return runIntakeSubmit({ fromChat: true });
  }

  window.MonkyfiIntake = {
    snapshot: snapshotIntake,
    apply: applyIntake,
    canSubmit: canSubmitIntake,
    submitFromChat: submitIntakeFromFormChat
  };

  showStep(0);
  document.addEventListener('monkyfi:langchange', function(){
    const cont = document.getElementById('intakeContinue');
    const sub = document.getElementById('intakeSubmit');
    if(cont && !cont.hidden) cont.innerHTML = '<span data-i18n="intake.continue">' + i18nT('intake.continue') + '</span> <span class="arr">&#8594;</span>';
    if(sub && !sub.hidden && !intakeSubmitting) sub.innerHTML = intakeSubmitHtml();
    const chatSend = document.getElementById('chatIntakeSend');
    const chatHint = document.querySelector('#chatIntakeSendWrap .chat-cta-hint');
    if(chatSend && !chatSend.disabled) chatSend.textContent = i18nT('chat.intake.send');
    if(chatHint) chatHint.textContent = i18nT('chat.intake.confirmHint');
  });
}

function bootChatFromQuery(){
  try{
    var params = new URLSearchParams(window.location.search);
    var chat = (params.get('chat') || '').toLowerCase();
    if(chat === 'intake'){
      if(typeof startIntakeChat === 'function') startIntakeChat();
    } else if(chat === '1' || chat === 'open'){
      if(typeof openChat === 'function') openChat();
    }
  }catch(_){}
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', bootChatFromQuery);
} else {
  bootChatFromQuery();
}

(function mastheadDate(){
  function localeFor(lang){
    if(lang === 'ES') return 'es';
    if(lang === 'PT') return 'pt-BR';
    return 'en-GB';
  }
  function stamp(){
    var el = document.getElementById('mastheadDate');
    if(!el) return;
    var lang = 'EN';
    try{
      if(window.MonkyfiI18n && typeof window.MonkyfiI18n.getLang === 'function') lang = window.MonkyfiI18n.getLang();
    }catch(_){}
    var d = new Date();
    el.setAttribute('datetime', d.toISOString().slice(0,10));
    el.textContent = d.toLocaleDateString(localeFor(lang), { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }
  document.addEventListener('monkyfi:langchange', stamp);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', stamp);
  else stamp();
})();

(function editionToggle(){
  var KEY = 'monkyfi.edition';
  function read(){
    try{
      return localStorage.getItem(KEY) === 'morning' ? 'morning' : 'night';
    }catch(e){
      return 'night';
    }
  }
  function labelFor(ed){
    var key = ed === 'morning' ? 'mast.edition.morning' : 'mast.edition.night';
    try{
      if(window.MonkyfiI18n && typeof window.MonkyfiI18n.t === 'function') return window.MonkyfiI18n.t(key);
    }catch(_){}
    return ed === 'morning' ? 'Morning Edition' : 'Night Edition';
  }
  function hintFor(){
    try{
      if(window.MonkyfiI18n && typeof window.MonkyfiI18n.t === 'function') return window.MonkyfiI18n.t('a11y.edition');
    }catch(_){}
    return 'Switch between night and morning edition';
  }
  function apply(ed){
    document.documentElement.setAttribute('data-edition', ed);
    var pressed = ed === 'morning' ? 'true' : 'false';
    var label = labelFor(ed);
    var hint = hintFor();
    document.querySelectorAll('[data-edition-label]').forEach(function(el){
      el.textContent = label;
    });
    document.querySelectorAll('.edition-toggle').forEach(function(btn){
      btn.setAttribute('aria-pressed', pressed);
      btn.setAttribute('title', label);
      if(!btn.hasAttribute('data-edition-label')){
        btn.setAttribute('aria-label', hint + ' — ' + label);
      }
    });
  }
  function toggle(e){
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
    var next = read() === 'morning' ? 'night' : 'morning';
    try{ localStorage.setItem(KEY, next); }catch(_){}
    apply(next);
  }
  window.toggleEdition = toggle;
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest ? e.target.closest('.edition-toggle') : null;
    if(btn) toggle(e);
  });
  document.addEventListener('monkyfi:langchange', function(){ apply(read()); });
  apply(read());
})();
