const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const track = (name, data) => { try { console.log('[analytics]', name, data || {}); } catch(e){} };
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const burgerBtn = $('#burgerBtn'); const closeDrawerBtn = $('#closeDrawerBtn'); const mobileDrawer = $('#mobileDrawer');
burgerBtn?.addEventListener('click', ()=> mobileDrawer.classList.add('open'));
closeDrawerBtn?.addEventListener('click', ()=> mobileDrawer.classList.remove('open'));
$$('#mobileDrawer a').forEach(a=> a.addEventListener('click', ()=> mobileDrawer.classList.remove('open')));

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
},{threshold:0.12});
$$('.reveal').forEach(el=>revealObserver.observe(el));

function showToast(message){
  const container = $('#toastContainer');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(()=> toast.remove(), 5200);
}

$$('.ba-slider').forEach(slider=>{
  const before = $('.ba-before', slider);
  const handle = $('.ba-handle', slider);
  if(!before || !handle) return;
  let dragging = false;
  function setPos(clientX){
    const rect = slider.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    before.style.clipPath = `inset(0 ${100-pct}% 0 0)`;
    handle.style.left = pct + '%';
  }
  handle.addEventListener('mousedown', ()=> dragging = true);
  window.addEventListener('mouseup', ()=> dragging = false);
  window.addEventListener('mousemove', e=>{ if(dragging) setPos(e.clientX); });
  handle.addEventListener('touchstart', ()=> dragging = true, {passive:true});
  window.addEventListener('touchend', ()=> dragging = false);
  window.addEventListener('touchmove', e=>{ if(dragging && e.touches[0]) setPos(e.touches[0].clientX); }, {passive:true});
  slider.addEventListener('click', e=> setPos(e.clientX));
});

const baArrowSet = [
  {before:'https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=1200&q=70', after:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70'},
  {before:'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=70', after:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=70'},
  {before:'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=70', after:'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=70'}
];
let baIndex = 0;
const homeBa = $('#homeBaSlider');
if(homeBa){
  const beforeImg = $('.ba-before img', homeBa);
  const afterImg = $('.ba-after img', homeBa);
  $('#baPrev')?.addEventListener('click', ()=>{ baIndex = (baIndex-1+baArrowSet.length)%baArrowSet.length; updateBa(); });
  $('#baNext')?.addEventListener('click', ()=>{ baIndex = (baIndex+1)%baArrowSet.length; updateBa(); });
  function updateBa(){ beforeImg.src = baArrowSet[baIndex].before; afterImg.src = baArrowSet[baIndex].after; }
}

$$('.gallery-filters').forEach(filterBar=>{
  $$('.filter-btn', filterBar).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.filter-btn', filterBar).forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      $$('.gallery-item').forEach(item=>{
        const show = filter === 'toutes' || item.dataset.cat === filter;
        item.classList.toggle('gallery-hidden', !show);
      });
    });
  });
});

(function promoPopup(){
  const SESSION_KEY = 'ad_promo_seen';
  const overlay = document.createElement('div');
  overlay.className = 'promo-popup-overlay';
  overlay.id = 'promoOverlay';
  overlay.innerHTML = `
    <div class="promo-popup">
      <button class="promo-popup-close" id="promoClose" aria-label="Fermer">X</button>
      <div class="promo-popup-body">
        <span class="tag">Promotion du mois</span>
        <h3>[A VALIDER PAR LE GARAGE]</h3>
        <p>[Titre et conditions de la promotion en cours - a renseigner par AD Carrosserie avant mise en ligne definitive.]</p>
        <a href="devis.html" class="btn btn-primary btn-block">Demander un devis</a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const badge = document.createElement('button');
  badge.className = 'promo-badge';
  badge.id = 'promoBadge';
  badge.textContent = 'Voir la promotion en cours';
  document.body.appendChild(badge);

  function openPromo(){ overlay.classList.add('show'); track('promo_popup_shown', {}); }
  function closePromo(){ overlay.classList.remove('show'); badge.classList.add('show'); sessionStorage.setItem(SESSION_KEY, '1'); }

  if(!sessionStorage.getItem(SESSION_KEY)){
    setTimeout(openPromo, 1800);
  } else {
    badge.classList.add('show');
  }
  $('#promoClose', overlay).addEventListener('click', closePromo);
  overlay.addEventListener('click', e=>{ if(e.target === overlay) closePromo(); });
  badge.addEventListener('click', ()=>{ badge.classList.remove('show'); openPromo(); });
})();

const devisForm = $('#devisForm');
if(devisForm){
  const STORAGE_KEY = 'ad_devis_v1';
  let state = { make:'', model:'', plate:'', damage:[], zones:[], photos:[], fullName:'', phone:'', email:'', message:'', courtesy:'', step:1 };
  const totalSteps = 6;

  function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({...state, photos: state.photos.map(p=>p.name)})); }catch(e){} }

  function setStep(n){
    state.step = n;
    $$('.devis-step').forEach(s=> s.classList.toggle('active', parseInt(s.dataset.step)===n));
    $$('.devis-step-pill').forEach(p=>{
      const idx = parseInt(p.dataset.pill);
      p.classList.toggle('done', idx < n);
      p.classList.toggle('active', idx === n);
    });
    if(n===5){ const cp = $('#contactPreview'); if(cp) cp.textContent = `${state.fullName} - ${state.phone}`; }
    if(n===6) renderSummary();
    saveState();
    track('devis_step', {step:n});
    window.scrollTo({top: devisForm.getBoundingClientRect().top + window.scrollY - 100, behavior: prefersReduced?'auto':'smooth'});
  }

  $$('.next').forEach(btn=> btn.addEventListener('click', ()=>{
    if(!validateStep(state.step)) return;
    setStep(parseInt(btn.dataset.next));
  }));
  $$('.prev').forEach(btn=> btn.addEventListener('click', ()=> setStep(parseInt(btn.dataset.prev))));

  function validateStep(n){
    if(n===1){
      state.make = $('#dMake').value; state.model = $('#dModel').value.trim(); state.plate = $('#dPlate').value.trim();
      const ok = state.make && state.model;
      $('#dErr1').classList.toggle('show', !ok);
      return ok;
    }
    if(n===2){
      const ok = state.damage.length > 0;
      $('#dErr2').classList.toggle('show', !ok);
      return ok;
    }
    if(n===4){
      state.fullName = $('#dName').value.trim();
      state.phone = $('#dPhone').value.trim();
      state.email = $('#dEmail').value.trim();
      state.message = $('#dMessage').value.trim();
      const ok = state.fullName.length>1 && state.phone.length>5;
      $('#dErr4').classList.toggle('show', !ok);
      return ok;
    }
    return true;
  }

  const damageContainer = $('#damageCards');
  if(damageContainer){
    $$('.select-card', damageContainer).forEach(card=>{
      card.addEventListener('click', ()=>{
        card.classList.toggle('selected');
        state.damage = $$('.select-card.selected', damageContainer).map(c=>c.dataset.value);
      });
      card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); card.click(); } });
    });
  }

  const zoneMapper = $('#zoneMapper');
  if(zoneMapper){
    $$('.zone-btn', zoneMapper).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btn.classList.toggle('selected');
        state.zones = $$('.zone-btn.selected', zoneMapper).map(b=>b.dataset.zone);
      });
      btn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); } });
    });
  }

  const courtesyGroup = $('#courtesyGroup');
  if(courtesyGroup){
    $$('.courtesy-opt', courtesyGroup).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        $$('.courtesy-opt', courtesyGroup).forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        state.courtesy = btn.dataset.value;
        const note = $('#courtesyNote');
        note.classList.toggle('show', state.courtesy === 'oui');
      });
    });
  }

  const qDropzone = $('#qDropzone'); const qFileInput = $('#qFileInput'); const qPreviewGrid = $('#qPreviewGrid');
  qDropzone?.addEventListener('click', ()=> qFileInput.click());
  qDropzone?.addEventListener('dragover', e=>{ e.preventDefault(); qDropzone.classList.add('dragover'); });
  qDropzone?.addEventListener('dragleave', ()=> qDropzone.classList.remove('dragover'));
  qDropzone?.addEventListener('drop', e=>{ e.preventDefault(); qDropzone.classList.remove('dragover'); handlePhotos(e.dataTransfer.files); });
  qFileInput?.addEventListener('change', ()=> handlePhotos(qFileInput.files));

  function compressImage(file, maxDim=1600, quality=0.75){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = e=>{
        const img = new Image();
        img.onload = ()=>{
          let { width, height } = img;
          if(width > maxDim || height > maxDim){
            const ratio = Math.min(maxDim/width, maxDim/height);
            width = Math.round(width*ratio); height = Math.round(height*ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handlePhotos(files){
    const remaining = 6 - state.photos.length;
    Array.from(files).slice(0, remaining).forEach(file=>{
      if(!file.type.startsWith('image/')){ showToast("Ce fichier n'est pas une image."); return; }
      if(file.size > 15*1024*1024){ showToast('Cette photo est trop volumineuse.'); return; }
      const entry = {name:file.name, dataUrl:null, status:'loading'};
      state.photos.push(entry);
      renderPreviews();
      compressImage(file).then(dataUrl=>{
        entry.dataUrl = dataUrl; entry.status = 'success';
        renderPreviews();
      }).catch(()=>{
        entry.status = 'error';
        showToast("Cette photo n'a pas pu etre ajoutee. Reessayez.");
        renderPreviews();
      });
    });
  }
  function renderPreviews(){
    if(!qPreviewGrid) return;
    qPreviewGrid.innerHTML = state.photos.map((p,i)=>{
      if(p.status === 'loading') return `<div class="qpreview-item"><div class="qp-progress" style="width:70%;"></div></div>`;
      if(p.status === 'error') return `<div class="qpreview-item" style="display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--red);text-align:center;">Erreur<button type="button" data-idx="${i}">X</button></div>`;
      return `<div class="qpreview-item"><img src="${p.dataUrl}" alt="Photo ${i+1}"><button type="button" data-idx="${i}">X</button></div>`;
    }).join('');
    $$('.qpreview-item button', qPreviewGrid).forEach(btn=>{
      btn.addEventListener('click', ()=>{ state.photos.splice(parseInt(btn.dataset.idx),1); renderPreviews(); });
    });
  }

  const damageLabels = {accident:'Accident', rayure:'Rayure', bosse:'Bosse', 'pare-chocs':'Pare-chocs', peinture:'Peinture', vitrage:'Vitrage', mecanique:'Mecanique', autre:'Autre'};
  const zoneLabels = {avant:'Avant', arriere:'Arriere', gauche:'Cote gauche', droit:'Cote droit', capot:'Capot', toit:'Toit', portieres:'Portieres', 'pare-chocs':'Pare-chocs', ailes:'Ailes', vitres:'Vitres', autre:'Autre'};
  const courtesyLabels = {oui:'Oui', non:'Non', 'je-ne-sais-pas':'Je ne sais pas encore'};

  function renderSummary(){
    const c = $('#summaryContainer');
    if(!c) return;
    c.innerHTML = `
      <div class="summary-block"><div><div class="label">Vehicule</div><div class="value">${state.make} ${state.model}${state.plate ? ' - '+state.plate : ''}</div></div><button type="button" class="summary-edit" data-goto="1">Modifier</button></div>
      <div class="summary-block"><div><div class="label">Dommage</div><div class="value">${state.damage.map(d=>damageLabels[d]||d).join(', ') || 'Non precise'}${state.zones.length ? ' - Zones: '+state.zones.map(z=>zoneLabels[z]||z).join(', ') : ''}</div></div><button type="button" class="summary-edit" data-goto="2">Modifier</button></div>
      <div class="summary-block"><div><div class="label">Photos</div><div class="value">${state.photos.filter(p=>p.status==='success').length} photo(s)</div></div><button type="button" class="summary-edit" data-goto="3">Modifier</button></div>
      <div class="summary-block"><div><div class="label">Coordonnees</div><div class="value">${state.fullName} - ${state.phone}${state.email ? ' - '+state.email : ''}${state.courtesy ? ' - Vehicule de courtoisie: '+(courtesyLabels[state.courtesy]||state.courtesy) : ''}</div></div><button type="button" class="summary-edit" data-goto="4">Modifier</button></div>
    `;
    $$('.summary-edit', c).forEach(btn=> btn.addEventListener('click', ()=> setStep(parseInt(btn.dataset.goto))));
  }

  (function checkRecovery(){
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved){
        const data = JSON.parse(saved);
        if(data.fullName || data.model){
          $('#recoveryNotice')?.classList.remove('hidden');
          $('#resumeBtn')?.addEventListener('click', ()=>{ restoreState(data); $('#recoveryNotice').classList.add('hidden'); });
          $('#discardBtn')?.addEventListener('click', ()=>{ localStorage.removeItem(STORAGE_KEY); $('#recoveryNotice').classList.add('hidden'); });
        }
      }
    }catch(e){}
  })();
  function restoreState(data){
    state = {...state, ...data, photos: []};
    if(state.plate) $('#dPlate').value = state.plate;
    if(state.make) $('#dMake').value = state.make;
    if(state.model) $('#dModel').value = state.model;
    if(state.fullName) $('#dName').value = state.fullName;
    if(state.phone) $('#dPhone').value = state.phone;
    if(state.email) $('#dEmail').value = state.email;
    if(state.message) $('#dMessage').value = state.message;
    setStep(state.step || 1);
  }

  let submitted = false;
  devisForm.addEventListener('submit', e=>{
    e.preventDefault();
    if(submitted) return;
    const honeypot = devisForm.querySelector('input[name="company"]').value;
    if(honeypot) return;
    submitted = true;
    const submitBtn = $('#submitBtn');
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    const waText = encodeURIComponent(
      `Bonjour AD Carrosserie, je souhaite un devis.\nVehicule: ${state.make} ${state.model} ${state.plate?'('+state.plate+')':''}\nDommage: ${state.damage.map(d=>damageLabels[d]||d).join(', ')}\nZones: ${state.zones.map(z=>zoneLabels[z]||z).join(', ')}\nVehicule de courtoisie: ${courtesyLabels[state.courtesy]||'Non precise'}\nNom: ${state.fullName}\nTelephone: ${state.phone}\nEmail: ${state.email}\nMessage: ${state.message}`
    );
    setTimeout(()=>{
      localStorage.removeItem(STORAGE_KEY);
      showToast('Demande envoyee avec succes.');
      devisForm.parentElement.querySelector('.devis-stepper')?.classList.add('hidden');
      devisForm.classList.add('hidden');
      $('#recoveryNotice')?.classList.add('hidden');
      $('#successState').classList.remove('hidden');
      $('#successState .btn-primary').href = `https://wa.me/330000000000?text=${waText}`;
    }, 500);
  });

  setStep(1);
}

const contactForm = $('#contactForm');
contactForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const honeypot = contactForm.querySelector('input[name="company"]').value;
  if(honeypot) return;
  const name = $('#cName').value.trim();
  const phone = $('#cPhone')?.value.trim() || '';
  const message = $('#cMessage').value.trim();
  const text = encodeURIComponent(`Bonjour AD Carrosserie,\nNom: ${name}\nTelephone: ${phone}\nMessage: ${message}`);
  showToast('Message envoye.');
  setTimeout(()=> window.open(`https://wa.me/330000000000?text=${text}`, '_blank'), 400);
});

$$('a[href^="tel:"]').forEach(a=> a.addEventListener('click', ()=> track('phone_click', {})));
$$('a[href*="wa.me"]').forEach(a=> a.addEventListener('click', ()=> track('whatsapp_click', {})));
