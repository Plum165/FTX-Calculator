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
   4) Adjustments & FS — integrated with Ledger & Trial Balance
   Accruals, Prepayments, Depreciation
   --------------------------- */
function adjustmentsHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Adjustments & Annual Financial Statements</h2>
      <p class="mt-2 text-sm opacity-90">
        Record year-end adjustments (accruals, prepayments, depreciation).
        Adjustments will automatically post journal entries and update your Trial Balance.
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
          </div>
          <div id="dep-output" class="mt-2 steps"></div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------
   5) Financial Ratios
   Full interactive ratio calculator with grouped dropdown,
   category descriptions, worked examples, formulas, and explanations.
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

      <div id="category-description" class="mt-2 text-sm text-gray-600"></div>

      <div id="ratio-inputs" class="mt-3 grid gap-2 md:grid-cols-3"></div>

      <div class="mt-3 flex gap-2">
        <button id="rat-explain" class="btn btn-primary">Compute</button>
        <button id="rat-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="rat-output" class="mt-3 steps"></div>
    </div>
  `;
}

/* Ratio definitions with categories */
const ratioDefs = {
  categoryDescriptions: {
    "solvency": "Measures the company's ability to meet long-term obligations.",
    "nav": "Shows the value of shareholders’ equity per share.",
    "current": "Assesses short-term liquidity and ability to meet current liabilities.",
    "quick": "Measures immediate liquidity excluding inventory.",
    "inv-days": "Indicates average number of days inventory is held before sale.",
    "inv-turnover": "Shows how many times inventory is sold and replaced over a period.",
    "ar-days": "Average days to collect receivables from customers.",
    "ap-days": "Average days to pay suppliers.",
    "total-asset-turn": "Efficiency of using assets to generate sales.",
    "fixed-asset-turn": "Efficiency of using fixed assets to generate sales.",
    "debt-ratio": "Proportion of assets financed by debt.",
    "debt-equity": "Shows leverage in terms of debt vs equity.",
    "times-interest": "Ability to cover interest payments from operating profit.",
    "cash-coverage": "Ability to cover interest using cash generated from operations.",
    "gross-margin": "Percentage of revenue remaining after COGS.",
    "oper-margin": "Percentage of revenue remaining after operating expenses.",
    "net-margin": "Percentage of revenue remaining as net profit.",
    "roa": "Return generated from total assets.",
    "roe": "Return generated from shareholders’ equity.",
    "dy": "Income return on investment from dividends.",
    "hpr": "Total return earned over the holding period.",
    "eps": "Profit allocated per share.",
    "div-cover": "How many times earnings cover dividends.",
    "payout": "Percentage of earnings distributed as dividends.",
    "retention": "Percentage of earnings retained for reinvestment.",
    "pe": "Market valuation of earnings.",
    "ey": "Inverse of P/E; shows earnings yield as a percentage."
  },
  solvency: {
    label:"Solvency Ratio",
    formula:"Total Assets ÷ Total Liabilities",
    inputs:["Total assets","Total liabilities"],
    example:{vals:[200000,120000],calc:"200000/120000 = 1.67",explain:"For every R1 of liability, the business has R1.67 in assets."}
  },
  nav: {
    label:"Net Asset Value",
    formula:"(Total Assets - Total Liabilities) ÷ Shares Outstanding",
    inputs:["Total assets","Total liabilities","Number of shares"],
    example:{vals:[500000,200000,10000],calc:"(500000-200000)/10000=30",explain:"Each share represents R30 in net assets."}
  },
  current: {
    label:"Current Ratio",
    formula:"Current Assets ÷ Current Liabilities",
    inputs:["Current assets","Current liabilities"],
    example:{vals:[100000,50000],calc:"100000/50000=2.0",explain:"R2 of current assets per R1 of liability."}
  },
  quick: {
    label:"Quick Ratio (Acid Test)",
    formula:"(Current Assets - Inventory) ÷ Current Liabilities",
    inputs:["Current assets","Inventory","Current liabilities"],
    example:{vals:[80000,20000,40000],calc:"(80000-20000)/40000=1.5",explain:"Quick assets cover short-term liabilities 1.5 times."}
  },
  "inv-days": {
    label:"Days Inventory on Hand",
    formula:"365 ÷ Inventory Turnover",
    inputs:["COGS","Average inventory"],
    example:{vals:[60000,10000],calc:"Inv turnover=60000/10000=6; Days=365/6=61",explain:"Inventory is held ~61 days before sale."}
  },
  "inv-turnover": {
    label:"Inventory Turnover",
    formula:"COGS ÷ Average Inventory",
    inputs:["COGS","Average inventory"],
    example:{vals:[60000,10000],calc:"60000/10000=6",explain:"Stock turns over 6 times a year."}
  },
  "ar-days": {
    label:"Receivables Collection Period",
    formula:"(Accounts Receivable ÷ Credit Sales) × 365",
    inputs:["Accounts receivable","Credit sales"],
    example:{vals:[20000,120000],calc:"20000/120000×365=61 days",explain:"On average, debtors pay in 61 days."}
  },
  "ap-days": {
    label:"Payables Payment Period",
    formula:"(Accounts Payable ÷ Purchases) × 365",
    inputs:["Accounts payable","Purchases"],
    example:{vals:[15000,90000],calc:"15000/90000×365=61 days",explain:"On average, creditors are paid after 61 days."}
  },
  "total-asset-turn": {
    label:"Total Asset Turnover",
    formula:"Sales ÷ Total Assets",
    inputs:["Sales","Total assets"],
    example:{vals:[200000,100000],calc:"200000/100000=2",explain:"Every R1 of assets generates R2 sales."}
  },
  "fixed-asset-turn": {
    label:"Fixed Asset Turnover",
    formula:"Sales ÷ Net Fixed Assets",
    inputs:["Sales","Net fixed assets"],
    example:{vals:[200000,50000],calc:"200000/50000=4",explain:"Each R1 of fixed assets generates R4 in sales."}
  },
  "debt-ratio": {
    label:"Debt Ratio",
    formula:"Total Liabilities ÷ Total Assets",
    inputs:["Total liabilities","Total assets"],
    example:{vals:[40000,100000],calc:"40000/100000=0.4",explain:"40% of assets are financed by debt."}
  },
  "debt-equity": {
    label:"Debt-to-Equity Ratio",
    formula:"Total Liabilities ÷ Total Equity",
    inputs:["Total liabilities","Total equity"],
    example:{vals:[60000,90000],calc:"60000/90000=0.67",explain:"R0.67 debt per R1 equity."}
  },
  "times-interest": {
    label:"Times Interest Earned",
    formula:"EBIT ÷ Interest Expense",
    inputs:["EBIT","Interest expense"],
    example:{vals:[50000,10000],calc:"50000/10000=5",explain:"Operating profit covers interest 5 times."}
  },
  "cash-coverage": {
    label:"Cash Coverage Ratio",
    formula:"(EBIT + Depreciation) ÷ Interest Expense",
    inputs:["EBIT","Depreciation","Interest expense"],
    example:{vals:[50000,5000,10000],calc:"(50000+5000)/10000=5.5",explain:"Cash covers interest 5.5 times."}
  },
  "gross-margin": {
    label:"Gross Profit Margin",
    formula:"(Sales - COGS) ÷ Sales",
    inputs:["Sales","COGS"],
    example:{vals:[120000,60000],calc:"(120000-60000)/120000=0.5=50%",explain:"50% of sales remains after COGS."}
  },
  "oper-margin": {
    label:"Operating Margin",
    formula:"Operating Profit ÷ Sales",
    inputs:["Operating profit","Sales"],
    example:{vals:[40000,200000],calc:"40000/200000=0.2=20%",explain:"20% operating profit margin."}
  },
  "net-margin": {
    label:"Net Profit Margin",
    formula:"Net Profit ÷ Sales",
    inputs:["Net profit","Sales"],
    example:{vals:[30000,200000],calc:"30000/200000=0.15=15%",explain:"15% of sales is retained as net profit."}
  },
  roa: {
    label:"Return on Assets (ROA)",
    formula:"Net Income ÷ Total Assets",
    inputs:["Net income","Total assets"],
    example:{vals:[20000,100000],calc:"20000/100000=0.2=20%",explain:"20% return on total assets."}
  },
  roe: {
    label:"Return on Equity (ROE)",
    formula:"Net Income ÷ Equity",
    inputs:["Net income","Equity"],
    example:{vals:[20000,50000],calc:"20000/50000=0.4=40%",explain:"40% return on equity."}
  },
  dy: {
    label:"Dividend Yield",
    formula:"Dividend per Share ÷ Share Price",
    inputs:["Dividend per share","Share price"],
    example:{vals:[2,40],calc:"2/40=0.05=5%",explain:"Shareholders earn 5% income yield."}
  },
  hpr: {
    label:"Holding Period Return",
    formula:"(Ending Price - Beginning Price + Dividends) ÷ Beginning Price",
    inputs:["Beginning price","Ending price","Dividends received"],
    example:{vals:[50,60,2],calc:"(60-50+2)/50=0.24=24%",explain:"Return over the holding period = 24%."}
  },
  eps: {
    label:"Earnings per Share (EPS)",
    formula:"Net Income ÷ Shares Outstanding",
    inputs:["Net income","Shares outstanding"],
    example:{vals:[100000,50000],calc:"100000/50000=2",explain:"Each share earns R2 profit."}
  },
  "div-cover": {
    label:"Dividend Cover",
    formula:"Earnings per Share ÷ Dividend per Share",
    inputs:["EPS","DPS"],
    example:{vals:[4,2],calc:"4/2=2",explain:"Earnings cover dividends 2 times."}
  },
  payout: {
    label:"Payout Ratio",
    formula:"Dividends ÷ Net Income",
    inputs:["Dividends","Net income"],
    example:{vals:[20000,50000],calc:"20000/50000=0.4=40%",explain:"40% of profits paid as dividends."}
  },
  retention: {
    label:"Retention Ratio",
    formula:"1 - Payout Ratio",
    inputs:["Dividends","Net income"],
    example:{vals:[20000,50000],calc:"1-(20000/50000)=0.6=60%",explain:"60% profits retained for reinvestment."}
  },
  pe: {
    label:"Price/Earnings Ratio",
    formula:"Share Price ÷ Earnings per Share",
    inputs:["Share price","EPS"],
    example:{vals:[30,5],calc:"30/5=6",explain:"Investors pay R6 per R1 of earnings."}
  },
  ey: {
    label:"Earnings Yield",
    formula:"EPS ÷ Share Price",
    inputs:["EPS","Share price"],
    example:{vals:[5,30],calc:"5/30=0.167=16.7%",explain:"Inverse of P/E; earnings yield 16.7%."}
  }
};

/* Utility function to format numbers */
function fmt(n, dec = 2) { return parseFloat(n.toFixed(dec)); }

/* Render input fields dynamically */
document.addEventListener("change", e => {
  if (e.target.id === "ratio-select") {
    const sel = e.target.value;
    const def = ratioDefs[sel];
    const inputDiv = document.getElementById('ratio-inputs');
    const catDiv = document.getElementById('category-description');
    inputDiv.innerHTML = "";
    catDiv.innerHTML = ratioDefs.categoryDescriptions[sel] || "";

    if (def) {
      def.inputs.forEach((lbl, i) => {
        inputDiv.innerHTML += `<label class="label">${lbl}<input id="ratio-in-${i}" class="input"/></label>`;
      });
    }
  }
});

/* Compute ratio */
function explainRatios() {
  const sel = document.getElementById('ratio-select').value;
  const def = ratioDefs[sel];
  if (!def) { document.getElementById('rat-output').innerHTML = "<p>Please select a ratio.</p>"; return; }

  const vals = def.inputs.map((lbl, i) => parseFloat(document.getElementById(`ratio-in-${i}`).value || 0));
  let result = "N/A";
  try {
    switch (sel) {
      case "solvency": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "nav": result = vals[2] === 0 ? "N/A" : fmt((vals[0]-vals[1])/vals[2]); break;
      case "current": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "quick": result = vals[2] === 0 ? "N/A" : fmt((vals[0]-vals[1])/vals[2]); break;
      case "inv-days": {
        const turnover = vals[1] === 0 ? 0 : vals[0]/vals[1];
        result = turnover === 0 ? "N/A" : fmt(365/turnover) + " days"; break;
      }
      case "inv-turnover": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "ar-days": result = vals[1] === 0 ? "N/A" : fmt((vals[0]/vals[1])*365) + " days"; break;
      case "ap-days": result = vals[1] === 0 ? "N/A" : fmt((vals[0]/vals[1])*365) + " days"; break;
      case "total-asset-turn": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "fixed-asset-turn": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "debt-ratio": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "debt-equity": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "times-interest": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "cash-coverage": result = vals[2] === 0 ? "N/A" : fmt((vals[0]+vals[1])/vals[2]); break;
      case "gross-margin": result = vals[0] === 0 ? "N/A" : fmt((vals[0]-vals[1])/vals[0]*100,2)+"%"; break;
      case "oper-margin": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
      case "net-margin": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
      case "roa": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
      case "roe": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
      case "dy": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
      case "hpr": result = vals[0] === 0 ? "N/A" : fmt((vals[1]-vals[0]+vals[2])/vals[0]*100,2)+"%"; break;
      case "eps": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "div-cover": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "payout": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
      case "retention": result = vals[1] === 0 ? "N/A" : fmt((1-vals[0]/vals[1])*100,2)+"%"; break;
      case "pe": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]); break;
      case "ey": result = vals[1] === 0 ? "N/A" : fmt(vals[0]/vals[1]*100,2)+"%"; break;
    }
  } catch(e) { result="Error"; }

  document.getElementById('rat-output').innerHTML = `
    <p><strong>${def.label}</strong></p>
    <p>Formula: ${def.formula}</p>
    <p>Result: ${result}</p>
    <p class="muted">Interpretation: ${def.example.explain}</p>
  `;
}

/* Fill example values */
function fillExample() {
  const sel = document.getElementById('ratio-select').value;
  const def = ratioDefs[sel];
  if(!def) return;
  def.example.vals.forEach((v,i)=>{
    const input = document.getElementById(`ratio-in-${i}`);
    if(input) input.value = v;
  });
  explainRatios();
}

/* Mount module to container */
function mountRatioModule(container){
  if(!container) return;
  container.innerHTML = ratiosHTML();
  // Trigger initial inputs rendering
  const select = container.querySelector('#ratio-select');
  select.dispatchEvent(new Event('change'));

  container.querySelector('#rat-explain').addEventListener('click', explainRatios);
  container.querySelector('#rat-example').addEventListener('click', fillExample);
}

/* Optional: auto-mount if div with id="ratio-module" exists */
document.addEventListener("DOMContentLoaded", ()=>{
  const container = document.getElementById("ratio-module");
  if(container) mountRatioModule(container);
});



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
   7) Working Capital Management (NWC & Cash Conversion Cycle)
   - Net Working Capital
   - DIO, DSO, DPO
   - Cash Conversion Cycle
   - Early payment discount interpretation
   --------------------------- */
function workingCapHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Working Capital Management</h2>
      <p class="mt-2 text-sm opacity-90">
        Calculate net working capital and analyze the cash conversion cycle (CCC).
        Inputs should be yearly averages where possible.
      </p>

      <div class="mt-3 grid gap-2 md:grid-cols-3">
        <label class="label">Current assets <input id="wc-ca" class="input" /></label>
        <label class="label">Current liabilities <input id="wc-cl" class="input" /></label>
        <label class="label">Average inventory <input id="wc-inv" class="input" /></label>
        <label class="label">Cost of goods sold (annual) <input id="wc-cogs" class="input" /></label>
        <label class="label">Average receivables <input id="wc-rec" class="input" /></label>
        <label class="label">Credit sales (annual) <input id="wc-sales" class="input" /></label>
        <label class="label">Average payables <input id="wc-pay" class="input" /></label>
      </div>

      <div class="mt-3 flex gap-2">
        <button id="wc-explain" class="btn btn-primary">Compute</button>
        <button id="wc-example" class="btn btn-ghost">Example</button>
      </div>

      <div id="wc-output" class="mt-4 steps"></div>
    </div>
  `;
}

function explainWorkingCap(){
  const ca = parseFloat(document.getElementById('wc-ca').value || 0);
  const cl = parseFloat(document.getElementById('wc-cl').value || 0);
  const inv = parseFloat(document.getElementById('wc-inv').value || 0);
  const cogs = parseFloat(document.getElementById('wc-cogs').value || 0);
  const rec = parseFloat(document.getElementById('wc-rec').value || 0);
  const sales = parseFloat(document.getElementById('wc-sales').value || 0);
  const pay = parseFloat(document.getElementById('wc-pay').value || 0);

  const out = document.getElementById('wc-output');
  let html = "";

  // Net working capital
  const nwc = ca - cl;
  html += `<p><strong>Net working capital (NWC)</strong> = Current assets - Current liabilities = R${fmt(nwc)}</p>`;

  // Formulas:
  // DIO = Inventory × 365 / COGS
  const dio = cogs === 0 ? null : inv * 365 / cogs;
  // DSO = Receivables × 365 / Credit sales
  const dso = sales === 0 ? null : rec * 365 / sales;
  // DPO = Payables × 365 / COGS
  const dpo = cogs === 0 ? null : pay * 365 / cogs;

  if(dio !== null) html += `<p><strong>Days Inventory Outstanding (DIO)</strong> = Inventory × 365 / COGS = ${fmt(dio)} days</p>`;
  if(dso !== null) html += `<p><strong>Days Sales Outstanding (DSO)</strong> = Receivables × 365 / Credit sales = ${fmt(dso)} days</p>`;
  if(dpo !== null) html += `<p><strong>Days Payables Outstanding (DPO)</strong> = Payables × 365 / COGS = ${fmt(dpo)} days</p>`;

  if(dio !== null && dso !== null && dpo !== null){
    const ccc = dio + dso - dpo;
    html += `<p class="block"><strong>Cash Conversion Cycle (CCC)</strong> = DIO + DSO - DPO = ${fmt(ccc)} days</p>`;
    html += `<p class="muted">Interpretation: Spar collected cash from debtors ${fmt(ccc)} days after they paid creditors. A shorter CCC means faster liquidity.</p>`;
  }

  out.innerHTML = html;
  if(window.MathJax) MathJax.typesetPromise();
}

document.addEventListener("click", e=>{
  if(e.target.id === "wc-explain") explainWorkingCap();

  if(e.target.id === "wc-example"){
    document.getElementById("wc-output").innerHTML = `
      <p><strong>Example: Working Capital Cycle (2017)</strong></p>
      <ul>
        <li>DIO = (3,816.4 × 365) / 85,830.2 = 16.23 days</li>
        <li>DSO = (10,814.3 × 365) / 57,277 = 68.91 days</li>
        <li>DPO = (13,452.7 × 365) / 85,830.2 = 57.21 days</li>
        <li>CCC = 16.23 + 68.91 - 57.21 = 27.93 days</li>
      </ul>
      <p><em>Interpretation:</em> Spar pays creditors 27.9 days before receiving cash from debtors.</p>
    `;
  }
});


/* ---------------------------
   8) Cost-Volume-Profit (Break-even, MOS, Target Profit, Graph)
   Includes:
   - Contribution Margin Income Statement
   - Break-even (units & revenue)
   - Margin of Safety
   - Target Profit units
   - Graphical representation
   - Example (Chenai Dodzo Boerewors rolls)
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

// Graph function
function drawCVPChart(FC, P, VC, BE_units, Q){
  const ctx = document.getElementById('cvp-chart').getContext('2d');
  if(window.cvpChart) window.cvpChart.destroy();

  const maxQ = Math.max(BE_units*1.5, Q*1.2 || BE_units*1.5);
  const quantities = [];
  const salesLine = [];
  const costLine = [];

  for(let q=0; q<=maxQ; q+=Math.ceil(maxQ/20)){
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
          fill: false
        },
        {
          label: 'Total Cost',
          data: costLine,
          borderColor: 'red',
          fill: false
        }
      ]
    },
    options: {
      plugins: {
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
        y: { title: { display: true, text: 'Rands (R)' }}
      }
    }
  });
}

// Example
document.addEventListener("click", e=>{
  if(e.target.id === "cvp-example"){
    document.getElementById("cvp-output").innerHTML = `
      <p><strong>Example: Chenai Dodzo (Pty) Ltd Boerewors rolls</strong></p>
      <ul>
        <li>VC = R2 + R8 + R4 = R14 per roll</li>
        <li>FC = 104,000 + 40,000 + 96,000 + 72,000 = R312,000</li>
        <li>CMU = 20 - 14 = R6</li>
        <li>BE units = 312,000 ÷ 6 = 52,000 rolls</li>
        <li>BE revenue = 52,000 × 20 = R1,040,000</li>
        <li>MOS = 100,000 - 52,000 = 48,000 units</li>
        <li>New VC (20% ↑) = 14 × 1.2 = 16.8</li>
        <li>New FC (rental ↑) = 352,000</li>
        <li>Target profit = 250,000 ⇒ (352,000+250,000)/3.2 = 188,125 rolls</li>
      </ul>
      <p><em>Interpretation:</em> Chenai must sell 52,000 rolls to break even, and 188,125 to reach the profit target under new costs.</p>
    `;
  }
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
  const varPct = bud === 0 ? null : varAmt / bud;
  const label = varAmt > 0 ? 'Unfavourable (U)' : (varAmt < 0 ? 'Favourable (F)' : 'No variance');
  out.innerHTML = `
    <p>Budgeted: R${fmt(bud)} | Actual: R${fmt(act)}</p>
    <p>Variance (Actual - Budget) = R${fmt(varAmt)} ${varPct !== null ? `(${(varPct*100).toFixed(2)}%)` : ''}</p>
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
    <p><strong>Closing balance</strong> = Opening + Inflows - Outflows = R${fmt(opening)} + R${fmt(inflows)} - R${fmt(outflows)} = R${fmt(closing)}</p>
    <p class="muted">Interpretation: A negative closing balance = overdraft; positive = cash surplus.</p>
  `;
}

/* Example: FurnitureWorld Ltd */
document.addEventListener("click", e=>{
  if(e.target.id === "bud-example"){
    document.getElementById("cb-output").innerHTML = `
      <p><strong>Example: FurnitureWorld Ltd (September 2024)</strong></p>
      <ul>
        <li>Opening overdraft: R20,000</li>
        <li>Cash sales: 20% of 500,000 = R100,000</li>
        <li>Collections: 60% of Aug (400,000) + 35% of Jul (300,000) = 240,000 + 105,000 = R345,000</li>
        <li>Other income: Rent = R40,000</li>
        <li><u>Total inflows</u> = 100,000 + 345,000 + 40,000 = R485,000</li>
        <li>Cash purchases: 40% of 160,000 = R64,000</li>
        <li>Creditors (Aug purchases 140,000 × 60%) = R84,000</li>
        <li>Salaries: 60,000 × 1.10 = R66,000</li>
        <li>Opex (excl. depreciation) = 100,000 - 20,000 = R80,000</li>
        <li>Van deposit (25% × 200,000) = R50,000</li>
        <li>Loan instalment = R17,000</li>
        <li><u>Total outflows</u> = 64,000 + 84,000 + 66,000 + 80,000 + 50,000 + 17,000 = R361,000</li>
        <li><strong>Closing balance</strong> = -20,000 + 485,000 - 361,000 = R104,000</li>
      </ul>
      <p><em>Interpretation:</em> FurnitureWorld ends September 2024 with a cash surplus of R104,000.</p>
    `;
  }
});

/* Event Handlers */
document.addEventListener("click", e=>{
  if(e.target.id === "bud-explain") explainBudgeting();
  if(e.target.id === "cb-explain") explainCashBudget();
});


/* ---------------------------
   10) Time Value of Money (PV, FV, annuities)
   Features:
   - Compute PV (given FV/PMT) and FV (given PV/PMT)
   - Supports annuities (ordinary vs annuity due with type)
   - Examples from exam-style problems
   --------------------------- */
function tvmHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Time Value of Money (TVM)</h2>
      <p class="mt-2 text-sm opacity-90">Single-sum and annuity calculators. Enter knowns, leave the unknown blank. Rate is per period (decimal, e.g. 0.05 = 5%).</p>

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
    <p class="block">PV = \\(-\\dfrac{FV + PMT(1+r \\cdot type)\\dfrac{(1+r)^n - 1}{r}}{(1+r)^n}\\)</p>
    <p>Substitute: PV = -[ ${fv} + ${pmt}(1+${r}·${type})((1+${r})^${n} - 1)/${r} ] / (1+${r})^${n}</p>
    <p><strong>Result:</strong> PV = R${fmt(pv)}</p>
    <p class="muted">Interpretation: This is the value today (present) of the given future value and/or payments.</p>
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
    <p class="block">FV = \\(-\\big( PV(1+r)^n + PMT(1+r \\cdot type)\\dfrac{(1+r)^n - 1}{r} \\big)\\)</p>
    <p>Substitute: FV = -[ ${pv}(1+${r})^${n} + ${pmt}(1+${r}·${type})((1+${r})^${n}-1)/${r} ]</p>
    <p><strong>Result:</strong> FV = R${fmt(fv)}</p>
    <p class="muted">Interpretation: This is the value after n periods, including compounding of PV and PMTs.</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* --- Example button: exam-style problems --- */
document.addEventListener("click", e=>{
  if(e.target.id === "tvm-example"){
    document.getElementById("tvm-output").innerHTML = `
      <p><strong>Example 1:</strong> If you invest R1,000 today at 10% for 5 years, what is FV?</p>
      <p>FV = 1000 × (1.1)^5 = R1610.51</p>
      <p><strong>Example 2:</strong> You want R10,000 in 5 years, interest 8%. PV = ?</p>
      <p>PV = 10000 / (1.08^5) = R6805.83</p>
      <p><strong>Example 3:</strong> An annuity of R2,000 paid yearly for 10 years at 6% (ordinary annuity). FV = ?</p>
      <p>FV = 2000 × [(1.06^10 - 1)/0.06] = R26,358.47</p>
    `;
  }
});

/* --- Event Handlers --- */
document.addEventListener("click", e=>{
  if(e.target.id === "tvm-pv-btn") explainTVMPV();
  if(e.target.id === "tvm-fv-btn") explainTVMFV();
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
          <select id="val-type" class="input">
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
      out.innerHTML = `<p>Perpetuity: PV = C / r = ${fmt(C)} / ${fmt(r)} = ${fmt(pv)}</p>`;
    } else {
      if(r <= g){ out.innerHTML = '<p>For a growing perpetuity r must be greater than g.</p>'; return; }
      const pv = C / (r - g);
      out.innerHTML = `<p>Growing perpetuity: PV = C / (r - g) = ${fmt(C)} / (${fmt(r)} - ${fmt(g)}) = ${fmt(pv)}</p>`;
    }
  }

  if(type === "ddm"){
    const D1 = parseFloat(document.getElementById('val-c').value || NaN);
    const r = parseFloat(document.getElementById('val-r').value || NaN);
    const g = parseFloat(document.getElementById('val-g').value || 0);
    if(isNaN(D1) || isNaN(r)){ out.innerHTML = '<p>Enter dividend and discount rate.</p>'; return; }
    if(r <= g){ out.innerHTML = '<p>r must exceed g for DDM.</p>'; return; }
    const P0 = D1 / (r - g);
    out.innerHTML = `<p>DDM (Gordon growth): P₀ = D₁ / (r - g) = ${fmt(D1)} / (${fmt(r)} - ${fmt(g)}) = ${fmt(P0)}</p>`;
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
      <p>Price = C × [1 - (1+i)^(-N)]/i + F × (1+i)^(-N)</p>
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

/* ---------------------------
   12) Capital Budgeting — NPV, IRR, AAR, PBP, DPB
   --------------------------- */
function capBudHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Capital Budgeting — NPV, IRR & Other Methods</h2>
      <p class="mt-2 text-sm opacity-90">Enter cash flows for periods 0..n as comma-separated values (e.g. -500000,100000,150000,250000,400000).</p>
      <div class="mt-2 grid gap-2 md:grid-cols-2">
        <label class="label">Discount rate (r) <input id="cb-r" class="input" placeholder="e.g. 0.12" /></label>
        <label class="label">Cash flows (CSV) <input id="cb-cfs" class="input" /></label>
      </div>
      <div class="mt-2 flex flex-wrap gap-2">
        <button id="cb-explain" class="btn btn-primary">NPV & IRR</button>
        <button id="cb-aar" class="btn btn-ghost">AAR</button>
        <button id="cb-pbp" class="btn btn-ghost">Payback</button>
        <button id="cb-dpb" class="btn btn-ghost">Discounted Payback</button>
        <button id="cb-example" class="btn btn-ghost">Example</button>
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
    <p>NPV at r=${fmt(r)} = ${fmt(npv)} → Accept project if NPV > 0.</p>
    <p>IRR = ${irr === null ? 'Cannot compute (non-conventional cash flows)' : fmt(irr)}.</p>
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
    <p>Average inflow = (${inflows.join(" + ")}) / ${inflows.length} = ${fmt(avgReturn)}</p>
    <p>Initial investment = ${fmt(C0)}</p>
    <p>AAR = ${fmt(avgReturn)} / ${fmt(C0)} = ${(aar*100).toFixed(2)}%</p>
    <p class="muted">Interpretation: Accept project if AAR > required return.</p>
  `;
}

function explainPBP(){
  const cfs = getCashFlows();
  const out = document.getElementById('cb-output');
  if(cfs.length < 2){ out.innerHTML = '<p>Need cash flows including initial investment.</p>'; return; }

  let cum = cfs[0];
  let years = 0;
  for(let t=1; t<cfs.length; t++){
    if(cum + cfs[t] >= 0){
      const needed = -cum;
      const frac = needed / cfs[t];
      years = t-1 + frac;
      out.innerHTML = `<p><strong>Payback Period</strong> = ${years.toFixed(2)} years</p>`;
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
  let years = 0;
  for(let t=1; t<cfs.length; t++){
    const pv = cfs[t] / Math.pow(1+r,t);
    if(cum + pv >= 0){
      const needed = -cum;
      const frac = needed / pv;
      years = t-1 + frac;
      out.innerHTML = `<p><strong>Discounted Payback Period</strong> = ${years.toFixed(2)} years</p>`;
      return;
    }
    cum += pv;
  }
  out.innerHTML = '<p>Discounted investment not recovered within project life.</p>';
}

/* Utility: get parsed cash flows */
function getCashFlows(){
  const cfsStr = document.getElementById('cb-cfs').value || '';
  return cfsStr.split(',').map(s=>parseFloat(s.trim())).filter(x=>!isNaN(x));
}

/* --- Bindings --- */
document.addEventListener("click", e=>{
  if(e.target.id==="cb-explain") explainCapBud();
  if(e.target.id==="cb-aar") explainAAR();
  if(e.target.id==="cb-pbp") explainPBP();
  if(e.target.id==="cb-dpb") explainDPB();
  if(e.target.id==="cb-example"){
    document.getElementById('cb-r').value='0.20';
    document.getElementById('cb-cfs').value='-500000,100000,150000,250000,400000';
    explainCapBud();
  }
});


/* Default topic */
renderTopic('tvm');
