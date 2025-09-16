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
   --------------------------- */
function sourcesCostHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Sources of Finance & Cost of Capital</h2>
      <p class="mt-2 text-sm opacity-90">Calculate price using Gordon Growth (Dividend Discount Model), CAPM expected return, and WACC.</p>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Dividend Growth Model (Gordon)</h3>
          <div class="mt-2 grid gap-2">
            <label class="label">Dividend just paid D0 <input id="dgm-d0" class="input" placeholder="e.g. 2.50" /></label>
            <label class="label">Dividend next year D1 (optional) <input id="dgm-d1" class="input" placeholder="or leave blank to compute from D0 and g" /></label>
            <label class="label">Growth rate g (decimal) <input id="dgm-g" class="input" placeholder="e.g. 0.04" /></label>
            <label class="label">Required return r (decimal) <input id="dgm-r" class="input" placeholder="e.g. 0.09" /></label>
            <div class="flex gap-2 mt-2"><button id="dgm-explain" class="btn btn-primary">Explain</button><button id="dgm-example" class="btn btn-ghost">Example</button></div>
            <div id="dgm-output" class="mt-2 steps"></div>
          </div>
        </div>

        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">CAPM — Expected return</h3>
          <div class="mt-2 grid gap-2">
            <label class="label">Risk-free rate Rf (decimal) <input id="capm-rf" class="input" placeholder="e.g. 0.06" /></label>
            <label class="label">Beta (β) <input id="capm-beta" class="input" placeholder="e.g. 1.2" /></label>
            <label class="label">Market return Rm (decimal) <input id="capm-rm" class="input" placeholder="e.g. 0.12" /></label>
            <div class="flex gap-2 mt-2"><button id="capm-explain" class="btn btn-primary">Explain</button><button id="capm-example" class="btn btn-ghost">Example</button></div>
            <div id="capm-output" class="mt-2 steps"></div>
          </div>
        </div>

        <div class="glass p-3 rounded-md md:col-span-2">
          <h3 class="font-semibold">WACC — Weighted Average Cost of Capital</h3>
          <p class="muted">Enter market values (Equity and Debt), costs and corporate tax rate.</p>
          <div class="mt-2 grid gap-2 md:grid-cols-3">
            <label class="label">Market value of Equity (E) <input id="wacc-e" class="input" placeholder="e.g. 500000" /></label>
            <label class="label">Market value of Debt (D) <input id="wacc-d" class="input" placeholder="e.g. 200000" /></label>
            <label class="label">Cost of equity Re (decimal) <input id="wacc-re" class="input" placeholder="e.g. 0.12" /></label>
            <label class="label">Cost of debt Rd (decimal) <input id="wacc-rd" class="input" placeholder="e.g. 0.07" /></label>
            <label class="label">Corporate tax rate Tc (decimal) <input id="wacc-tc" class="input" placeholder="e.g. 0.28" /></label>
          </div>
          <div class="mt-2 flex gap-2"><button id="wacc-explain" class="btn btn-primary">Explain</button><button id="wacc-example" class="btn btn-ghost">Example</button></div>
          <div id="wacc-output" class="mt-2 steps"></div>
        </div>
      </div>
    </div>
  `;
}
function explainDGM(){
  const d0 = parseFloat(document.getElementById('dgm-d0').value || NaN);
  const d1val = document.getElementById('dgm-d1').value.trim();
  const g = parseFloat(document.getElementById('dgm-g').value || NaN);
  const r = parseFloat(document.getElementById('dgm-r').value || NaN);
  const out = document.getElementById('dgm-output');
  if(isNaN(g) || isNaN(r) || (isNaN(d0) && d1val=='')){ out.innerHTML='<p>Enter growth rate g, required return r, and either D0 or D1.</p>'; return; }
  let d1;
  if(d1val !== '') d1 = parseFloat(d1val);
  else d1 = d0 * (1 + g);
  if(r <= g){ out.innerHTML = `<p>Warning: required return r must be > growth rate g for the Gordon model to give a finite price. r=${r}, g=${g}</p>`; return; }
  const P0 = d1 / (r - g);
  out.innerHTML = `
    <p><strong>Given</strong>: D<sub>1</sub> = R${fmt(d1)}, r = ${fmt(r)}, g = ${fmt(g)}</p>
    <p>Gordon Growth Model (constant growth): $P_0 = \\dfrac{D_1}{r-g}$</p>
    <p class="block">$P_0 = \\dfrac{${fmt(d1)}}{${fmt(r)} - ${fmt(g)}} = R${fmt(P0)}</p>
    <p><em>Interpretation:</em> Price today equals next year's dividend discounted by the excess of return over growth.</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}
function explainCAPM(){
  const rf = parseFloat(document.getElementById('capm-rf').value || NaN);
  const beta = parseFloat(document.getElementById('capm-beta').value || NaN);
  const rm = parseFloat(document.getElementById('capm-rm').value || NaN);
  const out = document.getElementById('capm-output');
  if(isNaN(rf) || isNaN(beta) || isNaN(rm)){ out.innerHTML='<p>Enter Rf, β and Rm.</p>'; return; }
  const exp = rf + beta * (rm - rf);
  out.innerHTML = `
    <p><strong>Given</strong>: Risk-free rate $R_f = ${fmt(rf)}$, $\\beta = ${fmt(beta)}$, Market return $R_m = ${fmt(rm)}</p>
    <p>CAPM: $E[R_i] = R_f + \\beta (R_m - R_f)$</p>
    <p class="block">$E[R_i] = ${fmt(rf)} + ${fmt(beta)} \\times (${fmt(rm)} - ${fmt(rf)}) = ${fmt(exp)}</p>
    <p><em>Interpretation:</em> Expected return compensates for time value (Rf) plus risk premium (β times market premium).</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}
function explainWACC(){
  const E = parseFloat(document.getElementById('wacc-e').value || 0);
  const D = parseFloat(document.getElementById('wacc-d').value || 0);
  const Re = parseFloat(document.getElementById('wacc-re').value || NaN);
  const Rd = parseFloat(document.getElementById('wacc-rd').value || NaN);
  const Tc = parseFloat(document.getElementById('wacc-tc').value || 0);
  const out = document.getElementById('wacc-output');
  if(isNaN(Re) || isNaN(Rd)){ out.innerHTML = '<p>Enter costs of equity (Re) and debt (Rd).</p>'; return; }
  const V = E + D;
  if(V === 0){ out.innerHTML = '<p>Please provide non-zero capital values for E or D.</p>'; return; }
  const wE = E / V, wD = D / V;
  const afterTaxRd = Rd * (1 - Tc);
  const wacc = wE * Re + wD * afterTaxRd;
  out.innerHTML = `
    <p><strong>Inputs</strong>: E=${fmt(E)}, D=${fmt(D)}, Re=${fmt(Re)}, Rd=${fmt(Rd)}, Tax rate Tc=${fmt(Tc)}</p>
    <p>Weights: $w_E = \\dfrac{E}{E+D} = ${fmt(wE)}$, $w_D = \\dfrac{D}{E+D} = ${fmt(wD)}$</p>
    <p>After-tax cost of debt: $R_d(1-T_c) = ${fmt(Rd)}\\times(1-${fmt(Tc)}) = ${fmt(afterTaxRd)}</p>
    <p class="block">WACC $= w_E R_e + w_D R_d (1-T_c) = ${fmt(wacc)}</p>
    <p><em>Interpretation:</em> Weighted average cost of capital is the average return required by providers of capital, weighted by market values.</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   3) Recording transactions — simple journal -> ledger -> trial balance
   --------------------------- */
function recordTxnHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Recording Financial Transactions — Journal & Trial Balance</h2>
      <p class="mt-2 text-sm opacity-90">Enter journal entries (date, account debited, account credited, amount). Click "Post" to make ledger posting and "Trial balance" to verify.</p>

      <div class="mt-3 grid gap-2 md:grid-cols-4">
        <input id="je-date" class="input" placeholder="Date (e.g. 2025-03-31)" />
        <input id="je-debit" class="input" placeholder="Account debited (e.g. Cash)" />
        <input id="je-credit" class="input" placeholder="Account credited (e.g. Revenue)" />
        <input id="je-amt" class="input" placeholder="Amount" />
      </div>
      <div class="mt-2 flex gap-2">
        <button id="je-add" class="btn btn-primary">Add Journal Entry</button>
        <button id="je-post" class="btn btn-ghost">Post to Ledger</button>
        <button id="je-trial" class="btn btn-link">Show Trial Balance</button>
      </div>

      <div id="je-output" class="mt-4 topic-card p-4 rounded-md steps"></div>
    </div>
  `;
}
let journalEntries = []; // {date, debit, credit, amount}
let ledger = {}; // account -> {debit: total, credit: total}
function addJournalEntry(){
  const date = document.getElementById('je-date').value || '(no date)';
  const debit = document.getElementById('je-debit').value.trim();
  const credit = document.getElementById('je-credit').value.trim();
  const amt = parseFloat(document.getElementById('je-amt').value || 0);
  const out = document.getElementById('je-output');
  if(!debit || !credit || !amt){ out.innerHTML = '<p>Please provide debit account, credit account and amount.</p>'; return; }
  journalEntries.push({date, debit, credit, amount: amt});
  out.innerHTML = `<p>Added journal entry: ${date}: Debit ${debit} R${fmt(amt)} / Credit ${credit} R${fmt(amt)} (unposted)</p>`;
  renderJournalList();
}
function renderJournalList(){
  const out = document.getElementById('je-output');
  if(journalEntries.length === 0){ out.innerHTML = '<p>No journal entries.</p>'; return; }
  let html = `<p><strong>Journal (unposted)</strong></p><table><thead><tr><th>Date</th><th>Debit</th><th>Credit</th><th>Amount</th></tr></thead><tbody>`;
  journalEntries.forEach(j => { html += `<tr><td>${j.date}</td><td>${j.debit}</td><td>${j.credit}</td><td>R${fmt(j.amount)}</td></tr>`; });
  html += `</tbody></table>`;
  out.innerHTML = html;
}
function postToLedger(){
  // reset ledger
  ledger = {};
  journalEntries.forEach(j => {
    if(!ledger[j.debit]) ledger[j.debit] = {debit:0, credit:0};
    if(!ledger[j.credit]) ledger[j.credit] = {debit:0, credit:0};
    ledger[j.debit].debit += j.amount;
    ledger[j.credit].credit += j.amount;
  });
  const out = document.getElementById('je-output');
  let html = `<p><strong>Ledger (posted)</strong></p><table><thead><tr><th>Account</th><th>Total Debits</th><th>Total Credits</th></tr></thead><tbody>`;
  Object.keys(ledger).forEach(a => { html += `<tr><td>${a}</td><td>R${fmt(ledger[a].debit)}</td><td>R${fmt(ledger[a].credit)}</td></tr>`; });
  html += `</tbody></table><p class="muted">Use "Show Trial Balance" to view balances by account.</p>`;
  out.innerHTML = html;
}
function showTrialBalance(){
  const out = document.getElementById('je-output');
  if(!ledger || Object.keys(ledger).length === 0){ out.innerHTML = '<p>No ledger postings yet. Post entries first.</p>'; return; }
  let html = `<p><strong>Trial Balance</strong></p><table><thead><tr><th>Account</th><th>Debit Balance</th><th>Credit Balance</th></tr></thead><tbody>`;
  let totalDebits = 0, totalCredits = 0;
  Object.keys(ledger).forEach(a=>{
    const bal = ledger[a].debit - ledger[a].credit;
    if(bal >= 0){ html += `<tr><td>${a}</td><td>R${fmt(bal)}</td><td>R0</td></tr>`; totalDebits += bal; }
    else { html += `<tr><td>${a}</td><td>R0</td><td>R${fmt(-bal)}</td></tr>`; totalCredits += -bal; }
  });
  html += `</tbody></table><p class="block"><strong>Totals</strong> — Debits: R${fmt(totalDebits)} | Credits: R${fmt(totalCredits)}</p>`;
  html += `<p>${fmt(totalDebits) === fmt(totalCredits) ? '<strong>Trial balance is balanced.</strong>' : '<strong>Trial balance does not balance.</strong>'}</p>`;
  out.innerHTML = html;
}

/* ---------------------------
   4) Adjustments & FS — short explanation (because adjustments vary)
   --------------------------- */
function adjustmentsHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Adjustments & Annual Financial Statements</h2>
      <p class="mt-2 text-sm opacity-90">This module outlines common year-end adjustments and shows how they affect the income statement and balance sheet. Use as a worked example tool.</p>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Accruals and Prepayments</h3>
          <p class="muted">Enter data to see the effect on profit and closing balances.</p>
          <label class="label mt-2">Accrued expense (expense incurred but not yet paid) <input id="adj-accrued" class="input" placeholder="R" /></label>
          <label class="label">Prepaid expense (paid but not yet incurred) <input id="adj-prepaid" class="input" placeholder="R" /></label>
          <div class="mt-2 flex gap-2"><button id="adj-explain" class="btn btn-primary">Explain Effect</button><button id="adj-example" class="btn btn-ghost">Example</button></div>
          <div id="adj-output" class="mt-2 steps"></div>
        </div>

        <div class="glass p-3 rounded-md">
          <h3 class="font-semibold">Depreciation (straight-line)</h3>
          <label class="label mt-2">Cost <input id="dep-cost" class="input" placeholder="R" /></label>
          <label class="label">Residual value <input id="dep-res" class="input" placeholder="R" /></label>
          <label class="label">Useful life (years) <input id="dep-life" class="input" placeholder="e.g. 5" /></label>
          <div class="mt-2 flex gap-2"><button id="dep-explain" class="btn btn-primary">Explain</button><button id="dep-example" class="btn btn-ghost">Example</button></div>
          <div id="dep-output" class="mt-2 steps"></div>
        </div>
      </div>
    </div>
  `;
}
function explainAdjustments(){
  const accrued = parseFloat(document.getElementById('adj-accrued').value || 0);
  const prepaid = parseFloat(document.getElementById('adj-prepaid').value || 0);
  const out = document.getElementById('adj-output');
  // explain effect concisely
  out.innerHTML = `
    <p><strong>Accrued expense</strong>: R${fmt(accrued)}. This increases expenses (reduces profit) and increases a liability (accruals). Example: record debit Expense R${fmt(accrued)}, credit Accrued Liabilities R${fmt(accrued)}.</p>
    <p><strong>Prepaid expense</strong>: R${fmt(prepaid)}. This is an asset. At year-end, the portion incurred becomes an expense and reduces the prepaid asset. Example: if R${fmt(prepaid)} was paid but none incurred, adjust by debiting Expense and crediting Prepaid as needed (or reverse if over-accrued).</p>
    <p class="muted">Why step-by-step: adjustments ensure revenue and expenses are recognized in the period they are incurred (accrual accounting).</p>
  `;
}
function explainDepreciation(){
  const cost = parseFloat(document.getElementById('dep-cost').value || NaN);
  const res = parseFloat(document.getElementById('dep-res').value || 0);
  const life = parseFloat(document.getElementById('dep-life').value || NaN);
  const out = document.getElementById('dep-output');
  if(isNaN(cost) || isNaN(life) || life <= 0){ out.innerHTML = '<p>Enter cost and useful life (years).</p>'; return; }
  const dep = (cost - res) / life;
  out.innerHTML = `
    <p><strong>Straight-line depreciation</strong></p>
    <p>Cost = R${fmt(cost)}, Residual = R${fmt(res)}, Useful life = ${fmt(life)}</p>
    <p class="block">Annual depreciation expense = \\(\\dfrac{\\text{Cost - Residual}}{\\text{Useful life}} = \\dfrac{${fmt(cost)} - ${fmt(res)}}{${fmt(life)}} = R${fmt(dep)}\\)</p>
    <p>Journal: Debit Depreciation Expense R${fmt(dep)}; Credit Accumulated Depreciation R${fmt(dep)}</p>
  `;
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   5) Financial Ratios
   --------------------------- */
function ratiosHTML(){
  return `
    <div>
      <h2 class="text-2xl font-semibold">Financial Ratio Analysis</h2>
      <p class="mt-2 text-sm opacity-90">Compute common ratios (liquidity, profitability, efficiency). Each explanation shows the formula and interpretation.</p>
      <div class="mt-3 grid gap-3 md:grid-cols-3">
        <label class="label">Current assets <input id="rat-current-assets" class="input" /></label>
        <label class="label">Inventory <input id="rat-inventory" class="input" /></label>
        <label class="label">Current liabilities <input id="rat-current-liab" class="input" /></label>
        <label class="label">Sales / Revenue <input id="rat-sales" class="input" /></label>
        <label class="label">Cost of goods sold <input id="rat-cogs" class="input" /></label>
        <label class="label">Net income <input id="rat-netincome" class="input" /></label>
        <label class="label">Total assets <input id="rat-totalassets" class="input" /></label>
        <label class="label">Total equity <input id="rat-equity" class="input" /></label>
      </div>
      <div class="mt-3 flex gap-2"><button id="rat-explain" class="btn btn-primary">Compute Ratios</button><button id="rat-example" class="btn btn-ghost">Example</button></div>
      <div id="rat-output" class="mt-3 steps"></div>
    </div>
  `;
}
function explainRatios(){
  const ca = parseFloat(document.getElementById('rat-current-assets').value || 0);
  const inv = parseFloat(document.getElementById('rat-inventory').value || 0);
  const cl = parseFloat(document.getElementById('rat-current-liab').value || 0);
  const sales = parseFloat(document.getElementById('rat-sales').value || 0);
  const cogs = parseFloat(document.getElementById('rat-cogs').value || 0);
  const net = parseFloat(document.getElementById('rat-netincome').value || 0);
  const ta = parseFloat(document.getElementById('rat-totalassets').value || 0);
  const eq = parseFloat(document.getElementById('rat-equity').value || 0);
  const out = document.getElementById('rat-output');

  const currentRatio = cl === 0 ? null : ca / cl;
  const quickRatio = cl === 0 ? null : (ca - inv) / cl;
  const grossMargin = sales === 0 ? null : (sales - cogs) / sales;
  const netMargin = sales === 0 ? null : net / sales;
  const roa = ta === 0 ? null : net / ta;
  const roe = eq === 0 ? null : net / eq;

  let html = `<p><strong>Ratios</strong></p>`;
  html += `<p>Current ratio = \\(\\dfrac{\\text{Current assets}}{\\text{Current liabilities}} = ${cl===0 ? 'N/A' : fmt(currentRatio)}</p>`;
  html += `<p>Quick ratio (acid test) = \\(\\dfrac{\\text{Current assets - Inventory}}{\\text{Current liabilities}} = ${cl===0 ? 'N/A' : fmt(quickRatio)}</p>`;
  html += `<p>Gross profit margin = \\(\\dfrac{\\text{Sales - COGS}}{\\text{Sales}} = ${sales===0 ? 'N/A' : (fmt(grossMargin*100,3) + '%')}</p>`;
  html += `<p>Net profit margin = \\(\\dfrac{\\text{Net income}}{\\text{Sales}} = ${sales===0 ? 'N/A' : (fmt(netMargin*100,3) + '%')}</p>`;
  html += `<p>Return on assets (ROA) = \\(\\dfrac{\\text{Net income}}{\\text{Total assets}} = ${ta===0 ? 'N/A' : (fmt(roa*100,3) + '%')}</p>`;
  html += `<p>Return on equity (ROE) = \\(\\dfrac{\\text{Net income}}{\\text{Total equity}} = ${eq===0 ? 'N/A' : (fmt(roe*100,3) + '%')}</p>`;
  html += `<p class="muted">Interpretation: liquidity ratios measure short-term ability to meet obligations; margin ratios show profitability; ROA/ROE indicate efficiency of asset/equity use.</p>`;
  out.innerHTML = html;
  if(window.MathJax) MathJax.typesetPromise();
}

/* ---------------------------
   6) Investments, Risk & Return (expected return & variance)
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
