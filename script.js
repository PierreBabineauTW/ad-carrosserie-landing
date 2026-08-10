const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const burger = $('#burger');
const navLinks = $('#navLinks');
if(burger){
  burger.addEventListener('click', ()=>{
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.position='absolute'; navLinks.style.top='100%'; navLinks.style.left='0';
    navLinks.style.width='100%'; navLinks.style.background='rgba(10,12,16,.97)';
    navLinks.style.flexDirection='column'; navLinks.style.padding='1rem 1.5rem'; navLinks.style.gap='1rem';
  });
}

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
},{threshold:0.15});
$$('.reveal').forEach(el=>revealObserver.observe(el));

function animateCounter(el){
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimal || '0');
  const duration = 1400;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now-start)/duration, 1);
    const val = target * progress;
    el.textContent = decimals ? val.toFixed(decimals) : Math.round(val);
    if(progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ animateCounter(e.target); counterObserver.unobserve(e.target); }
  });
},{threshold:0.5});
$$('.counter').forEach(el=>counterObserver.observe(el));

const toastMessages = [
  "🚘 Un devis carrosserie validé à l'instant — Peugeot 208",
  "🔑 Véhicule de prêt réservé pour demain 09h00",
  "✅ Cession de créance signée — Renault Clio",
  "📸 Photos de dégâts reçues — diagnostic en cours",
  "🛡️ Garantie à vie activée sur une réparation pare-brise",
  "💬 Nouveau message WhatsApp reçu — devis en cours"
];
function showToast(){
  const container = $('#toastContainer');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = toastMessages[Math.floor(Math.random()*toastMessages.length)];
  container.appendChild(toast);
  setTimeout(()=> toast.remove(), 5200);
}
setTimeout(showToast, 3000);
setInterval(showToast, 13000);

const photoDrawer = $('#photoDrawer');
$('#openPhotoDrawer')?.addEventListener('click', ()=> photoDrawer.classList.add('open'));
$('#closePhotoDrawer')?.addEventListener('click', ()=> photoDrawer.classList.remove('open'));
setupDropzone($('#heroDropzone'), $('#heroFileInput'), $('#heroPreviewGrid'));
$('#heroDrawerContinue')?.addEventListener('click', ()=>{
  photoDrawer.classList.remove('open');
  document.getElementById('rdv').scrollIntoView({behavior:'smooth'});
});

function setupDropzone(zone, input, previewGrid){
  if(!zone) return;
  zone.addEventListener('click', ()=> input.click());
  zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', ()=> zone.classList.remove('dragover'));
  zone.addEventListener('drop', e=>{
    e.preventDefault(); zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files, previewGrid);
  });
  input.addEventListener('change', ()=> handleFiles(input.files, previewGrid));
}
function handleFiles(files, previewGrid){
  const existing = previewGrid.children.length;
  Array.from(files).slice(0, 4-existing).forEach(file=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = document.createElement('img');
      img.src = e.target.result;
      previewGrid.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

const zoneLabels = {
  'pare-chocs-avant':'Pare-chocs avant','pare-chocs-arriere':'Pare-chocs arrière','capot':'Capot',
  'aile-avant':'Aile avant','aile-arriere':'Aile arrière','portiere-avant':'Portière avant',
  'portiere-arriere':'Portière arrière','pare-brise':'Pare-brise / Vitrage','optiques':'Optiques',
  'retroviseurs':'Rétroviseurs'
};
let selectedZones = [];
let currentZoneKey = null;
let currentDamageType = null;
let currentSeverity = null;

$$('.veh-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.veh-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const zoneModal = $('#zoneModal');
$$('.zone').forEach(zone=>{
  zone.addEventListener('click', ()=>{
    currentZoneKey = zone.dataset.zone;
    currentDamageType = null; currentSeverity = null;
    $('#zoneModalTitle').textContent = zoneLabels[currentZoneKey] || 'Zone sélectionnée';
    $$('#damageTypeChips .chip').forEach(c=>c.classList.remove('active'));
    $$('#severityChips .chip').forEach(c=>c.classList.remove('active'));
    zoneModal.classList.add('open');
  });
});
$('#closeZoneModal')?.addEventListener('click', ()=> zoneModal.classList.remove('open'));
$$('#damageTypeChips .chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    $$('#damageTypeChips .chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active'); currentDamageType = chip.dataset.value;
  });
});
$$('#severityChips .chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    $$('#severityChips .chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active'); currentSeverity = chip.dataset.value;
  });
});

$('#addZoneBtn')?.addEventListener('click', ()=>{
  if(!currentDamageType || !currentSeverity){ alert('Merci de sélectionner un type de dégât et une sévérité.'); return; }
  selectedZones = selectedZones.filter(z=>z.zone !== currentZoneKey);
  selectedZones.push({zone:currentZoneKey, damage:currentDamageType, severity:currentSeverity});
  document.querySelector('.zone[data-zone="'+currentZoneKey+'"]').classList.add('active');
  zoneModal.classList.remove('open');
  renderZonesList();
  computeEstimate();
});

function renderZonesList(){
  const list = $('#selectedZonesList');
  if(selectedZones.length === 0){
    list.innerHTML = '<p class="muted">Aucune zone sélectionnée pour le moment.</p>';
    return;
  }
  list.innerHTML = selectedZones.map(z=>`
    <div class="zone-chip">
      <span>${zoneLabels[z.zone]} — ${z.damage} (${z.severity})</span>
      <button data-remove="${z.zone}">✕</button>
    </div>`).join('');
  $$('#selectedZonesList [data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.dataset.remove;
      selectedZones = selectedZones.filter(z=>z.zone !== key);
      document.querySelector('.zone[data-zone="'+key+'"]')?.classList.remove('active');
      renderZonesList();
      computeEstimate();
    });
  });
}

const severityHours = {mineur:24, moyen:48, majeur:96};
const packageMap = {
  rayure:'Forfait Rénovation Peinture', enfoncement:'Forfait Tôlerie & Redressage',
  plastique:'Forfait Remplacement Élément', vitrage:'Forfait Pare-Brise & Calibrage ADAS'
};
function computeEstimate(){
  const resultBox = $('#estimateResult');
  if(selectedZones.length === 0){ resultBox.hidden = true; return; }
  resultBox.hidden = false;
  const maxHours = Math.max(...selectedZones.map(z=>severityHours[z.severity]||24));
  $('#resultDelay').textContent = maxHours <= 24 ? '24h à 48h' : (maxHours <= 48 ? '48h à 72h' : '3 à 5 jours');
  const packages = [...new Set(selectedZones.map(z=>packageMap[z.damage]))];
  $('#resultPackage').textContent = packages.join(', ');
}

$('#validateDiagnostic')?.addEventListener('click', ()=>{
  if(selectedZones.length === 0){ alert('Sélectionnez au moins une zone endommagée.'); return; }
  const tagsWrap = $('#prefilledDamage');
  tagsWrap.innerHTML = selectedZones.map(z=>`<span>${zoneLabels[z.zone]} — ${z.damage}</span>`).join('');
  document.getElementById('rdv').scrollIntoView({behavior:'smooth'});
});

const franchiseRange = $('#franchiseRange');
function updateFranchise(){
  const val = parseInt(franchiseRange.value);
  $('#franchiseAmountDisplay').textContent = val + ' €';
  $('#outputCovered').textContent = '-' + val + ' €';
  $('#outputGift').hidden = val !== 0;
}
franchiseRange?.addEventListener('input', updateFranchise);
updateFranchise();

$$('.accordion-head').forEach(head=>{
  head.addEventListener('click', ()=>{
    const item = head.parentElement;
    item.classList.toggle('open');
  });
});

$('#downloadCession')?.addEventListener('click', ()=>{
  const content = `CESSION DE CRÉANCE - AD CARROSSERIE\n\nJe soussigné(e), autorise AD Carrosserie à percevoir directement de mon assureur les indemnités relatives à la réparation de mon véhicule, dans le respect de la Loi Hamon (2014).\n\nDate: ${new Date().toLocaleDateString('fr-FR')}\nSignature: ______________________`;
  const blob = new Blob([content], {type:'text/plain'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'cession-de-creance-ad-carrosserie.txt';
  link.click();
});

const baSlider = $('#baSlider');
const baBeforeWrap = $('#baBeforeWrap');
const baHandle = $('#baHandle');
let baDragging = false;

function setBaPosition(clientX){
  const rect = baSlider.getBoundingClientRect();
  let pct = ((clientX - rect.left) / rect.width) * 100;
  pct = Math.max(0, Math.min(100, pct));
  baBeforeWrap.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
  baHandle.style.left = pct + '%';
}
baHandle?.addEventListener('mousedown', ()=> baDragging = true);
window.addEventListener('mouseup', ()=> baDragging = false);
window.addEventListener('mousemove', e=>{ if(baDragging) setBaPosition(e.clientX); });
baHandle?.addEventListener('touchstart', ()=> baDragging = true);
window.addEventListener('touchend', ()=> baDragging = false);
window.addEventListener('touchmove', e=>{ if(baDragging && e.touches[0]) setBaPosition(e.touches[0].clientX); });
baSlider?.addEventListener('click', e=> setBaPosition(e.clientX));

const baImages = [
  {before:'https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=1200&q=60', after:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60'},
  {before:'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=60', after:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=60'},
  {before:'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60', after:'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=60'}
];
$$('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const idx = parseInt(btn.dataset.cat);
    $('#baBeforeWrap img').src = baImages[idx].before;
    $('.ba-after img').src = baImages[idx].after;
  });
});

$$('.select-vehicle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    localStorage.setItem('ad_selected_car', btn.dataset.car);
    $('#loanerSelect').value = btn.dataset.car;
    document.getElementById('rdv').scrollIntoView({behavior:'smooth'});
  });
});

$('#trackBtn')?.addEventListener('click', ()=>{
  const plate = $('#plateInput').value.trim();
  if(!plate){ alert('Merci de saisir une immatriculation.'); return; }
  $('#stepper').hidden = false;
});

const leadForm = $('#leadForm');
const formSteps = $$('.form-step');
let currentStep = 1;
const totalSteps = formSteps.length;

function goToStep(n){
  currentStep = n;
  formSteps.forEach(s=> s.classList.toggle('active', parseInt(s.dataset.step) === n));
  const pct = Math.round((n/totalSteps)*100);
  $('#progressFill').style.width = pct + '%';
  $('#progressPct').textContent = pct + '%';
  saveFormState();
}
$$('.next-step').forEach(btn=> btn.addEventListener('click', ()=>{
  if(currentStep < totalSteps) goToStep(currentStep+1);
}));
$$('.prev-step').forEach(btn=> btn.addEventListener('click', ()=>{
  if(currentStep > 1) goToStep(currentStep-1);
}));
setupDropzone($('#formDropzone'), $('#formFileInput'), $('#formPreviewGrid'));

function collectFormData(){
  return {
    make: $('#makeSelect').value, model: $('#modelInput').value,
    dropoffDate: $('#dropoffDate').value, loaner: $('#loanerSelect').value,
    name: $('#nameInput').value, phone: $('#phoneInput').value,
    email: $('#emailInput').value, insurer: $('#insurerInput').value,
    damages: selectedZones, step: currentStep
  };
}
function saveFormState(){
  try{ localStorage.setItem('ad_lead_form', JSON.stringify(collectFormData())); }catch(e){}
}
$$('#leadForm input, #leadForm select').forEach(el=> el.addEventListener('input', saveFormState));

function restoreFormState(data){
  if(data.make) $('#makeSelect').value = data.make;
  if(data.model) $('#modelInput').value = data.model;
  if(data.dropoffDate) $('#dropoffDate').value = data.dropoffDate;
  if(data.loaner) $('#loanerSelect').value = data.loaner;
  if(data.name) $('#nameInput').value = data.name;
  if(data.phone) $('#phoneInput').value = data.phone;
  if(data.email) $('#emailInput').value = data.email;
  if(data.insurer) $('#insurerInput').value = data.insurer;
  goToStep(data.step || 1);
}

(function checkRecovery(){
  try{
    const saved = localStorage.getItem('ad_lead_form');
    if(saved){
      const data = JSON.parse(saved);
      if(data.name || data.model || data.phone){
        $('#recoveryBar').hidden = false;
        $('#resumeYes').addEventListener('click', ()=>{ restoreFormState(data); $('#recoveryBar').hidden = true; });
        $('#resumeNo').addEventListener('click', ()=>{ localStorage.removeItem('ad_lead_form'); $('#recoveryBar').hidden = true; });
      }
    }
  }catch(e){}
})();

leadForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const data = collectFormData();
  const waText = encodeURIComponent(
    `Bonjour AD Carrosserie, je souhaite un devis.\nVéhicule: ${data.make} ${data.model}\nDégâts: ${data.damages.map(d=>zoneLabels[d.zone]).join(', ') || 'Non précisé'}\nDate souhaitée: ${data.dropoffDate}\nVéhicule de prêt: ${data.loaner || 'Non'}\nNom: ${data.name}\nTéléphone: ${data.phone}\nAssureur: ${data.insurer}`
  );
  localStorage.removeItem('ad_lead_form');
  window.open(`https://wa.me/330000000000?text=${waText}`, '_blank');
  alert('Merci ! Votre demande a été préparée. Un message WhatsApp pré-rempli s\'ouvre pour confirmer votre demande — vous pouvez aussi être contacté par email.');
});

$('#geoBtn')?.addEventListener('click', ()=>{
  if(!navigator.geolocation){ alert('Géolocalisation non supportée par votre navigateur.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude, longitude} = pos.coords;
    const text = encodeURIComponent(`Urgence AD Carrosserie — Ma position: https://maps.google.com/?q=${latitude},${longitude}`);
    window.open(`https://wa.me/330000000001?text=${text}`, '_blank');
  }, ()=> alert('Impossible de récupérer votre position. Merci d\'appeler directement.'));
});

(function openStatus(){
  const el = $('#openStatus');
  if(!el) return;
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes()/60;
  let isOpen = false, closeTime = '';
  if(day >= 1 && day <= 5){ isOpen = hour >= 8 && hour < 18.5; closeTime = '18h30'; }
  else if(day === 6){ isOpen = hour >= 9 && hour < 12.5; closeTime = '12h30'; }
  el.textContent = isOpen ? `🟢 Ouvert actuellement — Ferme à ${closeTime}` : '🔴 Fermé actuellement — Réouverture prochaine';
})();

window.addEventListener('scroll', ()=>{
  const nav = $('#navbar');
  if(window.scrollY > 40) nav.style.boxShadow = '0 8px 24px rgba(0,0,0,.45)';
  else nav.style.boxShadow = 'none';
});
