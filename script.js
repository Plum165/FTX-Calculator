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
  'sapphire-steel': {bg:['#13293d','#006494','#247ba0'],text:'#ffffff',btn1:'#00a6fb',btn2:'#0582ca',ghost:'#0d1b2a'},
  'emerald-charcoal': {bg:['#004d40','#1c313a','#2e7d32'],text:'#ffffff',btn1:'#10b981',btn2:'#065f46',ghost:'#0b1f1a'},
  'monochrome-focus': {bg:['#111111','#333333','#555555'],text:'#ffffff',btn1:'#6b7280',btn2:'#9ca3af',ghost:'#141414'}
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
    default: html = `<div><p>Topic not found</p></div>`;
  }
  topicRoot.innerHTML = '';
  topicRoot.appendChild(el(html));
  bindTopicEvents(topic);
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   1) Accounting equation: A = E + L
   --------------------------- */
function accEqHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Accounting Equation — Assets = Equity + Liabilities</h2>
      <p class="mt-2 text-sm opacity-90">Enter any two values; leave the value to compute blank. Amounts are in R (Rand).</p>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div class="label">Assets (A) <span class="help">?</span></div><input id="acc-A" class="input" placeholder="leave blank to compute" />
        <div class="label">Equity / Owner's capital (E) <span class="help">?</span></div><input id="acc-E" class="input" placeholder="leave blank to compute" />
        <div class="label">Liabilities (L) <span class="help">?</span></div><input id="acc-L" class="input" placeholder="leave blank to compute" />
      </div>
      <div class="mt-4 flex gap-2">
        <button id="acc-explain" class="btn btn-primary">Explain</button>
        <button id="acc-example" class="btn btn-ghost">Load example</button>
      </div>
      <div id="acc-output" class="mt-5 topic-card p-4 rounded-md steps" role="status"></div>
    </div>
  `;
}
function explainAccEq(){
  const A = document.getElementById('acc-A').value.trim();
  const E = document.getElementById('acc-E').value.trim();
  const L = document.getElementById('acc-L').value.trim();
  const out = document.getElementById('acc-output');
  // Count blanks
  const blankCount = [A,E,L].filter(v=>v==='').length;
  if(blankCount !== 1){ out.innerHTML = `<p>Please leave exactly one field blank (the one you want to compute).</p>`; return; }
  const toNum = v => Number(String(v).replace(/[, ]+/g,'')) || 0;
  if(A === ''){
    // A = E + L
    const e = toNum(E), l = toNum(L);
    const a = e + l;
    out.innerHTML = `
      <p><strong>Given</strong>: Equity (E) = R${fmt(e)}, Liabilities (L) = R${fmt(l)}</p>
      <p>By definition: $A = E + L$ (Assets equal owner's equity plus liabilities)</p>
      <p class="block">$A = ${fmt(e)} + ${fmt(l)} = ${fmt(a)}$</p>
      <p><em>Answer:</em> Assets = R${fmt(a)}</p>
    `;
  } else if(E === ''){
    const a = toNum(A), l = toNum(L);
    const e = a - l;
    out.innerHTML = `
      <p><strong>Given</strong>: Assets (A) = R${fmt(a)}, Liabilities (L) = R${fmt(l)}</p>
      <p>Rearrange: $E = A - L$</p>
      <p class="block">$E = ${fmt(a)} - ${fmt(l)} = ${fmt(e)}$</p>
      <p><em>Answer:</em> Equity = R${fmt(e)}</p>
    `;
  } else {
    const a = toNum(A), e = toNum(E);
    const l = a - e;
    out.innerHTML = `
      <p><strong>Given</strong>: Assets (A) = R${fmt(a)}, Equity (E) = R${fmt(e)}</p>
      <p>Rearrange: $L = A - E$</p>
      <p class="block">$L = ${fmt(a)} - ${fmt(e)} = ${fmt(l)}</p>
      <p><em>Answer:</em> Liabilities = R${fmt(l)}</p>
    `;
  }
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   2) Sources & Cost of Capital (Dividend Growth, CAPM, WACC)
   /* ---------------------------
   Sources of Finance & Cost of Capital
   Upgraded: 
   - Added direct P0 input option for Gordon Growth
   - Expanded WACC explanation: kd step, weighted components, step-by-step
---------------------------- */
/* ---------------------------
   Sources of Finance & Cost of Capital (Upgraded)
   --------------------------- */
function sourcesCostHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Sources of Finance & Cost of Capital</h2>
      <p class="mt-2 text-sm opacity-90">Work with Dividend Growth (Gordon), CAPM, and WACC — all step by step with symbols used in class.</p>

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
            <div class="flex gap-2 mt-2"><button id="dgm-explain" class="btn btn-primary">Explain</button><button id="dgm-example" class="btn btn-ghost">Example</button></div>
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
            <div class="flex gap-2 mt-2"><button id="capm-explain" class="btn btn-primary">Explain</button><button id="capm-example" class="btn btn-ghost">Example</button></div>
            <div id="capm-output" class="mt-2 steps"></div>
          </div>
        </div>

        <!-- WACC -->
        <div class="glass p-3 rounded-md md:col-span-2">
          <h3 class="font-semibold">Weighted Average Cost of Capital (WACC)</h3>
          <p class="muted">Use Ke, Kp, Kd, and values of Equity (Vₑ), Preference shares (Vₚ), and Debt (Vd).</p>
          <div class="mt-2 grid gap-2 md:grid-cols-3">
            <label class="label">Vₑ (Ordinary shares + Retained income) <input id="wacc-ve" class="input" placeholder="e.g. 2000000" /></label>
            <label class="label">K<sub>e</sub> (Cost of equity) <input id="wacc-ke" class="input" placeholder="e.g. 0.20" /></label>
            <label class="label">Vₚ (Preference shares) <input id="wacc-vp" class="input" placeholder="e.g. 500000" /></label>
            <label class="label">K<sub>p</sub> (Cost of preference shares) <input id="wacc-kp" class="input" placeholder="e.g. 0.14" /></label>
            <label class="label">Vd (Debt) <input id="wacc-vd" class="input" placeholder="e.g. 300000" /></label>
            <label class="label">K<sub>d</sub> (Before tax) <input id="wacc-kd" class="input" placeholder="e.g. 0.15" /></label>
            <label class="label">Tax rate t <input id="wacc-t" class="input" placeholder="e.g. 0.30" /></label>
          </div>
          <div class="mt-2 flex gap-2"><button id="wacc-explain" class="btn btn-primary">Explain</button><button id="wacc-example" class="btn btn-ghost">Example</button></div>
          <div id="wacc-output" class="mt-2 steps"></div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------
   Explain Functions
   --------------------------- */
function explainDGM(){
  const d0 = parseFloat(document.getElementById('dgm-d0').value || NaN);
  const d1val = document.getElementById('dgm-d1').value.trim();
  const g = parseFloat(document.getElementById('dgm-g').value || NaN);
  const r = parseFloat(document.getElementById('dgm-r').value || NaN);
  const p0val = document.getElementById('dgm-p0').value.trim();
  const out = document.getElementById('dgm-output');

  // Need at least D1 & r-g OR P0 given
  if(isNaN(g)){ out.innerHTML='<p>Enter growth rate g.</p>'; return; }

  let d1, p0, reqR;
  if(d1val !== '') d1 = parseFloat(d1val);
  else if(!isNaN(d0)) d1 = d0 * (1 + g);

  if(p0val !== '' && !isNaN(d1)){ 
    // Compute required return r
    p0 = parseFloat(p0val);
    reqR = d1/p0 + g;
    out.innerHTML = `
      <p><strong>Given</strong>: D₁ = R${fmt(d1)}, P₀ = R${fmt(p0)}, g = ${fmt(g)}</p>
      <p>Formula: $r = \\dfrac{D₁}{P₀} + g$</p>
      <p class="block">$r = \\dfrac{${fmt(d1)}}{${fmt(p0)}} + ${fmt(g)} = ${fmt(reqR)}$</p>
      <p><em>Interpretation:</em> Required return equals dividend yield plus growth.</p>
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
    <p class="block">$K_e = ${fmt(rf)} + ${fmt(beta)} \\times (${fmt(rm)} - ${fmt(rf)}) = ${fmt(ke)}$</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

function explainWACC(){
  const Ve = parseFloat(document.getElementById('wacc-ve').value || 0);
  const Ke = parseFloat(document.getElementById('wacc-ke').value || NaN);
  const Vp = parseFloat(document.getElementById('wacc-vp').value || 0);
  const Kp = parseFloat(document.getElementById('wacc-kp').value || NaN);
  const Vd = parseFloat(document.getElementById('wacc-vd').value || 0);
  const Kd = parseFloat(document.getElementById('wacc-kd').value || NaN);
  const t = parseFloat(document.getElementById('wacc-t').value || 0);
  const out = document.getElementById('wacc-output');

  if(isNaN(Ke) || isNaN(Kp) || isNaN(Kd)){ out.innerHTML='<p>Enter Ke, Kp, Kd values.</p>'; return; }
  const V = Ve+Vp+Vd;
  if(V===0){ out.innerHTML='<p>Provide non-zero values for Ve, Vp, or Vd.</p>'; return; }

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

      <div class="mt-2 flex gap-2">
        <button id="je-add" class="btn btn-primary">Add Journal Entry</button>
        <button id="je-post" class="btn btn-ghost">Post to Ledger</button>
        <button id="je-trial" class="btn btn-link">Show Trial Balance</button>
        <button id="je-clear" class="btn btn-danger">Clear All</button>
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

/* ---------------------------
   4) Adjustments & Annual Financial Statements (AAFS)
   Upgrade: Can carry forward Trial Balance from earlier, apply adjustments,
   and split output into Income Statement vs SOFP.
   --------------------------- */
function adjustmentsHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Adjustments & Annual Financial Statements</h2>
      <p class="mt-2 text-sm opacity-90">
        This module lets you apply year-end adjustments to your trial balance and generate 
        Income Statement and Balance Sheet outputs. You can load balances from your earlier 
        journal/ledger work or run simple examples.
      </p>

      <div class="mt-3 flex gap-2">
        <button id="adj-load" class="btn btn-primary">Load Trial Balance</button>
        <button id="adj-clear" class="btn btn-ghost">Clear Adjustments</button>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Accruals & Prepayments</h3>
          <label class="label mt-2">
            Accrued expense (increase expense + liability) 
            <input id="adj-accrued" class="input" placeholder="R" />
          </label>
          <label class="label">
            Prepaid expense (asset; reduce expense if not used) 
            <input id="adj-prepaid" class="input" placeholder="R" />
          </label>
          <div class="mt-2 flex gap-2">
            <button id="adj-explain" class="btn btn-primary">Explain Effect</button>
          </div>
          <div id="adj-output" class="mt-2 steps"></div>
        </div>

        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Depreciation (straight-line)</h3>
          <label class="label mt-2">Cost 
            <input id="dep-cost" class="input" placeholder="R" />
          </label>
          <label class="label">Residual value 
            <input id="dep-res" class="input" placeholder="R" />
          </label>
          <label class="label">Useful life (years) 
            <input id="dep-life" class="input" placeholder="e.g. 5" />
          </label>
          <div class="mt-2 flex gap-2">
            <button id="dep-explain" class="btn btn-primary">Explain</button>
          </div>
          <div id="dep-output" class="mt-2 steps"></div>
        </div>
      </div>

      <div class="mt-4">
        <button id="adj-apply" class="btn btn-link">Apply Adjustments to TB</button>
        <div id="adj-tb-output" class="mt-3 steps"></div>
      </div>
    </div>
  `;
}

/* ========== Adjustments logic ========== */
let savedTrialBalance = {}; // carryover from earlier module

function explainAdjustments(){
  const accrued = parseFloat(document.getElementById('adj-accrued').value || 0);
  const prepaid = parseFloat(document.getElementById('adj-prepaid').value || 0);
  const out = document.getElementById('adj-output');

  out.innerHTML = `
    <p><strong>Accrued expense</strong>: R${fmt(accrued)}. 
      → Debit Expense (increases cost, reduces profit). 
      → Credit Accrued Liabilities (current liability).</p>
    <p><strong>Prepaid expense</strong>: R${fmt(prepaid)}. 
      → Debit Prepaid Expense (asset). 
      → Credit Expense (reduce cost for portion not incurred).</p>
    <p class="muted">Adjustments ensure revenues and expenses match the correct accounting period (accrual principle).</p>
  `;
}

function explainDepreciation(){
  const cost = parseFloat(document.getElementById('dep-cost').value || NaN);
  const res = parseFloat(document.getElementById('dep-res').value || 0);
  const life = parseFloat(document.getElementById('dep-life').value || NaN);
  const out = document.getElementById('dep-output');

  if(isNaN(cost) || isNaN(life) || life <= 0){
    out.innerHTML = '<p>Enter cost and useful life (years).</p>';
    return;
  }
  const dep = (cost - res) / life;
  out.innerHTML = `
    <p><strong>Straight-line depreciation</strong></p>
    <p>Cost = R${fmt(cost)}, Residual = R${fmt(res)}, Life = ${fmt(life)} years</p>
    <p>Annual depreciation = (Cost - Residual) ÷ Life = R${fmt(dep)}</p>
    <p>Journal: Debit Depreciation Expense R${fmt(dep)}; Credit Accumulated Depreciation R${fmt(dep)}</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------- Load Trial Balance from earlier ledger ---------- */
function loadTrialBalanceFromLedger(){
  if(!ledger || Object.keys(ledger).length === 0){
    alert("No ledger data found. Post entries first in the Transactions module.");
    return;
  }
  savedTrialBalance = JSON.parse(JSON.stringify(ledger));
  document.getElementById('adj-tb-output').innerHTML = `<p class="muted">Trial Balance loaded from earlier postings. Ready for adjustments.</p>`;
}

/* ---------- Apply adjustments ---------- */
function applyAdjustmentsToTB(){
  if(!savedTrialBalance || Object.keys(savedTrialBalance).length === 0){
    document.getElementById('adj-tb-output').innerHTML = '<p>No trial balance loaded.</p>';
    return;
  }

  const accrued = parseFloat(document.getElementById('adj-accrued').value || 0);
  const prepaid = parseFloat(document.getElementById('adj-prepaid').value || 0);
  const cost = parseFloat(document.getElementById('dep-cost').value || NaN);
  const res = parseFloat(document.getElementById('dep-res').value || 0);
  const life = parseFloat(document.getElementById('dep-life').value || NaN);

  // Clone TB so we don’t overwrite original
  let adjTB = JSON.parse(JSON.stringify(savedTrialBalance));

  // Apply accrued expense
  if(accrued > 0){
    if(!adjTB["Accrued Expenses"]) adjTB["Accrued Expenses"] = {debit:0, credit:0};
    if(!adjTB["Expense (Accrued)"]) adjTB["Expense (Accrued)"] = {debit:0, credit:0};
    adjTB["Expense (Accrued)"].debit += accrued;
    adjTB["Accrued Expenses"].credit += accrued;
  }

  // Apply prepaid expense
  if(prepaid > 0){
    if(!adjTB["Prepaid Expenses"]) adjTB["Prepaid Expenses"] = {debit:0, credit:0};
    if(!adjTB["Expense (Prepaid adj)"]) adjTB["Expense (Prepaid adj)"] = {debit:0, credit:0};
    adjTB["Prepaid Expenses"].debit += prepaid;
    adjTB["Expense (Prepaid adj)"].credit += prepaid;
  }

  // Apply depreciation
  if(!isNaN(cost) && !isNaN(life) && life > 0){
    const dep = (cost - res) / life;
    if(dep > 0){
      if(!adjTB["Depreciation Expense"]) adjTB["Depreciation Expense"] = {debit:0, credit:0};
      if(!adjTB["Accumulated Depreciation"]) adjTB["Accumulated Depreciation"] = {debit:0, credit:0};
      adjTB["Depreciation Expense"].debit += dep;
      adjTB["Accumulated Depreciation"].credit += dep;
    }
  }

  renderAdjTB(adjTB);
}

/* ---------- Render Adjusted Trial Balance split ---------- */
function renderAdjTB(tb){
  let totalDebits = 0, totalCredits = 0;
  let isHTML = `<h3 class="font-semibold mt-2">Income Statement Accounts</h3><table><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>`;
  let sofpHTML = `<h3 class="font-semibold mt-2">Statement of Financial Position Accounts</h3><table><thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead><tbody>`;

  Object.keys(tb).forEach(a=>{
    const bal = tb[a].debit - tb[a].credit;
    const debit = bal >= 0 ? bal : 0;
    const credit = bal < 0 ? -bal : 0;

    // crude classification by keywords
    if(a.toLowerCase().includes("expense") || a.toLowerCase().includes("revenue") || a.toLowerCase().includes("income")){
      isHTML += `<tr><td>${a}</td><td>R${fmt(debit)}</td><td>R${fmt(credit)}</td></tr>`;
    } else {
      sofpHTML += `<tr><td>${a}</td><td>R${fmt(debit)}</td><td>R${fmt(credit)}</td></tr>`;
    }

    totalDebits += debit;
    totalCredits += credit;
  });

  isHTML += `</tbody></table>`;
  sofpHTML += `</tbody></table>`;

  let balanced = (fmt(totalDebits) === fmt(totalCredits));
  const out = document.getElementById('adj-tb-output');
  out.innerHTML = `
    ${isHTML}
    ${sofpHTML}
    <p class="mt-2"><strong>Totals</strong> — Debits: R${fmt(totalDebits)} | Credits: R${fmt(totalCredits)}</p>
    <p>${balanced ? '<strong>Trial Balance is balanced ✔️</strong>' : '<strong>Trial Balance does not balance ❌</strong>'}</p>
  `;
}

/* ---------- Hook up buttons ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("adj-load")){
    document.getElementById("adj-load").onclick = loadTrialBalanceFromLedger;
    document.getElementById("adj-clear").onclick = ()=>{ savedTrialBalance = {}; document.getElementById("adj-tb-output").innerHTML=""; };
    document.getElementById("adj-explain").onclick = explainAdjustments;
    document.getElementById("dep-explain").onclick = explainDepreciation;
    document.getElementById("adj-apply").onclick = applyAdjustmentsToTB;
  }
});

/* ---------------------------
   Full Financial Ratios Module
   Covers:
   1) Solvency & NAV
   2) Liquidity
   3) Asset Management
   4) Asset Turnover
   5) Financial Leverage
   6) Profitability
   7) Investment Performance
--------------------------- */
/* ---------------------------
   5) Financial Ratios Interactive Module
   Users can select a ratio from a dropdown, input values, and see the formula, calculation, and interpretation.
--------------------------- */

function ratiosHTML() {
  return `
    <div>
      <h2 class="text-2xl font-semibold">Financial Ratio Analysis</h2>
      <p class="mt-2 text-sm opacity-90">
        Choose a financial ratio to compute. Enter the relevant values to see the formula, calculation, and interpretation.
      </p>
      
      <div class="mt-3">
        <label class="label">Select Ratio:
          <select id="rat-type" class="input">
            <option value="">--Choose--</option>
            <option value="currentRatio">Current Ratio</option>
            <option value="quickRatio">Quick (Acid Test) Ratio</option>
            <option value="grossMargin">Gross Margin</option>
            <option value="netMargin">Net Profit Margin</option>
            <option value="roa">Return on Assets (ROA)</option>
            <option value="roe">Return on Equity (ROE)</option>
            <option value="inventoryTurnover">Inventory Turnover</option>
            <option value="debtorDays">Debtors Collection Period</option>
            <option value="creditorDays">Creditors Payment Period</option>
            <option value="assetTurnover">Total Asset Turnover</option>
          </select>
        </label>
      </div>

      <div id="rat-inputs" class="mt-3 grid gap-3 md:grid-cols-3"></div>

      <div class="mt-3 flex gap-2">
        <button id="rat-explain" class="btn btn-primary">Compute</button>
        <button id="rat-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="rat-output" class="mt-3 steps"></div>
    </div>
  `;
}

// Utility to format numbers
function fmt(num, dec=2){ return num === null || isNaN(num) ? 'N/A' : num.toFixed(dec); }

function updateInputs() {
  const type = document.getElementById('rat-type').value;
  const container = document.getElementById('rat-inputs');
  container.innerHTML = '';

  const inputs = {
    currentRatio: ['Current Assets', 'Current Liabilities'],
    quickRatio: ['Current Assets', 'Inventory', 'Current Liabilities'],
    grossMargin: ['Sales', 'Cost of Goods Sold (COGS)'],
    netMargin: ['Net Income', 'Sales'],
    roa: ['Net Income', 'Total Assets'],
    roe: ['Net Income', 'Total Equity'],
    inventoryTurnover: ['COGS', 'Average Inventory'],
    debtorDays: ['Accounts Receivable', 'Sales'],
    creditorDays: ['Accounts Payable', 'COGS'],
    assetTurnover: ['Sales', 'Total Assets']
  };

  if(inputs[type]){
    inputs[type].forEach(name => {
      const id = 'rat-' + name.toLowerCase().replace(/[^a-z]/g,'');
      container.innerHTML += `<label class="label">${name} <input id="${id}" class="input" type="number" /></label>`;
    });
  }
}

function explainRatios() {
  const type = document.getElementById('rat-type').value;
  const out = document.getElementById('rat-output');
  let html = `<p><strong>${type ? type.replace(/([A-Z])/g,' $1') : 'Ratios'}</strong></p>`;

  function getVal(id){ return parseFloat(document.getElementById(id)?.value || 0); }

  switch(type){
    case 'currentRatio': {
      const ca = getVal('rat-currentassets');
      const cl = getVal('rat-currentliabilities');
      const val = cl === 0 ? null : ca / cl;
      html += `<p>Current Ratio = Current Assets / Current Liabilities = ${fmt(val)}</p>`;
      html += `<p>Interpretation: Measures liquidity. Higher than 1 indicates sufficient short-term assets.</p>`;
      break;
    }
    case 'quickRatio': {
      const ca = getVal('rat-currentassets');
      const inv = getVal('rat-inventory');
      const cl = getVal('rat-currentliabilities');
      const val = cl === 0 ? null : (ca - inv)/cl;
      html += `<p>Quick Ratio = (Current Assets - Inventory) / Current Liabilities = ${fmt(val)}</p>`;
      html += `<p>Interpretation: Stricter liquidity measure than current ratio. Excludes inventory.</p>`;
      break;
    }
    case 'grossMargin': {
      const sales = getVal('rat-sales');
      const cogs = getVal('rat-costofgoodssoldcogs');
      const val = sales === 0 ? null : (sales - cogs)/sales;
      html += `<p>Gross Margin = (Sales - COGS) / Sales = ${fmt(val*100)}%</p>`;
      html += `<p>Interpretation: Profitability of core operations before expenses.</p>`;
      break;
    }
    case 'netMargin': {
      const net = getVal('rat-netincome');
      const sales = getVal('rat-sales');
      const val = sales === 0 ? null : net/sales;
      html += `<p>Net Profit Margin = Net Income / Sales = ${fmt(val*100)}%</p>`;
      html += `<p>Interpretation: Overall profitability after all expenses and taxes.</p>`;
      break;
    }
    case 'roa': {
      const net = getVal('rat-netincome');
      const ta = getVal('rat-totalassets');
      const val = ta === 0 ? null : net/ta;
      html += `<p>ROA = Net Income / Total Assets = ${fmt(val*100)}%</p>`;
      html += `<p>Interpretation: Efficiency in using assets to generate profit.</p>`;
      break;
    }
    case 'roe': {
      const net = getVal('rat-netincome');
      const eq = getVal('rat-totalequity');
      const val = eq === 0 ? null : net/eq;
      html += `<p>ROE = Net Income / Total Equity = ${fmt(val*100)}%</p>`;
      html += `<p>Interpretation: Returns generated on shareholders' investment.</p>`;
      break;
    }
    case 'inventoryTurnover': {
      const cogs = getVal('rat-cogs');
      const avgInv = getVal('rat-averageinventory');
      const val = avgInv === 0 ? null : cogs / avgInv;
      html += `<p>Inventory Turnover = COGS / Average Inventory = ${fmt(val)}</p>`;
      html += `<p>Interpretation: How quickly inventory is sold and replaced.</p>`;
      break;
    }
    case 'debtorDays': {
      const ar = getVal('rat-accountsreceivable');
      const sales = getVal('rat-sales');
      const val = sales === 0 ? null : (ar / sales) * 365;
      html += `<p>Debtors Collection Period = Accounts Receivable / Sales * 365 = ${fmt(val)} days</p>`;
      html += `<p>Interpretation: Average collection period for receivables.</p>`;
      break;
    }
    case 'creditorDays': {
      const ap = getVal('rat-accountspayable');
      const cogs = getVal('rat-cogs');
      const val = cogs === 0 ? null : (ap / cogs) * 365;
      html += `<p>Creditors Payment Period = Accounts Payable / COGS * 365 = ${fmt(val)} days</p>`;
      html += `<p>Interpretation: Average period to pay suppliers.</p>`;
      break;
    }
    case 'assetTurnover': {
      const sales = getVal('rat-sales');
      const ta = getVal('rat-totalassets');
      const val = ta === 0 ? null : sales / ta;
      html += `<p>Total Asset Turnover = Sales / Total Assets = ${fmt(val)}</p>`;
      html += `<p>Interpretation: Efficiency in using assets to generate revenue.</p>`;
      break;
    }
    default:
      html += `<p>Please select a ratio.</p>`;
  }

  out.innerHTML = html;
  if(window.MathJax) MathJax.typesetPromise();
}

// Event listeners
document.addEventListener('DOMContentLoaded', ()=>{
  document.body.addEventListener('change', e=>{
    if(e.target && e.target.id==='rat-type') updateInputs();
  });
  document.body.addEventListener('click', e=>{
    if(e.target && e.target.id==='rat-explain') explainRatios();
  });
});



/* ---------------------------
   6) Investments, Risk & Return (expected return & variance)
   Years Share A Average Return Dev Deviations squared
R R R−R ( R−R )2
2020 0.25 0.22 0.03 0.0009
2021 0.23 0.22 0.01 0.0001
2022 0.18 0.22 -0.04 0.0016
0.66 0.0026
Mean = 066/3 = 0.22
Variance = 0.0026 / (3-1) = 0.0013
Standard Deviation = √0.0013 = 0.0361
Years Share A Average Return Dev Deviations squared
R R R−R ( R−R )2
2020 0.14 0.2 -0.06 0.0036
2021 0.16 0.2 -0.04 0.0016
2022 0.30 0.2 0.1 0.01
0.60 0.0152
Mean = 0.60/3 = 0.2
Variance = 0.0152/(3-1) = 0.0076
Standard Deviation= √0.0076 = 0.0872
QUESTION 2
Economic
State
Probabilit
y
P
Projected
returns
R
E(R)
P x R
Deviation
s
R- E(R)
Dev Sqd
(DEV2)
(R-ER)2 P x DEV2
Boom 0.35 0.22 0.077 0.088 0.0077 0.0027
Normal 0.45 0.10 0.045 -0.032 0.0010 0.0005
Recession 0.20 0.05 0.01 -0.082 0.0067 0.0013
0.132 0.0045
Expected return = 0.132
Variance = 0.0045
Standard deviation = √0 , 0 045=0.0671
OR
Mean = (0.35 x 0.22) + (0.45 x 0.10) + (0.20 x 0.05)
= 0.077+ 0.045 +0.01
= 0.132
Variance = ((0.22 – 0.132) 2 x 0.35) + ((0.10 – 0.132) 2 x 0.45) + ((0.05 – 0.132) 2 x 0.20)
= 0.0027 + 0.0005 + 0.0013
= 0.0045
Standard deviation = √0,0045 = 0.0671
QUESTION 3
At a 90% confidence level, we expect the return to be within 1.645 standard deviations from
the mean
(RA) +/- (A x 1.000)
= 8 +- / (20 x 1.645)
= 8 - 32.9 = -24.9 and 8 + 32.9 = 40.9
There is a 90% chance that the actual return will be between -24.9% and 40.9%
QUESTION 4
E(Ri) = Rrf + βi(E(Rm) – Rrf)
= 8 + (1.3 x (15- 8))
= 8 + 9.1
= 17.1%
   --------------------------- */
function investRiskHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Investments — Expected Return & Risk</h2>
      <p class="mt-2 text-sm opacity-90">Enter possible states with probabilities and returns to compute expected return and variance (portfolio-level not included here).</p>
      <div class="mt-2" id="inv-states">
        <div class="grid md:grid-cols-3 gap-2">
          <input class="input inv-prob" placeholder="probability (e.g. 0.25)" />
          <input class="input inv-ret" placeholder="return (decimal, e.g. 0.08)" />
          <div></div>
        </div>
      </div>
      <div class="mt-2 flex gap-2"><button id="inv-add" class="btn btn-ghost">Add state</button><button id="inv-explain" class="btn btn-primary">Explain</button></div>
      <div id="inv-output" class="mt-3 steps"></div>
    </div>
  `;
}
function attachInvestHandlers(){
  document.getElementById('inv-add').addEventListener('click', ()=>{
    document.getElementById('inv-states').insertAdjacentHTML('beforeend', `<div class="grid md:grid-cols-3 gap-2 mt-2"><input class="input inv-prob" placeholder="probability (e.g. 0.25)" /><input class="input inv-ret" placeholder="return (decimal, e.g. 0.08)" /><button class="btn btn-ghost inv-del">Remove</button></div>`);
  });
  document.getElementById('inv-states').addEventListener('click', (e)=>{
    if(e.target.classList.contains('inv-del')) e.target.closest('div').remove();
  });
}
function explainInvest(){
  const probs = Array.from(document.querySelectorAll('.inv-prob')).map(i=>parseFloat(i.value || NaN));
  const rets = Array.from(document.querySelectorAll('.inv-ret')).map(i=>parseFloat(i.value || NaN));
  const out = document.getElementById('inv-output');
  const pairs = [];
  for(let i=0;i<probs.length;i++) if(!isNaN(probs[i]) && !isNaN(rets[i])) pairs.push({p:probs[i], r:rets[i]});
  if(pairs.length === 0){ out.innerHTML = '<p>Enter at least one state with probability and return.</p>'; return; }
  const pSum = pairs.reduce((s,o)=>s+o.p,0);
  if(Math.abs(pSum - 1) > 1e-6){ out.innerHTML = `<p>Probabilities sum to ${fmt(pSum)} (they should sum to 1). Normalize first or ensure probabilities are correct.</p>`; return; }
  const exp = pairs.reduce((s,o)=>s + o.p * o.r, 0);
  const varR = pairs.reduce((s,o)=> s + o.p * Math.pow(o.r - exp, 2), 0);
  out.innerHTML = `
    <p><strong>Expected return</strong> = \\(\\sum p_i r_i = ${fmt(exp)} = ${(exp*100).toFixed(3)}\\%\\)</p>
    <p><strong>Variance</strong> = \\(\\sum p_i (r_i - E[r])^2 = ${fmt(varR)}\\)</p>
    <p><strong>Standard deviation</strong> = ${fmt(Math.sqrt(varR))}</p>
    <p class="muted">Interpretation: variance/standard deviation measure risk (dispersion of returns around expected value).</p>
  `;
}

/* ---------------------------
   7) Working Capital Management (NWC & Cash Conversion Cycle)
   1. Working Capital Cycle 2017
Days inventory on hand Inventory x 365 R3 816.4 x 365 (1)
Cost of sales expense 85 830.2 (1)
= 16.2299 days (½m)
Debtors collection period Debtors x 365 R10 814.3 x 365 (1)
Credit sales 57 277 (95 461.1 x 0.60) (1)
= 68.91 days (½m)
Creditors payment period Creditors x 365 R13 452.7 x 365 (1)
Cost of sales expense 85 830.2 (1)
= 57.21 days (½m)
Days inventory on
hand
+ Debtors collection
period
- Creditors payment
period
= Working Capital Cycle
16.2299 (½m) days + 68.91 (½m) days - 57.21 (½m) days = 27.9299 (½m) days
▪ Spar collected cash from debtors 27.9299 days after they paid their creditors
or
▪ Spar paid their creditors 27.9299 days before they received the cash from Debtors
(½)
▪ A shorter Working Capital Cycle (½) so that they receive the cash from the credit customers
(debtors) before they pay their creditors (½)
(11 marks)
2.
3 X 365 =
100 – 3 45 – 12
(1 or ½m) (1 or ½m)
0.030927835 x 11.06060606 34.2080 %
Calculation of discount 180 / 6000 x 100 = 3 % (1)
   --------------------------- */
function workingCapHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Working Capital Management</h2>
      <div class="mt-2 grid gap-2 md:grid-cols-3">
        <label class="label">Current assets <input id="wc-ca" class="input" /></label>
        <label class="label">Current liabilities <input id="wc-cl" class="input" /></label>
        <label class="label">Inventory (for CCC) <input id="wc-inv" class="input" /></label>
        <label class="label">Cost of goods sold (annual) <input id="wc-cogs" class="input" /></label>
        <label class="label">Average receivables (for DSO) <input id="wc-rec" class="input" /></label>
        <label class="label">Average payables (for DPO) <input id="wc-pay" class="input" /></label>
      </div>
      <div class="mt-2 flex gap-2"><button id="wc-explain" class="btn btn-primary">Explain</button><button id="wc-example" class="btn btn-ghost">Example</button></div>
      <div id="wc-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainWorkingCap(){
  const ca = parseFloat(document.getElementById('wc-ca').value || 0);
  const cl = parseFloat(document.getElementById('wc-cl').value || 0);
  const inv = parseFloat(document.getElementById('wc-inv').value || 0);
  const cogs = parseFloat(document.getElementById('wc-cogs').value || 0);
  const rec = parseFloat(document.getElementById('wc-rec').value || 0);
  const pay = parseFloat(document.getElementById('wc-pay').value || 0);
  const out = document.getElementById('wc-output');
  const nwc = ca - cl;
  // DIO = avg inventory / (COGS/365)
  const dio = cogs === 0 ? null : inv / (cogs / 365);
  const dso = cogs === 0 ? null : rec / (cogs / 365);
  const dpo = cogs === 0 ? null : pay / (cogs / 365);
  const ccc = (dio === null || dso === null || dpo === null) ? null : dio + dso - dpo;
  let html = `<p><strong>Net working capital</strong> = Current assets - Current liabilities = R${fmt(nwc)}</p>`;
  if(dio !== null) html += `<p><strong>Days inventory outstanding (DIO)</strong> = ${fmt(dio)} days</p>`;
  if(dso !== null) html += `<p><strong>Days sales outstanding (DSO)</strong> = ${fmt(dso)} days</p>`;
  if(dpo !== null) html += `<p><strong>Days payables outstanding (DPO)</strong> = ${fmt(dpo)} days</p>`;
  if(ccc !== null) html += `<p class="block"><strong>Cash conversion cycle (CCC)</strong> = DIO + DSO - DPO = ${fmt(ccc)} days</p>`;
  html += `<p class="muted">Interpretation: Positive CCC = cash tied up in operating cycle; lower CCC is usually better.</p>`;
  out.innerHTML = html;
}

/* ---------------------------
   8) Cost-Volume-Profit (break-even)
   QUESTION ONE
Purple Ltd produces special candles in glasses containers for restaurants and packs them in
red boxes that sells for R200 each. The total and per unit budgeted costs to manufacture and
sell 20 000 candles for 2021 are as follows:
Total Per unit
R R
Variable Manufacturing costs
Direct materials 800 000 40
Direct labour 700 000 35
Variable manufacturing overheads 100 000 5
Selling commission (10 % of the selling price) ? ?
Fixed costs
Fixed manufacturing overheads 340 000
Salaries and other operating fixed costs 600 000
Zandisile, the accountant, has omitted the depreciation of R60 000 for the production
equipment.
YOU ARE REQUIRED TO:
1. Prepare Purple Ltd’s Contribution Margin Income Statement for the year ended 31
December 2021.
(6 marks)
2. Calculate the number of glass candles that Purple Ltd must sell to Breakeven in 2021.
(5 marks)
3. Calculate the Margin of Safety (in glasses).
(1 mark)
4. Assume that the Prime costs increases by 10 % calculate the number of glass candles
that Purple Ltd must sell in 2021 to make a Profit of R119 250.
(3 marks)
(SOLUTION)
1. Contribution margin Income Statement for the year ended 31 December 2021
Sales (20 000 x R200) R4 000 000
Less: Variable costs -2 000 000
Direct material (Ingredients) (20 000 x R40) 800 000
Direct labour (20 000 x R35) 700 000
Variable manufacturing overheads (20 000 x R5) 100 000
Selling commission (20 000 x R20) 400 000
Contribution margin 2 000 000
Less: Fixed costs -1 000 000
Fixed manufacturing overheads 340 000
Salaries and other operating fixed costs 600 000
Depreciation 60 000
Net profit R1 000 000
2. Break-even quantity
ALL Fixed costs (R340 000 + 600 000 + 60 000)
Contribution margin per unit
= R1 000 000
100
= 10 000 candles
Contribution margin per unit
Selling price per unit 200
Variable Manufacturing costs: -100
Direct material (Ingredients) 40
Direct labour 35
Variable manufacturing overheads 5
Selling commission (10 % of the selling price) 20
100
3. Margin of safety
Budgeted sales - Breakeven quantity
20 000 – 10 000 = 10 000
4. New breakeven quantity with Target profit
ALL Fixed costs + Target net profit
Contribution margin per unit
= R340 000 + 600 000 + 60 000 + 119 250
100 – 7.5
= 12 100 candles
QUESTION 2
DuraBricks Ltd provided the folllowing information relating to the manufacturer of
bricks.
R R R
Sales (40 000 units at R10) 400 000
Less: Cost of sales Fixed Variable 280 000
Cost of direct materials 60 000
Cost of direct labour 80 000
Manufacturing overheads 100 000 40 000
Gross profit 120 000
Less: Selling and admin costs 30 000 20 000 50 000
Net Profit 70 000
Determine the following:
a. The breakeven point (in units and value)
b. The effect on the breakeven units if there is an
i. Increase of 10 % in the selling price per unit
ii. Increase of 10% in the sales volume
iii. Increase of 10% in the variable costs per unit
iv. Increase of 10% in fixed costs.
Consider each scenario independently
a. The breakeven point (in units and value)
TOTAL PER
UNIT
R R
Sales (40 000 units X 10) 400 000 10
Less: Variable costs (60 000 + 80 000 + 40 000+ 20 000) 200 000 5
Contribution 200 000 5
Breakeven units = total fixed costs / contribution per unit
= 130 000 / 5
= 26 000 units
Breakeven value = 26 000 X R10
= R 260 000
b. i. Increase in selling price unit = R1 + previous contribution per unit R5
= R6 per unit
Breakeven units = 130 000 / 6
= 21 667 units
There is a decrease from 26 000 to 21 667 in the breakeven units
ii . Fixed costs remain unchanged
Contribution per unit remains
unchanged
Therefore: Breakeven units remain unchanged.
iii. Previous contribution per unit
cost per unit of
Breakeven units = R130 000 / R4.50
= 28 889 units
iv. Fixed costs increase by 10 % (R130 000 X 1.1) =
R 143 000 Breakeven units = R 143 000 / R5
= 28 600
There is an increase from 26 000 to 28 600 in the breakeven units.
   --------------------------- */
function cvpHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Cost-Volume-Profit (Break-even)</h2>
      <div class="mt-2 grid gap-2 md:grid-cols-3">
        <label class="label">Fixed costs (FC) <input id="cvp-fc" class="input" /></label>
        <label class="label">Price per unit (P) <input id="cvp-p" class="input" /></label>
        <label class="label">Variable cost per unit (VC) <input id="cvp-vc" class="input" /></label>
      </div>
      <div class="mt-2 flex gap-2"><button id="cvp-explain" class="btn btn-primary">Explain</button><button id="cvp-example" class="btn btn-ghost">Example</button></div>
      <div id="cvp-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainCVP(){
  const FC = parseFloat(document.getElementById('cvp-fc').value || 0);
  const P = parseFloat(document.getElementById('cvp-p').value || 0);
  const VC = parseFloat(document.getElementById('cvp-vc').value || 0);
  const out = document.getElementById('cvp-output');
  if(P <= VC){ out.innerHTML = '<p>Price must exceed variable cost per unit to have a break-even quantity.</p>'; return; }
  const BE_units = FC / (P - VC);
  const BE_revenue = BE_units * P;
  out.innerHTML = `
    <p>Break-even units = \\(\\dfrac{FC}{P - VC} = \\dfrac{${fmt(FC)}}{${fmt(P)} - ${fmt(VC)}} = ${fmt(BE_units)}\\)</p>
    <p>Break-even revenue = ${fmt(BE_revenue)}</p>
    <p class="muted">Explanation: contribution per unit = P - VC. Divide fixed costs by contribution to get units required to cover FC.</p>
  `;
}

/* ---------------------------
   9) Budgeting (variance analysis)
   Allow creation pf Cash Budget
   FurnitureWorld Ltd is a relatively new company that retails both office and household furniture for the
domestic market. The chief executive director (CEO) is concern about the company’s ability to meet its
cash obligations in the coming months. In order to facilitate the preparation of the Cash Budget for the
company, the following estimates are provided to you for the three months ending 30 September 2024:
1. Sales and purchases
July August September
R R R
Total sales 300 000 400 000 500 000
Total purchases (inventory) 120 000 140 000 160 000
2. Of the total sales, 20% are for cash, while 80% are on credit. The company expects to collect cash
from its credit customers (debtors) as follows:
• 60% in the first month after the month of sale.
• 35% in the second month after the month of sale.
• 5% is considered as bad debts (that is, irrecoverable).
3. 40% of the total purchases (of inventory) is on a cash basis, while 60% is on credit. Creditors are paid
in the month following the month of purchase.
4. FurnitureWorld is leasing part of its warehouse to another company and is charging rent of R40 000
per month. The lease runs for one year from 1 April 2024.
5. Salaries and wages are R60 000 per month for July and August 2024 and are expected to increase by
10% from September 2024 going forward. Salaries and wages are payable in the month in which they
are incurred.
6. Operating expenses are R100 000 per month, payable in the month in which they are incurred. The
amount (R100 000) includes depreciation of R20 000 for delivery vehicles.
7. A new delivery van is expected to be purchased on 1 September 2024 for R200 000. A deposit of 25%
is paid on the date of purchase (1 September 2024). The balance (together with interest) is paid in 10
equal instalments of R17 000 each beginning end of September 2024.
8. On 1 September 2024, the company expects to have a bank overdraft of R20 000.
REQUIRED:
1. Prepare a Cash Budget for FurnitureWorld Ltd (Only) for the month of September 2024 using the
available information, and indicate the cash balance at the end of September 2024
   --------------------------- */
function budgetingHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Budgeting — Variance Analysis</h2>
      <p class="mt-2 text-sm opacity-90">Compare budgeted vs actual figures and calculate variances (amount and percent). Indicate favourable (F) vs unfavourable (U).</p>
      <div class="mt-2 grid gap-2 md:grid-cols-3">
        <label class="label">Budgeted amount <input id="bud-budget" class="input" /></label>
        <label class="label">Actual amount <input id="bud-actual" class="input" /></label>
      </div>
      <div class="mt-2 flex gap-2"><button id="bud-explain" class="btn btn-primary">Explain</button><button id="bud-example" class="btn btn-ghost">Example</button></div>
      <div id="bud-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainBudgeting(){
  const bud = parseFloat(document.getElementById('bud-budget').value || 0);
  const act = parseFloat(document.getElementById('bud-actual').value || 0);
  const out = document.getElementById('bud-output');
  const varAmt = act - bud;
  const varPct = bud === 0 ? null : varAmt / bud;
  const label = varAmt >= 0 ? 'Unfavourable (U)' : 'Favourable (F)'; // depends on cost vs revenue; generic assumption: higher actual cost > budget => U
  out.innerHTML = `
    <p>Budgeted: R${fmt(bud)} | Actual: R${fmt(act)}</p>
    <p>Variance (Actual - Budget) = R${fmt(varAmt)} ${varPct !== null ? `(${(varPct*100).toFixed(2)}%)` : '(no percent: budget = 0)'}</p>
    <p><strong>Classification:</strong> ${label}</p>
    <p class="muted">Note: whether a positive variance is favourable depends on whether the line is cost (lower actual is F) or revenue (higher actual is F). Clarify when used in exam answers.</p>
  `;
}

/* ---------------------------
   10) Time Value of Money (PV, FV, annuities)
   Solve these
   --------------------------- */
function tvmHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Time Value of Money (TVM)</h2>
      <p class="mt-2 text-sm opacity-90">Single-sum and annuity calculators; uses period rate in decimal and periods (n).</p>

      <div class="mt-3 grid gap-2 md:grid-cols-3">
        <label class="label">Rate per period (r) <input id="tvm-r" class="input" placeholder="e.g. 0.05" /></label>
        <label class="label">Periods (n) <input id="tvm-n" class="input" placeholder="e.g. 5" /></label>
        <label class="label">Future value (FV) <input id="tvm-fv" class="input" placeholder="e.g. 1000" /></label>
        <label class="label">Payment (PMT) per period <input id="tvm-pmt" class="input" placeholder="annuity payment" /></label>
        <label class="label">Present value (PV) <input id="tvm-pv" class="input" placeholder="or leave blank to compute" /></label>
        <label class="label">Type (0=end,1=begin) <input id="tvm-type" class="input" placeholder="0 or 1" /></label>
      </div>

      <div class="mt-2 flex gap-2"><button id="tvm-pv-btn" class="btn btn-primary">Compute PV</button><button id="tvm-fv-btn" class="btn btn-ghost">Compute FV</button></div>
      <div id="tvm-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainTVMPV(){
  const r = Number(document.getElementById('tvm-r').value || 0);
  const n = Number(document.getElementById('tvm-n').value || 0);
  const fv = Number(document.getElementById('tvm-fv').value || 0);
  const pmt = Number(document.getElementById('tvm-pmt').value || 0);
  const type = Number(document.getElementById('tvm-type').value || 0);
  const pv = PV(r, n, pmt, fv, type);
  const out = document.getElementById('tvm-output');
  out.innerHTML = `
    <p>Using PV formula (payments and final value):</p>
    <p class="block">PV = \\( -\\dfrac{FV + PMT(1+r\\cdot type)\\dfrac{(1+r)^n -1}{r}}{(1+r)^n} = ${fmt(pv)}\\)</p>
    <p class="muted">Note: sign conventions matter. This tool returns PV as the present monetary value (positive means you would receive this today).</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}
function explainTVMFV(){
  const r = Number(document.getElementById('tvm-r').value || 0);
  const n = Number(document.getElementById('tvm-n').value || 0);
  const pv = Number(document.getElementById('tvm-pv').value || 0);
  const pmt = Number(document.getElementById('tvm-pmt').value || 0);
  const type = Number(document.getElementById('tvm-type').value || 0);
  const fv = FV(r, n, pmt, pv, type);
  const out = document.getElementById('tvm-output');
  out.innerHTML = `
    <p>Using FV formula (payments and initial present value):</p>
    <p class="block">FV = \\( -\\left( PV(1+r)^n + PMT(1+r\\cdot type)\\dfrac{(1+r)^n -1}{r} \\right) = ${fmt(fv)} \\)</p>
    <p class="muted">Interpretation: Future value is total accumulated value after n periods.</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   11) Valuation (Perpetuity & Growing perpetuity)
   Question 1.
Green Ltd paid R13 dividend this year. The firm expects the dividend to grow at a constant
rate of 4% each year forever. Investors require an 8% return on this stock.
Required: How much is the intrinsic price of this share?
Question 2
The company paid a dividend of R4.50 in the last period; however, the company’s dividends
have been reduced each year by 6%. This trend is expected to continue in the future.
Required: As an investor, what is the most price you are willing to pay for this stock if your
required rate of return is 12%?
Question 3
Sindy Ltd just paid a dividend of R2.15 last year. The company is expected to grow at a
steady rate of 5 percent for the next several years.
Required: If shares such as these require a rate of return of 15 percent, what should be the
market value of the shares?
Question 4
A non –redeemable bond that has a face value of R300 and pays a coupon rate of 7%. The
current yield to maturity for similar bonds is 4%.
Required: Calculate the price you will pay for this bond
Question 5
Purple Ltd issued a bond with a face value of R100 and pays an annual coupon of 15%, and it
is redeemable in 5 years’ time. Similar bonds have a market yield of 10%.
Required: How much will you be willing to pay for this bond?
Question 6
White Ltd has issued a bond with a face value of R1000. This is a three-year bond that pays a
coupon of 6.10%. Coupon payments are made semi-annually.
Required: Given the market rate of interest of 5.8%, what is the market value of the bond?
How much will you be willing to pay for this bond?
Question 7
Brown Ltd issued bond-paying coupons annually. The bond has a par value of R800 and is
now left with 12 years to maturity, and a coupon rate is R8%.
Required: Calculate the prices of the bond today, assuming bonds are trading at a yield of
8%, 6%, and 10%. Interpret your calculation by stating whether each bond is selling at a
premium or at a discount or at pa
   Question 1.
𝐷0 = 13, R = 8%, G= 4%
𝑃0 = 𝐷1
𝑅 − 𝑔
𝐶𝑎𝑙𝑐𝑢𝑙𝑎𝑡𝑒 𝐷1 = 𝐷0 𝑋 (1 + 𝑔)
𝐷1 = 13 (1 + 0.04) = R13.52
= 13.52
0.08 − 0.04
= 13.52
0.04
= R338
Question 2.
𝑃0 = 𝐷1
𝑅 − 𝑔
𝐶𝑎𝑙𝑐𝑢𝑙𝑎𝑡𝑒 𝐷1 = 𝐷0 𝑋 (1 + 𝑔)
𝐷1 =4.50 (1 − 0.06)
= 4.23
0.12 − (−0.06)
= 4.23
0.18
= R23.50
Question 3.
D0 = R2.15; g = 5%; R = 15%
𝑃0 = 𝐷1
𝑅−𝑔 = 𝐷0 (1+𝑔)
𝑅−𝑔
𝑅2.15 (1.05)
0.15−0.05
= R22.58
Question 4
𝑃𝐵 = 𝐶
𝑖 ; C = coupon payment = R300 x 7% = R21; I = 4%
𝑃𝐵 = 𝑅21
0.04
= R525.
Question 5
𝑃𝐵 = 𝐶 [
1 − 1
(1 + 𝑖)𝑛𝑚
𝑖 ] + 𝐹 [ 1
(1 + 𝑖)𝑛]
C = R100 x 15% =R15; I= 0.10; F =100; N = 5
𝑃𝐵 = 𝑅15𝑥(1− 1
(1+0.10)5
0.10 ) +100𝑥( 1
(1+0.10)5)
= 𝑅15𝑥(1− 1
(1,61051
0.10 )+100𝑥( 1
(1,61051))
= 𝑅15𝑥(1−0.620921323
0.10 )+100𝑥(0.620921323)
= 15 (3.79078677) + 100 (0.620921323)
= 56.86180155 + 62.0921323
= R118.95
OR
PB= R15 x PVIFA5; 10% + R100 x PVIF5; 10%
= 15 x 3.791 + 100 x 0.621
= 56.865 + 62.10
= R118.97
Question 6
N = 3
C = R1000 (6.1%/2) = R30.50
M = 2
Semi-annual coupon = R 1 000 x (0.061/2) = R30.50
I = 5.8%/2 = 0.029
𝑃𝐵 = 𝐶/𝑚 [
1 − 1
(1 + 𝑖/𝑚)𝑛𝑚
𝑖/𝑚 ] + 𝐹 [ 1
(1 + 𝑖/𝑚)𝑛𝑚]
𝑃𝐵 = 30.50 [ 1− 1
(1.029)6
0.029 ] +1000𝑥 ( 1
(1.029 ) 6 )
= R165.77 + R842.38
= R1008.15
Question 7
N = 12
C = 800 x 8% = R64
I= 8%, 6%, 10
FV = R800
Bond price assuming a yield of 8%
𝑃𝐵 = 𝐶 [
1 − 1
(1 + 𝑖)𝑛
𝑖 ] + 𝐹 [ 1
(1 + 𝑖)𝑛]
𝑃𝐵 = 64 [
1 − 1
(1 + 0.08)12
0.08 ] + 800 [ 1
(1 + 0.08)12]
= 64 [1− 1
2.5182
0.08 ] + 800 𝑥 [ 1
2.5182]
= 64 (1-0.3971/0.08) + 800 x (0.3971)
= 482.32 + 317.68
= R800
Bond price assuming a yield of 6%
𝑃𝐵 = 64 [
1 − 1
(1 + 0.06)12
0.06 ] + 800 [ 1
(1 + 0.06)12]
= 64 [1− 1
2.0121
0.06 ] + 800 [ 1
2.0121 ]
= 64 (1- 0.4970/0.06) + 800 x (0.4970)
= 536.5406 + 397.6
= R934.14
Bond price assuming a yield of 10%
𝑃𝐵 = 64 [
1 − 1
(1 + 0.10)12
0.10 ] + 800 𝑥 [ 1
(1 + 0.10)12]
= 64 [1− 1
3.1384
0.10 ] + 800 𝑥 [ 1
3.1384 ]
= 64 x (1- 0.3186 /0.10) + 800x (0.3186)
= 436.0744 + 254.9070
= R690.98
   --------------------------- */
function valuationHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Valuation — Perpetuity & Growing Perpetuity</h2>
      <div class="mt-2 grid gap-2 md:grid-cols-3">
        <label class="label">Cash flow (C) next period <input id="val-c" class="input" /></label>
        <label class="label">Discount rate (r) <input id="val-r" class="input" /></label>
        <label class="label">Growth rate (g) (0 for constant perpetuity) <input id="val-g" class="input" /></label>
      </div>
      <div class="mt-2 flex gap-2"><button id="val-explain" class="btn btn-primary">Explain</button><button id="val-example" class="btn btn-ghost">Example</button></div>
      <div id="val-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainValuation(){
  const C = parseFloat(document.getElementById('val-c').value || NaN);
  const r = parseFloat(document.getElementById('val-r').value || NaN);
  const g = parseFloat(document.getElementById('val-g').value || 0);
  const out = document.getElementById('val-output');
  if(isNaN(C) || isNaN(r)){ out.innerHTML = '<p>Enter cash flow C and discount rate r.</p>'; return; }
  if(g === 0){
    const pv = C / r;
    out.innerHTML = `
      <p>Perpetuity (constant cash flow): $PV = \\dfrac{C}{r} = \\dfrac{${fmt(C)}}{${fmt(r)}} = ${fmt(pv)}</p>
      <p class="muted">A perpetuity is a constant cash flow forever. Works if r &gt; 0.</p>
    `;
  } else {
    if(r <= g){ out.innerHTML = '<p>For a growing perpetuity r must be greater than g.</p>'; return; }
    const pv = C / (r - g);
    out.innerHTML = `
      <p>Growing perpetuity: $PV = \\dfrac{C}{r - g} = \\dfrac{${fmt(C)}}{${fmt(r)} - ${fmt(g)}} = ${fmt(pv)}</p>
      <p class="muted">C is the payment next period (not the payment today). Ensure consistent timing.</p>
    `;
  }
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   12) Capital Budgeting — NPV & IRR
   A) AR – THE AVERAGE RETURN
PROJECT A PROJECT B
𝐶𝐶0 = R500 000 (Investment)
𝐶𝐶𝑡𝑡 = 100 000 , 150 000, 250 000, 400 000
N = 4 years
𝐶𝐶0 = R500 000 (Investment)
𝐶𝐶𝑡𝑡 = 250 000, 200 000, 150 000, 100 000
N = 4 years
𝐴𝐴𝐴𝐴𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑡𝑡𝑝𝑝
= ( 100 000 + 150 000 + 250 000 + 400 000) /4 x 100
500 000 1
𝐴𝐴𝐴𝐴𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑝𝑡𝑡𝑝𝑝
= (250 000 + 200 000 + 150 000 + 100 000) /4 x 100
500 000 1
= 225 000 x 100
500 000
= 175 000 x 100
500 000
= 0.45 or 45% = 0.35 or 35%
Interpretation
 Both projects would be acceptable since both ARs exceed the cost of capital of 10%
 Project A offers a higher return than Project B, so choose Project A
 Both projects require the same capital
 Project A cash flows are lower at the beginning of the project
 Project B requires cash flows are larger at the beginning of the investment
 The sooner the cash flows are received, the greater the return on the investment
B) PBP - PAYBACK PERIOD
Year Nature of cash
flow
PROJECT A
cash flows
Cumulative cash flows
0 Outflow -R500 000 -R500 000
1 Inflow R100 000 -R400 000 (-500 000 + 100 000)
2 Inflow R150 000, -R250 000 (-400 000 + 150 000)
3 Inflow R250 000, 0 (- 250 000 + 250 000)
= 3 years
4 Inflow R400 000
Page 2 of 4
Year Nature of cash
flow
PROJECT B
cash flows
Cumulative cash flows
0 Outflow -R500 000 -R500 000
1 Inflow 250 000, -R250 000 (-500 000 + 250 000)
2 Inflow 200 000 -R50 000 (-250 000 + 200 000)
3 Inflow 150 000 In the 3 rd year, we need R50 000 only,
not R150 000 to recover the
investment capital of R500 000
= 2 years + 50 000
150 000
= 2.33 years
4 Inflow 100 000
Interpretation
 Project B is preferred because it has a shorter recovery period than Project A.
 The investor would recover the invested capital more quickly by investing in Project
B.
C) DPB - DISCOUNTED PAYBACK PERIOD
Year Nature of
cash flow
PROJECT A
cash flows
Present value of cash flow
Cash flow discounted at i =
20%
Cumulative cash flows
0 Outflow -R500 000 -R500 000
1 Inflow R100 000 𝐶𝐶t
(1+𝑖𝑖)𝑡𝑡 = 100 000
(1+0,20)1 = 100 000
1,2 =
83 333
-R416 667 ( -500 000 + 83 333)
2 Inflow R150 000, 150 000
(1+0,20)2 = 150 000
1,44 = 104 167 -R312 500 (- 416 667 + 104 167)
3 Inflow R250 000, 250 000
(1+0,20)3 = 250 000
1,728 = 144 676 -R167 824 (-312 500 + 144 676)
4 Inflow R400 000 400 000
(1+0,20)4 = 400 000
2,0736 = 192 901 In the 4th year, the investor needs
R167 824 only, not R192 901 to
recover the investment capital of
R500 000
= 3 years + 167 824
192 901
= 3.87 years
DCF = 𝐶𝐶t
(1+𝑖𝑖)𝑡𝑡
Page 3 of 4
Year Nature of
cash flow
PROJECT B
cash flows
Present value of cash flow
Cash flow discounted at i =
20%
Cumulative cash flows
0 Outflow -R500 000 -R500 000
1 Inflow 250 000, 𝐶𝐶t
(1+𝑖𝑖)𝑡𝑡 = 250 000
(1+0,20)1 = 250 000
1,2
= 208 333
-R291 667 (-500 000 + 208 333)
2 Inflow 200 000 200 000
(1+0,20)2 = 200 000
1,44 = 138 889 -152 778 (-291 667 + 138 889)
3 Inflow 150 000 150 000
(1+0,20)3 = 150 000
1,728 = 86 806 -65 972 (-152 778 + 86 806)
4 Inflow 100 000 100 000
(1+0,20)4 = 100 000
2,0736 = 48 225 -17 757 (-65 872 + 48225)
Capital is NOT recovered at the
end of the project
= +4years
Interpretation
 DPB method yields larger values, This is because the discounted cash flows are lower
than the cash flows, therefore it will take longer to recover the capital compared to
PBP
 Project A is preferred because it has a shorter recovery period than Project B.
 The investor will not recover the capital if project B is chos
   --------------------------- */
function capBudHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Capital Budgeting — NPV & IRR</h2>
      <p class="mt-2 text-sm opacity-90">Enter cash flows for periods 0..n as comma-separated values (e.g. -100000,30000,40000,50000).</p>
      <div class="mt-2 grid gap-2 md:grid-cols-2">
        <label class="label">Discount rate (r) <input id="cb-r" class="input" placeholder="e.g. 0.12" /></label>
        <label class="label">Cash flows (CSV) <input id="cb-cfs" class="input" placeholder="-100000,30000,40000,50000" /></label>
      </div>
      <div class="mt-2 flex gap-2"><button id="cb-explain" class="btn btn-primary">Compute NPV & IRR</button><button id="cb-example" class="btn btn-ghost">Example</button></div>
      <div id="cb-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainCapBud(){
  const r = parseFloat(document.getElementById('cb-r').value || NaN);
  const cfsStr = document.getElementById('cb-cfs').value || '';
  const out = document.getElementById('cb-output');
  if(isNaN(r) || cfsStr.trim() === ''){ out.innerHTML = '<p>Enter discount rate and cash flows.</p>'; return; }
  const cfs = cfsStr.split(',').map(s=>parseFloat(s.trim())).filter(x=>!isNaN(x));
  const npv = NPV(r, cfs);
  const irr = IRR(cfs);
  out.innerHTML = `
    <p><strong>Cash flows</strong>: [${cfs.join(', ')}]</p>
    <p>NPV at r=${fmt(r)}: ${fmt(npv)}</p>
    <p>Interpretation: If NPV &gt; 0 accept the project (project adds value).</p>
    <p>IRR (internal rate of return): ${irr === null ? 'Unable to compute (non-standard cash flow pattern or iteration failed)' : fmt(irr)}</p>
    <p class="muted">IRR is the discount rate that makes NPV = 0. Use NPV for mutually exclusive projects.</p>
  `;
}

/* ---------------------------
   Binding events for topics
   --------------------------- */
function bindTopicEvents(topic){
  // attach universal help buttons (simple)
  document.querySelectorAll('.help').forEach(h => {
    h.onclick = (e) => {
      e.stopPropagation();
      const p = document.createElement('div'); p.className = 'help-popup'; p.textContent = 'Click Explain to show step-by-step. All formulas are shown and explained in-line.';
      const parent = h.closest('.label') || h.parentElement;
      parent.style.position = 'relative';
      // remove any existing popups
      parent.querySelectorAll('.help-popup').forEach(n=>n.remove());
      parent.appendChild(p);
      p.style.top = '120%';
      p.style.left = '0';
      setTimeout(()=> p.remove(), 4200);
    };
  });

  // Topic-specific bindings
  if(topic === 'acc_eq'){
    document.getElementById('acc-explain').onclick = explainAccEq;
    document.getElementById('acc-example').onclick = ()=>{ document.getElementById('acc-A').value=''; document.getElementById('acc-E').value='15000'; document.getElementById('acc-L').value='5000'; explainAccEq(); };
  }

  if(topic === 'sources_capcost'){
    document.getElementById('dgm-explain').onclick = explainDGM;
    document.getElementById('dgm-example').onclick = ()=>{ document.getElementById('dgm-d0').value='2.00'; document.getElementById('dgm-g').value='0.04'; document.getElementById('dgm-r').value='0.09'; explainDGM(); };
    document.getElementById('capm-explain').onclick = explainCAPM;
    document.getElementById('capm-example').onclick = ()=>{ document.getElementById('capm-rf').value='0.06'; document.getElementById('capm-beta').value='1.2'; document.getElementById('capm-rm').value='0.12'; explainCAPM(); };
    document.getElementById('wacc-explain').onclick = explainWACC;
    document.getElementById('wacc-example').onclick = ()=>{ document.getElementById('wacc-e').value='500000'; document.getElementById('wacc-d').value='200000'; document.getElementById('wacc-re').value='0.12'; document.getElementById('wacc-rd').value='0.07'; document.getElementById('wacc-tc').value='0.28'; explainWACC(); };
  }

  if(topic === 'record_txn'){
    document.getElementById('je-add').onclick = addJournalEntry;
    document.getElementById('je-post').onclick = postToLedger;
    document.getElementById('je-trial').onclick = showTrialBalance;
    renderJournalList();
  }

  if(topic === 'adj_fs'){
    document.getElementById('adj-explain').onclick = explainAdjustments;
    document.getElementById('adj-example').onclick = ()=>{ document.getElementById('adj-accrued').value='1200'; document.getElementById('adj-prepaid').value='500'; explainAdjustments(); };
    document.getElementById('dep-explain').onclick = explainDepreciation;
    document.getElementById('dep-example').onclick = ()=>{ document.getElementById('dep-cost').value='10000'; document.getElementById('dep-res').value='1000'; document.getElementById('dep-life').value='5'; explainDepreciation(); };
  }

  if(topic === 'ratios'){
    document.getElementById('rat-explain').onclick = explainRatios;
    document.getElementById('rat-example').onclick = ()=> {
      document.getElementById('rat-current-assets').value='150000';
      document.getElementById('rat-inventory').value='30000';
      document.getElementById('rat-current-liab').value='60000';
      document.getElementById('rat-sales').value='500000';
      document.getElementById('rat-cogs').value='300000';
      document.getElementById('rat-netincome').value='50000';
      document.getElementById('rat-totalassets').value='400000';
      document.getElementById('rat-equity').value='200000';
      explainRatios();
    };
  }

  if(topic === 'invest_risk'){
    attachInvestHandlers();
    document.getElementById('inv-explain').onclick = explainInvest;
    // default one state
    document.querySelectorAll('.inv-prob')[0].value='1.0';
    document.querySelectorAll('.inv-ret')[0].value='0.08';
  }

  if(topic === 'working_cap'){
    document.getElementById('wc-explain').onclick = explainWorkingCap;
    document.getElementById('wc-example').onclick = ()=>{ document.getElementById('wc-ca').value='120000'; document.getElementById('wc-cl').value='80000'; document.getElementById('wc-inv').value='30000'; document.getElementById('wc-cogs').value='240000'; document.getElementById('wc-rec').value='45000'; document.getElementById('wc-pay').value='20000'; explainWorkingCap(); };
  }

  if(topic === 'cost_cv'){
    document.getElementById('cvp-explain').onclick = explainCVP;
    document.getElementById('cvp-example').onclick = ()=>{ document.getElementById('cvp-fc').value='50000'; document.getElementById('cvp-p').value='50'; document.getElementById('cvp-vc').value='30'; explainCVP(); };
  }

  if(topic === 'budgeting'){
    document.getElementById('bud-explain').onclick = explainBudgeting;
    document.getElementById('bud-example').onclick = ()=>{ document.getElementById('bud-budget').value='20000'; document.getElementById('bud-actual').value='18500'; explainBudgeting(); };
  }

  if(topic === 'tvm'){
    document.getElementById('tvm-pv-btn').onclick = explainTVMPV;
    document.getElementById('tvm-fv-btn').onclick = explainTVMFV;
  }

  if(topic === 'valuation'){
    document.getElementById('val-explain').onclick = explainValuation;
    document.getElementById('val-example').onclick = ()=>{ document.getElementById('val-c').value='5'; document.getElementById('val-r').value='0.10'; document.getElementById('val-g').value='0.03'; explainValuation(); };
  }

  if(topic === 'capbud'){
    document.getElementById('cb-explain').onclick = explainCapBud;
    document.getElementById('cb-example').onclick = ()=>{ document.getElementById('cb-r').value='0.12'; document.getElementById('cb-cfs').value='-100000,30000,40000,50000'; explainCapBud(); };
  }
}

/* Default topic */
renderTopic('tvm');
