/* FTX1005F/S interactive logic
   - Renders topic UI
   - Performs calculations using math.js
   - Shows step-by-step explanations for each calculator
   - Basic theme handling re-using the original index design
*/

/* ---------------------------
   Theme handling (simple)
   --------------------------- */
const themes = {
  'spiderman': {bg:['#0b172a','#d62828','#e63946'],text:'#ffffff',btn1:'#0ea5e9',btn2:'#ef4444',ghost:'#0b1220'},
  'bloodred': {bg:['#2a0000','#660000','#b30000'],text:'#ffeaea',btn1:'#7f1d1d',btn2:'#b91c1c',ghost:'#1a1a1a'},
  'red-blue': {bg:['#2b2d42','#ef233c','#3a86ff'],text:'#ffffff',btn1:'#ef233c',btn2:'#3a86ff',ghost:'#161a2b'},
  'purple-black': {bg:['#0f0b1d','#3b0d54','#12002b'],text:'#ffffff',btn1:'#7c3aed',btn2:'#a21caf',ghost:'#0b0b12'},
  'sapphire-steel': {bg:['#13293d','#006494','#247ba0'],text:'#ffffff',btn1:'#00a6fb',btn2:'#0582ca',ghost:'#0d1b2a'},
  'emerald-charcoal': {bg:['#004d40','#1c313a','#2e7d32'],text:'#ffffff',btn1:'#10b981',btn2:'#065f46',ghost:'#0b1f1a'},
  'digital-twilight': {bg:['#0f2027','#203a43','#2c5364'],text:'#ffffff',btn1:'#22d3ee',btn2:'#0ea5e9',ghost:'#0a151b'},
  'coral-aqua': {bg:['#ff6f61','#6bc5d2','#004d61'],text:'#ffffff',btn1:'#ff8fa3',btn2:'#00bcd4',ghost:'#0f2a2f'},
  'electric-citrus': {bg:['#ff9f1c','#ffbf69','#ff4040'],text:'#000000',btn1:'#ff7f50',btn2:'#ff4040',ghost:'#2b1a00'},
  'artisan-clay': {bg:['#b3541e','#d9a066','#8c4a2f'],text:'#ffffff',btn1:'#b3541e',btn2:'#8c4a2f',ghost:'#2a140a'},
  'forest-canopy': {bg:['#004b23','#006400','#228b22'],text:'#ffffff',btn1:'#16a34a',btn2:'#065f46',ghost:'#06220f'},
  'ocean-depth': {bg:['#011f4b','#03396c','#005b96'],text:'#ffffff',btn1:'#3b82f6',btn2:'#0ea5e9',ghost:'#041024'},
  'desert-sunset': {bg:['#ff7e5f','#feb47b','#ffcc70'],text:'#000000',btn1:'#f97316',btn2:'#fde68a',ghost:'#3a1d0b'},
  'monochrome-focus': {bg:['#111111','#333333','#555555'],text:'#ffffff',btn1:'#6b7280',btn2:'#9ca3af',ghost:'#141414'},
  'soft-nordic': {bg:['#a8dadc','#457b9d','#1d3557'],text:'#000000',btn1:'#1d3557',btn2:'#457b9d',ghost:'#0f2338'},
  'neutral-peach': {bg:['#ffe0b2','#f48fb1','#f06292'],text:'#000000',btn1:'#f48fb1',btn2:'#f06292',ghost:'#3d2b2b'},
  'retro-pop': {bg:['#ff00ff','#00ffff','#ffff00'],text:'#000000',btn1:'#ff00ff',btn2:'#00ffff',ghost:'#1a1020'},
  'cyberpunk-glow': {bg:['#0f0b1d','#ff0080','#7928ca'],text:'#ffffff',btn1:'#ff0080',btn2:'#7928ca',ghost:'#0a0713'},
  'plum-gold': {bg:['#4b006e','#b07bac','#ffd700'],text:'#ffffff',btn1:'#a855f7',btn2:'#f59e0b',ghost:'#1a0a26'},
  'pink-black': {
    bg: ['#1a0b0f','#ff1e56','#0d0d0d'],
    text: '#ffffff',
    btn1: '#ff4d6d',
    btn2: '#000000',
    ghost: '#1a0d12'
  },
  'pink-overall': {
    bg: ['#ffc1cc','#ff69b4','#ff1493'],
    text: '#000000',
    btn1: '#ff69b4',
    btn2: '#ff1493',
    ghost: '#fff0f5'
  },
  'pink-purple': {
    bg: ['#ff77e9','#b832ff','#7a0bc0'],
    text: '#ffffff',
    btn1: '#e879f9',
    btn2: '#9333ea',
    ghost: '#2b0b2e'
  },
  'pink-yellow': {
    bg: ['#ffe4e1','#ffb347','#ff69b4'],
    text: '#000000',
    btn1: '#ff69b4',
    btn2: '#ffd93d',
    ghost: '#402d00'
  },
  'pink-white': {
    bg: ['#ffffff','#ffe4f3','#ffb6c1'],
    text: '#000000',
    btn1: '#ff85a1',
    btn2: '#f472b6',
    ghost: '#fdf2f8'
  },
  'rose-gold': {
    bg: ['#fadadd','#e6c7c2','#f5b5a3'],
    text: '#000000',
    btn1: '#f59e9e',
    btn2: '#f4a261',
    ghost: '#5a3d31'
  },
  'neon-pink': {
    bg: ['#ff007f','#ff4da6','#33001a'],
    text: '#ffffff',
    btn1: '#ff0080',
    btn2: '#ff4da6',
    ghost: '#140010'
  },
  'blush-cherry': {
    bg: ['#ffdde1','#ee4c7c','#b30f53'],
    text: '#ffffff',
    btn1: '#ec4899',
    btn2: '#be123c',
    ghost: '#25010b'
  },
  'bubblegum': {
    bg: ['#ffb6c1','#ff85a1','#ff4d88'],
    text: '#000000',
    btn1: '#ff85a1',
    btn2: '#ff4d88',
    ghost: '#3d1a2b'
  },
  'flamingo': {
    bg: ['#ff6f91','#ff9671','#ffc75f'],
    text: '#000000',
    btn1: '#ff6f91',
    btn2: '#ff9671',
    ghost: '#40220f'
  }
};
const dropdown = document.getElementById('theme-dropdown');
const themeChip = document.getElementById('theme-chip');
dropdown.addEventListener('change', ()=> applyTheme(dropdown.value));
document.getElementById('reset-theme').addEventListener('click', ()=> applyTheme('bloodred'));
document.getElementById('print-btn').addEventListener('click', ()=> window.print());
function applyTheme(name){
  const t = themes[name] || themes['bloodred'];
  document.documentElement.style.setProperty('--bg1', t.bg[0]);
  document.documentElement.style.setProperty('--bg2', t.bg[1]);
  document.documentElement.style.setProperty('--bg3', t.bg[2]);
  document.documentElement.style.setProperty('--text', t.text);
  document.documentElement.style.setProperty('--btn1', t.btn1);
  document.documentElement.style.setProperty('--btn2', t.btn2);
  document.documentElement.style.setProperty('--ghost', t.ghost);
  themeChip.style.background = `linear-gradient(90deg, ${t.bg.join(',')})`;
}
applyTheme('bloodred');


/* ---------------------------
   Helpers
   --------------------------- */
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
function fmt(n,dec=6){ if(!isFinite(n)) return 'NaN'; if(Math.abs(n) < 1e-12) return '0'; if(Number.isInteger(n)) return n.toString(); return Number(n).toFixed(dec); }
function clamp01(v){ return Math.max(0, Math.min(1, v)); }

/* math helpers (financial) */
function PV(rate, n, pmt=0, fv=0, type=0){
  // rate decimal (e.g., 0.05), n periods, pmt periodic payment, fv future value, type 0=end,1=begin
  rate = Number(rate); n = Number(n); pmt = Number(pmt); fv = Number(fv); type = Number(type);
  if(n === 0) return -(fv + pmt);
  if(rate === 0) return -(fv + pmt * n);
  const pow = Math.pow(1+rate, n);
  const pv = -( fv + pmt * (1+rate*type) * ( (pow - 1) / rate ) ) / pow;
  return pv;
}
function FV(rate, n, pmt=0, pv=0, type=0){
  rate = Number(rate); n = Number(n); pmt = Number(pmt); pv = Number(pv); type = Number(type);
  if(rate === 0) return -(pv + pmt * n);
  const pow = Math.pow(1+rate, n);
  return -( pv * pow + pmt * (1+rate*type) * ( (pow - 1) / rate ) );
}
function NPV(rate, cashflows){ // cashflows: array of numbers, assumed t=0..n (t=0 usually 0 or initial outflow)
  rate = Number(rate);
  return cashflows.reduce((sum, cf, i) => sum + cf / Math.pow(1+rate, i), 0);
}
function IRR(cashflows, guess=0.1){
  // simple bisection + secant hybrid. Works for standard shapes. Returns null if fails.
  const f = (r) => cashflows.reduce((s,cf,i)=> s + cf / Math.pow(1+r, i), 0);
  let low = -0.9999, high = 10;
  let fLow = f(low), fHigh = f(high);
  for(let iter=0; iter<100; iter++){
    const mid = (low + high) / 2;
    const fMid = f(mid);
    if(Math.abs(fMid) < 1e-8) return mid;
    if(fLow * fMid <= 0){ high = mid; fHigh = fMid; } else { low = mid; fLow = fMid; }
  }
  // if failed return null
  return null;
}

/* ---------------------------
   Topic rendering & calculators
   --------------------------- */
const topicRoot = document.getElementById('topic-root');
const topicButtons = document.querySelectorAll('.topic-select');
topicButtons.forEach(b=>b.addEventListener('click', ()=> renderTopic(b.dataset.topic)));

/* Render router */
function renderTopic(topic){
  let html = '';
  switch(topic){
    case 'acc_eq': html = accEqHTML(); break;
    case 'sources_capcost': html = sourcesCostHTML(); break;
    case 'record_txn': html = recordTxnHTML(); break;
    case 'adj_fs': html = adjustmentsHTML(); break;
    case 'ratios': html = ratiosHTML(); break;
    case 'invest_risk': html = investRiskHTML(); break;
    case 'working_cap': html = workingCapHTML(); break;
    case 'cost_cv': html = cvpHTML(); break;
    case 'budgeting': html = budgetingHTML(); break;
    case 'tvm': html = tvmHTML(); break;
    case 'valuation': html = valuationHTML(); break;
    case 'capbud': html = capBudHTML(); break;
    case "formulae": html = formulaeHTML(); break;
    default: html = `<div><p>Topic not found</p></div>`;
  }
  topicRoot.innerHTML = '';
  topicRoot.appendChild(el(html));
  bindTopicEvents(topic);
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   1) Accounting Equation: A = E + L
   --------------------------- */
function accEqHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Accounting Equation — Assets = Equity + Liabilities</h2>
      <p class="mt-2 text-sm opacity-90">Enter any two values; leave the value to compute blank. Amounts are in R (Rand).</p>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div class="label">Assets (A) <span class="help">?</span></div>
        <input id="acc-A" class="input" placeholder="leave blank to compute" />
        <div class="label">Equity / Owner's capital (E) <span class="help">?</span></div>
        <input id="acc-E" class="input" placeholder="leave blank to compute" />
        <div class="label">Liabilities (L) <span class="help">?</span></div>
        <input id="acc-L" class="input" placeholder="leave blank to compute" />
      </div>
      <div class="mt-4 flex gap-2">
        <button id="acc-explain" class="btn btn-primary">Explain</button>
        <button id="acc-example" class="btn btn-ghost">Load example</button>
      </div>
      <div id="acc-output" class="mt-5 topic-card p-4 rounded-md steps" role="status"></div>
    </div>
  `;
}

// Format numbers consistently
function fmtAcc(n){
  return Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Compute the missing value
function explainAccEq(){
  const A = document.getElementById('acc-A').value.trim();
  const E = document.getElementById('acc-E').value.trim();
  const L = document.getElementById('acc-L').value.trim();
  const out = document.getElementById('acc-output');

  const blankCount = [A,E,L].filter(v => v === '').length;
  if(blankCount !== 1){
    out.innerHTML = `<p>Please leave exactly one field blank (the one you want to compute).</p>`;
    return;
  }

  const toNum = v => Number(String(v).replace(/[, ]+/g,'')) || 0;

  if(A === ''){
    const e = toNum(E), l = toNum(L);
    const a = e + l;
    out.innerHTML = `
      <p><strong>Given</strong>: Equity (E) = R${fmtAcc(e)}, Liabilities (L) = R${fmtAcc(l)}</p>
      <p>By definition: $A = E + L$</p>
      <p class="block">$A = ${fmtAcc(e)} + ${fmtAcc(l)} = ${fmtAcc(a)}$</p>
      <p><em>Answer:</em> Assets = R${fmtAcc(a)}</p>
    `;
  } else if(E === ''){
    const a = toNum(A), l = toNum(L);
    const e = a - l;
    out.innerHTML = `
      <p><strong>Given</strong>: Assets (A) = R${fmtAcc(a)}, Liabilities (L) = R${fmtAcc(l)}</p>
      <p>Rearrange: $E = A - L$</p>
      <p class="block">$E = ${fmtAcc(a)} - ${fmtAcc(l)} = ${fmtAcc(e)}$</p>
      <p><em>Answer:</em> Equity = R${fmtAcc(e)}</p>
    `;
  } else {
    const a = toNum(A), e = toNum(E);
    const l = a - e;
    out.innerHTML = `
      <p><strong>Given</strong>: Assets (A) = R${fmtAcc(a)}, Equity (E) = R${fmtAcc(e)}</p>
      <p>Rearrange: $L = A - E$</p>
      <p class="block">$L = ${fmtAcc(a)} - ${fmtAcc(e)} = ${fmtAcc(l)}</p>
      <p><em>Answer:</em> Liabilities = R${fmtAcc(l)}</p>
    `;
  }

  if(window.MathJax) MathJax.typesetPromise();
}

// Load example values
function loadAccExample(){
  document.getElementById('acc-A').value = '';
  document.getElementById('acc-E').value = '3000';
  document.getElementById('acc-L').value = '2000';
  explainAccEq();
}

// Bind events after rendering the topic
function bindAccEqEvents(){
  const explainBtn = document.getElementById('acc-explain');
  const exampleBtn = document.getElementById('acc-example');
  if(explainBtn) explainBtn.addEventListener('click', explainAccEq);
  if(exampleBtn) exampleBtn.addEventListener('click', loadAccExample);
}

// Integrate with your topic router
function bindTopicEvents(topic){
  if(topic === 'acc_eq'){
    bindAccEqEvents();
  }
  // Add bindings for other topics here...
}






/* ---------------------------
   Module 2: Sources & Cost of Capital (with Examples)
   --------------------------- */
function sourcesCostHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Sources of Finance & Cost of Capital</h2>
      <p class="mt-2 text-sm opacity-90">Work with Dividend Growth (Gordon), CAPM, and WACC — step by step with class symbols.</p>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <!-- Dividend Growth -->
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Dividend Growth Model (Gordon)</h3>
          <div class="mt-2 grid gap-2">
            <label class="label">Dividend just paid D₀ <input id="dgm-d0" class="input" placeholder="e.g. 0.50" /></label>
            <label class="label">Dividend next year D₁ (optional) <input id="dgm-d1" class="input" placeholder="or leave blank" /></label>
            <label class="label">Growth rate g <input id="dgm-g" class="input" placeholder="e.g. 0.08" /></label>
            <label class="label">Required return r <input id="dgm-r" class="input" placeholder="e.g. 0.20" /></label>
            <label class="label">Price today P₀ (optional) <input id="dgm-p0" class="input" placeholder="Enter to compute r" /></label>
            <div class="flex gap-2 mt-2">
              <button id="dgm-explain" class="btn btn-primary">Explain</button>
              <button id="dgm-example" class="btn btn-ghost">Example</button>
            </div>
            <div id="dgm-output" class="mt-2 steps"></div>
          </div>
        </div>

        <!-- CAPM -->
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">CAPM — Cost of Equity (K<sub>e</sub>)</h3>
          <div class="mt-2 grid gap-2">
            <label class="label">Risk-free rate R<sub>f</sub> <input id="capm-rf" class="input" placeholder="e.g. 0.06" /></label>
            <label class="label">Beta β <input id="capm-beta" class="input" placeholder="e.g. 1.1" /></label>
            <label class="label">Market return R<sub>m</sub> <input id="capm-rm" class="input" placeholder="e.g. 0.10" /></label>
            <div class="flex gap-2 mt-2">
              <button id="capm-explain" class="btn btn-primary">Explain</button>
              <button id="capm-example" class="btn btn-ghost">Example</button>
            </div>
            <div id="capm-output" class="mt-2 steps"></div>
          </div>
        </div>

        <!-- WACC -->
        <div class="glass p-3 rounded-md md:col-span-2">
          <h3 class="font-semibold">Weighted Average Cost of Capital (WACC)</h3>
          <p class="muted">Use Ke, Kp, Kd, and values of Equity (Vₑ), Preference shares (Vₚ), and Debt (Vd).</p>
          <div class="mt-2 grid gap-2 md:grid-cols-3">
            <label class="label">Vₑ <input id="wacc-ve" class="input" placeholder="e.g. 2000000" /></label>
            <label class="label">K<sub>e</sub> <input id="wacc-ke" class="input" placeholder="e.g. 0.20" /></label>
            <label class="label">Vₚ <input id="wacc-vp" class="input" placeholder="e.g. 500000" /></label>
            <label class="label">K<sub>p</sub> <input id="wacc-kp" class="input" placeholder="e.g. 0.14" /></label>
            <label class="label">Vd <input id="wacc-vd" class="input" placeholder="e.g. 300000" /></label>
            <label class="label">K<sub>d</sub> <input id="wacc-kd" class="input" placeholder="e.g. 0.15" /></label>
            <label class="label">Tax rate t <input id="wacc-t" class="input" placeholder="e.g. 0.30" /></label>
          </div>
          <div class="mt-2 flex gap-2">
            <button id="wacc-explain" class="btn btn-primary">Explain</button>
            <button id="wacc-example" class="btn btn-ghost">Example</button>
          </div>
          <div id="wacc-output" class="mt-2 steps"></div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------
   Helpers
---------------------------- */
function fmt(x){ return Number.parseFloat(x).toFixed(4); }

/* ---------------------------
   DGM Explain
---------------------------- */
function explainDGM(){
  const d0 = parseFloat(document.getElementById('dgm-d0').value || NaN);
  const d1val = document.getElementById('dgm-d1').value.trim();
  const g = parseFloat(document.getElementById('dgm-g').value || NaN);
  const r = parseFloat(document.getElementById('dgm-r').value || NaN);
  const p0val = document.getElementById('dgm-p0').value.trim();
  const out = document.getElementById('dgm-output');

  if(isNaN(g)){ out.innerHTML='<p>Enter growth rate g.</p>'; return; }

  let d1, p0, reqR;
  if(d1val!=='') d1=parseFloat(d1val);
  else if(!isNaN(d0)) d1 = d0*(1+g);

  if(p0val!=='' && !isNaN(d1)){
    p0 = parseFloat(p0val);
    reqR = d1/p0 + g;
    out.innerHTML = `
      <p><strong>Given</strong>: D₁ = R${fmt(d1)}, P₀ = R${fmt(p0)}, g = ${fmt(g)}</p>
      <p>Formula: $r = \\dfrac{D₁}{P₀} + g$</p>
      <p class="block">$r = \\dfrac{${fmt(d1)}}{${fmt(p0)}} + ${fmt(g)} = ${fmt(reqR)}$</p>
    `;
  } else if(!isNaN(d1) && !isNaN(r) && r>g){
    p0 = d1/(r-g);
    out.innerHTML = `
      <p><strong>Given</strong>: D₁ = R${fmt(d1)}, r = ${fmt(r)}, g = ${fmt(g)}</p>
      <p>Formula: $P₀ = \\dfrac{D₁}{r-g}$</p>
      <p class="block">$P₀ = \\dfrac{${fmt(d1)}}{${fmt(r)} - ${fmt(g)}} = R${fmt(p0)}</p>
    `;
  } else {
    out.innerHTML='<p>Enter D₀ (or D₁), growth g, and either r or P₀.</p>';
  }
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   CAPM Explain
---------------------------- */
function explainCAPM(){
  const rf = parseFloat(document.getElementById('capm-rf').value || NaN);
  const beta = parseFloat(document.getElementById('capm-beta').value || NaN);
  const rm = parseFloat(document.getElementById('capm-rm').value || NaN);
  const out = document.getElementById('capm-output');

  if(isNaN(rf) || isNaN(beta) || isNaN(rm)){ out.innerHTML='<p>Enter Rf, β and Rm.</p>'; return; }
  const ke = rf + beta*(rm-rf);
  out.innerHTML = `
    <p><strong>Given</strong>: Rf=${fmt(rf)}, β=${fmt(beta)}, Rm=${fmt(rm)}</p>
    <p>Formula: $K_e = R_f + \\beta (R_m - R_f)$</p>
    <p class="block">$K_e = ${fmt(rf)} + ${fmt(beta)}\\times(${fmt(rm)}-${fmt(rf)}) = ${fmt(ke)}$</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   WACC Explain
---------------------------- */
function explainWACC(){
  const Ve = parseFloat(document.getElementById('wacc-ve').value || 0);
  const Ke = parseFloat(document.getElementById('wacc-ke').value || NaN);
  const Vp = parseFloat(document.getElementById('wacc-vp').value || 0);
  const Kp = parseFloat(document.getElementById('wacc-kp').value || NaN);
  const Vd = parseFloat(document.getElementById('wacc-vd').value || 0);
  const Kd = parseFloat(document.getElementById('wacc-kd').value || NaN);
  const t = parseFloat(document.getElementById('wacc-t').value || 0);
  const out = document.getElementById('wacc-output');

  if(isNaN(Ke) || isNaN(Kp) || isNaN(Kd)){ out.innerHTML='<p>Enter Ke, Kp, Kd.</p>'; return; }
  const V = Ve+Vp+Vd;
  if(V===0){ out.innerHTML='<p>Provide non-zero Ve, Vp, or Vd.</p>'; return; }

  const kdAfter = Kd*(1-t);
  const wacc = (Ke*Ve + Kp*Vp + kdAfter*Vd)/V;

  out.innerHTML = `
    <p><strong>Inputs</strong>: Ve=${fmt(Ve)}, Ke=${fmt(Ke)}, Vp=${fmt(Vp)}, Kp=${fmt(Kp)}, Vd=${fmt(Vd)}, Kd=${fmt(Kd)}, t=${fmt(t)}</p>
    <p>Step 1: $K_d(1-t) = ${fmt(Kd)}(1-${fmt(t)}) = ${fmt(kdAfter)}$</p>
    <p>Step 2: $WACC = \\dfrac{K_e V_e + K_p V_p + K_d(1-t) V_d}{V_e+V_p+V_d}$</p>
    <p class="block">$= \\dfrac{${fmt(Ke)}\\times${fmt(Ve)} + ${fmt(Kp)}\\times${fmt(Vp)} + ${fmt(kdAfter)}\\times${fmt(Vd)}}{${fmt(V)}} = ${fmt(wacc)}$</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* Example fillers for Module 2 */
function fillDGMExample(){
  document.getElementById('dgm-d0').value = 2;
  document.getElementById('dgm-g').value = 0.05;
  document.getElementById('dgm-r').value = 0.12;
  document.getElementById('dgm-d1').value = '';
  document.getElementById('dgm-p0').value = '';
  explainDGM();
}

function fillCAPMExample(){
  document.getElementById('capm-rf').value = 0.06;
  document.getElementById('capm-beta').value = 1.2;
  document.getElementById('capm-rm').value = 0.10;
  explainCAPM();
}

function fillWACCExample(){
  document.getElementById('wacc-ve').value = 2000000;
  document.getElementById('wacc-ke').value = 0.15;
  document.getElementById('wacc-vp').value = 500000;
  document.getElementById('wacc-kp').value = 0.12;
  document.getElementById('wacc-vd').value = 300000;
  document.getElementById('wacc-kd').value = 0.10;
  document.getElementById('wacc-t').value = 0.30;
  explainWACC();
}

/* Event delegation for Module 2 */
document.addEventListener("click", e=>{
  if(e.target.id === "dgm-explain"){ e.preventDefault(); explainDGM(); }
  if(e.target.id === "dgm-example"){ e.preventDefault(); fillDGMExample(); }

  if(e.target.id === "capm-explain"){ e.preventDefault(); explainCAPM(); }
  if(e.target.id === "capm-example"){ e.preventDefault(); fillCAPMExample(); }

  if(e.target.id === "wacc-explain"){ e.preventDefault(); explainWACC(); }
  if(e.target.id === "wacc-example"){ e.preventDefault(); fillWACCExample(); }
});




/* ---------------------------
   3) Recording transactions — Journal -> Ledger -> Trial Balance
   Upgraded: Dropdowns, reset button, IS vs SOFP split
   --------------------------- */
function recordTxnHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Recording Financial Transactions — Journal & Trial Balance</h2>
      <p class="mt-2 text-sm opacity-90">Enter journal entries (date, debit, credit, amount). Use dropdowns to select common accounts (Income Statement or SOFP). Choose "Other" to type your own.</p>

      <div class="mt-3 grid gap-2 md:grid-cols-4">
        <input id="je-date" class="input" placeholder="Date (e.g. 2025-03-31)" />
        <select id="je-debit" class="input" style="color:black">${accountOptions()}</select>
        <input id="je-debit-other" class="input hidden" placeholder="If Debit=Other, type here" />
        <select id="je-credit" class="input" style="color:black">${accountOptions()}</select>
        <input id="je-credit-other" class="input hidden" placeholder="If Credit=Other, type here" />
        <input id="je-amt" class="input" placeholder="Amount" />
      </div>

      <div class="mt-2 flex gap-2 flex-wrap">
        <button id="je-add" class="btn btn-primary">Add Journal Entry</button>
        <button id="je-post" class="btn btn-ghost">Post to Ledger</button>
        <button id="je-trial" class="btn btn-link">Show Trial Balance</button>
        <button id="je-clear" class="btn btn-primary">Clear All</button>
        <button id="je-example" class="btn btn-primary">Load Example</button>
      </div>

      <div id="je-output" class="mt-4 topic-card p-4 rounded-md steps"></div>
      <p class="muted mt-2">Example: Debit "Cash" R1000, Credit "Sales Revenue" R1000 → increases cash (asset, SOFP) and revenue (Income Statement).</p>
    </div>
  `;
}


/* Account options for dropdowns */
function accountOptions(){
  const incomeDebit = [
    "Cost of Goods Sold","Salaries Expense","Rent Expense","Utilities Expense",
    "Depreciation Expense","Amortization Expense","Marketing Expense",
    "Repairs and Maintenance Expense","Interest Expense","Bad Debt Expense",
    "Insurance Expense","Office Supplies Expense","Travel Expense","Transport Expense",
    "Research and Development Expense","Impairment Loss","Loss on Sale of Asset","Dividend Expense"
  ];
  const incomeCredit = [
    "Sales Revenue","Service Revenue","Interest Revenue","Dividend Revenue","Rent Revenue",
    "Gain on Sale of Asset","Other Comprehensive Income"
  ];
  const sofpDebit = [
    "Cash","Accounts Receivable","Inventory","Prepaid Expenses","Property, Plant, and Equipment",
    "Accumulated Depreciation","Intangible Assets","Investments","Drawings"
  ];
  const sofpCredit = [
    "Accounts Payable","Salaries Payable","Rent Payable","Accrued Expenses","Unearned Revenue",
    "Notes Payable","Loans Payable","Bonds Payable","Share Capital","Retained Earnings",
    "Accumulated Other Comprehensive Income","Sales Returns and Allowances","Purchase Returns and Allowances"
  ];
  const all = [...incomeDebit, ...incomeCredit, ...sofpDebit, ...sofpCredit];
  let html = `<option value="">-- Select account --</option>`;
  all.forEach(acc => html += `<option value="${acc}">${acc}</option>`);
  html += `<option value="Other">Other (type manually)</option>`;
  return html;
}

/* Data stores */
let journalEntries = []; // {date, debit, credit, amount}
let ledger = {}; // account -> {debit, credit}

/* Event listeners for Other toggle */
document.addEventListener("change", e=>{
  if(e.target.id==="je-debit") {
    document.getElementById("je-debit-other").classList.toggle("hidden", e.target.value!=="Other");
  }
  if(e.target.id==="je-credit") {
    document.getElementById("je-credit-other").classList.toggle("hidden", e.target.value!=="Other");
  }
});

/* Add journal entry */
function addJournalEntry(){
  const date = document.getElementById('je-date').value || '(no date)';
  let debit = document.getElementById('je-debit').value;
  if(debit==="Other") debit = document.getElementById('je-debit-other').value.trim();
  let credit = document.getElementById('je-credit').value;
  if(credit==="Other") credit = document.getElementById('je-credit-other').value.trim();
  const amt = parseFloat(document.getElementById('je-amt').value || 0);
  const out = document.getElementById('je-output');
  if(!debit || !credit || !amt){ out.innerHTML = '<p>Please provide debit account, credit account, and amount.</p>'; return; }

  journalEntries.push({date, debit, credit, amount: amt});
  out.innerHTML = `<p>Added: ${date}: Debit ${debit} R${fmt(amt)} / Credit ${credit} R${fmt(amt)} (unposted)</p>`;
  renderJournalList();
}

/* Render Journal */
function renderJournalList(){
  const out = document.getElementById('je-output');
  if(journalEntries.length === 0){ out.innerHTML = '<p>No journal entries.</p>'; return; }
  let html = `<p><strong>Journal (unposted)</strong></p><table><thead><tr><th>Date</th><th>Debit</th><th>Credit</th><th>Amount</th></tr></thead><tbody>`;
  journalEntries.forEach(j => { html += `<tr><td>${j.date}</td><td>${j.debit}</td><td>${j.credit}</td><td>R${fmt(j.amount)}</td></tr>`; });
  html += `</tbody></table>`;
  out.innerHTML = html;
}

/* Post to Ledger */
function postToLedger(){
  ledger = {};
  journalEntries.forEach(j=>{
    if(!ledger[j.debit]) ledger[j.debit]={debit:0,credit:0};
    if(!ledger[j.credit]) ledger[j.credit]={debit:0,credit:0};
    ledger[j.debit].debit += j.amount;
    ledger[j.credit].credit += j.amount;
  });
  const out=document.getElementById('je-output');
  let html=`<p><strong>Ledger (posted)</strong></p><table><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>`;
  Object.keys(ledger).forEach(a=>{ html+=`<tr><td>${a}</td><td>R${fmt(ledger[a].debit)}</td><td>R${fmt(ledger[a].credit)}</td></tr>`; });
  html+=`</tbody></table><p class="muted">Click "Show Trial Balance" to see by section (Income Statement / SOFP).</p>`;
  out.innerHTML=html;
}

/* Trial Balance split */
function showTrialBalance(){
  const out=document.getElementById('je-output');
  if(!ledger||Object.keys(ledger).length===0){ out.innerHTML='<p>No ledger postings yet. Post entries first.</p>'; return; }

  let isRows="", sofpRows="", totalDeb=0,totalCred=0;
  Object.keys(ledger).forEach(a=>{
    const bal=ledger[a].debit - ledger[a].credit;
    let dr=0,cr=0; if(bal>=0){dr=bal; totalDeb+=bal;} else {cr=-bal; totalCred+=-bal;}
    const row=`<tr><td>${a}</td><td>R${fmt(dr)}</td><td>R${fmt(cr)}</td></tr>`;

    if(isAccount(a)) isRows+=row; else sofpRows+=row;
  });

  let html=`<h3>Trial Balance</h3>`;
  html+=`<p><strong>Income Statement Accounts</strong></p><table><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>${isRows}</tbody></table>`;
  html+=`<p><strong>SOFP Accounts</strong></p><table><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>${sofpRows}</tbody></table>`;
  html+=`<p class="block"><strong>Totals</strong> — Debits: R${fmt(totalDeb)} | Credits: R${fmt(totalCred)}</p>`;
  html+=`<p>${fmt(totalDeb)===fmt(totalCred)?'<strong>Trial balance is balanced.</strong>':'<strong>Trial balance does not balance.</strong>'}</p>`;
  out.innerHTML=html;
}

/* Helper: classify IS vs SOFP */
function isAccount(acc){
  const incomeList=["Cost of Goods Sold","Salaries Expense","Rent Expense","Utilities Expense","Depreciation Expense","Amortization Expense","Marketing Expense","Repairs and Maintenance Expense","Interest Expense","Bad Debt Expense","Insurance Expense","Office Supplies Expense","Travel Expense","Transport Expense","Research and Development Expense","Impairment Loss","Loss on Sale of Asset","Dividend Expense","Sales Revenue","Service Revenue","Interest Revenue","Dividend Revenue","Rent Revenue","Gain on Sale of Asset","Other Comprehensive Income"];
  return incomeList.includes(acc);
}

/* Clear all */
function clearAll(){
  journalEntries=[]; ledger={};
  document.getElementById('je-output').innerHTML='<p>All data cleared.</p>';
}
/* Example filler */
function fillJournalExample() {
  journalEntries = [
    // Statement of Financial Position accounts
    {date: 'June 1', debit: 'Motor vehicles', credit: 'Share Capital', amount: 60000},
    {date: 'June 1', debit: 'Equipment', credit: 'Share Capital', amount: 70000},
    {date: 'June 1', debit: 'Loan : Nedbank 15 % per annum', credit: 'Bank', amount: 150000},
    {date: 'June 1', debit: 'Inventory', credit: 'Bank', amount: 25000},
    {date: 'June 5', debit: 'Cost of sales expense', credit: 'Inventory', amount: 2100},
    {date: 'June 1', debit: 'Bank', credit: 'Inventory', amount: 2940},
    {date: 'June 12', debit: 'Stationery expense', credit: 'Bank', amount: 250},
    {date: 'June 30', debit: 'Interest expense', credit: 'Bank', amount: 1875},

    // Statement of Comprehensive Income accounts
    {date: 'June 1', debit: 'Sales income', credit: 'Debtors', amount: 4200},
    {date: 'June 1', debit: 'Cost of sales expense', credit: 'Inventory', amount: 2100},
    {date: 'June 4', debit: 'Bank', credit: 'Stationery expense', amount: 250},
    {date: 'June 30', debit: 'Interest expense', credit: 'Bank', amount: 1875},
  ];

  ledger = {};
  const out = document.getElementById('je-output');
  out.innerHTML = '<p>Example journal entries loaded.</p>';
  renderJournalList();
}

/* Event delegation */
document.addEventListener("click", e => {
  // Add journal entry
  if(e.target.id === "je-add") { e.preventDefault(); addJournalEntry(); }

  // Post to ledger
  if(e.target.id === "je-post") { e.preventDefault(); postToLedger(); }

  // Show trial balance
  if(e.target.id === "je-trial") { e.preventDefault(); showTrialBalance(); }

  // Clear all
  if(e.target.id === "je-clear") { e.preventDefault(); clearAll(); }

  // Example
  if(e.target.id === "je-example") { e.preventDefault(); fillJournalExample(); }
});
/* ---------------------------
   4) Adjustments & Financial Statements
   Integrated with Journal, Ledger, Trial Balance
   --------------------------- */

function adjustmentsHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Adjustments & Annual Financial Statements</h2>
      <p class="mt-2 text-sm opacity-90">
        Record year-end adjustments (accruals, prepayments, depreciation).
        Adjustments automatically post journal entries and update your Trial Balance.
      </p>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <!-- Accruals / Prepayments -->
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Accruals and Prepayments</h3>
          <label class="label mt-2">Accrued expense (unpaid, still owed)</label>
          <input id="adj-accrued" class="input" placeholder="R e.g. 500" />
          <label class="label mt-2">Prepaid expense (paid in advance)</label>
          <input id="adj-prepaid" class="input" placeholder="R e.g. 1000" />

          <div class="mt-2 flex gap-2">
            <button id="adj-explain" class="btn btn-primary">Post Adjustment</button>
            <button id="adj-example" class="btn btn-ghost">Show Example</button>
            <button id="adj-post-trial" class="btn btn-secondary">Update Trial Balance</button>
          </div>

          <div id="adj-output" class="mt-2 steps"></div>
        </div>

        <!-- Depreciation -->
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Depreciation (Straight-line)</h3>
          <label class="label mt-2">Cost of asset</label>
          <input id="dep-cost" class="input" placeholder="R e.g. 120000" />
          <label class="label">Residual value</label>
          <input id="dep-res" class="input" placeholder="R e.g. 10000" />
          <label class="label">Useful life (years)</label>
          <input id="dep-life" class="input" placeholder="e.g. 5" />

          <div class="mt-2 flex gap-2">
            <button id="dep-explain" class="btn btn-primary">Post Depreciation</button>
            <button id="dep-example" class="btn btn-ghost">Show Example</button>
            <button id="dep-post-trial" class="btn btn-secondary">Update Trial Balance</button>
          </div>

          <div id="dep-output" class="mt-2 steps"></div>
        </div>
      </div>

      <!-- Trial Balance Display -->
      <div class="mt-6 glass p-3 rounded-md">
        <h3 class="font-semibold">Trial Balance (Updated)</h3>
        <div id="trial-output">Post adjustments or depreciation to see updated trial balance here.</div>
      </div>
    </div>
  `;
}

/* ---------------------------
   Post adjustments
   --------------------------- */
function postAdjustment(){
  const accrued = parseFloat(document.getElementById('adj-accrued').value || 0);
  const prepaid = parseFloat(document.getElementById('adj-prepaid').value || 0);

  if(accrued === 0 && prepaid === 0){
    document.getElementById('adj-output').innerHTML = '<p>Enter at least one adjustment.</p>';
    return;
  }

  let explanation = '<h4>Adjustment Calculations</h4><ul>';

  if(accrued > 0){
    journalEntries.push({date: '31/12', debit: 'Salaries Expense', credit: 'Accrued Expenses', amount: accrued});
    explanation += `<li>Accrued Expense: Debit Salaries Expense R${fmt(accrued)}, Credit Accrued Expenses R${fmt(accrued)}</li>`;
  }
  if(prepaid > 0){
    journalEntries.push({date: '31/12', debit: 'Prepaid Expenses', credit: 'Bank', amount: prepaid});
    explanation += `<li>Prepaid Expense: Debit Prepaid Expenses R${fmt(prepaid)}, Credit Bank R${fmt(prepaid)}</li>`;
  }

  explanation += '</ul>';

  document.getElementById('adj-output').innerHTML = explanation;
  updateTrialBalanceDisplay();
}

/* ---------------------------
   Post depreciation
   --------------------------- */
function postDepreciation(){
  const cost = parseFloat(document.getElementById('dep-cost').value || 0);
  const res = parseFloat(document.getElementById('dep-res').value || 0);
  const life = parseFloat(document.getElementById('dep-life').value || 1);

  if(cost <= 0 || life <= 0){
    document.getElementById('dep-output').innerHTML = '<p>Enter valid asset cost and useful life.</p>';
    return;
  }

  const depreciation = (cost - res)/life;
  journalEntries.push({date: '31/12', debit: 'Depreciation Expense', credit: 'Accumulated Depreciation', amount: depreciation});

  document.getElementById('dep-output').innerHTML = `
    <h4>Depreciation Calculation (Straight-line)</h4>
    <p>Depreciation = (Cost - Residual Value) / Useful Life</p>
    <p>= (R${fmt(cost)} - R${fmt(res)}) / ${life} years</p>
    <p>= R${fmt(depreciation)}</p>
    <p>Journal entry: Debit Depreciation Expense R${fmt(depreciation)}, Credit Accumulated Depreciation R${fmt(depreciation)}</p>
  `;
  updateTrialBalanceDisplay();
}

/* ---------------------------
   Update Trial Balance Display (reuse Module 3 logic)
   --------------------------- */
function updateTrialBalanceDisplay(){
  postToLedger(); // reuse from Module 3
  const out=document.getElementById('trial-output');
  if(!ledger || Object.keys(ledger).length===0){ out.innerHTML='<p>No ledger postings yet.</p>'; return; }

  let isRows="", sofpRows="", totalDeb=0,totalCred=0;
  Object.keys(ledger).forEach(a=>{
    const bal=ledger[a].debit - ledger[a].credit;
    let dr=0,cr=0; if(bal>=0){dr=bal; totalDeb+=bal;} else {cr=-bal; totalCred+=-bal;}
    const row=`<tr><td>${a}</td><td>R${fmt(dr)}</td><td>R${fmt(cr)}</td></tr>`;
    if(isAccount(a)) isRows+=row; else sofpRows+=row;
  });

  let html=`<p><strong>Income Statement Accounts</strong></p><table class="table-auto w-full border"><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>${isRows}</tbody></table>`;
  html+=`<p><strong>SOFP Accounts</strong></p><table class="table-auto w-full border"><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>${sofpRows}</tbody></table>`;
  html+=`<p><strong>Totals</strong> — Debits: R${fmt(totalDeb)} | Credits: R${fmt(totalCred)}</p>`;
  html+=`<p>${fmt(totalDeb)===fmt(totalCred)?'<strong>Trial balance is balanced.</strong>':'<strong>Trial balance does not balance.</strong>'}</p>`;
  out.innerHTML=html;
}

/* ---------------------------
   Example filler
   --------------------------- */
function fillAdjustmentExample(){
  document.getElementById('adj-accrued').value = 1800;
  document.getElementById('adj-prepaid').value = 1000;
  document.getElementById('dep-cost').value = 236000;
  document.getElementById('dep-res').value = 0;
  document.getElementById('dep-life').value = 5;

  postAdjustment();
  postDepreciation();
}

/* ---------------------------
   Event delegation
   --------------------------- */
document.addEventListener("click", e => {
  if(e.target.id === "adj-explain"){ e.preventDefault(); postAdjustment(); }
  if(e.target.id === "dep-explain"){ e.preventDefault(); postDepreciation(); }
  if(e.target.id === "adj-example"){ e.preventDefault(); fillAdjustmentExample(); }
  if(e.target.id === "dep-example"){ e.preventDefault(); fillAdjustmentExample(); }
  if(e.target.id === "adj-post-trial"){ e.preventDefault(); updateTrialBalanceDisplay(); }
  if(e.target.id === "dep-post-trial"){ e.preventDefault(); updateTrialBalanceDisplay(); }
});


/* ---------------------------
   5) Financial Ratios — Working module
   Drop-in replacement for previous "ratios" code.
   Full behaviour:
   - ratiosHTML() returns module HTML (used by your router)
   - Dynamically renders inputs when the select appears or changes
   - Compute button calculates & explains
   - Example button fills inputs & computes
   - Robust parsing & formatting
   --------------------------- */

function ratiosHTML() {
  return `
    <div>
      <h2 class="text-2xl font-semibold">Financial Ratio Analysis</h2>
      <p class="mt-2 text-sm opacity-90">
        Select a ratio from the dropdown to calculate, see the formula, and get a worked example.
      </p>

      <label class="label mt-3">Choose Ratio:</label>
      <select id="ratio-select" class="input" style="color:black">
        <optgroup label="Solvency & Net Asset Value">
          <option value="solvency">Solvency Ratio</option>
          <option value="nav">Net Asset Value (NAV)</option>
        </optgroup>
        <optgroup label="Liquidity Ratios">
          <option value="current">Current Ratio</option>
          <option value="quick">Quick Ratio (Acid Test)</option>
        </optgroup>
        <optgroup label="Asset Management">
          <option value="inv-days">Days Inventory on Hand</option>
          <option value="inv-turnover">Inventory Turnover</option>
          <option value="ar-days">Receivables Collection Period</option>
          <option value="ap-days">Payables Payment Period</option>
        </optgroup>
        <optgroup label="Asset Turnover">
          <option value="total-asset-turn">Total Asset Turnover</option>
          <option value="fixed-asset-turn">Fixed Asset Turnover</option>
        </optgroup>
        <optgroup label="Financial Leverage">
          <option value="debt-ratio">Debt Ratio</option>
          <option value="debt-equity">Debt-to-Equity Ratio</option>
          <option value="times-interest">Times Interest Earned</option>
          <option value="cash-coverage">Cash Coverage Ratio</option>
        </optgroup>
        <optgroup label="Profitability">
          <option value="gross-margin">Gross Margin</option>
          <option value="oper-margin">Operating Margin</option>
          <option value="net-margin">Net Profit Margin</option>
          <option value="roa">Return on Assets (ROA)</option>
          <option value="roe">Return on Equity (ROE)</option>
        </optgroup>
        <optgroup label="Investment Performance">
          <option value="dy">Dividend Yield</option>
          <option value="hpr">Holding Period Return (HPR)</option>
          <option value="eps">Earnings per Share (EPS)</option>
          <option value="div-cover">Dividend Cover</option>
          <option value="payout">Payout Ratio</option>
          <option value="retention">Retention Ratio</option>
          <option value="pe">Price/Earnings Ratio (P/E)</option>
          <option value="ey">Earnings Yield (EY)</option>
        </optgroup>
      </select>

      <div id="category-description" class="mt-2 text-sm text-gray-600 muted"></div>

      <div id="ratio-inputs" class="mt-3 grid gap-2 md:grid-cols-3"></div>

      <div class="mt-3 flex gap-2">
        <button id="rat-explain" class="btn btn-primary">Compute</button>
        <button id="rat-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="rat-output" class="mt-3 steps"></div>
    </div>
  `;
}

/* Definitions for ratios (label, formula, inputs, example and short interpretation) */
const ratioDefs = {
  categoryDescriptions: {
    solvency: "Measures the company's ability to meet long-term obligations (higher >1 is usually better).",
    nav: "Shows the value of shareholders’ equity per share (book value per share).",
    current: "Assesses short-term liquidity and ability to meet current liabilities.",
    quick: "Measures immediate liquidity excluding inventory (conservative liquidity measure).",
    "inv-days": "Average days inventory is held before sale — the shorter, the better (usually).",
    "inv-turnover": "How many times inventory is sold and replaced during a period.",
    "ar-days": "Average number of days to collect credit sales from customers.",
    "ap-days": "Average number of days the business takes to pay suppliers.",
    "total-asset-turn": "How efficiently assets generate sales (higher = more efficient).",
    "fixed-asset-turn": "How efficiently fixed assets generate sales.",
    "debt-ratio": "Proportion of assets financed by debt (lower = less leverage).",
    "debt-equity": "Leverage in terms of debt vs equity (higher = more leveraged).",
    "times-interest": "How many times operating profit covers interest expense (higher = safer).",
    "cash-coverage": "EBIT + Depreciation relative to interest expense (cash ability to cover interest).",
    "gross-margin": "Share of sales left after COGS (profitability at production level).",
    "oper-margin": "Share of sales left after operating expenses (operational profitability).",
    "net-margin": "Share of sales that becomes net profit (bottom-line profitability).",
    roa: "Return on total assets (efficiency of using assets to generate net income).",
    roe: "Return on shareholders' equity (profitability for owners).",
    dy: "Dividend per share relative to market price (income yield).",
    hpr: "Total return (price change + dividends) over the holding period.",
    eps: "Net income per share — used in valuation metrics.",
    "div-cover": "How many times earnings cover dividends (safety of dividend).",
    payout: "Portion of net income paid out as dividends.",
    retention: "Portion of net income retained for growth (1 - payout).",
    pe: "Price investors are willing to pay per R1 of earnings.",
    ey: "Inverse of P/E: earnings yield (EPS / Price)."
  },

  solvency: {
    label: "Solvency Ratio",
    formula: "Total assets ÷ Total liabilities",
    inputs: ["Total assets", "Total liabilities"],
    example: { vals: [200000, 120000], explain: "For every R1 of liability the business has R1.67 in assets (200k / 120k = 1.67)." }
  },

  nav: {
    label: "Net Asset Value (per share)",
    formula: "(Total assets - Total liabilities) ÷ Shares outstanding",
    inputs: ["Total assets", "Total liabilities", "Shares outstanding"],
    example: { vals: [500000, 200000, 10000], explain: "Book value per share = (500k - 200k) / 10k = R30 per share." }
  },

  current: {
    label: "Current Ratio",
    formula: "Current assets ÷ Current liabilities",
    inputs: ["Current assets", "Current liabilities"],
    example: { vals: [100000, 50000], explain: "Current ratio = 100k / 50k = 2.0 (R2 of current assets per R1 liability)." }
  },

  quick: {
    label: "Quick Ratio (Acid Test)",
    formula: "(Current assets - Inventory) ÷ Current liabilities",
    inputs: ["Current assets", "Inventory", "Current liabilities"],
    example: { vals: [80000, 20000, 40000], explain: "(80k - 20k) / 40k = 1.5 (quick assets cover short-term liabilities 1.5x)." }
  },

  "inv-turnover": {
    label: "Inventory Turnover",
    formula: "COGS ÷ Average inventory",
    inputs: ["COGS", "Average inventory"],
    example: { vals: [60000, 10000], explain: "60000 / 10000 = 6 times per year." }
  },

  "inv-days": {
    label: "Days Inventory on Hand (DIO)",
    formula: "365 ÷ Inventory turnover (or (Average inventory / COGS) × 365)",
    inputs: ["COGS", "Average inventory"],
    example: { vals: [60000, 10000], explain: "Turnover = 6; Days = 365 / 6 ≈ 61 days inventory on hand." }
  },

  "ar-days": {
    label: "Receivables Collection Period (DSO)",
    formula: "(Accounts receivable ÷ Credit sales) × 365",
    inputs: ["Accounts receivable", "Credit sales (annual)"],
    example: { vals: [20000, 120000], explain: "(20k / 120k) × 365 ≈ 61 days to collect receivables." }
  },

  "ap-days": {
    label: "Payables Payment Period (DPO)",
    formula: "(Accounts payable ÷ Purchases) × 365",
    inputs: ["Accounts payable", "Purchases (annual)"],
    example: { vals: [15000, 90000], explain: "(15k / 90k) × 365 ≈ 61 days to pay suppliers." }
  },

  "total-asset-turn": {
    label: "Total Asset Turnover",
    formula: "Sales ÷ Total assets",
    inputs: ["Sales (annual)", "Total assets"],
    example: { vals: [200000, 100000], explain: "200k / 100k = 2 => each R1 of assets generates R2 sales." }
  },

  "fixed-asset-turn": {
    label: "Fixed Asset Turnover",
    formula: "Sales ÷ Net fixed assets",
    inputs: ["Sales (annual)", "Net fixed assets"],
    example: { vals: [200000, 50000], explain: "200k / 50k = 4 => each R1 of fixed assets generates R4 sales." }
  },

  "debt-ratio": {
    label: "Debt Ratio",
    formula: "Total liabilities ÷ Total assets",
    inputs: ["Total liabilities", "Total assets"],
    example: { vals: [40000, 100000], explain: "40k / 100k = 0.4 => 40% of assets financed by debt." }
  },

  "debt-equity": {
    label: "Debt-to-Equity Ratio",
    formula: "Total liabilities ÷ Total equity",
    inputs: ["Total liabilities", "Total equity"],
    example: { vals: [60000, 90000], explain: "60k / 90k ≈ 0.67 => R0.67 debt per R1 equity." }
  },

  "times-interest": {
    label: "Times Interest Earned",
    formula: "EBIT ÷ Interest expense",
    inputs: ["EBIT (Operating profit)", "Interest expense"],
    example: { vals: [50000, 10000], explain: "50k / 10k = 5 times coverage." }
  },

  "cash-coverage": {
    label: "Cash Coverage Ratio",
    formula: "(EBIT + Depreciation) ÷ Interest expense",
    inputs: ["EBIT", "Depreciation", "Interest expense"],
    example: { vals: [50000, 5000, 10000], explain: "(50k + 5k) / 10k = 5.5 times coverage." }
  },

  "gross-margin": {
    label: "Gross Profit Margin",
    formula: "(Sales - COGS) ÷ Sales",
    inputs: ["Sales", "COGS"],
    example: { vals: [120000, 60000], explain: "60k / 120k = 50% gross margin." }
  },

  "oper-margin": {
    label: "Operating Margin",
    formula: "Operating profit ÷ Sales",
    inputs: ["Operating profit", "Sales"],
    example: { vals: [40000, 200000], explain: "40k / 200k = 20% operating margin." }
  },

  "net-margin": {
    label: "Net Profit Margin",
    formula: "Net profit ÷ Sales",
    inputs: ["Net profit", "Sales"],
    example: { vals: [30000, 200000], explain: "30k / 200k = 15% net margin." }
  },

  roa: {
    label: "Return on Assets (ROA)",
    formula: "Net income ÷ Total assets",
    inputs: ["Net income", "Total assets"],
    example: { vals: [20000, 100000], explain: "20k / 100k = 20% ROA." }
  },

  roe: {
    label: "Return on Equity (ROE)",
    formula: "Net income ÷ Equity",
    inputs: ["Net income", "Equity"],
    example: { vals: [20000, 50000], explain: "20k / 50k = 40% ROE." }
  },

  dy: {
    label: "Dividend Yield",
    formula: "Dividend per share ÷ Share price",
    inputs: ["Dividend per share", "Share price"],
    example: { vals: [2, 40], explain: "2 / 40 = 5% dividend yield." }
  },

  hpr: {
    label: "Holding Period Return (HPR)",
    formula: "(Ending price - Beginning price + Dividends) ÷ Beginning price",
    inputs: ["Beginning price", "Ending price", "Dividends received"],
    example: { vals: [50, 60, 2], explain: "(60 - 50 + 2) / 50 = 24% HPR." }
  },

  eps: {
    label: "Earnings per Share (EPS)",
    formula: "Net income ÷ Shares outstanding",
    inputs: ["Net income", "Shares outstanding"],
    example: { vals: [100000, 50000], explain: "100k / 50k = R2 EPS." }
  },

  "div-cover": {
    label: "Dividend Cover",
    formula: "EPS ÷ Dividend per share",
    inputs: ["EPS", "Dividend per share"],
    example: { vals: [4, 2], explain: "4 / 2 = 2 times cover." }
  },

  payout: {
    label: "Payout Ratio",
    formula: "Dividends ÷ Net income",
    inputs: ["Dividends", "Net income"],
    example: { vals: [20000, 50000], explain: "20k / 50k = 40% payout." }
  },

  retention: {
    label: "Retention Ratio",
    formula: "1 - Payout ratio (or (Net income - Dividends) ÷ Net income)",
    inputs: ["Dividends", "Net income"],
    example: { vals: [20000, 50000], explain: "1 - (20k/50k) = 60% retention." }
  },

  pe: {
    label: "Price/Earnings Ratio (P/E)",
    formula: "Share price ÷ EPS",
    inputs: ["Share price", "EPS"],
    example: { vals: [30, 5], explain: "30 / 5 = 6 (P/E = 6)." }
  },

  ey: {
    label: "Earnings Yield (EY)",
    formula: "EPS ÷ Share price",
    inputs: ["EPS", "Share price"],
    example: { vals: [5, 30], explain: "5 / 30 = 16.7% earnings yield." }
  }
};

/* -------------------------
   Helpers (format & parse)
   ------------------------- */
function formatNumberSmart(x, dec = 2) {
  if (x === null || x === undefined) return "N/A";
  if (!isFinite(x)) return "NaN";
  // if very nearly integer, show integer
  if (Math.abs(Math.round(x) - x) < 1e-9) return (Math.round(x)).toString();
  return Number(x).toFixed(dec);
}

// parse numeric-like strings robustly
function parseNumberSmart(str) {
  if (typeof str === "number") return str;
  if (!str) return NaN;
  // remove currency 'R', commas, spaces
  let s = String(str).trim().replace(/[, ]+/g, "");
  // if percentage like '12%', convert to 0.12
  if (s.endsWith("%")) {
    const v = parseFloat(s.slice(0, -1));
    return isNaN(v) ? NaN : v / 100;
  }
  // remove leading R or other currency symbols
  s = s.replace(/^[^\d\.\-]+/, "");
  const v = parseFloat(s);
  return isNaN(v) ? NaN : v;
}

/* -------------------------
   Render inputs for selected ratio
   ------------------------- */
function renderRatioInputsFor(selectEl) {
  if (!selectEl) return;
  const sel = selectEl.value;
  const def = ratioDefs[sel];
  const inputDiv = document.getElementById("ratio-inputs");
  const catDiv = document.getElementById("category-description");
  if (!inputDiv || !catDiv) return;
  inputDiv.innerHTML = "";
  catDiv.innerHTML = ratioDefs.categoryDescriptions[sel] || "";

  if (!def) {
    inputDiv.innerHTML = `<p>Select a ratio</p>`;
    return;
  }
  // create labeled inputs
  def.inputs.forEach((lbl, i) => {
    // accessible input id unique by index
    const id = `ratio-in-${i}`;
    inputDiv.insertAdjacentHTML(
      "beforeend",
      `<label class="label">${lbl} <input id="${id}" class="input" placeholder="${lbl}" /></label>`
    );
  });

  // style select text black explicitly (some browsers need this after insertion)
  selectEl.style.color = "black";
}

/* -------------------------
   Compute & show output
   ------------------------- */
function computeSelectedRatio() {
  const selEl = document.getElementById("ratio-select");
  const outputEl = document.getElementById("rat-output");
  if (!selEl || !outputEl) return;
  const sel = selEl.value;
  const def = ratioDefs[sel];
  if (!def) {
    outputEl.innerHTML = `<p>Please select a ratio.</p>`;
    return;
  }

  // collect input values
  const rawVals = def.inputs.map((_, i) => {
    const el = document.getElementById(`ratio-in-${i}`);
    return el ? el.value.trim() : "";
  });

  // parse all values
  const vals = rawVals.map(v => parseNumberSmart(v));

  // check for missing (NaN) values
  const missingIndex = vals.findIndex(v => isNaN(v));
  if (missingIndex !== -1) {
    outputEl.innerHTML = `<p>Please enter a valid number for <strong>${def.inputs[missingIndex]}</strong>.</p>`;
    return;
  }

  // compute based on sel
  let result = null;
  let formulaStr = def.formula;
  let stepStr = "";
  try {
    switch (sel) {
      case "solvency":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "nav":
        result = (vals[0] - vals[1]) / vals[2];
        stepStr = `(${formatNumberSmart(vals[0])} - ${formatNumberSmart(vals[1])}) ÷ ${formatNumberSmart(vals[2])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "current":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "quick":
        result = (vals[0] - vals[1]) / vals[2];
        stepStr = `(${formatNumberSmart(vals[0])} - ${formatNumberSmart(vals[1])}) ÷ ${formatNumberSmart(vals[2])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "inv-turnover":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)} times`;
        break;

      case "inv-days": {
        const turnover = vals[0] / vals[1];
        result = turnover === 0 ? null : 365 / turnover;
        stepStr = `Inventory turnover = ${formatNumberSmart(turnover, 4)}; Days = 365 ÷ ${formatNumberSmart(turnover, 4)} = ${formatNumberSmart(result, 2)} days`;
        break;
      }

      case "ar-days":
        result = (vals[0] / vals[1]) * 365;
        stepStr = `(${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])}) × 365 = ${formatNumberSmart(result, 2)} days`;
        break;

      case "ap-days":
        result = (vals[0] / vals[1]) * 365;
        stepStr = `(${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])}) × 365 = ${formatNumberSmart(result, 2)} days`;
        break;

      case "total-asset-turn":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "fixed-asset-turn":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "debt-ratio":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "debt-equity":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "times-interest":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)} times`;
        break;

      case "cash-coverage":
        result = (vals[0] + vals[1]) / vals[2];
        stepStr = `(${formatNumberSmart(vals[0])} + ${formatNumberSmart(vals[1])}) ÷ ${formatNumberSmart(vals[2])} = ${formatNumberSmart(result, 4)} times`;
        break;

      case "gross-margin":
        result = (vals[0] - vals[1]) / vals[0];
        stepStr = `(${formatNumberSmart(vals[0])} - ${formatNumberSmart(vals[1])}) ÷ ${formatNumberSmart(vals[0])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "oper-margin":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "net-margin":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "roa":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "roe":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "dy":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "hpr":
        result = (vals[1] - vals[0] + vals[2]) / vals[0];
        stepStr = `(${formatNumberSmart(vals[1])} - ${formatNumberSmart(vals[0])} + ${formatNumberSmart(vals[2])}) ÷ ${formatNumberSmart(vals[0])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "eps":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "div-cover":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)} times`;
        break;

      case "payout":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "retention":
        result = 1 - (vals[0] / vals[1]);
        stepStr = `1 - (${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])}) = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      case "pe":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result, 4)}`;
        break;

      case "ey":
        result = vals[0] / vals[1];
        stepStr = `${formatNumberSmart(vals[0])} ÷ ${formatNumberSmart(vals[1])} = ${formatNumberSmart(result * 100, 2)}%`;
        break;

      default:
        result = "Unsupported ratio";
    }
  } catch (err) {
    outputEl.innerHTML = `<p>Error computing ratio: ${err.message || err}</p>`;
    return;
  }

  // produce result display
  const resultText = (typeof result === "number") ? formatNumberSmart(result, 4) : result;
  const interpret = def.example && def.example.explain ? def.example.explain : (ratioDefs.categoryDescriptions[sel] || "");

  outputEl.innerHTML = `
    <p><strong>${def.label}</strong></p>
    <p><em>Formula:</em> ${def.formula}</p>
    <p><em>Calculation:</em> ${stepStr}</p>
    <p><em>Result:</em> <strong>${resultText}</strong></p>
    <p class="muted"><strong>Interpretation:</strong> ${interpret}</p>
  `;
}

/* -------------------------
   Example filler
   ------------------------- */
function fillExampleForSelected() {
  const selEl = document.getElementById("ratio-select");
  if (!selEl) return;
  const def = ratioDefs[selEl.value];
  if (!def) return;
  def.example.vals.forEach((v, i) => {
    const input = document.getElementById(`ratio-in-${i}`);
    if (input) input.value = v;
  });
  // compute immediately after filling
  computeSelectedRatio();
}

/* -------------------------
   Event wiring (delegation + mutation observer)
   - works whether the module is dynamically injected or present at load
   ------------------------- */

// Listen for clicks on Compute / Example (delegation)
document.addEventListener("click", function (ev) {
  const t = ev.target;
  if (!t) return;
  // Compute button
  if (t.id === "rat-explain") {
    ev.preventDefault();
    computeSelectedRatio();
    return;
  }
  // Example button
  if (t.id === "rat-example") {
    ev.preventDefault();
    fillExampleForSelected();
    return;
  }
});

// Listen for change events on the ratio-select (delegation)
document.addEventListener("change", function (ev) {
  const t = ev.target;
  if (!t) return;
  if (t.id === "ratio-select") {
    // when selection changes, render its input fields
    renderRatioInputsFor(t);
  }
});

// A MutationObserver to catch when the module HTML is injected into DOM
// (your router calls renderTopic and injects the HTML — this detects that insertion)
const ratioObserver = new MutationObserver(function (mutations) {
  for (const m of mutations) {
    // check added nodes for the select
    const added = Array.from(m.addedNodes || []);
    for (const node of added) {
      if (!(node instanceof HTMLElement)) continue;
      const sel = node.querySelector && node.querySelector("#ratio-select");
      if (sel) {
        // initial render inputs for default selection
        renderRatioInputsFor(sel);
        sel.style.color = "black";
        // optionally focus first input
        const firstInput = document.getElementById("ratio-in-0");
        if (firstInput) firstInput.focus();
      }
      // also if the node itself is the container (topic-root) and contains select
      if (node.id === "topic-root") {
        const sel2 = node.querySelector && node.querySelector("#ratio-select");
        if (sel2) renderRatioInputsFor(sel2);
      }
    }
  }
});

// observe document body for subtree changes (lightweight)
ratioObserver.observe(document.body, { childList: true, subtree: true });

// If the select is already present at script-eval time, render inputs now
const existingSelect = document.getElementById("ratio-select");
if (existingSelect) {
  renderRatioInputsFor(existingSelect);
  existingSelect.style.color = "black";
}




/* ---------------------------
   6) Investments, Risk & Return
   Expanded: 
   - Historical (sample mean/variance/std dev)
   - State-based probabilities (E[R], Var, σ)
   - Confidence intervals
   - CAPM expected return
   --------------------------- */
function investRiskHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Investments — Expected Return & Risk</h2>
      <p class="mt-2 text-sm opacity-90">
        Analyze risk & return using historical data or state probabilities.
      </p>

      <div class="mt-3 flex gap-2">
        <button class="btn btn-ghost" id="tab-states">State Probabilities</button>
        <button class="btn btn-ghost" id="tab-years">Historical Years</button>
        <button class="btn btn-ghost" id="tab-capm">CAPM</button>
        <button class="btn btn-ghost" id="tab-ci">Confidence Interval</button>
      </div>

      <div id="inv-section" class="mt-3"></div>
      <div id="inv-output" class="mt-4 steps"></div>
    </div>
  `;
}

/* Renderers for tabs */
function renderStates(){
  document.getElementById("inv-section").innerHTML = `
    <p>Enter states of the economy with probabilities and returns:</p>
    <div id="inv-states">
      <div class="grid md:grid-cols-3 gap-2">
        <input class="input inv-prob" placeholder="Probability (e.g. 0.35)" />
        <input class="input inv-ret" placeholder="Return (decimal, e.g. 0.12)" />
        <div></div>
      </div>
    </div>
    <div class="mt-2 flex gap-2">
      <button id="inv-add" class="btn btn-ghost">Add state</button>
      <button id="inv-explain" class="btn btn-primary">Compute</button>
      <button id="inv-example" class="btn btn-ghost">Example</button>
    </div>
  `;
  attachInvestHandlers();
}

function renderYears(){
  document.getElementById("inv-section").innerHTML = `
    <p>Enter yearly returns to calculate sample mean, variance, and standard deviation:</p>
    <div id="inv-years">
      <div class="grid md:grid-cols-2 gap-2">
        <input class="input inv-year" placeholder="Return (decimal, e.g. 0.08)" />
        <div></div>
      </div>
    </div>
    <div class="mt-2 flex gap-2">
      <button id="year-add" class="btn btn-ghost">Add year</button>
      <button id="year-explain" class="btn btn-primary">Compute</button>
      <button id="year-example" class="btn btn-ghost">Example</button>
    </div>
  `;
  attachYearHandlers();
}

function renderCAPM(){
  document.getElementById("inv-section").innerHTML = `
    <p>Capital Asset Pricing Model (CAPM):</p>
    <label class="label">Risk-free rate Rf (decimal) <input id="capm-rf2" class="input" placeholder="e.g. 0.08" /></label>
    <label class="label">Beta (β) <input id="capm-beta2" class="input" placeholder="e.g. 1.3" /></label>
    <label class="label">Market return Rm (decimal) <input id="capm-rm2" class="input" placeholder="e.g. 0.15" /></label>
    <div class="mt-2 flex gap-2">
      <button id="capm-explain2" class="btn btn-primary">Compute</button>
      <button id="capm-example2" class="btn btn-ghost">Example</button>
    </div>
  `;
}

function renderCI(){
  document.getElementById("inv-section").innerHTML = `
    <p>Confidence Interval for returns:</p>
    <label class="label">Mean return (decimal) <input id="ci-mean" class="input" placeholder="e.g. 0.08" /></label>
    <label class="label">Std deviation (σ) <input id="ci-sd" class="input" placeholder="e.g. 0.20" /></label>
    <label class="label">Z-value <input id="ci-z" class="input" placeholder="e.g. 1.645 (90%), 1.96 (95%)" /></label>
    <div class="mt-2 flex gap-2">
      <button id="ci-explain" class="btn btn-primary">Compute</button>
      <button id="ci-example" class="btn btn-ghost">Example</button>
    </div>
  `;
}

/* Attach handlers for States */
function attachInvestHandlers(){
  document.getElementById('inv-add').addEventListener('click', ()=>{
    document.getElementById('inv-states').insertAdjacentHTML('beforeend',
      `<div class="grid md:grid-cols-3 gap-2 mt-2">
        <input class="input inv-prob" placeholder="Probability" />
        <input class="input inv-ret" placeholder="Return (decimal)" />
        <button class="btn btn-ghost inv-del">Remove</button>
      </div>`);
  });
  document.getElementById('inv-states').addEventListener('click', (e)=>{
    if(e.target.classList.contains('inv-del')) e.target.closest('div').remove();
  });
  document.getElementById('inv-explain').addEventListener('click', explainInvest);
  document.getElementById('inv-example').addEventListener('click', ()=>exampleInvest());
}

/* Attach handlers for Years */
function attachYearHandlers(){
  document.getElementById('year-add').addEventListener('click', ()=>{
    document.getElementById('inv-years').insertAdjacentHTML('beforeend',
      `<div class="grid md:grid-cols-2 gap-2 mt-2">
        <input class="input inv-year" placeholder="Return (decimal)" />
        <button class="btn btn-ghost year-del">Remove</button>
      </div>`);
  });
  document.getElementById('inv-years').addEventListener('click', (e)=>{
    if(e.target.classList.contains('year-del')) e.target.closest('div').remove();
  });
  document.getElementById('year-explain').addEventListener('click', explainYears);
  document.getElementById('year-example').addEventListener('click', ()=>exampleYears());
}

/* Explain State-based */
function explainInvest(){
  const probs = Array.from(document.querySelectorAll('.inv-prob')).map(i=>parseFloat(i.value||NaN));
  const rets = Array.from(document.querySelectorAll('.inv-ret')).map(i=>parseFloat(i.value||NaN));
  const out = document.getElementById('inv-output');
  const pairs=[];
  for(let i=0;i<probs.length;i++) if(!isNaN(probs[i]) && !isNaN(rets[i])) pairs.push({p:probs[i],r:rets[i]});
  if(pairs.length===0){out.innerHTML="<p>Enter probabilities and returns.</p>";return;}
  const pSum=pairs.reduce((s,o)=>s+o.p,0);
  if(Math.abs(pSum-1)>1e-6){out.innerHTML=`<p>Probabilities sum to ${fmt(pSum)}, should equal 1.</p>`;return;}
  const exp=pairs.reduce((s,o)=>s+o.p*o.r,0);
  const varR=pairs.reduce((s,o)=>s+o.p*Math.pow(o.r-exp,2),0);
  out.innerHTML=`
    <p><strong>Expected return</strong> = ${fmt(exp)} (${(exp*100).toFixed(2)}%)</p>
    <p><strong>Variance</strong> = ${fmt(varR)}</p>
    <p><strong>Std dev</strong> = ${fmt(Math.sqrt(varR))}</p>
  `;
}

/* Explain Historical years */
function explainYears(){
  const vals=Array.from(document.querySelectorAll('.inv-year')).map(i=>parseFloat(i.value||NaN)).filter(v=>!isNaN(v));
  const out=document.getElementById('inv-output');
  if(vals.length<2){out.innerHTML="<p>Enter at least 2 returns.</p>";return;}
  const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  const devs=vals.map(v=>v-mean);
  const sq=devs.map(d=>d*d);
  const variance=sq.reduce((a,b)=>a+b,0)/(vals.length-1);
  const sd=Math.sqrt(variance);
  out.innerHTML=`
    <p>Mean = ${fmt(mean)} (${(mean*100).toFixed(2)}%)</p>
    <p>Variance = ${fmt(variance)}</p>
    <p>Std deviation = ${fmt(sd)}</p>
  `;
}

/* CAPM */
document.addEventListener("click", e=>{
  if(e.target.id==="capm-explain2"){
    const rf=parseFloat(document.getElementById('capm-rf2').value||NaN);
    const beta=parseFloat(document.getElementById('capm-beta2').value||NaN);
    const rm=parseFloat(document.getElementById('capm-rm2').value||NaN);
    const out=document.getElementById('inv-output');
    if(isNaN(rf)||isNaN(beta)||isNaN(rm)){out.innerHTML="<p>Enter Rf, β, Rm.</p>";return;}
    const exp=rf+beta*(rm-rf);
    out.innerHTML=`
      <p><strong>CAPM Expected Return</strong> = ${fmt(exp)} (${(exp*100).toFixed(2)}%)</p>
      <p>Formula: E(Ri) = Rf + β(E(Rm)-Rf)</p>
    `;
  }
  if(e.target.id==="capm-example2"){
    document.getElementById('inv-output').innerHTML=`
      <p><strong>Example CAPM</strong></p>
      <p>Rf=0.08, β=1.3, Rm=0.15</p>
      <p>E(R) = 0.08 + 1.3(0.15-0.08)=0.171 (17.1%)</p>
    `;
  }
});

/* Confidence Interval */
document.addEventListener("click", e=>{
  if(e.target.id==="ci-explain"){
    const mean=parseFloat(document.getElementById('ci-mean').value||NaN);
    const sd=parseFloat(document.getElementById('ci-sd').value||NaN);
    const z=parseFloat(document.getElementById('ci-z').value||NaN);
    const out=document.getElementById('inv-output');
    if(isNaN(mean)||isNaN(sd)||isNaN(z)){out.innerHTML="<p>Enter mean, sd, z.</p>";return;}
    const low=mean - z*sd;
    const high=mean + z*sd;
    out.innerHTML=`
      <p>Confidence interval = [${(low*100).toFixed(2)}%, ${(high*100).toFixed(2)}%]</p>
      <p>At ${(z===1.645?"90%":z===1.96?"95%":z===2.58?"99%":"given")} confidence level.</p>
    `;
  }
  if(e.target.id==="ci-example"){
    document.getElementById('inv-output').innerHTML=`
      <p><strong>Example CI</strong></p>
      <p>Mean=0.08, σ=0.20, z=1.645 (90%)</p>
      <p>Interval=0.08 ±1.645×0.20 = [-0.249,0.409]</p>
      <p>So 90% chance actual return lies between -24.9% and 40.9%.</p>
    `;
  }
});

/* Examples */
function exampleInvest(){
  document.getElementById('inv-output').innerHTML=`
    <p><strong>Example State Probabilities</strong></p>
    <table>
      <tr><th>State</th><th>P</th><th>R</th><th>P×R</th></tr>
      <tr><td>Boom</td><td>0.35</td><td>0.22</td><td>0.077</td></tr>
      <tr><td>Normal</td><td>0.45</td><td>0.10</td><td>0.045</td></tr>
      <tr><td>Recession</td><td>0.20</td><td>0.05</td><td>0.010</td></tr>
    </table>
    <p>E(R)=0.132, Var=0.0045, σ=0.0671</p>
  `;
}
function exampleYears(){
  document.getElementById('inv-output').innerHTML=`
    <p><strong>Example Historical Returns</strong></p>
    <p>2020:0.25, 2021:0.23, 2022:0.18</p>
    <p>Mean=0.22, Var=0.0013, σ=0.0361</p>
  `;
}

/* Tab switching */
document.addEventListener("click", e=>{
  if(e.target.id==="tab-states") renderStates();
  if(e.target.id==="tab-years") renderYears();
  if(e.target.id==="tab-capm") renderCAPM();
  if(e.target.id==="tab-ci") renderCI();
});


/* ---------------------------
   7) Working Capital Management
   - Net Working Capital
   - Inventory Days on Hand
   - Debtors Collection Period
   - Creditors Payment Period
   - Cash Conversion Cycle
   - Early Payment Discount
   --------------------------- */

function workingCapHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Working Capital Management</h2>
      <p class="mt-2 text-sm opacity-90">
        Select a topic to calculate and learn step-by-step with formulas and examples.
      </p>

      <label class="block mt-3">Choose calculation:
        <select id="wc-select" class="input">
          <optgroup label="Liquidity Position">
            <option value="nwc">Net Working Capital</option>
          </optgroup>
          <optgroup label="Cycle Components">
            <option value="invdays">Inventory Days on Hand</option>
            <option value="debtors">Debtors Collection Period</option>
            <option value="creditors">Creditors Payment Period</option>
            <option value="ccc">Cash Conversion Cycle</option>
          </optgroup>
          <optgroup label="Trade Credit">
            <option value="discount">Early Payment Discount</option>
          </optgroup>
        </select>
      </label>

      <div id="wc-inputs" class="mt-3 grid gap-2 md:grid-cols-2"></div>

      <div class="mt-3 flex gap-2">
        <button id="wc-explain" class="btn btn-primary">Compute</button>
        <button id="wc-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="wc-output" class="mt-4 steps"></div>
    </div>
  `;
}

// Define each formula, inputs, example, explanation
const wcDefs = {
  nwc: {
    label: "Net Working Capital",
    inputs: ["Current assets", "Current liabilities"],
    formula: "Net Working Capital = Current Assets − Current Liabilities",
    example: {
      vals: [200000, 120000],
      calc: "200,000 − 120,000 = 80,000",
      explain: "A positive figure means the firm can cover its short-term obligations."
    }
  },
  invdays: {
    label: "Inventory Days on Hand",
    inputs: ["Average inventory", "Cost of goods sold (annual)"],
    formula: "Inventory Days = (Average Inventory × 365) ÷ Cost of Goods Sold",
    example: {
      vals: [120000, 600000],
      calc: "(120,000 × 365) ÷ 600,000 = 73 days",
      explain: "On average, inventory stays in stock for 73 days before being sold."
    }
  },
  debtors: {
    label: "Debtors Collection Period",
    inputs: ["Accounts receivable", "Credit sales (annual)"],
    formula: "Debtors Collection Period = (Accounts Receivable × 365) ÷ Credit Sales",
    example: {
      vals: [157808, 600000],
      calc: "(157,808 × 365) ÷ 600,000 = 96 days",
      explain: "On average, customers take 96 days to pay."
    }
  },
  creditors: {
    label: "Creditors Payment Period",
    inputs: ["Accounts payable", "Total annual purchases (or COGS)"],
    formula: "Creditors Payment Period = (Accounts Payable × 365) ÷ Purchases",
    example: {
      vals: [25000, 365000],
      calc: "(25,000 × 365) ÷ 365,000 = 25 days",
      explain: "On average, the firm pays suppliers in 25 days."
    }
  },
  ccc: {
    label: "Cash Conversion Cycle",
    inputs: ["Inventory days", "Debtors collection days", "Creditors payment days"],
    formula: "CCC = Inventory Days + Debtors Days − Creditors Days",
    example: {
      vals: [73, 96, 25],
      calc: "73 + 96 − 25 = 144 days",
      explain: "It takes 144 days from paying suppliers until receiving cash from sales."
    }
  },
  discount: {
    label: "Early Payment Discount",
    inputs: ["Discount %", "Discount period (days)", "Final due (days)"],
    formula: "Cost of not taking discount = (Discount ÷ (100 − Discount)) × (365 ÷ (Final Due − Discount Period))",
    example: {
      vals: [3, 10, 30],
      calc: "(3 ÷ 97) × (365 ÷ 20) = 55.6%",
      explain: "Forgoing the 3% discount costs the firm an annualised 55.6% — much higher than most borrowing costs."
    }
  }
};

// Render inputs dynamically
document.addEventListener("change", e=>{
  if(e.target.id==="wc-select"){
    const sel = wcDefs[e.target.value];
    if(sel){
      document.getElementById("wc-inputs").innerHTML = sel.inputs.map((lbl,i)=>
        `<label class="label">${lbl}<input id="wc-in${i}" class="input"/></label>`
      ).join("");
      document.getElementById("wc-output").innerHTML = "";
    }
  }
});

// Compute function
function explainWC(){
  const key = document.getElementById("wc-select").value;
  const def = wcDefs[key];
  if(!def) return;
  const vals = def.inputs.map((_,i)=>parseFloat(document.getElementById(`wc-in${i}`).value||0));
  let html = `<p><strong>${def.label}</strong></p>`;
  html += `<p>Formula: ${def.formula}</p>`;

  // Apply calculations
  if(key==="nwc"){
    const res = vals[0]-vals[1];
    html += `<p>Calculation: ${vals[0]} − ${vals[1]} = ${res}</p>`;
  }
  if(key==="invdays"){
    const res = vals[1]===0?0:(vals[0]*365/vals[1]);
    html += `<p>Calculation: (${vals[0]} × 365) ÷ ${vals[1]} = ${res.toFixed(2)} days</p>`;
  }
  if(key==="debtors"){
    const res = vals[1]===0?0:(vals[0]*365/vals[1]);
    html += `<p>Calculation: (${vals[0]} × 365) ÷ ${vals[1]} = ${res.toFixed(2)} days</p>`;
  }
  if(key==="creditors"){
    const res = vals[1]===0?0:(vals[0]*365/vals[1]);
    html += `<p>Calculation: (${vals[0]} × 365) ÷ ${vals[1]} = ${res.toFixed(2)} days</p>`;
  }
  if(key==="ccc"){
    const res = vals[0]+vals[1]-vals[2];
    html += `<p>Calculation: ${vals[0]} + ${vals[1]} − ${vals[2]} = ${res.toFixed(2)} days</p>`;
  }
  if(key==="discount"){
    const disc = vals[0], dp=vals[1], fd=vals[2];
    const cost = (disc/(100-disc))*(365/(fd-dp));
    html += `<p>Calculation: (${disc} ÷ (100−${disc})) × (365 ÷ (${fd}−${dp})) = ${cost.toFixed(2)}%</p>`;
  }

  html += `<p><em>${def.example.explain}</em></p>`;
  document.getElementById("wc-output").innerHTML = html;
}

// Example button
document.addEventListener("click", e=>{
  if(e.target.id==="wc-explain") explainWC();

  if(e.target.id==="wc-example"){
    const key = document.getElementById("wc-select").value;
    const def = wcDefs[key];
    if(def){
      document.getElementById("wc-inputs").innerHTML = def.inputs.map((lbl,i)=>
        `<label class="label">${lbl}<input id="wc-in${i}" class="input" value="${def.example.vals[i]}"/></label>`
      ).join("");
      explainWC();
    }
  }
});


/* ---------------------------
   8) Cost-Volume-Profit (Break-even, MOS, Target Profit, Graph)
   Fixed: buttons now work on dynamic injection, chart includes shaded profit/loss
   --------------------------- */
function cvpHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Cost-Volume-Profit (Break-even Analysis)</h2>
      <p class="mt-2 text-sm opacity-90">
        Analyze contribution margin, break-even, margin of safety and target profit.
      </p>

      <div class="mt-3 grid gap-2 md:grid-cols-3">
        <label class="label">Fixed costs (FC) <input id="cvp-fc" class="input" /></label>
        <label class="label">Selling price per unit (P) <input id="cvp-p" class="input" /></label>
        <label class="label">Variable cost per unit (VC) <input id="cvp-vc" class="input" /></label>
        <label class="label">Budgeted sales volume (Q) <input id="cvp-q" class="input" /></label>
        <label class="label">Target profit (optional) <input id="cvp-tp" class="input" /></label>
      </div>

      <div class="mt-3 flex gap-2">
        <button id="cvp-explain" class="btn btn-primary">Compute</button>
        <button id="cvp-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="cvp-output" class="mt-4 steps"></div>
      <canvas id="cvp-chart" class="mt-4 bg-white p-2 rounded"></canvas>
    </div>
  `;
}

/* Compute CVP analysis */
function explainCVP(){
  const FC = parseFloat(document.getElementById('cvp-fc').value || 0);
  const P = parseFloat(document.getElementById('cvp-p').value || 0);
  const VC = parseFloat(document.getElementById('cvp-vc').value || 0);
  const Q = parseFloat(document.getElementById('cvp-q').value || 0);
  const TP = parseFloat(document.getElementById('cvp-tp').value || 0);

  const out = document.getElementById('cvp-output');
  if(P <= VC){ out.innerHTML = '<p>Price must exceed variable cost per unit for a positive contribution margin.</p>'; return; }

  const CMU = P - VC; // Contribution margin per unit
  const BE_units = FC / CMU;
  const BE_revenue = BE_units * P;

  let html = `<p><strong>Contribution Margin per unit (CMU)</strong> = P - VC = ${fmt(P)} - ${fmt(VC)} = R${fmt(CMU)}</p>`;
  html += `<p><strong>Break-even (units)</strong> = FC ÷ CMU = ${fmt(FC)} ÷ ${fmt(CMU)} = ${fmt(BE_units)} units</p>`;
  html += `<p><strong>Break-even (revenue)</strong> = BE units × P = ${fmt(BE_units)} × ${fmt(P)} = R${fmt(BE_revenue)}</p>`;

  // Margin of Safety
  if(Q){
    const MOS_units = Q - BE_units;
    const MOS_value = MOS_units * P;
    html += `<p><strong>Margin of Safety</strong> = Budgeted sales - Break-even = ${fmt(Q)} - ${fmt(BE_units)} = ${fmt(MOS_units)} units (R${fmt(MOS_value)})</p>`;
  }

  // Target Profit
  if(TP){
    const TP_units = (FC + TP) / CMU;
    const TP_revenue = TP_units * P;
    html += `<p><strong>Target Profit Units</strong> = (FC + TP) ÷ CMU = (${fmt(FC)} + ${fmt(TP)}) ÷ ${fmt(CMU)} = ${fmt(TP_units)} units</p>`;
    html += `<p>Target sales revenue = ${fmt(TP_units)} × ${fmt(P)} = R${fmt(TP_revenue)}</p>`;
  }

  out.innerHTML = html;
  if(window.MathJax) MathJax.typesetPromise();

  drawCVPChart(FC, P, VC, BE_units, Q);
}

/* Graph function with shaded areas */
function drawCVPChart(FC, P, VC, BE_units, Q){
  const ctx = document.getElementById('cvp-chart').getContext('2d');
  if(window.cvpChart) window.cvpChart.destroy();

  const maxQ = Math.max(Q || 0, BE_units) * 1.2;
  const step = Math.ceil(maxQ/30);
  const quantities = [];
  const salesLine = [];
  const costLine = [];

  for(let q=0; q<=maxQ; q+=step){
    quantities.push(q);
    salesLine.push(q*P);
    costLine.push(FC + q*VC);
  }

  window.cvpChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: quantities,
      datasets: [
        {
          label: 'Sales Revenue',
          data: salesLine,
          borderColor: 'green',
          fill: false,
          tension: 0
        },
        {
          label: 'Total Cost',
          data: costLine,
          borderColor: 'red',
          fill: false,
          tension: 0
        },
        // Shaded profit area (green)
        {
          label: 'Profit Area',
          data: salesLine.map((s,i)=> s > costLine[i] ? s : costLine[i]),
          borderColor: 'transparent',
          backgroundColor: 'rgba(0,200,0,0.15)',
          fill: '-1', // fill between this dataset and previous (Total Cost)
          pointRadius: 0
        },
        // Shaded loss area (red)
        {
          label: 'Loss Area',
          data: salesLine.map((s,i)=> s < costLine[i] ? s : costLine[i]),
          borderColor: 'transparent',
          backgroundColor: 'rgba(200,0,0,0.15)',
          fill: 1, // fill between this dataset and Total Cost
          pointRadius: 0
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: true },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              xMin: BE_units,
              xMax: BE_units,
              borderColor: 'blue',
              borderWidth: 2,
              label: { content: `BE ${fmt(BE_units)} units`, enabled: true, position: 'top' }
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Units Sold' }},
        y: { title: { display: true, text: 'Rands (R)' }, beginAtZero: true }
      },
      maintainAspectRatio: false
    }
  });
}

/* Example filler */
function fillCVPExample(){
  document.getElementById('cvp-fc').value = 312000;
  document.getElementById('cvp-p').value = 20;
  document.getElementById('cvp-vc').value = 14;
  document.getElementById('cvp-q').value = 100000;
  document.getElementById('cvp-tp').value = 250000;
  explainCVP();
}

/* Event delegation */
document.addEventListener("click", e=>{
  if(e.target.id === "cvp-explain"){ e.preventDefault(); explainCVP(); }
  if(e.target.id === "cvp-example"){ e.preventDefault(); fillCVPExample(); }
});





/* ---------------------------
   9) Budgeting (Variance Analysis + Cash Budget)
   Features:
   - Variance Analysis: Budget vs Actual with F/U classification
   - Cash Budget builder: user enters sales, purchases, collections, expenses, etc.
   - Example: FurnitureWorld Ltd September 2024 Cash Budget
   --------------------------- */
function budgetingHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Budgeting — Variance Analysis & Cash Budget</h2>
      <p class="mt-2 text-sm opacity-90">
        Compare budgeted vs actual results (variance analysis) OR prepare a monthly cash budget.
      </p>

      <!-- Variance Analysis -->
      <div class="glass p-3 rounded-md mt-3">
        <h3 class="font-semibold">Variance Analysis</h3>
        <div class="mt-2 grid gap-2 md:grid-cols-3">
          <label class="label">Budgeted amount <input id="bud-budget" class="input" /></label>
          <label class="label">Actual amount <input id="bud-actual" class="input" /></label>
        </div>
        <div class="mt-2 flex gap-2">
          <button id="bud-explain" class="btn btn-primary">Explain</button>
        </div>
        <div id="bud-output" class="mt-3 steps"></div>
      </div>

      <!-- Cash Budget -->
      <div class="glass p-3 rounded-md mt-4">
        <h3 class="font-semibold">Cash Budget (one month)</h3>
        <div class="mt-2 grid gap-2 md:grid-cols-3">
          <label class="label">Cash sales <input id="cb-cashsales" class="input" /></label>
          <label class="label">Collections from debtors <input id="cb-collections" class="input" /></label>
          <label class="label">Other income (e.g. rent) <input id="cb-other" class="input" /></label>
          <label class="label">Cash purchases <input id="cb-cashpurch" class="input" /></label>
          <label class="label">Payments to creditors <input id="cb-creditors" class="input" /></label>
          <label class="label">Salaries <input id="cb-salaries" class="input" /></label>
          <label class="label">Operating expenses (excl. depreciation) <input id="cb-opex" class="input" /></label>
          <label class="label">Capital expenditure (e.g. deposit) <input id="cb-capex" class="input" /></label>
          <label class="label">Loan repayment / instalment <input id="cb-loan" class="input" /></label>
          <label class="label">Opening cash/overdraft <input id="cb-opening" class="input" /></label>
        </div>
        <div class="mt-2 flex gap-2">
          <button id="cb-explain" class="btn btn-primary">Prepare Budget</button>
          <button id="bud-example" class="btn btn-ghost">Example</button>
        </div>
        <div id="cb-output" class="mt-3 steps"></div>
      </div>
    </div>
  `;
}

/* Variance Analysis */
function explainBudgeting(){
  const bud = parseFloat(document.getElementById('bud-budget').value || 0);
  const act = parseFloat(document.getElementById('bud-actual').value || 0);
  const out = document.getElementById('bud-output');
  const varAmt = act - bud;
  const varPct = bud === 0 ? null : (varAmt / bud) * 100;
  const label = varAmt > 0 ? 'Unfavourable (U)' : (varAmt < 0 ? 'Favourable (F)' : 'No variance');

  out.innerHTML = `
    <p>Budgeted: R${fmt(bud)} | Actual: R${fmt(act)}</p>
    <p>Variance (Actual − Budget) = R${fmt(varAmt)} ${varPct !== null ? `(${varPct.toFixed(2)}%)` : ''}</p>
    <p><strong>Classification:</strong> ${label}</p>
    <p class="muted">Note: For costs → higher actual is Unfavourable; for revenue → higher actual is Favourable. Interpret carefully.</p>
  `;
}

/* Cash Budget */
function explainCashBudget(){
  const cashsales = parseFloat(document.getElementById('cb-cashsales').value || 0);
  const collections = parseFloat(document.getElementById('cb-collections').value || 0);
  const other = parseFloat(document.getElementById('cb-other').value || 0);
  const cashpurch = parseFloat(document.getElementById('cb-cashpurch').value || 0);
  const creditors = parseFloat(document.getElementById('cb-creditors').value || 0);
  const salaries = parseFloat(document.getElementById('cb-salaries').value || 0);
  const opex = parseFloat(document.getElementById('cb-opex').value || 0);
  const capex = parseFloat(document.getElementById('cb-capex').value || 0);
  const loan = parseFloat(document.getElementById('cb-loan').value || 0);
  const opening = parseFloat(document.getElementById('cb-opening').value || 0);

  const inflows = cashsales + collections + other;
  const outflows = cashpurch + creditors + salaries + opex + capex + loan;
  const closing = opening + inflows - outflows;

  const out = document.getElementById('cb-output');
  out.innerHTML = `
    <p><strong>Cash Budget (one month)</strong></p>
    <p>Opening balance: R${fmt(opening)}</p>
    <p><u>Inflows</u> = Cash sales (${fmt(cashsales)}) + Collections (${fmt(collections)}) + Other income (${fmt(other)}) = R${fmt(inflows)}</p>
    <p><u>Outflows</u> = Purchases (${fmt(cashpurch)}) + Creditors (${fmt(creditors)}) + Salaries (${fmt(salaries)}) + Opex (${fmt(opex)}) + Capex (${fmt(capex)}) + Loan (${fmt(loan)}) = R${fmt(outflows)}</p>
    <p><strong>Closing balance</strong> = Opening + Inflows − Outflows = R${fmt(opening)} + R${fmt(inflows)} − R${fmt(outflows)} = R${fmt(closing)}</p>
    <p class="muted">Interpretation: A negative closing balance = overdraft; positive = cash surplus.</p>
  `;
}

/* Example: FurnitureWorld Ltd */
function showBudgetExample(){
  // Fill inputs with example values
  document.getElementById("cb-opening").value = -20000;
  document.getElementById("cb-cashsales").value = 100000;
  document.getElementById("cb-collections").value = 345000;
  document.getElementById("cb-other").value = 40000;
  document.getElementById("cb-cashpurch").value = 64000;
  document.getElementById("cb-creditors").value = 84000;
  document.getElementById("cb-salaries").value = 66000;
  document.getElementById("cb-opex").value = 80000;
  document.getElementById("cb-capex").value = 50000;
  document.getElementById("cb-loan").value = 17000;

  // Automatically compute
  explainCashBudget();
}

/* Event Handlers (single listener) */
document.addEventListener("click", e=>{
  if(e.target.id === "bud-explain") explainBudgeting();
  if(e.target.id === "cb-explain") explainCashBudget();
  if(e.target.id === "bud-example") showBudgetExample();
});




/* ---------------------------
   10) Time Value of Money (PV, FV, Annuities)
   Features:
   - Compute PV (given FV/PMT) and FV (given PV/PMT)
   - Supports annuities (ordinary vs annuity due with type)
   - Examples auto-fill inputs and compute
   --------------------------- */
function tvmHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Time Value of Money (TVM)</h2>
      <p class="mt-2 text-sm opacity-90">
        Single-sum and annuity calculators. Enter knowns, leave the unknown blank. 
        Rate is per period (decimal, e.g. 0.05 = 5%).
      </p>

      <div class="mt-3 grid gap-2 md:grid-cols-3">
        <label class="label">Rate per period (r) <input id="tvm-r" class="input" placeholder="e.g. 0.05" /></label>
        <label class="label">Periods (n) <input id="tvm-n" class="input" placeholder="e.g. 5" /></label>
        <label class="label">Future value (FV) <input id="tvm-fv" class="input" placeholder="e.g. 1000" /></label>
        <label class="label">Payment (PMT) per period <input id="tvm-pmt" class="input" placeholder="e.g. 200" /></label>
        <label class="label">Present value (PV) <input id="tvm-pv" class="input" placeholder="e.g. 500" /></label>
        <label class="label">Type (0=end, 1=begin) <input id="tvm-type" class="input" placeholder="0 or 1" /></label>
      </div>

      <div class="mt-2 flex gap-2">
        <button id="tvm-pv-btn" class="btn btn-primary">Compute PV</button>
        <button id="tvm-fv-btn" class="btn btn-ghost">Compute FV</button>
        <button id="tvm-example" class="btn btn-link">Example</button>
      </div>
      <div id="tvm-output" class="mt-3 steps"></div>
    </div>
  `;
}

/* --- PV calculation (with FV + PMT) --- */
function explainTVMPV(){
  const r = Number(document.getElementById('tvm-r').value || 0);
  const n = Number(document.getElementById('tvm-n').value || 0);
  const fv = Number(document.getElementById('tvm-fv').value || 0);
  const pmt = Number(document.getElementById('tvm-pmt').value || 0);
  const type = Number(document.getElementById('tvm-type').value || 0);

  const pv = PV(r, n, pmt, fv, type);
  const out = document.getElementById('tvm-output');
  out.innerHTML = `
    <p><strong>Present Value (PV)</strong></p>
    <p class="block">\\[
      PV = - \\frac{FV + PMT(1 + r \\cdot type) \\cdot \\frac{(1+r)^n - 1}{r}}
      {(1+r)^n}
    \\]</p>
    <p>Substitute: \\[
      PV = - \\frac{${fv} + ${pmt}(1+${r}\\cdot${type}) \\cdot \\frac{(1+${r})^{${n}} - 1}{${r}}}
      {(1+${r})^{${n}}}
    \\]</p>
    <p><strong>Result:</strong> PV = R${fmt(pv)}</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* --- FV calculation (with PV + PMT) --- */
function explainTVMFV(){
  const r = Number(document.getElementById('tvm-r').value || 0);
  const n = Number(document.getElementById('tvm-n').value || 0);
  const pv = Number(document.getElementById('tvm-pv').value || 0);
  const pmt = Number(document.getElementById('tvm-pmt').value || 0);
  const type = Number(document.getElementById('tvm-type').value || 0);

  const fv = FV(r, n, pmt, pv, type);
  const out = document.getElementById('tvm-output');
  out.innerHTML = `
    <p><strong>Future Value (FV)</strong></p>
    <p class="block">\\[
      FV = - \\Big( PV(1+r)^n + PMT(1 + r \\cdot type) \\cdot \\frac{(1+r)^n - 1}{r} \\Big)
    \\]</p>
    <p>Substitute: \\[
      FV = - \\Big( ${pv}(1+${r})^{${n}} + ${pmt}(1+${r}\\cdot${type}) \\cdot \\frac{(1+${r})^{${n}} - 1}{${r}} \\Big)
    \\]</p>
    <p><strong>Result:</strong> FV = R${fmt(fv)}</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* --- Example button: auto-fill + compute --- */
function showTVMExample(){
  const r = document.getElementById("tvm-r");
  const n = document.getElementById("tvm-n");
  const fv = document.getElementById("tvm-fv");
  const pv = document.getElementById("tvm-pv");
  const pmt = document.getElementById("tvm-pmt");
  const type = document.getElementById("tvm-type");

  // Example 1: FV of single sum
  r.value = 0.10; n.value = 5; pv.value = 1000; fv.value = ""; pmt.value = 0; type.value = 0;
  explainTVMFV();

  // Append text explanation under the result
  document.getElementById("tvm-output").innerHTML += `
    <hr/>
    <p><strong>Extra Examples:</strong></p>
    <p>Example 2: Want R10,000 in 5 years, interest 8%. PV = 10000 / (1.08^5) = R6,805.83</p>
    <p>Example 3: Annuity of R2,000 yearly for 10 years at 6%. FV = 2000 × [(1.06^10 - 1)/0.06] = R26,358.47</p>
  `;
}

/* --- Event Handlers --- */
document.addEventListener("click", e=>{
  if(e.target.id === "tvm-pv-btn") explainTVMPV();
  if(e.target.id === "tvm-fv-btn") explainTVMFV();
  if(e.target.id === "tvm-example") showTVMExample();
});

/* --- Helper Financial Functions --- */
// Present Value (like Excel's PV)
function PV(rate, nper, pmt, fv, type){
  if(rate === 0) return -(fv + pmt*nper);
  return -(fv + pmt*(1+rate*type)*((Math.pow(1+rate,nper)-1)/rate)) / Math.pow(1+rate,nper);
}
// Future Value (like Excel's FV)
function FV(rate, nper, pmt, pv, type){
  if(rate === 0) return -(pv + pmt*nper);
  return -(pv*Math.pow(1+rate,nper) + pmt*(1+rate*type)*((Math.pow(1+rate,nper)-1)/rate));
}



/* ---------------------------
   11) Valuation (DDM, Perpetuity, Bonds)
   --------------------------- */
function valuationHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Valuation — Dividends, Perpetuities & Bonds</h2>
      <p class="mt-2 text-sm opacity-90">Choose a type of valuation (Dividend Discount Model, Perpetuity, or Bond).</p>

      <div class="mt-3">
        <label class="label">Type
          <select id="val-type" class="input" style="color:black;">
            <option value="perpetuity">Perpetuity / Growing perpetuity</option>
            <option value="ddm">Dividend Discount Model (DDM)</option>
            <option value="bond">Bond (finite maturity)</option>
          </select>
        </label>
      </div>

      <!-- Shared inputs -->
      <div class="mt-3 grid gap-2 md:grid-cols-3">
        <label class="label">Cash flow / Dividend next period (C or D1) <input id="val-c" class="input" /></label>
        <label class="label">Discount rate (r / yield) <input id="val-r" class="input" /></label>
        <label class="label">Growth rate (g) (0 if none) <input id="val-g" class="input" /></label>
      </div>

      <!-- Bond-specific inputs -->
      <div id="val-bond-extra" class="mt-3 grid gap-2 md:grid-cols-3" style="display:none;">
        <label class="label">Face value (F) <input id="val-f" class="input" /></label>
        <label class="label">Coupon rate (%) <input id="val-cr" class="input" /></label>
        <label class="label">Years to maturity (n) <input id="val-n" class="input" /></label>
        <label class="label">Payments per year (m) <input id="val-m" class="input" placeholder="1=annual,2=semi" /></label>
      </div>

      <div class="mt-3 flex gap-2">
        <button id="val-explain" class="btn btn-primary">Explain</button>
        <button id="val-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="val-output" class="mt-3 steps"></div>
    </div>
  `;
}

function explainValuation(){
  const type = document.getElementById('val-type').value;
  const out = document.getElementById('val-output');

  if(type === "perpetuity"){
    const C = parseFloat(document.getElementById('val-c').value || NaN);
    const r = parseFloat(document.getElementById('val-r').value || NaN);
    const g = parseFloat(document.getElementById('val-g').value || 0);
    if(isNaN(C) || isNaN(r)){ out.innerHTML = '<p>Enter cash flow C and discount rate r.</p>'; return; }
    if(g === 0){
      const pv = C / r;
      out.innerHTML = `<p>Perpetuity: \\( PV = \\frac{C}{r} \\)</p>
                       <p>Substitute: \\( \\frac{${C}}{${r}} = ${fmt(pv)} \\)</p>`;
    } else {
      if(r <= g){ out.innerHTML = '<p>For a growing perpetuity r must be greater than g.</p>'; return; }
      const pv = C / (r - g);
      out.innerHTML = `<p>Growing perpetuity: \\( PV = \\frac{C}{r-g} \\)</p>
                       <p>Substitute: \\( \\frac{${C}}{${r}-${g}} = ${fmt(pv)} \\)</p>`;
    }
  }

  if(type === "ddm"){
    const D1 = parseFloat(document.getElementById('val-c').value || NaN);
    const r = parseFloat(document.getElementById('val-r').value || NaN);
    const g = parseFloat(document.getElementById('val-g').value || 0);
    if(isNaN(D1) || isNaN(r)){ out.innerHTML = '<p>Enter dividend and discount rate.</p>'; return; }
    if(r <= g){ out.innerHTML = '<p>r must exceed g for DDM.</p>'; return; }
    const P0 = D1 / (r - g);
    out.innerHTML = `<p>DDM (Gordon growth): \\( P_0 = \\frac{D_1}{r-g} \\)</p>
                     <p>Substitute: \\( \\frac{${D1}}{${r}-${g}} = ${fmt(P0)} \\)</p>`;
  }

  if(type === "bond"){
    const F = parseFloat(document.getElementById('val-f').value || NaN);
    const cr = parseFloat(document.getElementById('val-cr').value || NaN) / 100;
    const r = parseFloat(document.getElementById('val-r').value || NaN);
    const n = parseFloat(document.getElementById('val-n').value || NaN);
    const m = parseInt(document.getElementById('val-m').value || 1);

    if([F,cr,r,n].some(isNaN)){ out.innerHTML = '<p>Enter face value, coupon rate, yield, and years to maturity.</p>'; return; }

    const i = r / m;
    const N = n * m;
    const C = F * cr / m;

    const pvCoupons = C * (1 - 1/Math.pow(1+i,N)) / i;
    const pvFace = F / Math.pow(1+i,N);
    const price = pvCoupons + pvFace;

    let status = "At par";
    if(price > F) status = "Premium";
    else if(price < F) status = "Discount";

    out.innerHTML = `
      <p>Bond valuation:</p>
      <p>\\( Price = C \\times \\frac{1-(1+i)^{-N}}{i} + F \\times (1+i)^{-N} \\)</p>
      <p>Substitute: C=${fmt(C)}, i=${fmt(i)}, N=${N}, F=${fmt(F)}</p>
      <p><strong>Price = ${fmt(price)}</strong> → Bond trades at <strong>${status}</strong></p>
    `;
  }

  if(window.MathJax) MathJax.typesetPromise();
}

/* --- Show bond fields when type=bond --- */
document.addEventListener("change", e=>{
  if(e.target.id === "val-type"){
    document.getElementById("val-bond-extra").style.display = (e.target.value === "bond") ? "grid" : "none";
  }
});

/* --- Buttons --- */
document.addEventListener("click", e=>{
  if(e.target.id === "val-explain") explainValuation();

  if(e.target.id === "val-example"){
    const type = document.getElementById('val-type').value;

    if(type === "perpetuity"){
      document.getElementById('val-c').value = 13;
      document.getElementById('val-r').value = 0.08;
      document.getElementById('val-g').value = 0.04;
    }
    if(type === "ddm"){
      document.getElementById('val-c').value = 4.5;
      document.getElementById('val-r').value = 0.12;
      document.getElementById('val-g').value = 0.05;
    }
    if(type === "bond"){
      document.getElementById('val-f').value = 1000;
      document.getElementById('val-cr').value = 8;
      document.getElementById('val-r').value = 0.07;
      document.getElementById('val-n').value = 10;
      document.getElementById('val-m').value = 2;
    }

    explainValuation();
  }
});


/* ---------------------------
   12) Capital Budgeting — NPV, IRR, AAR, PBP, DPB
   --------------------------- */
function capBudHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Capital Budgeting — NPV, IRR & Other Methods</h2>
      <p class="mt-2 text-sm opacity-90">
        Enter cash flows for periods 0..n as comma-separated values (e.g. -930000,760000,122000,75000).
      </p>
      <div class="mt-2 grid gap-2 md:grid-cols-2">
        <label class="label">Discount rate (r) <input id="cb-r" class="input" placeholder="e.g. 0.20" /></label>
        <label class="label">Cash flows (CSV) <input id="cb-cfs" class="input" /></label>
      </div>
      <div class="mt-2 flex flex-wrap gap-2">
        <button id="cb-explain" class="btn btn-primary">NPV & IRR</button>
        <button id="cb-aar" class="btn btn-ghost">AAR</button>
        <button id="cb-pbp" class="btn btn-ghost">Payback</button>
        <button id="cb-dpb" class="btn btn-ghost">Discounted Payback</button>
        <button id="cb-example" class="btn btn-ghost">Example</button>
        <button id="cb-theory" class="btn btn-link">Theory Notes</button>
      </div>
      <div id="cb-output" class="mt-3 steps"></div>
    </div>
  `;
}

function explainCapBud(){
  const r = parseFloat(document.getElementById('cb-r').value || NaN);
  const cfs = getCashFlows();
  const out = document.getElementById('cb-output');
  if(isNaN(r) || cfs.length === 0){ out.innerHTML = '<p>Enter discount rate and cash flows.</p>'; return; }

  const npv = NPV(r, cfs);
  const irr = IRR(cfs);

  out.innerHTML = `
    <p><strong>Cash flows:</strong> [${cfs.join(', ')}]</p>
    <p>NPV at r=${(r*100).toFixed(2)}% = R${fmt(npv)} → Accept project if NPV > 0.</p>
    <p>IRR = ${irr === null ? 'Cannot compute (non-conventional cash flows)' : (irr*100).toFixed(2)+'%'}.</p>
  `;
}

function explainAAR(){
  const cfs = getCashFlows();
  const out = document.getElementById('cb-output');
  if(cfs.length < 2){ out.innerHTML = '<p>Need at least initial outflow and inflows.</p>'; return; }

  const C0 = Math.abs(cfs[0]);
  const inflows = cfs.slice(1);
  const avgReturn = inflows.reduce((a,b)=>a+b,0) / inflows.length;
  const aar = avgReturn / C0;

  out.innerHTML = `
    <p><strong>AAR</strong> = Average inflow ÷ Initial investment</p>
    <p>Average inflow = (${inflows.join(" + ")}) / ${inflows.length} = R${fmt(avgReturn)}</p>
    <p>Initial investment = R${fmt(C0)}</p>
    <p>AAR = ${fmt(avgReturn)} / ${fmt(C0)} = ${(aar*100).toFixed(2)}%</p>
    <p class="muted">Accept if AAR > required return.</p>
  `;
}

function explainPBP(){
  const cfs = getCashFlows();
  const out = document.getElementById('cb-output');
  if(cfs.length < 2){ out.innerHTML = '<p>Need cash flows including initial investment.</p>'; return; }

  let cum = cfs[0];
  for(let t=1; t<cfs.length; t++){
    if(cum + cfs[t] >= 0){
      const needed = -cum;
      const frac = needed / cfs[t];
      const years = (t-1 + frac).toFixed(2);
      out.innerHTML = `<p><strong>Payback Period</strong> = ${years} years</p>`;
      return;
    }
    cum += cfs[t];
  }
  out.innerHTML = '<p>Investment not recovered within project life.</p>';
}

function explainDPB(){
  const r = parseFloat(document.getElementById('cb-r').value || NaN);
  const cfs = getCashFlows();
  const out = document.getElementById('cb-output');
  if(isNaN(r) || cfs.length < 2){ out.innerHTML = '<p>Need discount rate and cash flows.</p>'; return; }

  let cum = cfs[0];
  for(let t=1; t<cfs.length; t++){
    const pv = cfs[t] / Math.pow(1+r,t);
    if(cum + pv >= 0){
      const needed = -cum;
      const frac = needed / pv;
      const years = (t-1 + frac).toFixed(2);
      out.innerHTML = `<p><strong>Discounted Payback Period</strong> = ${years} years</p>`;
      return;
    }
    cum += pv;
  }
  out.innerHTML = '<p>Discounted investment not recovered within project life.</p>';
}

/* Utility: parse CSV cash flows */
function getCashFlows(){
  const cfsStr = document.getElementById('cb-cfs').value || '';
  return cfsStr.split(',').map(s=>parseFloat(s.trim())).filter(x=>!isNaN(x));
}

/* --- Financial functions --- */
function NPV(rate, cashflows){
  return cashflows.reduce((acc,cf,t)=>acc + cf/Math.pow(1+rate,t),0);
}

// IRR via Newton-Raphson
function IRR(cashflows, guess=0.1){
  let r = guess;
  for(let i=0; i<100; i++){
    let f = cashflows.reduce((acc,cf,t)=>acc + cf/Math.pow(1+r,t),0);
    let fPrime = cashflows.reduce((acc,cf,t)=>acc - (t*cf)/Math.pow(1+r,t+1),0);
    let newR = r - f/fPrime;
    if(Math.abs(newR-r) < 1e-7) return newR;
    r = newR;
  }
  return null;
}

/* --- Bindings --- */
document.addEventListener("click", e=>{
  if(e.target.id==="cb-explain") explainCapBud();
  if(e.target.id==="cb-aar") explainAAR();
  if(e.target.id==="cb-pbp") explainPBP();
  if(e.target.id==="cb-dpb") explainDPB();

  if(e.target.id==="cb-example"){
    document.getElementById('cb-r').value='0.20';
    document.getElementById('cb-cfs').value='-930000,760000,122000,75000';
    explainCapBud();
  }

  if(e.target.id==="cb-theory"){
    document.getElementById("cb-output").innerHTML = `
      <h3>Theory Notes</h3>
      <ul>
        <li><strong>Disadvantage of AAR:</strong> Ignores time value of money.</li>
        <li><strong>Disadvantage of PBP:</strong> Ignores cash flows after payback period, and TVM.</li>
        <li><strong>Replacement project:</strong> Replace old assets; compare cash flows with vs without replacement.</li>
        <li><strong>Expansion project:</strong> Expands capacity; evaluate new project’s incremental cash flows.</li>
      </ul>
    `;
  }
});

/* ---------------------------
   Formulae sheet
   --------------------------- */

/* ---------------------------
   Formulae Sheet (with MathJax)
   --------------------------- */
function formulaeHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">📘 Formulae Sheet</h2>
      <p class="mt-2 text-sm opacity-90">Quick reference for Managerial Finance (FTX1005F). Formulas are rendered with MathJax.</p>

      <div class="mt-4 space-y-6">

        <!-- Financial Ratios -->
        <section>
          <h3 class="text-lg font-bold">Financial Ratio Analysis</h3>
          <ul class="list-disc ml-6 mt-2">
            <li><strong>Solvency Ratio</strong>: \\( \\text{Solvency} = \\dfrac{\\text{Total Assets}}{\\text{Total Liabilities}} \\)</li>
           <li><strong>Net Asset Value (NAV)</strong>: \\( \\text{NAV per share} = \\dfrac{\\text{Total Assets} - \\text{Total Liabilities}}{\\text{Shares Outstanding}} \\)</li> 
           <li><strong>Current Ratio</strong>: \\( \\text{Current Ratio} = \\dfrac{\\text{Current Assets}}{\\text{Current Liabilities}} \\)</li> 
           <li><strong>Quick Ratio (Acid Test)</strong>: \\( \\text{Quick Ratio} = \\dfrac{\\text{Current Assets} - \\text{Inventory}}{\\text{Current Liabilities}} \\)</li> <li><strong>Inventory Turnover</strong>: \\( \\text{InvTurn} = \\dfrac{\\text{COGS}}{\\text{Avg Inventory}} \\)</li> <li><strong>Days Inventory on Hand (DIO)</strong>: \\( \\text{DIO} = \\dfrac{\\text{Avg Inventory} \\times 365}{\\text{COGS}} = \\dfrac{365}{\\text{InvTurn}} \\)</li> <li><strong>Receivables Collection Period (DSO)</strong>: \\( \\text{DSO} = \\dfrac{\\text{Accounts Receivable} \\times 365}{\\text{Credit Sales}} \\)</li> <li><strong>Payables Payment Period (DPO)</strong>: \\( \\text{DPO} = \\dfrac{\\text{Accounts Payable} \\times 365}{\\text{Purchases or COGS}} \\)</li> <li><strong>Total Asset Turnover</strong>: \\( \\text{TAT} = \\dfrac{\\text{Sales}}{\\text{Total Assets}} \\)</li> <li><strong>Fixed Asset Turnover</strong>: \\( \\text{FAT} = \\dfrac{\\text{Sales}}{\\text{Net Fixed Assets}} \\)</li> <li><strong>Debt Ratio</strong>: \\( \\text{Debt Ratio} = \\dfrac{\\text{Total Liabilities}}{\\text{Total Assets}} \\)</li> <li><strong>Debt-to-Equity</strong>: \\( \\text{D/E} = \\dfrac{\\text{Total Liabilities}}{\\text{Total Equity}} \\)</li> <li><strong>Times Interest Earned</strong>: \\( \\text{TIE} = \\dfrac{\\text{EBIT}}{\\text{Interest Expense}} \\)</li> <li><strong>Cash Coverage Ratio</strong>: \\( \\text{CashCov} = \\dfrac{\\text{EBIT} + \\text{Depreciation}}{\\text{Interest Expense}} \\)</li> <li><strong>Gross Profit Margin</strong>: \\( \\text{Gross Margin} = \\dfrac{\\text{Sales} - \\text{COGS}}{\\text{Sales}} \\times 100\\% \\)</li> <li><strong>Operating Margin</strong>: \\( \\text{Operating Margin} = \\dfrac{\\text{Operating Profit}}{\\text{Sales}} \\times 100\\% \\)</li> <li><strong>Net Profit Margin</strong>: \\( \\text{Net Margin} = \\dfrac{\\text{Net Profit}}{\\text{Sales}} \\times 100\\% \\)</li> <li><strong>Return on Assets (ROA)</strong>: \\( \\text{ROA} = \\dfrac{\\text{Net Income}}{\\text{Total Assets}} \\times 100\\% \\)</li> <li><strong>Return on Equity (ROE)</strong>: \\( \\text{ROE} = \\dfrac{\\text{Net Income}}{\\text{Equity}} \\times 100\\% \\)</li> </ul> </section> <section> <h3 class="text-lg font-bold">Investment Performance</h3> <ul class="list-disc ml-6 mt-2"> <li><strong>Dividend Yield</strong>: \\( \\text{DY} = \\dfrac{\\text{Dividend per share}}{\\text{Share price}} \\times 100\\% \\)</li> <li><strong>Holding Period Return (HPR)</strong>: \\( \\text{HPR} = \\dfrac{\\text{Ending price} - \\text{Beginning price} + \\text{Dividends}}{\\text{Beginning price}} \\times 100\\% \\)</li> <li><strong>Earnings per Share (EPS)</strong>: \\( \\text{EPS} = \\dfrac{\\text{Net Income}}{\\text{Shares outstanding}} \\)</li> <li><strong>Dividend Cover</strong>: \\( \\text{Cover} = \\dfrac{\\text{EPS}}{\\text{DPS}} \\)</li> <li><strong>Payout Ratio</strong>: \\( \\text{Payout} = \\dfrac{\\text{Dividends}}{\\text{Net Income}} \\times 100\\% \\)</li> <li><strong>Retention Ratio</strong>: \\( \\text{Retention} = 1 - \\text{Payout} \\)</li> <li><strong>Price/Earnings (P/E)</strong>: \\( \\text{P/E} = \\dfrac{\\text{Share price}}{\\text{EPS}} \\)</li> <li><strong>Earnings Yield (EY)</strong>: \\( \\text{EY} = \\dfrac{\\text{EPS}}{\\text{Share price}} \\times 100\\% \\)</li> </ul> </section> <section> <h3 class="text-lg font-bold">Time Value of Money (TVM)</h3> <ul class="list-disc ml-6 mt-2"> <li>Future Value (single sum): \\( FV = PV (1+i)^n \\)</li> <li>Present Value (single sum): \\( PV = \\dfrac{FV}{(1+i)^n} \\)</li> <li>FV of ordinary annuity: \\( FV_{ann} = PMT \\times \\dfrac{(1+i)^n - 1}{i} \\)</li> <li>PV of ordinary annuity: \\( PV_{ann} = PMT \\times \\dfrac{1 - (1+i)^{-n}}{i} \\)</li> <li>Annuity due: multiply ordinary annuity by \\( (1+i) \\)</li> </ul> </section> <section> <h3 class="text-lg font-bold">Valuation & Bonds</h3> <ul class="list-disc ml-6 mt-2"> <li>Dividend Discount Model (Gordon): \\( P_0 = \\dfrac{D_1}{r - g} \\)</li> <li>Perpetuity: \\( PV = \\dfrac{C}{r} \\)</li> <li>Growing Perpetuity: \\( PV = \\dfrac{C}{r - g}, \\; r>g \\)</li> <li>Bond price (periodic): \\( P = C \\times \\dfrac{1 - (1+i)^{-N}}{i} + F(1+i)^{-N} \\)</li> <li>Where: \\(C\\) = coupon per period, \\(i\\) = market rate per period, \\(N\\) = #periods, \\(F\\)=face value</li> </ul> </section> <section> <h3 class="text-lg font-bold">Capital Budgeting</h3> <ul class="list-disc ml-6 mt-2"> <li>Net Present Value (NPV): \\( NPV = \\sum_{t=0}^{N} \\dfrac{C_t}{(1+i)^t} \\) (include initial outflow)</li> <li>Internal Rate of Return (IRR): discount rate such that \\( NPV = 0 \\)</li> <li>Average Accounting Return (AAR): \\( AAR = \\dfrac{\\text{Average accounting profit}}{\\text{Initial investment}} \\)</li> <li>Payback Period (PBP): time until cumulative cash flows = initial investment</li> <li>Discounted Payback (DPB): time until cumulative discounted cash flows = initial investment</li>
          </ul>
        </section>

        <!-- Other sections (Investments, TVM, Valuation, Capital Budgeting) ... same as before -->
        
      </div>
    </div>
  `;
}

/* Loader for Formulae (same pattern as other modules) */
function loadFormulae(){
  const container = document.getElementById("topic-content"); // the same container all modules use
  if(!container) return;
  container.innerHTML = formulaeHTML();

  // trigger MathJax rendering
  if(window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise([container]);
  }
}





/* Default topic */
renderTopic('acc_eq');
