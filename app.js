// ============================================================
//  MIAU — Imunoterapie alergii copii
//  Version 1.10
//  Vanilla JS, zero dependențe, localStorage
// ============================================================

'use strict';

// ============================================================
//  CONSTANTE
// ============================================================

const APP_VERSION = '1.18';
const STORAGE_KEY = 'miau_data';
const TIMER_KEY   = 'miau_timer';

const SIMPTOME = [
  { id: 'muci',       label: '🤧 Muci / nas înfundat' },
  { id: 'tuse',       label: '😮‍💨 Tuse' },
  { id: 'ragusit',    label: '🗣️ Raguseală' },
  { id: 'pete',       label: '🔴 Pete pe piele' },
  { id: 'mancarime',  label: '👅 Mâncărime limbă / gât' },
  { id: 'lacrimare',  label: '👁️ Lăcrimare / ochi roșii' },
  { id: 'stranute',   label: '🤧 Strănutat' },
  { id: 'oboseala',   label: '😴 Oboseală / irascibilitate' },
  { id: 'greata',     label: '🤢 Greață' },
  { id: 'edem',       label: '💊 Edem / umflătură' },
  { id: 'altele',     label: '📝 Altele', cuDetalii: true }
];

const SEVERITATE = [
  { id: 'usor',  label: 'Ușor',  emoji: '🟡' },
  { id: 'mediu', label: 'Mediu', emoji: '🟠' },
  { id: 'sever', label: 'Sever', emoji: '🔴' }
];

const LINK_STALORAL_DEFAULT = 'https://comenzi.farmaciatei.ro/cauti/staloral+pisica?product_category=1';
const LINK_MEDRADAR  = 'https://www.medradar.ro/';
const LINK_PROSPECT  = 'https://www.anm.ro/_/_PRO/PRO_10664_15.03.18.pdf';
const LINK_SITE      = 'https://miauapp.ro';
const LINK_GHID      = 'https://miauapp.ro/ghid-instalare.html';
const LINK_DONATIE   = 'https://revolut.me/denisalvcr';

// ============================================================
//  STARE GLOBALĂ
// ============================================================

let S = {
  data: null,              // toate datele salvate
  tab: 'acasa',            // tab activ: acasa | simptome | stocuri | istoric | setari
  modal: null,             // modal activ sau null
  timers: {},              // timere active
  timerStepIdx: null,      // indexul pasului curent în buildPasi() — null = neînceput
  timerDone: false,        // timer-ul curent a expirat
  onb: { step: 1, d: {} }, // onboarding state
  istoricSubtab: 'grafic', // subtab istoric
  simptomeCurate: false,   // după salvare, arată ecran curat
  simptomeData: null,      // data selectată în tab Simptome (null = azi)
  ejsExpanded: false,      // formular EmailJS expandat în Setări
  alerteExpanded: false,   // formular alerte stoc expandat
  wakeLock: null           // referință Wake Lock activ
};

// ============================================================
//  DATE — Model implicit
// ============================================================

function defaultData() {
  return {
    version: APP_VERSION,
    tratamente: [],
    activId: null
  };
}

function defaultTratament(partial = {}) {
  return {
    id: uid(),
    nume: '',                // ex: "Matei — pisică"
    alergen: 'pisica',
    dataStart: today(),
    protocol: [],            // [{ id, zile, picaturi, unitati }]
    antihistaminic: {
      activ: false,
      nume: '',
      tip: 'pastile',        // 'pastile' | 'picaturi'
      doza: '',              // ex: '5mg', '10ml', '2 picături'
      stoc: 0,
      stocInitial: 0,
      pozitie: 'inainte',   // 'inainte' | 'dupa'
      minute: 20
    },
    staloral: {
      flaconCurent: 50,      // picături rămase în flacon curent
      flacoaneRamase: 0,
      alertaPicaturi: 5,     // alertă la 10% din 50
      alertaFlacoane: 1,
      dataExpirare: ''       // opțional — data expirare flacon curent
    },
    email: '',
    emailActiv: false,
    emailjs: { serviceId: '', templateId: '', publicKey: '' },
    linkStaloral: '',       // link custom căutare Staloral (gol = default Farmacia Tei pisică)
    tranzitieFlacon: false, // true după ce utilizatorul confirmă trecerea la flaconul albastru
    pasiExtra: [], // pași personalizați adăugați după protocolul standard
    istoric: [],             // intrări zilnice
    creatLa: new Date().toISOString()
  };
}

function defaultProtocolInitiere() {
  return [
    { id: uid(), zile: 1, picaturi: 1, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 2, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 3, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 4, unitati: 10, tipData: 'zile' },
    { id: uid(), zile: 1, picaturi: 5, unitati: 10, tipData: 'zile' },
  ];
}

function defaultProtocolMentinere() {
  return [
    { id: uid(), zile: 7,    picaturi: 1, unitati: 100, tipData: 'zile' },
    { id: uid(), zile: 7,    picaturi: 2, unitati: 100, tipData: 'zile' },
    { id: uid(), zile: 1095, picaturi: 3, unitati: 100, tipData: 'zile' },
  ];
}

// ============================================================
//  STORAGE
// ============================================================

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) S.data = JSON.parse(raw);
    else S.data = defaultData();
  } catch {
    S.data = defaultData();
  }
  curataIstoricVechi();
}

function curataIstoricVechi() {
  if (!S.data?.tratamente) return;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 3);
  const limita = cutoff.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  let modificat = false;
  S.data.tratamente.forEach(t => {
    if (!t.istoric) return;
    const inainte = t.istoric.length;
    t.istoric = t.istoric.filter(e => e.data >= limita);
    if (t.istoric.length !== inainte) modificat = true;
  });
  if (modificat) saveData();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S.data));
  } catch (e) {
    toast('⚠️ Eroare la salvare — memoria plină?');
  }
}

const TEME_VALIDE = ['menta', 'soare', 'salvie', 'nocturn'];

function aplicaTema(tema) {
  if (!TEME_VALIDE.includes(tema)) tema = 'menta';
  if (tema === 'menta') document.documentElement.removeAttribute('data-tema');
  else document.documentElement.setAttribute('data-tema', tema);
  localStorage.setItem('miau_tema', tema);
  const culoriBara = { menta:'#4A9B8E', soare:'#F26A4B', salvie:'#2F5D50', nocturn:'#161C2E' };
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', culoriBara[tema]);
}

function temaCurenta() {
  return localStorage.getItem('miau_tema') || 'menta';
}

function tratamentActiv() {
  if (!S.data.activId) return null;
  return S.data.tratamente.find(t => t.id === S.data.activId) || null;
}

// ============================================================
//  UTILITARE
// ============================================================

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  // Folosim data locală (nu UTC) — evită bug-ul de timezone
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}

function formatMMSS(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function ziuaTratamentului(tratament) {
  const start = new Date(tratament.dataStart);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / 86400000) + 1;
}

function pasProtocolPentruZiua(tratament, ziua) {
  const azi = today();

  // Întâi verifică pașii cu date calendaristice — au prioritate
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar' && pas.dataStart && pas.dataEnd) {
      if (azi >= pas.dataStart && azi <= pas.dataEnd) return pas;
    }
  }

  // Apoi pașii cu număr de zile
  let contor = 0;
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar') continue;
    contor += (pas.zile || 0);
    if (ziua <= contor) return pas;
  }
  return tratament.protocol[tratament.protocol.length - 1] || null;
}

function tratatAziExista(tratament) {
  return tratament.istoric.some(e => e.data === today());
}

function zileRamasePas(tratament, ziua) {
  const azi = today();

  // Pas calendaristic — până la dataEnd
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar' && pas.dataStart && pas.dataEnd) {
      if (azi >= pas.dataStart && azi <= pas.dataEnd) {
        const end = new Date(pas.dataEnd); end.setHours(0,0,0,0);
        const now = new Date(); now.setHours(0,0,0,0);
        return Math.ceil((end - now) / 86400000) + 1;
      }
    }
  }

  // Pas cu zile — numără câte zile mai rămân în blocul curent
  let contor = 0;
  for (const pas of tratament.protocol) {
    if (pas.tipData === 'calendar') continue;
    const startPas = contor + 1;
    contor += (pas.zile || 0);
    if (ziua <= contor) return contor - ziua + 1;
  }
  return null; // ultimul pas (nelimitat)
}

function getOS() {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'other';
}

function toast(msg, durata = 3000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), durata);
}

function showOverlay(html) {
  const div = document.createElement('div');
  div.className = 'overlay';
  div.id = 'overlay';
  div.innerHTML = html;
  div.addEventListener('click', e => {
    if (e.target === div) closeOverlay();
    const btn = e.target.closest('button');
    if (btn && (btn.classList.contains('close-btn') || btn.getAttribute('onclick')?.includes('closeOverlay'))) {
      e.stopPropagation();
      closeOverlay();
    }
  });
  document.body.appendChild(div);
}

function closeOverlay() {
  document.getElementById('overlay')?.remove();
}

function confirmDialog(mesaj, onConfirm, { danger = false, textConfirma = 'Confirmă' } = {}) {
  const div = document.createElement('div');
  div.className = 'overlay';
  div.innerHTML = `
    <div class="modal">
      <div class="modal-title">${danger ? '⚠️ Confirmare' : 'Confirmă acțiunea'}</div>
      <p style="font-size:14px;color:var(--text);line-height:1.6;margin-bottom:16px;white-space:pre-line">${mesaj}</p>
      <div class="btn-row">
        <button class="btn btn-outline" id="confirm-dialog-cancel">Anulează</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-dialog-ok">${textConfirma}</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
  const inchide = () => div.remove();
  div.addEventListener('click', e => { if (e.target === div) inchide(); });
  div.querySelector('#confirm-dialog-cancel').addEventListener('click', inchide);
  div.querySelector('#confirm-dialog-ok').addEventListener('click', () => { inchide(); onConfirm(); });
}

// ============================================================
//  TIMER ENGINE
// ============================================================

function startTimer(id, minutes, onDone) {
  if (S.timers[id]) clearInterval(S.timers[id].interval);
  const endTs = Date.now() + minutes * 60 * 1000;
  const durataPasMs = minutes * 60 * 1000;

  // Stochează callback-ul pentru Skip
  S.timers[id] = { endTs, interval: null, onDone };

  const interval = setInterval(() => {
    const remaining = endTs - Date.now();
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatMMSS(remaining);

    // Inelul Nocturn — fracțiunea de timp rămasă (1 = plin, 0 = gol)
    const circle = document.getElementById('timer-circle');
    if (circle) {
      const frac = Math.max(0, Math.min(1, remaining / durataPasMs));
      circle.style.setProperty('--prog', frac.toFixed(3));
    }

    if (remaining <= 0) {
      clearInterval(interval);
      if (el) el.textContent = '00:00';
      if (circle) {
        circle.classList.remove('running');
        circle.classList.add('done');
        circle.style.setProperty('--prog', '0');
      }
      delete S.timers[id];
      if (onDone) onDone();
    }
  }, 500);

  S.timers[id].interval = interval;
  requestWakeLock();
}

// ============================================================
//  WAKE LOCK — ține ecranul aprins în timpul tratamentului
// ============================================================

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    if (S.wakeLock) return; // deja activ
    S.wakeLock = await navigator.wakeLock.request('screen');
    S.wakeLock.addEventListener('release', () => { S.wakeLock = null; });
  } catch {}
}

function releaseWakeLock() {
  if (S.wakeLock) {
    S.wakeLock.release().catch(() => {});
    S.wakeLock = null;
  }
}

// Reactivează Wake Lock și AudioContext dacă ecranul a revenit
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Object.keys(S.timers).length > 0) {
    requestWakeLock();
    if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
    // Recalculează timere — dacă ecranul a fost stins, actualizăm afișajul
    for (const [id, t] of Object.entries(S.timers)) {
      const remaining = t.endTs - Date.now();
      if (remaining <= 0 && t.onDone) {
        clearInterval(t.interval);
        delete S.timers[id];
        t.onDone();
      }
    }
  }
});

function stopAllTimers() {
  Object.values(S.timers).forEach(t => clearInterval(t.interval));
  S.timers = {};
  releaseWakeLock();
  localStorage.removeItem(TIMER_KEY);
}

function saveTimerState(endTs) {
  if (S.timerStepIdx === null) { localStorage.removeItem(TIMER_KEY); return; }
  localStorage.setItem(TIMER_KEY, JSON.stringify({
    data: today(), stepIdx: S.timerStepIdx, done: S.timerDone, endTs: endTs || null
  }));
}

function restoreTimerState() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return;
    const st = JSON.parse(raw);
    if (st.data !== today()) { localStorage.removeItem(TIMER_KEY); return; }
    const t = tratamentActiv();
    if (!t || tratatAziExista(t)) { localStorage.removeItem(TIMER_KEY); return; }
    S.timerStepIdx = st.stepIdx;
    if (st.done || !st.endTs || st.endTs <= Date.now()) {
      S.timerDone = true;
    } else {
      S._restoreEndTs = st.endTs; // timer încă rulează — repornim după render
    }
  } catch { localStorage.removeItem(TIMER_KEY); }
}

// ============================================================
//  SUNET (bip simplu cu Web Audio)
// ============================================================

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // iOS suspendă contextul dacă nu e user gesture — rezumăm
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// Apelat la primul tap — deblochează AudioContext pe iOS
function initAudio() {
  try { getAudioCtx(); } catch {}
  document.removeEventListener('touchstart', initAudio);
  document.removeEventListener('mousedown', initAudio);
}
document.addEventListener('touchstart', initAudio, { once: true });
document.addEventListener('mousedown', initAudio, { once: true });

function bip(frecventa = 880, durata = 0.3) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frecventa;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durata);
    osc.start();
    osc.stop(ctx.currentTime + durata);
  } catch {}
}

// ============================================================
//  RENDER PRINCIPAL
// ============================================================

function render() {
  const app = document.getElementById('app');

  // Dacă nu există niciun tratament → onboarding
  if (!S.data.tratamente.length) {
    app.innerHTML = renderOnboarding();
    attachOnboardingEvents();
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    <div class="scroll-area" id="scroll-area">
      ${renderTab()}
    </div>
    ${renderBottomNav()}
  `;
  attachMainEvents();
}

// ============================================================
//  HEADER
// ============================================================

function renderHeader() {
  const t = tratamentActiv();
  const optiuni = S.data.tratamente
    .map(tr => `<option value="${tr.id}" ${tr.id === S.data.activId ? 'selected' : ''}>${tr.nume}</option>`)
    .join('');
  return `
    <div class="app-header">
      <h1>🐾 Miau</h1>
      <select class="treatment-selector" id="sel-tratament">${optiuni}</select>
    </div>
  `;
}

// ============================================================
//  BOTTOM NAV
// ============================================================

function renderBottomNav() {
  const tabs = [
    { id: 'acasa',    icon: '🏠', label: 'Acasă' },
    { id: 'simptome', icon: '📋', label: 'Simptome' },
    { id: 'stocuri',  icon: '💊', label: 'Stocuri' },
    { id: 'istoric',  icon: '📅', label: 'Istoric' },
    { id: 'setari',   icon: '⚙️',  label: 'Setări' }
  ];
  return `
    <nav class="bottom-nav">
      ${tabs.map(t => `
        <button class="nav-btn ${S.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
          <span class="nav-icon">${t.icon}</span>
          <span>${t.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

// ============================================================
//  DISPATCH TABS
// ============================================================

function renderTab() {
  switch (S.tab) {
    case 'acasa':    return renderAcasa();
    case 'simptome': return renderSimptome();
    case 'stocuri':  return renderStocuri();
    case 'istoric':  return renderIstoric();
    case 'setari':   return renderSetari();
    default:         return renderAcasa();
  }
}

// ============================================================
//  TAB: ACASĂ — tratament zilei + timere
// ============================================================

function esteZiTransitieFlacon(t) {
  if (t.tranzitieFlacon) return false; // deja confirmat
  const ziua = ziuaTratamentului(t);
  const pasAzi = pasProtocolPentruZiua(t, ziua);
  if (!pasAzi || pasAzi.unitati !== 100) return false;
  // Verifică dacă protocolul are și pași de 10u (inițiere) înainte
  const areInitiere = t.protocol.some(p => p.unitati === 10);
  return areInitiere;
}

function trebuieBannerInstalare() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return false;
  if (S.data.bannerInstalareAscunsLa === 'pentru-totdeauna') return false;
  return true;
}

function renderAcasa() {
  const t = tratamentActiv();
  if (!t) return `<div class="empty-state"><div class="empty-icon">😿</div><p>Niciun tratament activ.</p></div>`;

  const ziua = ziuaTratamentului(t);
  const pas = pasProtocolPentruZiua(t, ziua);
  const tratatAzi = tratatAziExista(t);
  const faza = pas ? (pas.unitati === 10 ? 'Inițiere' : 'Menținere') : 'Menținere';
  const tranzitie = esteZiTransitieFlacon(t);
  const zileRamase = pas ? zileRamasePas(t, ziua) : null;

  return `
    ${trebuieBannerInstalare() ? `
    <div class="card" style="border:2px solid var(--warning);background:#FFF8EC">
      <div style="font-size:14px;font-weight:700;color:#7A5500;margin-bottom:6px">📲 Adaugă Miau pe ecranul principal</div>
      <div style="font-size:13px;color:#7A5500;line-height:1.5;margin-bottom:10px">
        Pe iPhone, datele se pot șterge automat dacă aplicația rămâne doar în browser și nu e folosită o vreme.
        Adaugă-o pe ecranul principal ca să fie sigură.
      </div>
      <div style="display:flex;gap:8px">
        <a href="ghid-instalare.html" target="_blank" class="btn btn-primary" style="flex:1;text-align:center;text-decoration:none">Vezi cum</a>
        <button class="btn btn-outline" id="btn-ascunde-banner-instalare">Am făcut-o</button>
      </div>
    </div>
    ` : ''}
    ${tranzitie ? `
    <div style="background:linear-gradient(135deg,#EEF4FF,#E0EAFF);border:2px solid #5B9BD5;
      border-radius:14px;padding:16px;margin-bottom:12px">
      <div style="font-size:15px;font-weight:700;color:#1A4A8A;margin-bottom:6px">
        💙 Ai trecut la faza de Menținere!
      </div>
      <div style="font-size:13px;color:#2A5A9A;line-height:1.6;margin-bottom:14px">
        De azi dozele sunt de <strong>100 unități</strong> (flaconul albastru).<br>
        Pune un flacon albastru nou și confirmă mai jos — stocul se resetează automat la 50 de picături.
      </div>
      <button class="btn" id="btn-confirma-tranzitie"
        style="background:#3A7ABD;color:white;border:none;width:100%;padding:13px;
          border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">
        ✅ Am pus flaconul albastru — continuă
      </button>
    </div>
    ` : ''}

    <!-- Card protocol azi -->
    <div class="card card-pink">
      <div class="card-title">Tratamentul de azi — ${formatDate(today())}</div>
      <div class="protocol-today">
        <div class="protocol-day">Ziua ${ziua} din tratament</div>
        ${pas ? `
          <div class="protocol-dose">
            ${pas.picaturi} ${pas.picaturi === 1 ? 'picătură' : 'picături'}
            <span>× ${pas.unitati} unități</span>
          </div>
          <span class="protocol-phase ${faza === 'Menținere' ? 'mentinere' : ''}">${faza} — ${pas.picaturi * pas.unitati} unități total</span>
          ${zileRamase !== null ? `
            <div style="margin-top:8px;font-size:12px;color:var(--text-light)">
              ${zileRamase === 1
                ? '⏳ Ultima zi din doza curentă'
                : `⏳ Mai ${zileRamase === 2 ? 'e' : 'sunt'} <strong>${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}</strong> din doza curentă`}
            </div>
          ` : `
            <div style="margin-top:8px;font-size:12px;color:var(--text-light)">
              ⏳ Doza de menținere — continuă
            </div>
          `}
        ` : '<p style="color:var(--text-light)">Protocolul nu este configurat.</p>'}
      </div>
    </div>

    ${!tratatAzi && pas && new Date().getHours() >= 20 ? `
      <div style="background:#FFF0DC;border:1px solid #FFD060;border-radius:10px;
        padding:10px 14px;margin-bottom:8px;font-size:13px;color:#7A5500;text-align:center">
        🌙 E târziu — nu uita de tratament!
      </div>
    ` : ''}

    ${tratatAzi ? renderTimereInactive(t) : renderTimere(t)}

    <!-- Hint protocol -->
    <p style="font-size:12px;color:var(--text-light);text-align:center;margin-bottom:12px">
      ⚙️ Protocolul și pașii se modifică din tab-ul <strong>Setări</strong>
    </p>

    <!-- Linkuri rapide -->
    <div class="card">
      <div class="card-title">Linkuri utile</div>
      <div class="links-grid">
        ${renderLinkuri(t)}
      </div>
    </div>

    ${!tratatAzi && pas ? `
      <button class="btn btn-outline" id="btn-sari">Sărit azi (nu s-a putut face tratamentul)</button>
    ` : ''}

    ${!pas ? `
      <div style="background:var(--bg);border-radius:10px;padding:14px;text-align:center;
        font-size:13px;color:var(--text-light)">
        ⚙️ Protocolul nu e configurat — mergi la <strong>Setări</strong> pentru a-l adăuga.
      </div>
    ` : ''}
  `;
}

function renderTimere(t) {
  const idx  = S.timerStepIdx;   // null = neînceput, 0,1,2... = pasul curent
  const pasi = buildPasi(t);

  return `
    <div class="card">
      <div class="card-title">Pașii tratamentului</div>
      <div class="steps-list">
        ${pasi.map((p, i) => {
          const done   = idx !== null && (i < idx || (i === idx && S.timerDone));
          const active = idx !== null && i === idx && !S.timerDone;
          const cls    = done ? 'done' : (active ? 'active' : 'waiting');
          return `
            <div class="step-item">
              <div class="step-number ${cls}">${done ? '✓' : (i + 1)}</div>
              <div class="step-info">
                <div class="step-title">${p.label}</div>
                <div class="step-sub">${p.sub}</div>
                ${active ? `
                  <div style="margin-top:8px;display:flex;align-items:center;gap:12px">
                    <div id="timer-circle" class="timer-circle running"
                      style="width:80px;height:80px;margin:0;border-width:4px">
                      <span id="timer-display" class="timer-time" style="font-size:20px">
                        ${formatMMSS(p.minute * 60000)}
                      </span>
                    </div>
                    <button class="btn btn-outline btn-small" id="btn-skip-timer"
                      style="font-size:13px;padding:10px 14px;width:auto">
                      ⏭️ Continuă acum
                    </button>
                  </div>
                ` : ''}
              </div>
              <div class="step-action">
                ${idx === null && i === 0 ? `
                  <button class="btn btn-primary btn-small" id="btn-start-pas">Start ▶</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${idx !== null && S.timerDone && idx < pasi.length - 1 ? `
        <div style="margin-top:12px">
          <button class="btn btn-success" id="btn-pas-urmator" data-idx="${idx + 1}">
            ${pasi[idx + 1].label} ▶
          </button>
        </div>
      ` : ''}
      ${idx !== null && S.timerDone && idx === pasi.length - 1 ? `
        <div style="margin-top:12px">
          <button class="btn btn-success" id="btn-finalizeaza">
            🎉 Finalizează tratamentul zilei!
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderDonatii() {
  return `
    <div style="background:linear-gradient(135deg,#FFF8EC,#FFF0DC);border-radius:14px;
      padding:14px 16px;margin-bottom:12px;border:1px solid #FFE0A0;
      display:flex;align-items:center;gap:12px">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#7A5500;margin-bottom:2px">
          💛 Susține aplicația
        </div>
        <div style="font-size:12px;color:#A07020;line-height:1.4">
          Miau e gratuită și fără reclame.<br>O cafea pentru developer (10–50 lei) ajută mult!
        </div>
      </div>
      <a href="${LINK_DONATIE}" target="_blank" rel="noopener"
        style="display:block;text-align:center;padding:10px 16px;white-space:nowrap;
          background:white;border:2px solid #FFD060;border-radius:10px;
          font-size:13px;font-weight:700;color:#7A5500;text-decoration:none;
          box-shadow:0 1px 4px rgba(0,0,0,0.06);flex-shrink:0">
        ☕ Donează
      </a>
    </div>
  `;
}

function renderLinkuri(t) {
  const linkStaloral = t.linkStaloral || LINK_STALORAL_DEFAULT;
  return `
    <div style="display:flex;align-items:center;gap:6px">
      <a href="${linkStaloral}" target="_blank" class="link-btn" style="flex:1">
        <span class="link-icon">🛒</span>
        <span>Caută Staloral — Farmacia Tei</span>
        <span class="link-arrow">↗</span>
      </a>
    </div>
    <a href="${LINK_MEDRADAR}" target="_blank" class="link-btn">
      <span class="link-icon">💊</span>
      <span>MedRadar — stocuri farmacii</span>
      <span class="link-arrow">↗</span>
    </a>
    <a href="${LINK_PROSPECT}" target="_blank" class="link-btn">
      <span class="link-icon">📄</span>
      <span>Prospect oficial Staloral (PDF)</span>
      <span class="link-arrow">↗</span>
    </a>
    <a href="${LINK_SITE}" target="_blank" class="link-btn">
      <span class="link-icon">🌐</span>
      <span>miauapp.ro — site aplicație</span>
      <span class="link-arrow">↗</span>
    </a>
    <a href="${LINK_GHID}" target="_blank" class="link-btn">
      <span class="link-icon">📱</span>
      <span>Ghid instalare pe telefon</span>
      <span class="link-arrow">↗</span>
    </a>
  `;
}

// ============================================================
//  TAB: SIMPTOME
// ============================================================

function renderSimptome() {
  const t = tratamentActiv();
  if (!t) return `<div class="empty-state"><div class="empty-icon">😿</div><p>Niciun tratament activ.</p></div>`;

  const dataSelectata = S.simptomeData || today();
  const esteAzi = dataSelectata === today();
  const intrareZi = t.istoric.find(e => e.data === dataSelectata);
  const simptomeZi = S.simptomeCurate ? [] : (intrareZi?.simptome || []);

  // Calculează doza pentru ziua selectată (pentru log retroactiv)
  const ziuaNr = (() => {
    const start = new Date(t.dataStart); start.setHours(0,0,0,0);
    const sel   = new Date(dataSelectata); sel.setHours(0,0,0,0);
    return Math.floor((sel - start) / 86400000) + 1;
  })();
  const pasZi = ziuaNr > 0 ? pasProtocolPentruZiua(t, ziuaNr) : null;

  return `
    <div class="card">
      <!-- Selector dată -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <label style="font-size:13px;font-weight:600;color:var(--text-light);text-transform:uppercase;
          letter-spacing:0.3px;white-space:nowrap">Data:</label>
        <input type="date" id="sim-data" value="${dataSelectata}" max="${today()}"
          style="flex:1;padding:8px 12px;border:2px solid ${esteAzi ? 'var(--teal)' : 'var(--warning)'};
            border-radius:8px;font-size:14px;font-weight:600">
        ${!esteAzi ? `<span style="font-size:12px;color:var(--warning);font-weight:600">zi trecută</span>` : ''}
      </div>

      ${!esteAzi && pasZi ? `
        <!-- Log retroactiv — opțiune scădere stoc -->
        <div style="background:var(--blue-light);border-radius:10px;padding:12px;margin-bottom:14px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">
            📋 Protocol pentru ${formatDate(dataSelectata)}: ${pasZi.picaturi} pic. × ${pasZi.unitati}u
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="checkbox" id="chk-scade-stoc" ${intrareZi?.finalizat ? 'checked' : ''}>
            Tratamentul a fost efectuat — scade din stoc
          </label>
        </div>
      ` : ''}

      <button class="btn btn-success" id="btn-totul-ok" style="margin-bottom:14px">
        ✅ Totul OK — niciun simptom
      </button>

      <div id="hint-simptome-goale" style="display:none;background:#FFF0DC;border:1px solid #FFD060;
        border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#7A5500;text-align:center">
        Bifează cel puțin un simptom sau apasă <strong>Totul OK</strong> dacă nu a fost nimic.
      </div>

      <div class="divider"></div>
      <p style="font-size:13px;color:var(--text-light);margin:10px 0 12px">
        Bifează simptomele${esteAzi ? ' de azi' : ` din ${formatDate(dataSelectata)}`}:
      </p>

      <div id="symptom-list" style="display:flex;flex-direction:column;gap:8px">
        ${SIMPTOME.map(s => {
          const sel = simptomeZi.find(x => x.id === s.id);
          return `
            <div class="symptom-row" data-id="${s.id}"
              style="padding:12px;border:2px solid ${sel ? 'var(--teal)' : '#DDF0ED'};border-radius:10px;
                     background:${sel ? 'var(--teal-light)' : 'white'};cursor:pointer;transition:all 0.15s">
              <div style="display:flex;align-items:center;gap:10px;pointer-events:none">
                <span style="font-size:20px">${s.label.split(' ')[0]}</span>
                <span style="font-size:14px;flex:1;font-weight:${sel ? '600' : '400'}">
                  ${s.label.split(' ').slice(1).join(' ')}
                </span>
                <span style="font-size:18px;color:${sel ? 'var(--teal)' : '#CCC'}">${sel ? '✓' : '○'}</span>
              </div>
              ${sel ? `
                <div class="severity-row" style="margin-top:10px" onclick="event.stopPropagation()">
                  ${SEVERITATE.map(sv => `
                    <button class="sev-btn ${sv.id} ${sel.severitate === sv.id ? 'sel' : ''}"
                      data-symptom="${s.id}" data-sev="${sv.id}">${sv.emoji} ${sv.label}</button>
                  `).join('')}
                </div>
                ${s.cuDetalii ? `
                  <input type="text" class="altele-detalii" placeholder="Descrie pe scurt..."
                    value="${sel.detalii || ''}"
                    onclick="event.stopPropagation()"
                    style="margin-top:8px;width:100%;padding:8px 10px;border:1px solid #DDF0ED;
                      border-radius:8px;font-size:13px;box-sizing:border-box">
                ` : ''}
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn btn-primary" id="btn-salveaza-simptome" style="margin-top:16px">
        💾 Salvează în Istoric
      </button>
    </div>
  `;
}

// ============================================================
//  TAB: STOCURI
// ============================================================

function renderStocuri() {
  const t = tratamentActiv();
  if (!t) return `<div class="empty-state"><div class="empty-icon">😿</div><p>Niciun tratament activ.</p></div>`;

  const s = t.staloral;
  const a = t.antihistaminic;
  const picAlert = s.flaconCurent <= s.alertaPicaturi;
  const flaconAlert = s.flacoaneRamase <= s.alertaFlacoane;

  return `
    <!-- Staloral -->
    <div class="card card-pink">
      <div class="card-title">💧 Staloral — Flacon curent</div>
      <div class="stock-grid">
        <div class="stock-item">
          <div class="stock-icon">💧</div>
          <div class="stock-value ${picAlert ? 'stock-alert' : ''}">${s.flaconCurent}</div>
          <div class="stock-label">picături rămase</div>
          ${picAlert ? '<div style="font-size:11px;color:var(--danger);font-weight:600">⚠️ Stoc scăzut!</div>' : ''}
        </div>
        <div class="stock-item">
          <div class="stock-icon">📦</div>
          <div class="stock-value ${flaconAlert ? 'stock-warn' : ''}">${s.flacoaneRamase}</div>
          <div class="stock-label">flacoane în rezervă</div>
          ${flaconAlert ? '<div style="font-size:11px;color:var(--warning);font-weight:600">⚠️ Puține flacoane!</div>' : ''}
        </div>
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn btn-outline btn-small" id="btn-flacon-nou">🆕 Flacon nou (50)</button>
        <button class="btn btn-outline btn-small" id="btn-corecteaza">✏️ Corectează</button>
      </div>
      <p class="hint" style="margin-top:8px">Dacă s-au pierdut picături la pornire, folosește „Corectează" pentru a scădea manual.</p>

      <!-- Data expirare opțională -->
      <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
        <label style="font-size:12px;color:var(--text-light);white-space:nowrap">📅 Expiră la:</label>
        <input type="date" id="input-data-expirare" value="${s.dataExpirare || ''}"
          style="flex:1;padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:13px">
        <button class="btn btn-outline btn-small" id="btn-salveaza-expirare"
          style="width:auto;padding:6px 12px;font-size:12px">Salvează</button>
      </div>

      ${s.dataExpirare ? (() => {
        const azi = today();
        const zileRamase = Math.ceil((new Date(s.dataExpirare) - new Date(azi)) / 86400000);
        const expirat = zileRamase < 0;
        const aproape = zileRamase >= 0 && zileRamase <= 30;
        if (expirat) return `
          <div style="margin-top:10px;background:#FFF0F0;border:1px solid #F5B0B0;border-radius:10px;
            padding:10px 12px;font-size:13px;color:#C00000;display:flex;align-items:center;gap:8px">
            ⚠️ <strong>Flaconul a expirat!</strong> Înlocuiește-l înainte de următorul tratament.
          </div>`;
        if (aproape) return `
          <div style="margin-top:10px;background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;
            padding:10px 12px;font-size:13px;color:#7A5500;display:flex;align-items:center;gap:8px">
            ⚠️ Atenție la data de expirare — mai sunt <strong>${zileRamase} ${zileRamase === 1 ? 'zi' : 'zile'}</strong> (${formatDate(s.dataExpirare)}).
          </div>`;
        return `
          <div style="margin-top:10px;background:var(--bg);border-radius:10px;
            padding:8px 12px;font-size:12px;color:var(--text-light)">
            📅 Data expirare flacon: <strong>${formatDate(s.dataExpirare)}</strong> — mai sunt ${zileRamase} zile.
          </div>`;
      })() : ''}
    </div>

    ${a.activ ? `
      <!-- Antihistaminic -->
      <div class="card card-blue">
        <div class="card-title">💊 ${a.nume || 'Antihistaminic'}${a.doza ? ` — ${a.doza}` : ''}</div>
        <div class="stock-grid">
          <div class="stock-item">
            <div class="stock-icon">${a.tip === 'pastile' ? '💊' : '💧'}</div>
            <div class="stock-value ${a.stoc <= Math.ceil(a.stocInitial * 0.1) ? 'stock-alert' : ''}">${a.stoc}</div>
            <div class="stock-label">${a.tip === 'pastile' ? 'pastile rămase' : 'doze rămase'}</div>
          </div>
          <div class="stock-item">
            <div class="stock-icon">📊</div>
            <div class="stock-value">${a.stocInitial ? Math.round((a.stoc / a.stocInitial) * 100) : 0}%</div>
            <div class="stock-label">din stoc inițial</div>
          </div>
        </div>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-outline btn-small" id="btn-cutie-noua">🆕 Cutie / sticlă nouă</button>
          <button class="btn btn-outline btn-small" id="btn-corecteaza-anti">✏️ Corectează</button>
        </div>
      </div>
    ` : ''}

    <!-- Praguri alerte -->
    <div class="card">
      <div class="card-title">🔔 Praguri de alertă</div>
      ${!S.alerteExpanded ? `
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:10px 12px;background:var(--bg);border-radius:10px">
          <div style="font-size:13px;color:var(--text-light)">
            Alertă la <strong>${s.alertaPicaturi} picături</strong> în flacon
            · <strong>${s.alertaFlacoane} flacoane</strong> rezervă
          </div>
          <button class="btn btn-outline btn-small" id="btn-alerte-edit"
            style="width:auto;padding:6px 12px;font-size:12px">✏️ Editează</button>
        </div>
      ` : `
        <div class="form-group">
          <label>Alertă picături flacon (curent)</label>
          <input type="number" id="alert-picaturi" value="${s.alertaPicaturi}" min="1" max="50">
          <p class="hint">Primești alertă când sunt atât de puține picături în flacon (implicit 5)</p>
        </div>
        <div class="form-group">
          <label>Alertă flacoane în rezervă</label>
          <input type="number" id="alert-flacoane" value="${s.alertaFlacoane}" min="0" max="10">
        </div>
        <div class="btn-row">
          <button class="btn btn-outline" id="btn-alerte-cancel">Anulează</button>
          <button class="btn btn-primary" id="btn-salveaza-alerte">Salvează</button>
        </div>
      `}
    </div>
  `;
}

// ============================================================
//  TAB: ISTORIC — cu sub-taburi Grafic | Listă
// ============================================================

const SIMPTOME_CULORI = {
  muci:       '#4A9B8E',
  tuse:       '#4A7FB5',
  ragusit:    '#C07840',
  pete:       '#D06060',
  mancarime:  '#E0A840',
  lacrimare:  '#5BA0C8',
  stranute:   '#8E72B5',
  oboseala:   '#6DBF8E',
  greata:     '#D4759F',
  edem:       '#FF8C42',
  altele:     '#AAA'
};

function renderIstoric() {
  const t = tratamentActiv();
  if (!t) return `<div class="empty-state"><div class="empty-icon">😿</div><p>Niciun tratament activ.</p></div>`;

  return `
    ${renderGraficSimptome(t)}
    ${renderListaIstorica(t)}
  `;
}

function renderGraficSimptome(t) {
  // Ultimele 14 zile — date locale, nu UTC
  const azi = new Date();
  const zile30 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(azi);
    d.setDate(azi.getDate() - i);
    zile30.push(localDateStr(d));
  }

  // Calculează frecvența fiecărui simptom în ultimele 30 de zile
  const frecventa = {};
  SIMPTOME.forEach(s => { frecventa[s.id] = 0; });
  let zileCuDateAzi = 0;
  let zileOk = 0;
  let zileFaraMentiune = 0;

  for (const data of zile30) {
    const intrare = t.istoric.find(e => e.data === data);
    if (!intrare) { zileFaraMentiune++; continue; }
    if (intrare.totulOk) { zileOk++; continue; }
    if (intrare.simptome?.length) {
      zileCuDateAzi++;
      intrare.simptome.forEach(s => { if (frecventa[s.id] !== undefined) frecventa[s.id]++; });
    } else {
      zileFaraMentiune++;
    }
  }

  // Filtrare simptome cu cel puțin 1 apariție
  const simptomeActive = SIMPTOME
    .filter(s => frecventa[s.id] > 0)
    .map(s => ({ ...s, count: frecventa[s.id], culoare: SIMPTOME_CULORI[s.id] || '#AAA' }))
    .sort((a, b) => b.count - a.count);

  const svgChart = simptomeActive.length > 0
    ? renderDonut(simptomeActive, zileCuDateAzi, 14)
    : renderDonutOk(zileOk, zileFaraMentiune);

  return `
    <div class="card">
      <div class="card-title">Simptome — ultimele 14 zile</div>

      <!-- Chart -->
      <div style="display:flex;flex-direction:column;align-items:center;padding:8px 0">
        ${svgChart}
      </div>

      ${simptomeActive.length > 0 ? `
        <!-- Legendă -->
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
          ${simptomeActive.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;
              background:var(--bg);border-radius:8px">
              <div style="width:14px;height:14px;border-radius:50%;background:${s.culoare};flex-shrink:0"></div>
              <span style="flex:1;font-size:14px">${s.label.split(' ').slice(1).join(' ')}</span>
              <span style="font-weight:700;font-size:16px;color:${s.culoare}">${s.count}</span>
              <span style="font-size:12px;color:var(--text-light)">${s.count === 1 ? 'zi' : 'zile'}</span>
            </div>
          `).join('')}
        </div>

        <!-- Sumar -->
        <div style="display:flex;gap:8px;margin-top:12px">
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px;font-weight:700;color:var(--danger)">${zileCuDateAzi}</div>
            <div style="font-size:11px;color:var(--text-light)">zile cu simptome</div>
          </div>
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px;font-weight:700;color:var(--success)">${zileOk}</div>
            <div style="font-size:11px;color:var(--text-light)">zile OK</div>
          </div>
          <div style="flex:1;text-align:center;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px;font-weight:700;color:var(--text-light)">${zileFaraMentiune}</div>
            <div style="font-size:11px;color:var(--text-light)">fără înreg.</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderDonutOk(zileOk, zileFaraMentiune) {
  const cx = 90, cy = 90, r = 60;
  const C = 2 * Math.PI * r;
  const total = 14;
  const dashOk   = (zileOk / total) * C;
  const dashGray = (zileFaraMentiune / total) * C;
  const gap = C - dashOk - dashGray;

  return `
    <svg viewBox="0 0 180 180" width="180" height="180">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E0EDEA" stroke-width="24"/>
      ${zileOk > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="#4A9B8E" stroke-width="24"
        stroke-dasharray="${dashOk.toFixed(2)} ${(C - dashOk).toFixed(2)}"
        stroke-dashoffset="${(C * 0.25).toFixed(2)}"
        stroke-linecap="butt"/>` : ''}
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="28" font-weight="800" fill="#1E3230">${zileOk}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" fill="#6A8C88">zile OK</text>
      <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="13" font-weight="700" fill="#4A9B8E">din 14</text>
    </svg>
  `;
}

function renderDonut(simptomeActive, zileCuSimptome, totalZile) {
  const r  = 60;
  const cx = 90, cy = 90;
  const C  = 2 * Math.PI * r; // circumference
  const totalCount = simptomeActive.reduce((acc, s) => acc + s.count, 0);

  // Fundal
  let arcs = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#E0EDEA" stroke-width="24"/>`;

  // Calculăm unghiurile — rotim din -90° (sus)
  let angleParcurs = -90;
  for (const s of simptomeActive) {
    const grade = (s.count / totalCount) * 360;
    const gradeUtil = Math.max(0, grade - 2); // mic gap între segmente
    const dash = (gradeUtil / 360) * C;
    const gap  = C - dash;
    arcs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${s.culoare}" stroke-width="24"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      stroke-dashoffset="${((90 + angleParcurs) / 360 * C * -1).toFixed(2)}"
      transform="rotate(${angleParcurs + 90} ${cx} ${cy})"
      stroke-linecap="butt"/>`;
    angleParcurs += grade;
  }

  // Text central
  const pct = Math.round((zileCuSimptome / totalZile) * 100);
  arcs += `
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="28" font-weight="800" fill="#1E3230">${zileCuSimptome}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" fill="#6A8C88">din 14 zile</text>
    <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="13" font-weight="700"
      fill="${pct > 30 ? '#D06060' : '#4A9B8E'}">${pct}%</text>
  `;

  return `<svg viewBox="0 0 180 180" width="180" height="180" style="overflow:visible">${arcs}</svg>`;
}

function renderListaIstorica(t) {
  const milestones = (t.milestones || []).map(m => ({ ...m, _tip: 'milestone' }));
  const intrari = t.istoric.map(e => ({ ...e, _tip: 'intrare' }));

  // Combină și sortează descrescător după dată
  const toate = [...intrari, ...milestones]
    .sort((a, b) => b.data.localeCompare(a.data) || (b._tip === 'milestone' ? 1 : -1));

  if (!toate.length) return `
    <div class="card">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Nicio intrare în istoric încă.<br>Fă primul tratament!</p>
      </div>
    </div>`;

  return `
    <div class="card">
      <div class="card-title">📅 ${t.nume} — toate zilele</div>
      ${toate.map(item => {
        if (item._tip === 'milestone') {
          return `
            <div style="display:flex;gap:10px;align-items:center;padding:8px 10px;
              background:linear-gradient(135deg,#FFF8EC,#FFF3DC);border-radius:10px;
              border-left:3px solid var(--warning);margin-bottom:4px">
              <span style="font-size:18px;flex-shrink:0">${item.label.split(' ')[0]}</span>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:#7A5500">
                  ${item.label.split(' ').slice(1).join(' ')}
                </div>
                <div style="font-size:11px;color:var(--text-light)">${formatDate(item.data)} · ${item.detalii}</div>
              </div>
            </div>
          `;
        }
        const e = item;
        const simStr = e.totulOk ? '✅ Totul OK' :
          e.simptome?.length ? e.simptome.map(s => {
            const info = SIMPTOME.find(x => x.id === s.id);
            const sev  = SEVERITATE.find(x => x.id === s.severitate);
            return `${info?.label.split(' ')[0]} ${sev?.emoji || ''}`;
          }).join('  ') : '—';
        return `
          <div class="history-item" data-hist-data="${e.data}" style="cursor:pointer">
            <div class="history-date">
              <div style="font-size:11px;font-weight:600">${formatDate(e.data).slice(0,5)}</div>
              <div style="font-size:10px;color:var(--text-light)">${formatDate(e.data).slice(6)}</div>
            </div>
            <div class="history-icon">${e.sarit ? '⏭️' : (e.finalizat || e.picaturi > 0) ? '✅' : '📋'}</div>
            <div class="history-info">
              <div class="history-title">
                ${e.sarit ? 'Sărit' : (e.finalizat || e.picaturi > 0)
                  ? `${e.picaturi} pic. × ${e.unitati}u`
                  : 'Simptome înregistrate'}
              </div>
              <div class="history-sub">${simStr}</div>
            </div>
            <div style="color:var(--text-light);font-size:16px;padding:0 4px">›</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================
//  TAB: SETĂRI
// ============================================================

function renderSetari() {
  const t = tratamentActiv();
  const tema = temaCurenta();
  const teme = [
    { id:'menta',   nume:'Mentă',   desc:'Verde-teal, prietenos · pentru copil', c:['#4A9B8E','#5BA0C8','#F0F8F6'] },
    { id:'soare',   nume:'Soare',   desc:'Cald, portocaliu · jucăuș',            c:['#F26A4B','#FF8C61','#FFF6EF'] },
    { id:'salvie',  nume:'Salvie',  desc:'Verde calm, sobru · pentru părinte',   c:['#2F5D50','#7BA593','#F4F2E9'] },
    { id:'nocturn', nume:'Nocturn', desc:'Întunecat, mint · doza de seară',      c:['#161C2E','#5BE3C0','#232C46'] },
  ];
  return `
    <div class="card">
      <div class="card-title">🎨 Temă</div>
      <p class="hint" style="margin-bottom:12px">Alege cum arată aplicația. Se salvează pe telefon.</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${teme.map(tm => `
          <button class="tema-optiune" data-tema-set="${tm.id}"
            style="display:flex;align-items:center;gap:14px;padding:12px;cursor:pointer;
              border-radius:14px;background:${tema===tm.id?'var(--teal-light)':'var(--bg)'};
              border:2px solid ${tema===tm.id?'var(--teal)':'transparent'};text-align:left;width:100%">
            <span style="display:flex;border-radius:10px;overflow:hidden;flex-shrink:0;
              box-shadow:0 1px 4px rgba(0,0,0,0.12)">
              <span style="width:20px;height:40px;background:${tm.c[0]}"></span>
              <span style="width:20px;height:40px;background:${tm.c[1]}"></span>
              <span style="width:20px;height:40px;background:${tm.c[2]}"></span>
            </span>
            <span style="flex:1">
              <span style="display:block;font-weight:700;font-size:16px;color:var(--text)">${tm.nume}</span>
              <span style="display:block;font-size:12.5px;color:var(--text-light)">${tm.desc}</span>
            </span>
            ${tema===tm.id
              ? '<span style="width:24px;height:24px;border-radius:50%;background:var(--teal);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0">✓</span>'
              : '<span style="width:24px;height:24px;border-radius:50%;border:2px solid var(--border);flex-shrink:0"></span>'}
          </button>
        `).join('')}
      </div>
    </div>

    ${renderDonatii()}

    ${t ? `
      <!-- Protocol -->
      <div class="card">
        <div class="card-title">📋 Protocol complet — ${t.nume}</div>
        <div style="margin-bottom:12px">
          ${t.protocol.map((p, i) => {
            const desc = p.tipData === 'calendar'
              ? `${formatDate(p.dataStart)} → ${formatDate(p.dataEnd)}`
              : `${p.zile} ${p.zile === 1 ? 'zi' : 'zile'}`;
            return `
              <div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #EAF4F2">
                <span style="color:var(--text-light);font-size:13px;width:20px">${i+1}.</span>
                <span style="font-size:14px">${desc} × ${p.picaturi} pic. × ${p.unitati}u = <strong>${p.picaturi * p.unitati}u/zi</strong></span>
              </div>
            `;
          }).join('') || '<p style="color:var(--text-light);font-size:14px">Niciun protocol configurat.</p>'}
        </div>
        <button class="btn btn-outline" id="btn-edit-protocol">✏️ Modifică protocolul</button>
        <p class="hint important" style="margin-top:8px">Modificarea protocolului nu resetează istoricul sau stocurile.</p>
        <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 12px;margin-top:8px;font-size:12px;color:#7A5500;line-height:1.6">
          💡 Protocolul e complet, de la ziua 1. App-ul calculează automat în ce zi ești azi față de data de start.<br>
          Dacă tratamentul a început deja și nu vrei să introduci istoricul, poți introduce doar pașii de acum și să schimbi data de start pe ziua de azi.
        </div>
      </div>

      <!-- Flux zilnic tratament -->
      <div class="card">
        <div class="card-title">🔄 Flux zilnic tratament</div>
        <p style="font-size:13px;color:var(--text-light);margin-bottom:12px;line-height:1.5">
          Personalizează pașii care apar zilnic, în ordinea în care se fac.
          Poți schimba antihistaminicul, adăuga pași înainte sau după Staloral,
          sau seta expirare automată (ex: un pas pentru o anumită fază).
        </p>

        ${(() => {
          const anti = t.antihistaminic;
          const extras = t.pasiExtra || [];
          const extrasActivi = extras.filter(p => p.activ !== false);
          const extrasInactivi = extras.filter(p => p.activ === false);

          const etiPoz = p => p.pozitie === 'inainte' ? 'înainte de Staloral' : 'după tratament';
          const etiExp = p => {
            if (!p.expirare || p.expirare.tip === 'niciodata') return '';
            if (p.expirare.tip === 'dupa_uses') return ` · exp. după ${p.expirare.valoare} folosiri (${p.usesCount || 0}/${p.expirare.valoare})`;
            if (p.expirare.tip === 'dupa_data') return ` · exp. ${formatDate(p.expirare.valoare)}`;
            return '';
          };

          const rowItem = (icon, label, sub, extra = '') => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
              background:var(--bg);border-radius:8px;margin-bottom:6px">
              <span style="font-size:20px;flex-shrink:0">${icon}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:14px;font-weight:600">${label}</div>
                <div style="font-size:12px;color:var(--text-light)">${sub}</div>
              </div>
              ${extra}
            </div>
          `;

          // Pași ÎNAINTE de Staloral
          const inainte = extrasActivi.filter(p => p.pozitie === 'inainte');
          const dupa = extrasActivi.filter(p => !p.pozitie || p.pozitie === 'dupa');

          return `
            <!-- Antihistaminic -->
            ${anti.activ ? rowItem(
              anti.tip === 'pastile' ? '💊' : '💧',
              `Antihistaminic ${anti.nume}`,
              `${anti.minute} min ${anti.pozitie === 'inainte' ? 'înainte de' : 'după'} Staloral · stoc: ${anti.stoc}`,
              `<button class="btn btn-outline btn-small" id="btn-edit-anti" style="width:auto;padding:6px 10px;font-size:12px">✏️</button>`
            ) : `
              <div style="text-align:center;padding:8px;margin-bottom:6px">
                <button class="btn btn-outline btn-small" id="btn-edit-anti"
                  style="width:auto;padding:8px 16px;font-size:13px;color:var(--teal-dark)">
                  + Adaugă antihistaminic
                </button>
              </div>
            `}

            <!-- Pași personalizați ÎNAINTE -->
            ${inainte.map((p, i) => rowItem(
              p.label.split(' ')[0],
              p.label.split(' ').slice(1).join(' ') || p.label,
              `${p.minute > 0 ? p.minute + ' min' : 'confirmare'} · ${etiPoz(p)}${etiExp(p)}`,
              `<button class="btn btn-outline btn-small" data-edit-extra="${extras.indexOf(p)}"
                style="width:auto;padding:6px 10px;font-size:12px">✏️</button>
               <button style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--danger);padding:4px"
                data-del-extra="${extras.indexOf(p)}">✕</button>`
            )).join('')}

            <!-- Staloral + asteptare (fixe) -->
            ${rowItem('💧', 'Staloral sub limbă', '2 min — fix, nu se poate modifica', '<span style="font-size:11px;color:var(--text-light);white-space:nowrap">fix</span>')}
            ${rowItem('⏳', 'Nu mânca / bea / dinți', '10 min — fix, nu se poate modifica', '<span style="font-size:11px;color:var(--text-light);white-space:nowrap">fix</span>')}

            <!-- Pași personalizați DUPĂ -->
            ${dupa.map((p, i) => rowItem(
              p.label.split(' ')[0],
              p.label.split(' ').slice(1).join(' ') || p.label,
              `${p.minute > 0 ? p.minute + ' min' : 'confirmare'} · ${etiPoz(p)}${etiExp(p)}`,
              `<button class="btn btn-outline btn-small" data-edit-extra="${extras.indexOf(p)}"
                style="width:auto;padding:6px 10px;font-size:12px">✏️</button>
               <button style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--danger);padding:4px"
                data-del-extra="${extras.indexOf(p)}">✕</button>`
            )).join('')}

            <!-- Pași inactivați (expirați) -->
            ${extrasInactivi.length > 0 ? `
              <div style="margin-top:8px;padding:8px 12px;background:#f5f5f5;border-radius:8px">
                <div style="font-size:12px;color:var(--text-light);font-weight:600;margin-bottom:4px">
                  Pași finalizați / expirați:
                </div>
                ${extrasInactivi.map((p, i) => `
                  <div style="font-size:13px;color:var(--text-light);padding:3px 0">
                    ✓ ${p.label}
                    <button style="background:none;border:none;font-size:12px;cursor:pointer;color:var(--danger)"
                      data-del-extra="${extras.indexOf(p)}">șterge</button>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          `;
        })()}

        <button class="btn btn-outline" id="btn-adauga-pas-extra" style="margin-top:4px">
          + Adaugă pas personalizat
        </button>
      </div>

      <!-- Email -->
      <div class="card">
        <div class="card-title">📧 Rapoarte zilnice pe email</div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;margin-bottom:12px">
          <div>
            <div style="font-weight:600;font-size:15px">Trimite raport zilnic</div>
            <div style="font-size:12px;color:var(--text-light)">După fiecare tratament finalizat</div>
          </div>
          <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer">
            <input type="checkbox" id="toggle-email" ${t.emailActiv ? 'checked' : ''}
              style="opacity:0;width:0;height:0;position:absolute">
            <span id="toggle-email-track" style="position:absolute;inset:0;background:${t.emailActiv ? 'var(--teal)' : '#CCC'};
              border-radius:13px;transition:0.2s"></span>
            <span style="position:absolute;left:${t.emailActiv ? '24px' : '2px'};top:2px;width:22px;height:22px;
              background:white;border-radius:50%;transition:0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)"
              id="toggle-email-thumb"></span>
          </label>
        </div>
        <div class="form-group">
          <label>Adresă de email</label>
          <input type="email" id="set-email" value="${t.email || ''}" placeholder="parinte@email.com">
        </div>
        <button class="btn btn-outline" id="btn-salveaza-email">Salvează</button>
      </div>

      <!-- EmailJS configurare -->
      <div class="card">
        <div class="card-title">⚙️ Configurare EmailJS</div>
        ${(t.emailjs?.serviceId && !S.ejsExpanded) ? (() => {
          const ejs = t.emailjs;
          const ok = field => ejs[field] ? '✅' : '❌';
          const complet = ejs.serviceId && ejs.templateId && ejs.publicKey;
          return `
          <div style="background:${complet ? '#EDF7F0' : '#FFF8EC'};border:1px solid ${complet ? '#B2DFC0' : '#FFD060'};
            border-radius:10px;padding:12px 14px;margin-bottom:10px">
            <div style="font-size:13px;font-weight:700;color:${complet ? 'var(--success)' : '#7A5500'};margin-bottom:8px">
              ${complet ? '✅ EmailJS complet configurat' : '⚠️ Configurare incompletă'}
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--text-light)">
              <div>${ok('serviceId')} Service ID: <strong style="color:#333">${ejs.serviceId || '—'}</strong></div>
              <div>${ok('templateId')} Template ID: <strong style="color:#333">${ejs.templateId || '—'}</strong></div>
              <div>${ok('publicKey')} Public Key: <strong style="color:#333">${ejs.publicKey ? ejs.publicKey.slice(0,6) + '••••••' : '—'}</strong></div>
            </div>
          </div>
          <button class="btn btn-outline btn-small" id="btn-ejs-edit"
            style="width:auto;padding:6px 14px;font-size:12px">✏️ Modifică</button>
          `;
        })() : `
          <p style="font-size:13px;color:var(--text-light);margin-bottom:12px;line-height:1.5">
            Permite trimiterea unui raport zilnic pe email după fiecare tratament. Gratuit, fără server.<br><br>
            Dacă nu te descurci cu configurarea, găsești ghidul complet pas cu pas pe site-ul nostru:
            <a href="https://miauapp.ro/ghid-emailjs" target="_blank" style="color:var(--teal-dark);font-weight:600">miauapp.ro/ghid-emailjs</a>
          </p>
          <div class="form-group">
            <label>Service ID</label>
            <input type="text" id="ejs-service" value="${t.emailjs?.serviceId || ''}" placeholder="service_xxxxxxx">
          </div>
          <div class="form-group">
            <label>Template ID</label>
            <input type="text" id="ejs-template" value="${t.emailjs?.templateId || ''}" placeholder="template_xxxxxxx">
          </div>
          <div class="form-group">
            <label>Public Key</label>
            <input type="text" id="ejs-pubkey" value="${t.emailjs?.publicKey || ''}" placeholder="xxxxxxxxxxxxxx">
          </div>
          <div class="btn-row">
            ${S.ejsExpanded ? `<button class="btn btn-outline" id="btn-ejs-cancel">Anulează</button>` : ''}
            <button class="btn btn-outline" id="btn-salveaza-emailjs">Salvează</button>
          </div>
        `}
      </div>
    ` : ''}

    <!-- Tratamente / Copii -->
    <div class="card">
      <div class="card-title">🐾 Copii / Tratamente</div>
      ${S.data.tratamente.map(tr => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #EAF4F2">
          <div>
            <div style="font-weight:600">${tr.nume}</div>
            <div style="font-size:12px;color:var(--text-light)">Start: ${formatDate(tr.dataStart)}</div>
          </div>
          <div style="display:flex;gap:8px">
            ${tr.id === S.data.activId ? '<span class="badge badge-pink">Activ</span>' :
              `<button class="btn btn-outline btn-small" data-activare="${tr.id}">Activează</button>`}
          </div>
        </div>
      `).join('')}
      <div style="margin-top:12px">
        <button class="btn btn-primary" id="btn-tratament-nou">+ Copil / Tratament nou</button>
      </div>
    </div>

    <!-- Link Staloral custom -->
    ${t ? `
    <div class="card">
      <div class="card-title">🔗 Link căutare Staloral</div>
      <p style="font-size:13px;color:var(--text-light);margin-bottom:10px;line-height:1.5">
        Implicit, aplicația caută Staloral pisică pe Farmacia Tei. Dacă tratamentul este pentru alt alergen, poți introduce un link personalizat.
      </p>
      <label style="font-size:13px;color:var(--text-light);display:block;margin-bottom:4px">Link personalizat (lasă gol pentru default pisică)</label>
      <input type="url" id="input-link-staloral"
        placeholder="Lipește linkul aici..."
        value="${t.linkStaloral || ''}"
        style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;margin-bottom:10px">
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-small" id="btn-salveaza-link-staloral" style="width:auto;padding:8px 16px">Salvează</button>
        ${t.linkStaloral ? `<button class="btn btn-outline btn-small" id="btn-reseteaza-link-staloral" style="width:auto;padding:8px 16px;color:var(--text-light)">Resetează la default</button>` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Export / Import -->
    <div class="card">
      <div class="card-title">💾 Export / Import date</div>
      <div class="btn-row">
        <button class="btn btn-outline" id="btn-export">📤 Export JSON</button>
        <button class="btn btn-outline" id="btn-import">📥 Import JSON</button>
      </div>
      <p class="hint" style="margin-top:8px">Exportă toate datele ca fișier JSON — pentru backup sau transfer pe alt dispozitiv / al doilea părinte.</p>
      <input type="file" id="import-file" accept=".json" style="display:none">
    </div>

    <!-- Pericol -->
    <div class="card" style="border-left:4px solid var(--danger)">
      <div class="card-title" style="color:var(--danger)">⚠️ Resetare</div>
      <button class="btn btn-danger" id="btn-reset">Șterge toate datele</button>
      <p class="hint" style="margin-top:8px">Atenție: șterge tot — tratamente, istoric, stocuri. Ireversibil!</p>
    </div>
  `;
}

// ============================================================
//  ONBOARDING — Wizard multi-step
// ============================================================

function renderOnboarding() {
  const { step, d } = S.onb;
  const totalSteps = 6;
  const pct = Math.round((step / totalSteps) * 100);

  const titluriPasi = {
    1: 'Bine ai venit! 🐾',
    2: 'Tratamentul',
    3: 'Protocolul medical',
    4: 'Staloral — stoc inițial',
    5: 'Antihistaminic',
    6: 'Gata! 🎉'
  };

  return `
    <div class="onboarding">
      <div class="onboarding-header">
        <h2>${titluriPasi[step]}</h2>
        <div class="step-indicator">Pasul ${step} din ${totalSteps}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>

      <div class="onboarding-body" id="onb-body">
        ${renderOnboardingStep(step, d)}
      </div>

      <div class="onboarding-footer">
        <div class="btn-row">
          ${step > 1 ? `<button class="btn btn-outline" id="onb-back">← Înapoi</button>` : ''}
          <button class="btn btn-primary" id="onb-next">
            ${step === totalSteps ? '✅ Pornesc aplicația!' : 'Continuă →'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOnboardingStep(step, d) {
  switch (step) {
    case 1: return `
      <div class="welcome-paw">
        <span class="big-paw">🐾</span>
        <h2>Miau</h2>
        <p>Aplicația care te ajută să gestionezi imunoterapia sublinguală a copilului tău — timere, stocuri, simptome, totul într-un loc.</p>
      </div>
      <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 14px;
        margin-bottom:16px;font-size:12px;color:#7A5500;line-height:1.5">
        ⚠️ <strong>Notă importantă:</strong> Miau este un instrument de organizare, nu un dispozitiv medical.
        Urmează întotdeauna indicațiile medicului alergolog. În caz de reacție severă, contactează imediat medicul sau serviciul de urgență.
      </div>
      <div class="form-group">
        <label>Cum numim acest tratament?</label>
        <input type="text" id="onb-nume" value="${d.nume || ''}" placeholder="ex: Matei — pisică">
        <p class="hint">Poți adăuga mai târziu tratamente pentru alți alergeni sau pentru alți copii.</p>
      </div>
      <div class="form-group">
        <label>Data de start a tratamentului</label>
        <input type="date" id="onb-data" value="${d.dataStart || today()}">
        <p class="hint">Dacă tratamentul a început deja, pune data reală de start — aplicația va calcula automat ziua curentă.</p>
      </div>
    `;

    case 2: return `
      <div class="form-group">
        <label>Faza curentă</label>
        <div class="toggle-group">
          <button class="toggle-btn ${(!d.faza || d.faza === 'initiere') ? 'selected' : ''}" data-faza="initiere">
            🩷 Inițiere<br><small style="font-weight:400">Doze de 10u (flacon roz)</small>
          </button>
          <button class="toggle-btn ${d.faza === 'mentinere' ? 'selected blue' : ''}" data-faza="mentinere">
            💙 Menținere<br><small style="font-weight:400">Doze de 100u (flacon albastru)</small>
          </button>
        </div>
      </div>
      <div class="hint important">
        Inițiere = flaconul roz de 50 picături × 10 unități.<br>
        Menținere = flacoanele albastre de 50 picături × 100 unități.<br>
        Tranziția dintre ele o marchezi tu manual când doctorul decide.
      </div>
    `;

    case 3: return `
      <p style="font-size:14px;color:var(--text-light);margin-bottom:16px">
        ${d.faza === 'mentinere'
          ? 'Am pre-completat protocolul standard — ajustează dacă medicul a prescris altceva.'
          : 'Am pre-completat protocolul standard de inițiere — ajustează dacă medicul a prescris altceva.'}
      </p>
      <div id="protocol-rows">
        ${(() => {
          if (!d.protocol || d.protocol.length === 0) {
            d.protocol = d.faza === 'mentinere' ? defaultProtocolMentinere() : defaultProtocolInitiere();
          }
          return d.protocol.map((p, i) => renderProtocolRow(p, i)).join('');
        })()}
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        ${d.faza === 'mentinere' ? `
          <button class="btn btn-outline" id="btn-adauga-pas-100" style="flex:1;border-color:#5B9BD5;color:#3A7ABD">
            💙 Adaugă pas (100u — menținere)
          </button>
        ` : `
          <button class="btn btn-outline" id="btn-adauga-pas" style="flex:1">
            🩷 Adaugă pas (10u — inițiere)
          </button>
          <button class="btn btn-outline" id="btn-adauga-pas-100" style="flex:1;border-color:#5B9BD5;color:#3A7ABD">
            💙 Adaugă doze de 100
          </button>
        `}
      </div>
      <p class="hint" style="margin-top:12px">
        Pașii se aplică în ordine, ziuă cu ziuă, de la data de start.<br>
        ${d.faza !== 'mentinere' ? 'Adaugă mai întâi toți pașii de 10u (inițiere), apoi cei de 100u (menținere) — se continuă fără pauză.<br>' : ''}
        Poți modifica oricând mai târziu din Setări, fără să pierzi istoricul.
      </p>
      <div style="background:#FFF8EC;border:1px solid #FFD060;border-radius:10px;padding:10px 12px;margin-top:8px;font-size:12px;color:#7A5500;line-height:1.6">
        💡 <strong>Tratamentul a început deja?</strong> Ai două variante:<br>
        • Introduci protocolul complet de la ziua 1 și setezi data de start corectă — app-ul se poziționează singur pe ziua de azi.<br>
        • Sau introduci doar pașii de acum înainte și setezi data de start pe ziua de azi — mai simplu, dar fără istoric anterior.
      </p>
    `;

    case 4: return `
      <div class="form-group">
        <label>Picături în flacon curent</label>
        <input type="number" id="onb-picaturi" value="${d.picaturiFlacon ?? 50}" min="1" max="50">
        <p class="hint">Un flacon nou are 50 de picături. Dacă ai început deja, pune câte au mai rămas.</p>
      </div>
      <div class="form-group">
        <label>Flacoane în rezervă (în afara celui curent)</label>
        <input type="number" id="onb-flacoane" value="${d.flacoaneRamase ?? 0}" min="0">
        <p class="hint">Setul de inițiere include 1 flacon roz + 2 flacoane albastre.</p>
      </div>
    `;

    case 5: return `
      <div class="form-group">
        <label>Copilul ia și un antihistaminic?</label>
        <div class="toggle-group">
          <button class="toggle-btn ${d.antiActiv !== false ? 'selected' : ''}" data-anti="da">Da</button>
          <button class="toggle-btn ${d.antiActiv === false ? 'selected' : ''}" data-anti="nu">Nu</button>
        </div>
      </div>
      ${d.antiActiv !== false ? `
        <div class="form-group">
          <label>Numele medicamentului</label>
          <input type="text" id="onb-anti-nume" value="${d.antiNume || ''}" placeholder="ex: Xyzal, Zyrtec">
        </div>
        <div class="form-group">
          <label>Tip</label>
          <div class="toggle-group">
            <button class="toggle-btn ${(!d.antiTip || d.antiTip === 'pastile') ? 'selected' : ''}" data-antitip="pastile">💊 Antihistaminic</button>
            <button class="toggle-btn ${d.antiTip === 'picaturi' ? 'selected' : ''}" data-antitip="picaturi">💧 Picături</button>
          </div>
        </div>
        <div class="form-group">
          <label>Stoc inițial</label>
          <input type="number" id="onb-anti-stoc" value="${d.antiStoc || 30}" min="1">
        </div>
        <div class="form-group">
          <label>Se administrează față de Staloral</label>
          <div class="toggle-group">
            <button class="toggle-btn ${(!d.antiPozitie || d.antiPozitie === 'inainte') ? 'selected' : ''}" data-antipoz="inainte">Înainte</button>
            <button class="toggle-btn ${d.antiPozitie === 'dupa' ? 'selected' : ''}" data-antipoz="dupa">După</button>
          </div>
          <p class="hint important" style="margin-top:6px">Recomandat: minim 20 de minute înainte de Staloral.</p>
        </div>
        <div class="form-group">
          <label>Interval față de Staloral (minute)</label>
          <input type="number" id="onb-anti-min" value="${d.antiMinute || 20}" min="5" max="120">
        </div>
      ` : ''}
    `;

    case 6: return `
      <div class="welcome-paw" style="padding-top:20px">
        <span class="big-paw">🎉</span>
        <h2 style="color:var(--success)">Totul e configurat!</h2>
        <p style="margin-top:12px">
          <strong>${d.nume || 'Tratamentul'}</strong> este gata.<br><br>
          Poți modifica oricând protocolul, pașii sau setările din tab-ul <strong>Setări ⚙️</strong>.<br><br>
          Dacă vrei să primești rapoarte zilnice pe email, configurează <strong>EmailJS</strong> din Setări — e gratuit și durează 10 minute.<br><br>
          Mult succes! 🐾
        </p>
      </div>
    `;
  }
}

function renderProtocolRow(p, i) {
  const isCalendar = p.tipData === 'calendar';
  const is100u = p.unitati === 100;
  return `
    <div class="protocol-row" data-idx="${i}" style="flex-wrap:wrap;gap:6px;${is100u ? 'border-left:3px solid #5B9BD5;padding-left:8px;background:#F0F6FC;' : ''}">${is100u ? '<span style="font-size:11px;color:#3A7ABD;font-weight:600;width:100%;margin-bottom:2px">💙 Menținere (100u)</span>' : ''}
      <!-- Toggle tip dată -->
      <div style="display:flex;gap:4px;width:100%">
        <button class="toggle-btn btn-small ${!isCalendar ? 'selected' : ''}"
          data-rowtip="zile" data-rowidx="${i}" style="flex:1;padding:6px 4px;font-size:12px">🔢 Zile</button>
        <button class="toggle-btn btn-small ${isCalendar ? 'selected' : ''}"
          data-rowtip="calendar" data-rowidx="${i}" style="flex:1;padding:6px 4px;font-size:12px">📅 Date</button>
      </div>

      ${!isCalendar ? `
        <!-- Zile -->
        <input type="number" class="pr-zile" value="${p.zile || 1}" min="1" placeholder="zile" style="width:60px;text-align:center">
        <span class="sep">zile</span>
      ` : `
        <!-- Date calendaristice -->
        <div style="display:flex;gap:4px;align-items:center;width:100%">
          <input type="date" class="pr-data-start" value="${p.dataStart || today()}" style="flex:1;font-size:16px;padding:6px">
          <span class="sep">→</span>
          <input type="date" class="pr-data-end" value="${p.dataEnd || ''}" style="flex:1;font-size:16px;padding:6px">
        </div>
      `}

      <span class="sep">×</span>
      <input type="number" class="pr-pic" value="${p.picaturi || 1}" min="1" max="10" placeholder="pic." style="width:50px;text-align:center">
      <span class="sep">pic. ×</span>
      <select class="pr-u" style="width:70px;text-align:center;padding:4px 2px;border:1px solid var(--border);border-radius:6px;font-size:14px">
        <option value="10" ${(p.unitati || 10) === 10 ? 'selected' : ''}>10u</option>
        <option value="100" ${p.unitati === 100 ? 'selected' : ''}>100u</option>
      </select>
      <span class="sep">u</span>
      <button class="del-btn" data-del="${i}">✕</button>
    </div>
  `;
}

// ============================================================
//  EVENT HANDLERS — Onboarding
// ============================================================

function attachOnboardingEvents() {
  const next = document.getElementById('onb-next');
  const back = document.getElementById('onb-back');

  next?.addEventListener('click', onbNext);
  back?.addEventListener('click', () => {
    S.onb.step--;
    renderOnboardingStep_update();
  });

  attachOnboardingStepEvents();
}

function attachOnboardingStepEvents() {
  const { step, d } = S.onb;

  // Step 1
  document.getElementById('onb-nume')?.addEventListener('input', e => d.nume = e.target.value.trim());
  document.getElementById('onb-data')?.addEventListener('change', e => d.dataStart = e.target.value);

  // Step 2 — toggle faza
  document.querySelectorAll('[data-faza]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.faza = btn.dataset.faza;
      d.protocol = []; // resetează ca să primești defaulturile corecte la step 3
      document.querySelectorAll('[data-faza]').forEach(b => {
        b.classList.toggle('selected', b.dataset.faza === d.faza);
        b.classList.toggle('blue', b.dataset.faza === 'mentinere' && b.dataset.faza === d.faza);
      });
    });
  });

  // Step 3 — protocol
  document.getElementById('btn-adauga-pas')?.addEventListener('click', () => {
    if (!d.protocol) d.protocol = [];
    d.protocol.push({ id: uid(), zile: 1, picaturi: 1, unitati: 10, tipData: 'zile' });
    document.getElementById('protocol-rows').innerHTML =
      d.protocol.map((p, i) => renderProtocolRow(p, i)).join('');
    attachProtocolRowEvents('protocol-rows', d.protocol);
  });
  document.getElementById('btn-adauga-pas-100')?.addEventListener('click', () => {
    if (!d.protocol) d.protocol = [];
    defaultProtocolMentinere().forEach(p => d.protocol.push(p));
    d.faza = 'mentinere'; // comută vizual la menținere — dispar butoanele de 10u
    renderOnboardingStep_update();
  });
  if (!d.protocol) d.protocol = [];
  attachProtocolRowEvents('protocol-rows', d.protocol);

  // Step 4
  document.getElementById('onb-picaturi')?.addEventListener('change', e => d.picaturiFlacon = +e.target.value);
  document.getElementById('onb-flacoane')?.addEventListener('change', e => d.flacoaneRamase = +e.target.value);

  // Step 5 — anti toggles
  document.querySelectorAll('[data-anti]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.antiActiv = btn.dataset.anti === 'da';
      document.querySelectorAll('[data-anti]').forEach(b => b.classList.toggle('selected', b.dataset.anti === btn.dataset.anti));
      renderOnboardingStep_update();
    });
  });
  document.querySelectorAll('[data-antitip]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.antiTip = btn.dataset.antitip;
      document.querySelectorAll('[data-antitip]').forEach(b => b.classList.toggle('selected', b.dataset.antitip === d.antiTip));
    });
  });
  document.querySelectorAll('[data-antipoz]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.antiPozitie = btn.dataset.antipoz;
      document.querySelectorAll('[data-antipoz]').forEach(b => b.classList.toggle('selected', b.dataset.antipoz === d.antiPozitie));
    });
  });
  document.getElementById('onb-anti-nume')?.addEventListener('input', e => d.antiNume = e.target.value.trim());
  document.getElementById('onb-anti-stoc')?.addEventListener('change', e => d.antiStoc = +e.target.value);
  document.getElementById('onb-anti-min')?.addEventListener('change', e => d.antiMinute = +e.target.value);
}

function detecteazaPauzeProtocol(protocol) {
  const calendarare = protocol
    .filter(p => p.tipData === 'calendar' && p.dataStart && p.dataEnd)
    .sort((a, b) => a.dataStart.localeCompare(b.dataStart));
  for (let i = 1; i < calendarare.length; i++) {
    const prev = calendarare[i - 1];
    const curr = calendarare[i];
    const endPrev = new Date(prev.dataEnd);
    const startCurr = new Date(curr.dataStart);
    endPrev.setHours(0,0,0,0); startCurr.setHours(0,0,0,0);
    const diff = Math.floor((startCurr - endPrev) / 86400000);
    if (diff > 1) return diff - 1; // nr zile de pauză
  }
  return 0;
}

function attachProtocolRowEvents(containerId = 'protocol-rows', protocol = null) {
  const { d } = S.onb;
  const proto = protocol || d.protocol;
  if (!proto) return;

  document.querySelectorAll(`#${containerId} .protocol-row`).forEach((row, i) => {
    const p = proto[i];
    if (!p) return;

    // Toggle tip dată
    row.querySelectorAll('[data-rowtip]').forEach(btn => {
      btn.addEventListener('click', () => {
        p.tipData = btn.dataset.rowtip;
        if (p.tipData === 'calendar' && !p.dataStart) {
          p.dataStart = today();
          p.dataEnd = '';
          delete p.zile;
        } else if (p.tipData === 'zile') {
          p.zile = p.zile || 1;
          delete p.dataStart;
          delete p.dataEnd;
        }
        document.getElementById(containerId).innerHTML = proto.map((px, j) => renderProtocolRow(px, j)).join('');
        attachProtocolRowEvents(containerId, proto);
      });
    });

    row.querySelector('.pr-zile')?.addEventListener('change', e => { p.zile = +e.target.value; });
    row.querySelector('.pr-data-start')?.addEventListener('change', e => { p.dataStart = e.target.value; });
    row.querySelector('.pr-data-end')?.addEventListener('change', e => { p.dataEnd = e.target.value; });

    row.querySelector('.pr-pic')?.addEventListener('change', e => {
      p.picaturi = +e.target.value;
      autoFill3Ani(p, proto, i, containerId);
    });
    row.querySelector('.pr-u')?.addEventListener('change', e => {
      p.unitati = +e.target.value;
      autoFill3Ani(p, proto, i, containerId);
    });

    row.querySelector('[data-del]')?.addEventListener('click', () => {
      proto.splice(i, 1);
      document.getElementById(containerId).innerHTML = proto.map((px, j) => renderProtocolRow(px, j)).join('');
      attachProtocolRowEvents(containerId, proto);
    });
  });
}

// Auto-completare 3 ani când e ultimul pas cu 3 pic × 100u (doza maximă de menținere)
function autoFill3Ani(pas, proto, idx, containerId) {
  if (pas.picaturi === 3 && pas.unitati === 100 && pas.tipData !== 'calendar') {
    if (!pas.zile || pas.zile < 100) {
      pas.zile = 1095; // 3 ani
      document.getElementById(containerId).innerHTML = proto.map((p, j) => renderProtocolRow(p, j)).join('');
      attachProtocolRowEvents(containerId, proto);
      toast('3 pic × 100u → 3 ani completați automat 🎉');
    }
  }
}

function renderOnboardingStep_update() {
  const app = document.getElementById('app');
  app.innerHTML = renderOnboarding();
  attachOnboardingEvents();
}

function onbNext() {
  const { step, d } = S.onb;

  // Validări per pas
  if (step === 1) {
    const numeEl = document.getElementById('onb-nume');
    const dataEl = document.getElementById('onb-data');
    d.nume = numeEl?.value.trim() || d.nume;
    d.dataStart = dataEl?.value || d.dataStart;
    if (!d.nume) { toast('Introdu un nume pentru tratament!'); return; }
    if (!d.dataStart) { toast('Introdu data de start!'); return; }
  }

  if (step === 3) {
    if (!d.protocol) d.protocol = [];
    document.querySelectorAll('#protocol-rows .protocol-row').forEach((row, i) => {
      if (d.protocol[i]) {
        const p = d.protocol[i];
        if (p.tipData === 'calendar') {
          p.dataStart = row.querySelector('.pr-data-start')?.value || p.dataStart;
          p.dataEnd   = row.querySelector('.pr-data-end')?.value || p.dataEnd;
        } else {
          p.zile = +(row.querySelector('.pr-zile')?.value || 1);
        }
        p.picaturi = +(row.querySelector('.pr-pic')?.value || 1);
        p.unitati  = +(row.querySelector('.pr-u')?.value || 10);
      }
    });
  }

  if (step === 4) {
    d.picaturiFlacon = +(document.getElementById('onb-picaturi')?.value || 50);
    d.flacoaneRamase = +(document.getElementById('onb-flacoane')?.value || 0);
  }

  if (step === 5 && d.antiActiv !== false) {
    d.antiNume    = document.getElementById('onb-anti-nume')?.value.trim() || d.antiNume;
    d.antiStoc    = +(document.getElementById('onb-anti-stoc')?.value || 30);
    d.antiMinute  = +(document.getElementById('onb-anti-min')?.value || 20);
  }

  if (step === 6) {
    // Finalizare — crează tratament
    const t = defaultTratament();
    t.nume      = d.nume;
    t.dataStart = d.dataStart;
    t.protocol  = (d.protocol || []).map(p => ({ ...p, id: uid() }));
    t.email     = d.email || '';
    t.staloral = {
      flaconCurent: d.picaturiFlacon || 50,
      flacoaneRamase: d.flacoaneRamase || 0,
      alertaPicaturi: 5,
      alertaFlacoane: 1
    };
    t.antihistaminic = {
      activ: d.antiActiv !== false,
      nume: d.antiNume || '',
      tip: d.antiTip || 'pastile',
      stoc: d.antiStoc || 0,
      stocInitial: d.antiStoc || 0,
      pozitie: d.antiPozitie || 'inainte',
      minute: d.antiMinute || 20
    };
    if (S.data._backup) {
      S.data.tratamente = [...S.data._backup.tratamente, t];
      delete S.data._backup;
    } else {
      S.data.tratamente.push(t);
    }
    S.data.activId = t.id;
    saveData();
    S.tab = 'acasa';
    S.timerStepIdx = null;
    S.timerDone = false;
    render();
    return;
  }

  S.onb.step++;
  renderOnboardingStep_update();
}

// ============================================================
//  EVENT HANDLERS — Main app
// ============================================================

function pornestePas(idx) {
  const t = tratamentActiv();
  const pasi = buildPasi(t);
  const pas = pasi[idx];
  if (!pas) return;
  S.timerStepIdx = idx;
  S.timerDone = false;

  // Pas fără timer (minute = 0) → marcat imediat ca done, așteaptă confirmare
  if (!pas.minute) {
    S.timerDone = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    return;
  }

  const endTs = Date.now() + pas.minute * 60 * 1000;
  saveTimerState(endTs);
  document.getElementById('scroll-area').innerHTML = renderTab();
  attachTabEvents();
  startTimer('pas', pas.minute, () => {
    S.timerDone = true;
    saveTimerState(null);
    bip(880, 0.4); bip(1100, 0.4);
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
}

function attachListaIstorica() {
  // Click pe ziua din listă → editare simptome
  document.querySelectorAll('[data-hist-data]').forEach(row => {
    row.addEventListener('click', () => {
      showEditSimptomeZi(row.dataset.histData);
    });
  });
}

function showEditSimptomeZi(data) {
  const t = tratamentActiv();
  if (!t) return;
  const intrare = t.istoric.find(e => e.data === data);
  if (!intrare) return;

  let simSelectate = {};
  (intrare.simptome || []).forEach(s => { simSelectate[s.id] = s.severitate; });

  showOverlay(`
    <div class="modal">
      <div class="modal-title">
        Simptome — ${formatDate(data)}
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <button class="btn btn-success" id="modal-totul-ok" style="margin-bottom:12px">
        ✅ Totul OK — niciun simptom
      </button>
      <div class="divider" style="margin-bottom:12px"></div>

      <div id="modal-symptom-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        ${SIMPTOME.map(s => {
          const sel = intrare.simptome?.find(x => x.id === s.id);
          return `
            <div class="modal-sym-row" data-id="${s.id}"
              style="padding:10px 12px;border:2px solid ${sel ? 'var(--teal)' : '#DDF0ED'};
                border-radius:10px;background:${sel ? 'var(--teal-light)' : 'white'};cursor:pointer">
              <div style="display:flex;align-items:center;gap:10px;pointer-events:none">
                <span style="font-size:18px">${s.label.split(' ')[0]}</span>
                <span style="font-size:14px;flex:1">${s.label.split(' ').slice(1).join(' ')}</span>
                <span style="font-size:16px;color:${sel ? 'var(--teal)' : '#CCC'}">${sel ? '✓' : '○'}</span>
              </div>
              ${sel ? `
                <div class="severity-row" style="margin-top:8px" onclick="event.stopPropagation()">
                  ${SEVERITATE.map(sv => `
                    <button class="sev-btn ${sv.id} ${sel.severitate === sv.id ? 'sel' : ''}"
                      data-symptom="${s.id}" data-sev="${sv.id}">${sv.emoji} ${sv.label}</button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div id="modal-altele-wrap" style="display:${simSelectate['altele'] ? 'block' : 'none'};margin-bottom:12px">
        <input type="text" id="modal-altele-detalii" placeholder="Descrie pe scurt..."
          value="${intrare.simptome?.find(x => x.id === 'altele')?.detalii || ''}"
          onclick="event.stopPropagation()"
          style="width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px">
      </div>

      <button class="btn btn-primary" id="modal-salveaza">💾 Salvează</button>
      <button class="btn btn-danger" id="modal-sterge-zi" style="margin-top:8px">🗑️ Șterge intrarea acestei zile</button>
    </div>
  `);

  const updateAlteleWrap = () => {
    const wrap = document.getElementById('modal-altele-wrap');
    if (wrap) wrap.style.display = simSelectate['altele'] ? 'block' : 'none';
  };

  // Events în modal
  document.querySelectorAll('.modal-sym-row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.classList.contains('sev-btn')) return;
      const id = row.dataset.id;
      if (simSelectate[id]) {
        delete simSelectate[id];
        row.style.border = '2px solid #DDF0ED';
        row.style.background = 'white';
        row.querySelector('span:last-child').textContent = '○';
        row.querySelector('span:last-child').style.color = '#CCC';
        row.querySelectorAll('.severity-row').forEach(r => r.remove());
      } else {
        simSelectate[id] = 'usor';
        row.style.border = '2px solid var(--teal)';
        row.style.background = 'var(--teal-light)';
        const sevRow = document.createElement('div');
        sevRow.className = 'severity-row';
        sevRow.style.marginTop = '8px';
        sevRow.setAttribute('onclick', 'event.stopPropagation()');
        sevRow.innerHTML = SEVERITATE.map(sv => `
          <button class="sev-btn ${sv.id} ${simSelectate[id] === sv.id ? 'sel' : ''}"
            data-symptom="${id}" data-sev="${sv.id}">${sv.emoji} ${sv.label}</button>
        `).join('');
        row.appendChild(sevRow);
        sevRow.querySelectorAll('.sev-btn').forEach(sb => {
          sb.addEventListener('click', e => {
            e.stopPropagation();
            simSelectate[id] = sb.dataset.sev;
            sevRow.querySelectorAll('.sev-btn').forEach(b => b.classList.toggle('sel', b.dataset.sev === sb.dataset.sev));
          });
        });
      }
      updateAlteleWrap();
    });
  });

  document.getElementById('modal-totul-ok').addEventListener('click', () => {
    intrare.simptome = [];
    intrare.totulOk = true;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Totul OK salvat!');
  });

  document.getElementById('modal-salveaza').addEventListener('click', () => {
    const detaliiAltele = document.getElementById('modal-altele-detalii')?.value.trim() || '';
    intrare.simptome = Object.entries(simSelectate).map(([id, severitate]) => {
      const obj = { id, severitate };
      if (id === 'altele' && detaliiAltele) obj.detalii = detaliiAltele;
      return obj;
    });
    intrare.totulOk = false;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('📋 Simptome actualizate!');
  });

  document.getElementById('modal-sterge-zi').addEventListener('click', () => {
    const wasFinalizat = intrare.finalizat || intrare.picaturi > 0;
    const msg = wasFinalizat
      ? `Ștergi intrarea din ${formatDate(data)}?\n\nTratamentul era marcat ca finalizat — stocurile se vor reface automat (${intrare.picaturi} picături Staloral${t.antihistaminic.activ ? ' + 1 antihistaminic' : ''}).`
      : `Ștergi intrarea din ${formatDate(data)}?`;
    confirmDialog(msg, () => {
      // Reface stocurile dacă era finalizat
      if (wasFinalizat) {
        t.staloral.flaconCurent = Math.min(50, t.staloral.flaconCurent + (intrare.picaturi || 0));
        if (t.antihistaminic.activ && intrare.finalizat) {
          t.antihistaminic.stoc += 1;
        }
      }

      t.istoric = t.istoric.filter(e => e.data !== data);
      saveData();
      closeOverlay();
      if (data === today()) {
        stopAllTimers();
        S.timerStepIdx = null;
        S.timerDone = false;
      }
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(wasFinalizat ? '🗑️ Intrare ștearsă + stocuri refăcute.' : '🗑️ Intrare ștearsă.');
    }, { danger: true, textConfirma: 'Șterge' });
  });
}

function attachMainEvents() {
  // Selector tratament din header
  document.getElementById('sel-tratament')?.addEventListener('change', e => {
    S.data.activId = e.target.value;
    saveData();
    S.timerStepIdx = null;
    S.timerDone = false;
    stopAllTimers();
    S.tab = 'acasa';
    render();
  });

  // Bottom nav
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.tab = btn.dataset.tab;
      document.getElementById('scroll-area').innerHTML = renderTab();
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === S.tab));
      attachTabEvents();
    });
  });

  attachTabEvents();
}

function attachTabEvents() {
  switch (S.tab) {
    case 'acasa':    attachAcasaEvents(); break;
    case 'simptome': attachSimptomeEvents(); break;
    case 'istoric':  attachListaIstorica(); break;
    case 'stocuri':  attachStocuriEvents(); break;
    case 'setari':   attachSetariEvents(); break;
  }
}

// --- ACASĂ ---

function attachAcasaEvents() {
  // Restaurare timer dacă aplicația a fost închisă și redeschisă
  if (S._restoreEndTs) {
    const remaining = (S._restoreEndTs - Date.now()) / 60000;
    const endTs = S._restoreEndTs;
    delete S._restoreEndTs;
    startTimer('pas', remaining, () => {
      S.timerDone = true;
      saveTimerState(null);
      bip(880, 0.4); bip(1100, 0.4);
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
    });
    // Actualizează display-ul timerului
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatMMSS(endTs - Date.now());
  }

  // ── Banner instalare pe ecranul principal ──
  document.getElementById('btn-ascunde-banner-instalare')?.addEventListener('click', () => {
    S.data.bannerInstalareAscunsLa = 'pentru-totdeauna';
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });

  // ── Confirmare tranziție la flaconul albastru ──
  document.getElementById('btn-confirma-tranzitie')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    t.tranzitieFlacon = true;
    t.staloral.flaconCurent = 50;
    t.staloral.flacoaneRamase = Math.max(0, t.staloral.flacoaneRamase - 1);
    if (t.milestones == null) t.milestones = [];
    t.milestones.push({ data: today(), label: '💙 Tranziție la Menținere (100u)', detalii: 'Flacon albastru activat, stoc resetat la 50 picături' });
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('💙 Flacon albastru activat! Stoc resetat la 50 picături.');
  });

  // ── Start primul pas (idx = 0) ──
  document.getElementById('btn-start-pas')?.addEventListener('click', () => {
    pornestePas(0);
  });

  // ── Continuă acum (skip timer) ──
  document.getElementById('btn-skip-timer')?.addEventListener('click', () => {
    stopAllTimers();
    S.timerDone = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    bip(880, 0.3);
  });

  // ── Pasul următor ──
  document.getElementById('btn-pas-urmator')?.addEventListener('click', e => {
    pornestePas(+e.currentTarget.dataset.idx);
  });

  // Finalizează
  document.getElementById('btn-finalizeaza')?.addEventListener('click', () => {
    finalizazaTratament();
  });

  // Sărit
  document.getElementById('btn-sari')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    const anti = t.antihistaminic;

    if (anti.activ) {
      // Modal cu întrebare despre antihistaminic
      showOverlay(`
        <div class="modal">
          <div class="modal-title">
            Marchează ziua ca sărit
            <button class="close-btn" onclick="closeOverlay()">✕</button>
          </div>
          <p style="font-size:14px;color:var(--text-light);margin-bottom:20px;line-height:1.6">
            Staloral nu s-a administrat azi — stocul <strong>nu</strong> va scădea.<br>
            Dar ${anti.tip === 'pastile' ? 'pastila' : 'picăturile'} de <strong>${anti.nume || 'antihistaminic'}</strong>?
          </p>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" id="modal-sarit-cu-anti">
              💊 Da, a luat antihistaminicul — scade 1 din stoc
            </button>
            <button class="btn btn-outline" id="modal-sarit-fara-anti">
              ✕ Nu, nu a luat nimic
            </button>
            <button class="btn btn-outline" style="color:var(--text-light)" onclick="closeOverlay()">
              Anulează
            </button>
          </div>
        </div>
      `);

      const finalizeazaSarit = (scadeAnti) => {
        const pas = pasProtocolPentruZiua(t, ziuaTratamentului(t));
        if (scadeAnti) t.antihistaminic.stoc = Math.max(0, t.antihistaminic.stoc - 1);
        t.istoric.push({
          data: today(), ora: Date.now(), finalizat: false, sarit: true,
          antiScazut: scadeAnti,
          picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0,
          simptome: [], totulOk: false
        });
        saveData();
        closeOverlay();
        stopAllTimers();
        S.timerStepIdx = null;
        S.timerDone = false;
        document.getElementById('scroll-area').innerHTML = renderTab();
        attachTabEvents();
        toast(scadeAnti ? 'Sărit — antihistaminic scăzut din stoc.' : 'Ziua marcată ca sărit.');
      };

      document.getElementById('modal-sarit-cu-anti')?.addEventListener('click', () => finalizeazaSarit(true));
      document.getElementById('modal-sarit-fara-anti')?.addEventListener('click', () => finalizeazaSarit(false));

    } else {
      // Fără antihistaminic — modal de confirmare
      showOverlay(`
        <div class="modal">
          <div class="modal-title">
            Marchează ziua ca sărit
            <button class="close-btn" onclick="closeOverlay()">✕</button>
          </div>
          <p style="font-size:14px;color:var(--text-light);margin-bottom:20px;line-height:1.6">
            Ești sigur că tratamentul de azi nu s-a putut face?<br>
            Staloral <strong>nu</strong> va scădea din stoc.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-primary" id="modal-sarit-da">Da, marchează ca sărit</button>
            <button class="btn btn-outline" onclick="closeOverlay()">Nu, anulează</button>
          </div>
        </div>
      `);
      document.getElementById('modal-sarit-da')?.addEventListener('click', () => {
        const pas = pasProtocolPentruZiua(t, ziuaTratamentului(t));
        t.istoric.push({
          data: today(), ora: Date.now(), finalizat: false, sarit: true,
          picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0,
          simptome: [], totulOk: false
        });
        saveData();
        closeOverlay();
        stopAllTimers();
        S.timerStepIdx = null;
        S.timerDone = false;
        document.getElementById('scroll-area').innerHTML = renderTab();
        attachTabEvents();
        toast('Ziua marcată ca sărit.');
      });
    }
  });
}

function renderTimereInactive(t) {
  const pasi = buildPasi(t);
  const oraFin = t.istoric.find(e => e.data === today())?.ora;
  return `
    <div class="card" style="opacity:0.6">
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0 12px">
        <span style="font-size:26px">✅</span>
        <div>
          <div style="font-weight:700;font-size:15px">Tratament finalizat azi</div>
          <div style="font-size:12px;color:var(--text-light)">${oraFin ? formatTime(oraFin) : ''} · Reactivare la miezul nopții</div>
        </div>
      </div>
      <div class="steps-list">
        ${pasi.map((p, i) => `
          <div class="step-item" style="opacity:0.7">
            <div class="step-number done">✓</div>
            <div class="step-info">
              <div class="step-title">${p.label}</div>
              <div class="step-sub">${p.sub}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function buildPasi(t) {
  const anti = t.antihistaminic;
  // Doar pașii activi (activ !== false)
  const extras = (t.pasiExtra || []).filter(p => p.activ !== false);
  const pasi = [];

  // ① Pași înainte de Staloral
  if (anti.activ && anti.pozitie === 'inainte')
    pasi.push({ id: 'anti', minute: anti.minute,
      label: `💊 Antihistaminic ${anti.nume}`,
      sub: `Aștepți ${anti.minute} min înainte de Staloral` });
  extras.filter(p => p.pozitie === 'inainte').forEach((p, i) =>
    pasi.push({ id: `extra_pre_${i}`, minute: p.minute, label: p.label, sub: p.sub || '' }));

  // ② Staloral + așteptare (fixe)
  pasi.push({ id: 'staloral', minute: 2,
    label: '💧 Staloral sub limbă',
    sub: 'Ții 2 minute sub limbă fără să înghiți' });
  pasi.push({ id: 'asteptare', minute: 10,
    label: '⏳ Nu mânca / bea / Nu te spăla pe dinți',
    sub: '10 minute — nu mânca, nu bea, nu te spăla pe dinți' });

  // ③ Pași după așteptare
  if (anti.activ && anti.pozitie === 'dupa')
    pasi.push({ id: 'anti', minute: anti.minute,
      label: `💊 Antihistaminic ${anti.nume}`,
      sub: `Aștepți ${anti.minute} min după Staloral` });
  extras.filter(p => !p.pozitie || p.pozitie === 'dupa').forEach((p, i) =>
    pasi.push({ id: `extra_post_${i}`, minute: p.minute, label: p.label, sub: p.sub || '' }));

  return pasi;
}

function finalizazaTratament() {
  const t = tratamentActiv();
  const ziua = ziuaTratamentului(t);
  const pas = pasProtocolPentruZiua(t, ziua);

  // Scade stoc picături
  if (pas) {
    t.staloral.flaconCurent = Math.max(0, t.staloral.flaconCurent - pas.picaturi);
    if (t.antihistaminic.activ) {
      t.antihistaminic.stoc = Math.max(0, t.antihistaminic.stoc - 1);
    }
  }

  // Adaugă în istoric
  t.istoric.push({
    data: today(), ora: Date.now(), finalizat: true, sarit: false,
    picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0,
    simptome: [], totulOk: false
  });

  // Verifică dacă s-a schimbat faza de protocol (milestone)
  checkPhaseChange(t, ziua);

  // Incrementează usesCount și verifică expirare pași personalizați
  checkExpirPasiExtra(t);

  saveData();
  stopAllTimers(); // include releaseWakeLock
  S.timerStepIdx = null;
  S.timerDone = false;

  // Verifică alerte stoc
  checkAlertStoc(t);

  document.getElementById('scroll-area').innerHTML = renderTab();
  attachTabEvents();
  bip(660, 0.2); bip(880, 0.3); bip(1100, 0.5);
  toast('🎉 Tratamentul zilei, finalizat!');

  // Navighează la simptome
  setTimeout(() => {
    S.tab = 'simptome';
    document.getElementById('scroll-area').innerHTML = renderTab();
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === S.tab));
    attachTabEvents();
    toast('Completează simptomele de azi 📋');
  }, 1500);
}

function checkPhaseChange(t, ziuaCurenta) {
  if (ziuaCurenta < 2) return;
  const pasAzi  = pasProtocolPentruZiua(t, ziuaCurenta);
  const pasIeri = pasProtocolPentruZiua(t, ziuaCurenta - 1);
  if (!pasAzi || !pasIeri) return;
  if (pasAzi.picaturi === pasIeri.picaturi && pasAzi.unitati === pasIeri.unitati) return;
  if (!t.milestones) t.milestones = [];
  const dejazi = t.milestones.find(m => m.data === today() && m.label.startsWith('🔬'));
  if (!dejazi) {
    t.milestones.push({
      data: today(),
      label: `🔬 Fază nouă: ${pasAzi.picaturi} pic. × ${pasAzi.unitati}u`,
      detalii: `Anterior: ${pasIeri.picaturi} pic. × ${pasIeri.unitati}u`
    });
  }
}

function checkExpirPasiExtra(t) {
  (t.pasiExtra || []).forEach(p => {
    if (p.activ === false) return;
    p.usesCount = (p.usesCount || 0) + 1;
    let expirat = false;
    if (p.expirare?.tip === 'dupa_uses' && p.expirare.valoare > 0
        && p.usesCount >= p.expirare.valoare) expirat = true;
    if (p.expirare?.tip === 'dupa_data' && p.expirare.valoare
        && today() >= p.expirare.valoare) expirat = true;
    if (expirat) {
      p.activ = false;
      if (!t.milestones) t.milestones = [];
      const det = p.expirare.tip === 'dupa_uses'
        ? `Expirat după ${p.expirare.valoare} ${p.expirare.valoare === 1 ? 'folosire' : 'folosiri'}`
        : `Expirat la data: ${formatDate(p.expirare.valoare)}`;
      t.milestones.push({ data: today(), label: `⭐ Pas finalizat: ${p.label}`, detalii: det });
      setTimeout(() => toast(`✅ Pasul „${p.label}" s-a finalizat!`, 4000), 1800);
    }
  });
}

function showEditAntihistaminic(t) {
  const a = t.antihistaminic;
  let tmpTip = a.tip || 'pastile';
  let tmpPoz = a.pozitie || 'inainte';
  let tmpActiv = !!a.activ;

  showOverlay(`
    <div class="modal">
      <div class="modal-title">💊 Antihistaminic
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:10px 0;margin-bottom:4px">
        <div>
          <div style="font-weight:600">Activ — copilul ia antihistaminic</div>
          <div style="font-size:12px;color:var(--text-light)">Dezactivează dacă nu mai este prescris</div>
        </div>
        <label style="position:relative;display:inline-block;width:48px;height:26px;cursor:pointer">
          <input type="checkbox" id="anti-activ" ${a.activ ? 'checked' : ''}
            style="opacity:0;width:0;height:0;position:absolute">
          <span id="anti-activ-track" style="position:absolute;inset:0;background:${a.activ ? 'var(--teal)' : '#CCC'};
            border-radius:13px;transition:0.2s"></span>
          <span id="anti-activ-thumb" style="position:absolute;left:${a.activ ? '24px' : '2px'};top:2px;
            width:22px;height:22px;background:white;border-radius:50%;transition:0.2s;
            box-shadow:0 1px 3px rgba(0,0,0,0.2)"></span>
        </label>
      </div>

      <div class="form-group">
        <label>Denumire medicament</label>
        <input type="text" id="anti-nume" value="${a.nume || ''}" placeholder="ex: Xyzal, Zyrtec">
      </div>
      <div class="form-group">
        <label>Doză per administrare (opțional)</label>
        <input type="text" id="anti-doza" value="${a.doza || ''}" placeholder="ex: 5mg, 10ml, 2 picături">
        <p class="hint">Conform prescripției medicului. Apare în stocuri și rapoarte email.</p>
      </div>

      <div class="form-group">
        <label>Tip</label>
        <div class="toggle-group" id="anti-tip-group">
          <button class="toggle-btn ${tmpTip === 'pastile' ? 'selected' : ''}" data-antitip2="pastile">💊 Antihistaminic</button>
          <button class="toggle-btn ${tmpTip === 'picaturi' ? 'selected' : ''}" data-antitip2="picaturi">💧 Picături</button>
        </div>
      </div>

      <div class="form-group">
        <label>Față de Staloral</label>
        <div class="toggle-group" id="anti-poz-group">
          <button class="toggle-btn ${tmpPoz === 'inainte' ? 'selected' : ''}" data-antipoz2="inainte">Înainte (recomandat)</button>
          <button class="toggle-btn ${tmpPoz === 'dupa' ? 'selected' : ''}" data-antipoz2="dupa">După</button>
        </div>
      </div>

      <div class="form-group">
        <label>Interval față de Staloral (minute)</label>
        <input type="number" id="anti-minute" value="${a.minute || 20}" min="1" max="120">
        <p class="hint important">Recomandat: minim 20 de minute înainte de picături.</p>
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">Anulează</button>
        <button class="btn btn-primary" id="btn-save-anti">✅ Salvează</button>
      </div>
    </div>
  `);

  // Toggle activ
  document.getElementById('anti-activ').addEventListener('change', e => {
    tmpActiv = e.target.checked;
    document.getElementById('anti-activ-track').style.background = tmpActiv ? 'var(--teal)' : '#CCC';
    document.getElementById('anti-activ-thumb').style.left = tmpActiv ? '24px' : '2px';
  });
  // Tip toggle
  document.querySelectorAll('[data-antitip2]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpTip = btn.dataset.antitip2;
      document.querySelectorAll('[data-antitip2]').forEach(b => b.classList.toggle('selected', b.dataset.antitip2 === tmpTip));
    });
  });
  // Poziție toggle
  document.querySelectorAll('[data-antipoz2]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpPoz = btn.dataset.antipoz2;
      document.querySelectorAll('[data-antipoz2]').forEach(b => b.classList.toggle('selected', b.dataset.antipoz2 === tmpPoz));
    });
  });

  document.getElementById('btn-save-anti').addEventListener('click', () => {
    a.activ   = tmpActiv;
    a.tip     = tmpTip;
    a.pozitie = tmpPoz;
    a.nume    = document.getElementById('anti-nume').value.trim();
    a.doza    = document.getElementById('anti-doza').value.trim();
    a.minute  = +(document.getElementById('anti-minute').value) || 20;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Antihistaminic actualizat!');
  });
}

function showEditPasExtra(t, idx) {
  const p = t.pasiExtra[idx];
  if (!p) return;
  let tmpPoz = p.pozitie || 'dupa';
  let tmpExpTip = p.expirare?.tip || 'niciodata';

  showOverlay(`
    <div class="modal">
      <div class="modal-title">✏️ Editează pas
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <div class="form-group">
        <label>Descriere (cu emoji)</label>
        <input type="text" id="ep-label" value="${p.label}" style="font-size:16px">
      </div>
      <div class="form-group">
        <label>Durată (minute) — 0 = fără timer, doar confirmare</label>
        <input type="number" id="ep-min" value="${p.minute || 0}" min="0" max="120">
      </div>
      <div class="form-group">
        <label>Notă explicativă (opțional)</label>
        <input type="text" id="ep-sub" value="${p.sub || ''}" placeholder="ex: Poți bea apă sau suc">
      </div>

      <div class="form-group">
        <label>Poziție în flux</label>
        <div class="toggle-group" id="ep-poz-group">
          <button class="toggle-btn ${tmpPoz === 'inainte' ? 'selected' : ''}" data-ep-poz="inainte">Înainte de Staloral</button>
          <button class="toggle-btn ${tmpPoz === 'dupa' ? 'selected' : ''}" data-ep-poz="dupa">După tratament</button>
        </div>
      </div>

      <div class="form-group">
        <label>Expirare automată</label>
        <div style="display:flex;flex-direction:column;gap:6px" id="ep-exp-group">
          <button class="toggle-btn ${tmpExpTip === 'niciodata' ? 'selected' : ''}" data-ep-exp="niciodata" style="text-align:left">🔁 Niciodată — continuă mereu</button>
          <button class="toggle-btn ${tmpExpTip === 'dupa_uses' ? 'selected' : ''}" data-ep-exp="dupa_uses" style="text-align:left">🔢 După X folosiri</button>
          <button class="toggle-btn ${tmpExpTip === 'dupa_data' ? 'selected' : ''}" data-ep-exp="dupa_data" style="text-align:left">📅 Până la o dată</button>
        </div>
      </div>

      <div id="ep-exp-valoare" style="${tmpExpTip === 'niciodata' ? 'display:none' : ''}">
        ${tmpExpTip === 'dupa_uses' ? `
          <div class="form-group">
            <label>Număr de folosiri</label>
            <input type="number" id="ep-exp-num" value="${p.expirare?.valoare || 1}" min="1">
          </div>
        ` : tmpExpTip === 'dupa_data' ? `
          <div class="form-group">
            <label>Expiră la data</label>
            <input type="date" id="ep-exp-data" value="${p.expirare?.valoare || today()}">
          </div>
        ` : ''}
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">Anulează</button>
        <button class="btn btn-primary" id="btn-ep-save">✅ Salvează</button>
      </div>
    </div>
  `);

  // Poziție toggle
  document.querySelectorAll('[data-ep-poz]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpPoz = btn.dataset.epPoz;
      document.querySelectorAll('[data-ep-poz]').forEach(b => b.classList.toggle('selected', b.dataset.epPoz === tmpPoz));
    });
  });

  // Expirare toggle
  document.querySelectorAll('[data-ep-exp]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpExpTip = btn.dataset.epExp;
      document.querySelectorAll('[data-ep-exp]').forEach(b => b.classList.toggle('selected', b.dataset.epExp === tmpExpTip));
      const valEl = document.getElementById('ep-exp-valoare');
      valEl.style.display = tmpExpTip === 'niciodata' ? 'none' : '';
      valEl.innerHTML = tmpExpTip === 'dupa_uses'
        ? `<div class="form-group"><label>Număr de folosiri</label>
            <input type="number" id="ep-exp-num" value="${p.expirare?.valoare || 1}" min="1"></div>`
        : `<div class="form-group"><label>Expiră la data</label>
            <input type="date" id="ep-exp-data" value="${p.expirare?.valoare || today()}"></div>`;
    });
  });

  document.getElementById('btn-ep-save').addEventListener('click', () => {
    p.label   = document.getElementById('ep-label').value.trim() || p.label;
    p.minute  = +(document.getElementById('ep-min').value) || 0;
    p.sub     = document.getElementById('ep-sub').value.trim();
    p.pozitie = tmpPoz;
    p.expirare = { tip: tmpExpTip, valoare: null };
    if (tmpExpTip === 'dupa_uses')
      p.expirare.valoare = +(document.getElementById('ep-exp-num')?.value) || 1;
    if (tmpExpTip === 'dupa_data')
      p.expirare.valoare = document.getElementById('ep-exp-data')?.value || null;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Pas actualizat!');
  });
}

function showAdaugaPasExtra(t) {
  let tmpPoz = 'dupa';
  let tmpExpTip = 'niciodata';

  showOverlay(`
    <div class="modal">
      <div class="modal-title">➕ Pas nou
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>

      <div class="form-group">
        <label>Descriere (cu emoji)</label>
        <input type="text" id="np-label" placeholder="💧 Bea apă acum" style="font-size:16px">
      </div>
      <div class="form-group">
        <label>Durată (minute) — 0 = fără timer, doar confirmare</label>
        <input type="number" id="np-min" value="0" min="0" max="120">
      </div>
      <div class="form-group">
        <label>Notă explicativă (opțional)</label>
        <input type="text" id="np-sub" placeholder="ex: Poți bea apă sau suc">
      </div>

      <div class="form-group">
        <label>Poziție în flux</label>
        <div class="toggle-group" id="np-poz-group">
          <button class="toggle-btn" data-np-poz="inainte">Înainte de Staloral</button>
          <button class="toggle-btn selected" data-np-poz="dupa">După tratament</button>
        </div>
      </div>

      <div class="form-group">
        <label>Expirare automată</label>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="toggle-btn selected" data-np-exp="niciodata" style="text-align:left">🔁 Niciodată — continuă mereu</button>
          <button class="toggle-btn" data-np-exp="dupa_uses" style="text-align:left">🔢 După X folosiri (ex: 1 picătură = 10 zile)</button>
          <button class="toggle-btn" data-np-exp="dupa_data" style="text-align:left">📅 Până la o dată</button>
        </div>
      </div>
      <div id="np-exp-valoare" style="display:none"></div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">Anulează</button>
        <button class="btn btn-primary" id="btn-np-save">✅ Adaugă</button>
      </div>
    </div>
  `);

  document.querySelectorAll('[data-np-poz]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpPoz = btn.dataset.npPoz;
      document.querySelectorAll('[data-np-poz]').forEach(b => b.classList.toggle('selected', b.dataset.npPoz === tmpPoz));
    });
  });

  document.querySelectorAll('[data-np-exp]').forEach(btn => {
    btn.addEventListener('click', () => {
      tmpExpTip = btn.dataset.npExp;
      document.querySelectorAll('[data-np-exp]').forEach(b => b.classList.toggle('selected', b.dataset.npExp === tmpExpTip));
      const valEl = document.getElementById('np-exp-valoare');
      valEl.style.display = tmpExpTip === 'niciodata' ? 'none' : '';
      valEl.innerHTML = tmpExpTip === 'dupa_uses'
        ? `<div class="form-group"><label>Număr de folosiri</label>
            <input type="number" id="np-exp-num" value="10" min="1">
            <p class="hint">Ex: 10 = pasul apare 10 zile și dispare automat, lăsând o urmă în Istoric.</p></div>`
        : `<div class="form-group"><label>Expiră la data</label>
            <input type="date" id="np-exp-data" value="${today()}"></div>`;
    });
  });

  document.getElementById('btn-np-save').addEventListener('click', () => {
    const label = document.getElementById('np-label').value.trim();
    if (!label) { toast('Adaugă o descriere!'); return; }
    if (!t.pasiExtra) t.pasiExtra = [];
    const expirare = { tip: tmpExpTip, valoare: null };
    if (tmpExpTip === 'dupa_uses')
      expirare.valoare = +(document.getElementById('np-exp-num')?.value) || 1;
    if (tmpExpTip === 'dupa_data')
      expirare.valoare = document.getElementById('np-exp-data')?.value || null;
    t.pasiExtra.push({
      label,
      minute: +(document.getElementById('np-min').value) || 0,
      sub: document.getElementById('np-sub').value.trim(),
      pozitie: tmpPoz,
      expirare,
      usesCount: 0,
      activ: true
    });
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Pas adăugat!');
  });
}

function checkAlertStoc(t) {
  if (t.staloral.flaconCurent <= t.staloral.alertaPicaturi) {
    toast(`⚠️ Picături puține în flacon: ${t.staloral.flaconCurent} rămase!`, 5000);
  }
  if (t.staloral.flacoaneRamase <= t.staloral.alertaFlacoane) {
    toast(`⚠️ Flacoane puține în rezervă: ${t.staloral.flacoaneRamase}!`, 5000);
  }
  if (t.antihistaminic.activ) {
    const prag = Math.ceil(t.antihistaminic.stocInitial * 0.1);
    if (t.antihistaminic.stoc <= prag) {
      toast(`⚠️ ${t.antihistaminic.nume}: stoc scăzut (${t.antihistaminic.stoc} rămase)!`, 5000);
    }
  }
}

// --- SIMPTOME ---

function attachSimptomeEvents() {
  const t = tratamentActiv();
  if (!t) return;

  // Schimbare dată → re-randează cu noua dată
  document.getElementById('sim-data')?.addEventListener('change', e => {
    S.simptomeData = e.target.value || null;
    S.simptomeCurate = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });

  const dataSelectata = S.simptomeData || today();
  const intrareZi = t.istoric.find(e => e.data === dataSelectata);
  let simptomeSelectate = {};
  if (!S.simptomeCurate && intrareZi?.simptome) {
    intrareZi.simptome.forEach(s => { simptomeSelectate[s.id] = s.severitate; });
  }

  document.querySelectorAll('.symptom-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('sev-btn')) return;
      document.getElementById('hint-simptome-goale')?.style && (document.getElementById('hint-simptome-goale').style.display = 'none');
      const id = row.dataset.id;
      if (simptomeSelectate[id]) {
        delete simptomeSelectate[id];
        // Re-render rândul fără severitate
        row.style.border = '2px solid #E0EDEB';
        row.style.background = 'white';
        row.classList.remove('selected');
        row.querySelectorAll('.severity-row').forEach(r => r.remove());
        row.querySelector('span:nth-child(2), div > span:last-child') && (row.querySelector('div > span:last-child').style.fontWeight = '400');
      } else {
        simptomeSelectate[id] = 'usor';
        row.style.border = '2px solid var(--teal)';
        row.style.background = 'var(--teal-light)';
        row.classList.add('selected');
        // Adaugă severitate
        const sevRow = document.createElement('div');
        sevRow.className = 'severity-row';
        sevRow.style.marginTop = '10px';
        sevRow.innerHTML = SEVERITATE.map(sv => `
          <button class="sev-btn ${sv.id} ${simptomeSelectate[id] === sv.id ? 'sel' : ''}"
            data-symptom="${id}" data-sev="${sv.id}">${sv.emoji} ${sv.label}</button>
        `).join('');
        row.appendChild(sevRow);
        sevRow.querySelectorAll('.sev-btn').forEach(sb => {
          sb.addEventListener('click', e => {
            e.stopPropagation();
            simptomeSelectate[id] = sb.dataset.sev;
            sevRow.querySelectorAll('.sev-btn').forEach(b => b.classList.toggle('sel', b.dataset.sev === sb.dataset.sev));
          });
        });
        // Câmp text pentru "Altele"
        if (id === 'altele') {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'altele-detalii';
          inp.placeholder = 'Descrie pe scurt...';
          inp.style.cssText = 'margin-top:8px;width:100%;padding:8px 10px;border:1px solid #DDF0ED;border-radius:8px;font-size:13px;box-sizing:border-box';
          inp.addEventListener('click', e => e.stopPropagation());
          row.appendChild(inp);
        }
      }
    });
  });

  document.getElementById('btn-totul-ok')?.addEventListener('click', () => {
    salveazaSimptome(t, [], true, dataSelectata);
  });

  document.getElementById('btn-salveaza-simptome')?.addEventListener('click', () => {
    const detaliiAltele = document.querySelector('.altele-detalii')?.value.trim() || '';
    const sim = Object.entries(simptomeSelectate).map(([id, severitate]) => {
      const obj = { id, severitate };
      if (id === 'altele' && detaliiAltele) obj.detalii = detaliiAltele;
      return obj;
    });
    if (sim.length === 0) {
      const hint = document.getElementById('hint-simptome-goale');
      if (hint) {
        hint.style.display = 'block';
        hint.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    salveazaSimptome(t, sim, false, dataSelectata);
  });
}

function salveazaSimptome(t, simptome, totulOk, data) {
  const dataZi = data || today();
  const esteAzi = dataZi === today();
  const intrare = t.istoric.find(e => e.data === dataZi);

  // Scade stoc dacă e zi trecută și e bifat "tratament efectuat"
  const scadeStoc = !esteAzi && document.getElementById('chk-scade-stoc')?.checked;

  if (intrare) {
    intrare.simptome = simptome;
    intrare.totulOk  = totulOk;
    if (scadeStoc && !intrare.finalizat) {
      // Marchează ca finalizat și scade stoc
      const ziuaNr = Math.floor((new Date(dataZi) - new Date(t.dataStart)) / 86400000) + 1;
      const pas = pasProtocolPentruZiua(t, ziuaNr);
      if (pas) {
        intrare.finalizat = true;
        intrare.picaturi = pas.picaturi;
        intrare.unitati  = pas.unitati;
        t.staloral.flaconCurent = Math.max(0, t.staloral.flaconCurent - pas.picaturi);
        if (t.antihistaminic.activ) t.antihistaminic.stoc = Math.max(0, t.antihistaminic.stoc - 1);
      }
    }
  } else {
    const ziuaNr = Math.floor((new Date(dataZi) - new Date(t.dataStart)) / 86400000) + 1;
    const pas = scadeStoc ? pasProtocolPentruZiua(t, ziuaNr) : null;
    if (scadeStoc && pas) {
      t.staloral.flaconCurent = Math.max(0, t.staloral.flaconCurent - pas.picaturi);
      if (t.antihistaminic.activ) t.antihistaminic.stoc = Math.max(0, t.antihistaminic.stoc - 1);
    }
    t.istoric.push({
      data: dataZi, ora: Date.now(), finalizat: !!scadeStoc, sarit: false,
      picaturi: pas?.picaturi || 0, unitati: pas?.unitati || 0, simptome, totulOk
    });
  }

  // Sortează istoricul cronologic
  t.istoric.sort((a, b) => a.data.localeCompare(b.data));

  saveData();
  if (esteAzi) {
    S.simptomeCurate = true;
    S.simptomeData = null; // resetează la azi după salvare
  }
  document.getElementById('scroll-area').innerHTML = renderTab();
  S.simptomeCurate = false;
  attachTabEvents();

  const msg = scadeStoc
    ? `💾 Salvat + stoc scăzut pentru ${formatDate(dataZi)}!`
    : totulOk ? '✅ Totul OK salvat în Istoric!' : `💾 ${simptome.length} simptome salvate!`;
  toast(msg);
  if (esteAzi && t.emailActiv && t.email && t.emailjs?.serviceId) trimiteEmail(t);
}

// --- STOCURI ---

function attachStocuriEvents() {
  const t = tratamentActiv();
  if (!t) return;

  document.getElementById('btn-flacon-nou')?.addEventListener('click', () => {
    t.staloral.flaconCurent = 50;
    t.staloral.dataExpirare = ''; // resetează data expirare la flacon nou
    if (t.staloral.flacoaneRamase > 0) t.staloral.flacoaneRamase--;
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('🆕 Flacon nou deschis — 50 picături');
  });

  document.getElementById('btn-salveaza-expirare')?.addEventListener('click', () => {
    const val = document.getElementById('input-data-expirare')?.value || '';
    t.staloral.dataExpirare = val;
    saveData();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast(val ? `📅 Data expirare salvată: ${formatDate(val)}` : 'Data expirare ștearsă.');
  });

  document.getElementById('btn-corecteaza')?.addEventListener('click', () => {
    showOverlay(`
      <div class="modal">
        <div class="modal-title">Corectează stoc picături <button class="close-btn" onclick="closeOverlay()">✕</button></div>
        <div class="form-group">
          <label>Picături rămase în flacon</label>
          <input type="number" id="cor-pic" value="${t.staloral.flaconCurent}" min="0" max="50">
        </div>
        <div class="form-group">
          <label>Flacoane în rezervă</label>
          <input type="number" id="cor-fla" value="${t.staloral.flacoaneRamase}" min="0">
        </div>
        <button class="btn btn-primary" id="btn-cor-save">Salvează</button>
      </div>
    `);
    document.getElementById('btn-cor-save').addEventListener('click', () => {
      t.staloral.flaconCurent    = +(document.getElementById('cor-pic').value) || 0;
      t.staloral.flacoaneRamase  = +(document.getElementById('cor-fla').value) || 0;
      saveData();
      closeOverlay();
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast('Stoc corectat!');
    });
  });

  document.getElementById('btn-cutie-noua')?.addEventListener('click', () => {
    showOverlay(`
      <div class="modal">
        <div class="modal-title">Cutie / sticlă nouă <button class="close-btn" onclick="closeOverlay()">✕</button></div>
        <div class="form-group">
          <label>Câte ${t.antihistaminic.tip === 'pastile' ? 'pastile' : 'doze'} adaugi?</label>
          <input type="number" id="add-anti" value="${t.antihistaminic.stocInitial || 30}" min="1">
        </div>
        <button class="btn btn-primary" id="btn-add-anti-save">Adaugă la stoc</button>
      </div>
    `);
    document.getElementById('btn-add-anti-save').addEventListener('click', () => {
      const add = +(document.getElementById('add-anti').value) || 0;
      t.antihistaminic.stoc += add;
      t.antihistaminic.stocInitial = t.antihistaminic.stoc;
      saveData();
      closeOverlay();
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast(`+${add} adăugate la stoc!`);
    });
  });

  document.getElementById('btn-corecteaza-anti')?.addEventListener('click', () => {
    showOverlay(`
      <div class="modal">
        <div class="modal-title">Corectează ${t.antihistaminic.tip === 'pastile' ? 'pastile' : 'picături'} <button class="close-btn" onclick="closeOverlay()">✕</button></div>
        <div class="form-group">
          <label>${t.antihistaminic.tip === 'pastile' ? 'Pastile' : 'Doze'} rămase</label>
          <input type="number" id="cor-anti" value="${t.antihistaminic.stoc}" min="0">
        </div>
        <button class="btn btn-primary" id="btn-cor-anti-save">Salvează</button>
      </div>
    `);
    document.getElementById('btn-cor-anti-save').addEventListener('click', () => {
      t.antihistaminic.stoc = +(document.getElementById('cor-anti').value) || 0;
      saveData();
      closeOverlay();
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast('Stoc corectat!');
    });
  });

  document.getElementById('btn-alerte-edit')?.addEventListener('click', () => {
    S.alerteExpanded = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-alerte-cancel')?.addEventListener('click', () => {
    S.alerteExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-salveaza-alerte')?.addEventListener('click', () => {
    t.staloral.alertaPicaturi = +(document.getElementById('alert-picaturi').value) || 5;
    t.staloral.alertaFlacoane = +(document.getElementById('alert-flacoane').value) || 1;
    saveData();
    S.alerteExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Praguri salvate!');
  });
}

// --- SETĂRI ---

function attachSetariEvents() {
  // Antihistaminic — editare
  document.getElementById('btn-edit-anti')?.addEventListener('click', () => {
    const t = tratamentActiv(); if (!t) return;
    showEditAntihistaminic(t);
  });

  // Pași extra — editare
  document.querySelectorAll('[data-edit-extra]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = tratamentActiv(); if (!t) return;
      showEditPasExtra(t, +btn.dataset.editExtra);
    });
  });

  // Pași extra — ștergere
  document.querySelectorAll('[data-del-extra]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = tratamentActiv(); if (!t) return;
      const p = t.pasiExtra[+btn.dataset.delExtra];
      confirmDialog(`Ștergi pasul „${p?.label || ''}"? Acțiunea este ireversibilă.`, () => {
        t.pasiExtra.splice(+btn.dataset.delExtra, 1);
        saveData();
        document.getElementById('scroll-area').innerHTML = renderTab();
        attachTabEvents();
        toast('Pas șters.');
      }, { danger: true, textConfirma: 'Șterge' });
    });
  });

  // Pași extra — adăugare
  document.getElementById('btn-adauga-pas-extra')?.addEventListener('click', () => {
    const t = tratamentActiv(); if (!t) return;
    showAdaugaPasExtra(t);
  });

  // Toggle email on/off
  document.getElementById('toggle-email')?.addEventListener('change', e => {
    const t = tratamentActiv();
    if (!t) return;
    t.emailActiv = e.target.checked;
    const track = document.getElementById('toggle-email-track');
    const thumb = document.getElementById('toggle-email-thumb');
    if (track) track.style.background = t.emailActiv ? 'var(--teal)' : '#CCC';
    if (thumb) thumb.style.left = t.emailActiv ? '24px' : '2px';
    saveData();
    toast(t.emailActiv ? '📧 Email activat' : '🔕 Email dezactivat');
  });

  // Email adresă
  document.getElementById('btn-salveaza-email')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    const val = document.getElementById('set-email')?.value.trim() || '';
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      toast('⚠️ Adresa de email nu este validă!'); return;
    }
    t.email = val;
    saveData();
    toast('Email salvat!');
  });

  // EmailJS config
  document.getElementById('btn-ejs-edit')?.addEventListener('click', () => {
    S.ejsExpanded = true;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-ejs-cancel')?.addEventListener('click', () => {
    S.ejsExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
  });
  document.getElementById('btn-salveaza-emailjs')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    if (!t.emailjs) t.emailjs = {};
    t.emailjs.serviceId  = document.getElementById('ejs-service')?.value.trim() || '';
    t.emailjs.templateId = document.getElementById('ejs-template')?.value.trim() || '';
    t.emailjs.publicKey  = document.getElementById('ejs-pubkey')?.value.trim() || '';
    saveData();
    S.ejsExpanded = false;
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Configurare EmailJS salvată!');
  });

  // Activare tratament
  document.querySelectorAll('[data-activare]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.data.activId = btn.dataset.activare;
      saveData();
      S.timerStepIdx = null;
      S.timerDone = false;
      stopAllTimers();
      S.tab = 'acasa';
      render();
    });
  });

  // Tratament nou
  document.getElementById('btn-tratament-nou')?.addEventListener('click', () => {
    S.onb = { step: 1, d: {} };
    S.data.tratamente = S.data.tratamente; // keep existing
    // Temporar golim lista ca să apară onboarding
    const backup = S.data.tratamente;
    const backupId = S.data.activId;
    S.data._backup = { tratamente: backup, activId: backupId };
    S.data.tratamente = [];
    S.data.activId = null;
    render();
    // Patch onb finish pentru a adăuga, nu înlocui
    const origNext = onbNext;
  });

  // Temă
  document.querySelectorAll('[data-tema-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      aplicaTema(btn.dataset.temaSet);
      document.getElementById('scroll-area').innerHTML = renderTab();
      attachTabEvents();
      toast('🎨 Temă schimbată!');
    });
  });

  // Edit protocol
  document.getElementById('btn-edit-protocol')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    showEditProtocol(t);
  });

  // Buton ✏️ lângă linkul Staloral de pe Acasă
  document.getElementById('btn-edit-link-staloral')?.addEventListener('click', () => {
    S.tab = 'setari';
    document.getElementById('scroll-area').innerHTML = renderTab();
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === 'setari'));
    attachTabEvents();
    setTimeout(() => {
      document.getElementById('input-link-staloral')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('input-link-staloral')?.focus();
    }, 100);
  });

  // Link Staloral custom
  document.getElementById('btn-salveaza-link-staloral')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    const val = document.getElementById('input-link-staloral')?.value.trim() || '';
    t.linkStaloral = val;
    saveData();
    render();
    toast('Link Staloral salvat!');
  });
  document.getElementById('btn-reseteaza-link-staloral')?.addEventListener('click', () => {
    const t = tratamentActiv();
    if (!t) return;
    t.linkStaloral = '';
    saveData();
    render();
    toast('Link resetat la default (pisică).');
  });

  // Export
  document.getElementById('btn-export')?.addEventListener('click', showExportModal);

  // Import
  document.getElementById('btn-import')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });
  document.getElementById('import-file')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    // Fișier prea mare (>5MB) e suspect
    if (file.size > 5 * 1024 * 1024) {
      toast('❌ Fișier prea mare — nu pare un export Miau.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const eroare = valideazaImport(data);
        if (eroare) {
          toast(`❌ ${eroare}`);
          e.target.value = '';
          return;
        }
        confirmDialog(`Importă ${data.tratamente.length} tratament(e)? Datele existente vor fi înlocuite.`, () => {
          S.data = data;
          saveData();
          render();
          toast('✅ Date importate cu succes!');
        }, { danger: true, textConfirma: 'Importă' });
      } catch {
        toast('❌ Fișier invalid — nu este un JSON corect.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  // Reset
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    confirmDialog('Ești sigur? Toate datele vor fi șterse definitiv!', () => {
      confirmDialog('Ultima confirmare — chiar ștergi tot?', () => {
        localStorage.removeItem(STORAGE_KEY);
        S.data = defaultData();
        S.onb = { step: 1, d: {} };
        S.timerStepIdx = null;
        S.timerDone = false;
        stopAllTimers();
        render();
        toast('Toate datele au fost șterse.');
      }, { danger: true, textConfirma: 'Șterge tot' });
    }, { danger: true, textConfirma: 'Continuă' });
  });
}

function showEditProtocol(t) {
  let protocol = t.protocol.map(p => ({ ...p }));

  showOverlay(`
    <div class="modal">
      <div class="modal-title">
        ✏️ Modifică protocol
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>
      <p style="font-size:13px;color:var(--text-light);margin-bottom:16px">
        Modificarea se aplică zilelor viitoare. Istoricul și stocurile rămân neschimbate.
      </p>
      <div id="edit-protocol-rows">
        ${protocol.map((p, i) => renderProtocolRow(p, i)).join('')}
      </div>
      <button class="btn btn-outline" id="ep-add" style="margin-top:8px">+ Adaugă pas</button>
      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn-outline" onclick="closeOverlay()">Anulează</button>
        <button class="btn btn-primary" id="ep-save">Salvează</button>
      </div>
    </div>
  `);

  attachProtocolRowEvents('edit-protocol-rows', protocol);

  document.getElementById('ep-add').addEventListener('click', () => {
    protocol.push({ id: uid(), zile: 1, picaturi: 1, unitati: 100, tipData: 'zile' });
    document.getElementById('edit-protocol-rows').innerHTML = protocol.map((p, i) => renderProtocolRow(p, i)).join('');
    attachProtocolRowEvents('edit-protocol-rows', protocol);
  });

  document.getElementById('ep-save').addEventListener('click', () => {
    protocol.forEach((_, i) => {
      const row = document.querySelector(`[data-row-idx="${i}"]`);
      if (!row) return;
      if (protocol[i].tipData === 'calendar') {
        protocol[i].dataStart = row.querySelector('.pr-data-start')?.value || protocol[i].dataStart;
        protocol[i].dataEnd   = row.querySelector('.pr-data-end')?.value || protocol[i].dataEnd;
      } else {
        protocol[i].zile = +(row.querySelector('.pr-zile')?.value || 1);
      }
      protocol[i].picaturi = +(row.querySelector('.pr-pic')?.value || 1);
      protocol[i].unitati  = +(row.querySelector('.pr-u')?.value || 10);
    });
    const pauze = detecteazaPauzeProtocol(protocol);
    if (pauze > 0) {
      toast(`⚠️ Există o pauză de ${pauze} ${pauze === 1 ? 'zi' : 'zile'} între pași calendaristici. Protocolul trebuie să fie continuu!`, 5000);
      return;
    }
    t.protocol = protocol;
    saveData();
    closeOverlay();
    document.getElementById('scroll-area').innerHTML = renderTab();
    attachTabEvents();
    toast('✅ Protocol actualizat!');
  });
}

// ============================================================
//  EXPORT / IMPORT JSON
// ============================================================

function valideazaImport(data) {
  if (!data || typeof data !== 'object') return 'Fișierul nu conține date valide.';
  if (!Array.isArray(data.tratamente)) return 'Lipsesc tratamentele — nu pare un export Miau.';
  if (data.tratamente.length === 0) return 'Fișierul nu conține niciun tratament.';

  for (const t of data.tratamente) {
    if (typeof t !== 'object' || !t.id) return 'Structură invalidă — fișier corupt sau din altă sursă.';
    if (!Array.isArray(t.protocol)) return `Tratamentul "${t.nume || t.id}" are protocolul corupt.`;
    if (!Array.isArray(t.istoric)) return `Tratamentul "${t.nume || t.id}" are istoricul corupt.`;
    if (!t.staloral || typeof t.staloral !== 'object') return `Tratamentul "${t.nume || t.id}" are stocurile corupte.`;
  }

  return null; // totul ok
}

function exportJSON(filtruId = null) {
  let dataDeExportat;
  if (filtruId && filtruId !== 'toti') {
    const t = S.data.tratamente.find(x => x.id === filtruId);
    dataDeExportat = { ...S.data, tratamente: t ? [t] : [], activId: t?.id || null };
  } else {
    dataDeExportat = S.data;
  }
  const json = JSON.stringify(dataDeExportat, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  const numeFisier = filtruId && filtruId !== 'toti'
    ? `miau-backup-${S.data.tratamente.find(x => x.id === filtruId)?.nume?.replace(/\s/g,'-') || 'copil'}-${today()}.json`
    : `miau-backup-${today()}.json`;
  a.download = numeFisier;
  a.click();
  URL.revokeObjectURL(url);
  S.data.lastBackup = today();
  saveData();
  toast('📤 Export realizat!');
}

function showExportModal() {
  if (S.data.tratamente.length <= 1) { exportJSON(); return; }
  showOverlay(`
    <div class="modal">
      <div class="modal-title">
        📤 Export date
        <button class="close-btn" onclick="closeOverlay()">✕</button>
      </div>
      <p style="font-size:14px;color:var(--text-light);margin-bottom:16px">Exportă pentru cine?</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-primary" data-export-id="toti">📦 Toți (${S.data.tratamente.length} copii)</button>
        ${S.data.tratamente.map(t => `
          <button class="btn btn-outline" data-export-id="${t.id}">👤 ${t.nume}</button>
        `).join('')}
      </div>
    </div>
  `);
  document.querySelectorAll('[data-export-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeOverlay();
      exportJSON(btn.dataset.exportId);
    });
  });
}

// ============================================================
//  EMAIL (EmailJS)
// ============================================================

function trimiteEmail(t) {
  if (!t.emailjs?.serviceId || !t.emailjs?.templateId || !t.emailjs?.publicKey) return;

  try {
    emailjs.init(t.emailjs.publicKey);
    const intrareAzi = t.istoric.find(e => e.data === today());
    const simStr = intrareAzi?.totulOk ? 'Totul OK — fără simptome' :
      intrareAzi?.simptome?.map(s => {
        const info = SIMPTOME.find(x => x.id === s.id);
        return `${info?.label || s.id} (${s.severitate})`;
      }).join(', ') || 'Nicio informație';

    const params = {
      to_email:    t.email,
      copil:       t.nume,
      data:        formatDate(today()),
      ora:         formatTime(intrareAzi?.ora || Date.now()),
      picaturi:    intrareAzi?.picaturi || 0,
      unitati:     intrareAzi?.unitati || 0,
      simptome:    simStr,
      stoc_pic:    t.staloral.flaconCurent,
      stoc_fla:    t.staloral.flacoaneRamase,
      stoc_anti:   t.antihistaminic.activ ? t.antihistaminic.stoc : 'N/A'
    };

    emailjs.send(t.emailjs.serviceId, t.emailjs.templateId, params)
      .then(() => toast('📧 Raport trimis pe email!', 5000))
      .catch(() => toast('⚠️ Emailul nu s-a putut trimite. Verifică configurarea EmailJS din Setări.', 6000));
  } catch {}
}

function verificaReminderBackup() {
  if (!S.data?.tratamente?.length) return;
  const ultim = S.data.lastBackup;
  if (!ultim) {
    setTimeout(() => toast('💾 Nu ai făcut niciun backup încă. Setări → Export JSON, ca să nu pierzi datele.', 6000), 2000);
    return;
  }
  const zile = Math.floor((new Date(today()) - new Date(ultim)) / 86400000);
  if (zile >= 30) {
    setTimeout(() => toast(`💾 Au trecut ${zile} zile de la ultimul backup — exportă datele din Setări.`, 6000), 2000);
  }
}

// ============================================================
//  INIT
// ============================================================

function init() {
  aplicaTema(temaCurenta());
  loadData();
  restoreTimerState();

  // Dacă exista backup de tratamente (tratament nou din setări)
  if (S.data._backup) {
    const backup = S.data._backup;
    S.data.tratamente = [...backup.tratamente, ...S.data.tratamente];
    if (!S.data.activId) S.data.activId = backup.activId;
    delete S.data._backup;
    saveData();
  }

  render();
  verificaReminderBackup();

  // Dacă timer-ul era activ și app-ul s-a reîncărcat pe alt tab, întoarce-l pe Acasă
  if (S._restoreEndTs) {
    S.tab = 'acasa';
    document.getElementById('scroll-area').innerHTML = renderTab();
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === 'acasa'));
    attachTabEvents();
  }
}

// Pornire
document.addEventListener('DOMContentLoaded', init);
