// Main interactive logic for index.html (FTX1005F/S Accounting Calculator)
// Mirrors structure/patterns from provided stats index.html.

(function(){
  // theming definitions (same idea as original)
  const themes = {
    'spiderman': {bg:['#0b172a','#d62828','#e63946'],text:'#ffffff',btn1:'#0ea5e9',btn2:'#ef4444',ghost:'#0b1220'},
    'bloodred': {bg:['#2a0000','#660000','#b30000'],text:'#ffeaea',btn1:'#7f1d1d',btn2:'#b91c1c',ghost:'#1a1a1a'},
    'sapphire-steel': {bg:['#13293d','#006494','#247ba0'],text:'#ffffff',btn1:'#00a6fb',btn2:'#0582ca',ghost:'#0d1b2a'},
    'emerald-charcoal': {bg:['#004d40','#1c313a','#2e7d32'],text:'#ffffff',btn1:'#10b981',btn2:'#065f46',ghost:'#0b1f1a'},
    'monochrome-focus': {bg:['#111111','#333333','#555555'],text:'#ffffff',btn1:'#6b7280',btn2:'#9ca3af',ghost:'#141414'}
  };

  function applyTheme(name){
    const t = themes[name] || themes['spiderman'];
    document.documentElement.style.setProperty('--bg1', t.bg[0]);
    document.documentElement.style.setProperty('--bg2', t.bg[1]);
    document.documentElement.style.setProperty('--bg3', t.bg[2]);
    document.documentElement.style.setProperty('--text', t.text);
    document.documentElement.style.setProperty('--btn1', t.btn1);
    document.documentElement.style.setProperty('--btn2', t.btn2);
    document.documentElement.style.setProperty('--ghost', t.ghost);
  }
  // default
  applyTheme('spiderman');
  window.applyTheme = applyTheme;

  // tiny helpers
  function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
  const fmt = (n,dec=2)=>{ if(!isFinite(n)) return 'NaN'; return Number(n).toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec}); };

  // module root
  const moduleRoot = document.getElementById('module-root');
  const moduleButtons = document.querySelectorAll('.module-select');
  moduleButtons.forEach(b => b.addEventListener('click', ()=> loadModule(b.dataset.module)));

  // module templates and calculators
  function loadModule(key){
    const map = {
      'intro': introHTML,
      'env': envHTML,
      'ooa_basic': ooaBasicHTML,
      'ooa_more': ooaMoreHTML,
      'sof_coc': sofCocHTML,
      'rft': rftHTML,
      'aafs': aafsHTML,
      'fra': fraHTML,
      'irr': irrHTML,
      'wcm': wcmHTML,
      'cvp': cvpHTML,
      'bud': budHTML,
      'tvm': tvmHTML,
      'val': valHTML,
      'cb': cbHTML
    };
    moduleRoot.innerHTML = '';
    moduleRoot.appendChild(el(map[key] ? map[key]() : `<div><p>Module not found.</p></div>`));
    bindModuleEvents(key);
    if(window.MathJax) MathJax.typesetPromise();
  }

  /* -------------------------
     Module HTML fragments
     ------------------------- */

  function introHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Introduction</h2>
        <p class="mt-2 muted">Overview of accounting, users of financial statements, and basic conventions.</p>
        <div class="solid-divider"></div>
        <p><strong>Learning aids</strong></p>
        <ul class="ml-5">
          <li>Clear worked examples</li>
          <li>Step-by-step calculations</li>
          <li>Exam-style questions in Practice mode</li>
        </ul>
        <div class="solid-divider"></div>
        <p class="muted">Quick start: choose a module at left and click "Load example".</p>
      </div>`;
  }

  function envHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">The Business Environment</h2>
        <p class="mt-2 muted">Understand economic context, stakeholders, and how accounting informs decisions.</p>
        <div class="solid-divider"></div>
        <p><strong>Example</strong></p>
        <p>Company X obtains a loan of R100,000 at 10% p.a. for working capital. What is the annual interest?</p>
        <div class="mt-3 flex gap-2"><button id="env-load" class="btn btn-primary">Load example</button></div>
        <div id="env-output" class="mt-4 steps"></div>
      </div>`;
  }

  function ooaBasicHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Objective of Accounting — A = E + L</h2>
        <p class="mt-2 muted">Assets = Equity + Liabilities. Use this to prepare basic balance sheet entries.</p>
        <div class="mt-3 grid md:grid-cols-2 gap-3">
          <div>
            <label class="label">Assets (A)</label>
            <input id="ooa-a" class="input" value="1000"/>
          </div>
          <div>
            <label class="label">Liabilities (L)</label>
            <input id="ooa-l" class="input" value="400"/>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button id="ooa-explain" class="btn btn-primary">Explain</button>
          <button id="ooa-example" class="btn btn-ghost">Load example</button>
        </div>
        <div id="ooa-output" class="mt-4 steps"></div>
      </div>`;
  }

  function ooaMoreHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Objective of Accounting — More</h2>
        <p class="mt-2 muted">Recognition, measurement and disclosure. Example: journalising a sale on credit.</p>
        <div class="mt-3">
          <label class="label">Sale amount (R)</label>
          <input id="ooam-sale" class="input" value="5000"/>
          <label class="label mt-2">COGS (R)</label>
          <input id="ooam-cogs" class="input" value="3000"/>
        </div>
        <div class="mt-3 flex gap-2"><button id="ooam-explain" class="btn btn-primary">Explain</button></div>
        <div id="ooam-output" class="mt-4 steps"></div>
      </div>`;
  }

  function sofCocHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Sources of Finance & Cost of Capital</h2>
        <p class="mt-2 muted">Calculate weighted average cost of capital (WACC), cost of debt (after tax) and cost of equity (CAPM).</p>
        <div class="mt-3 grid md:grid-cols-2 gap-3">
          <div><label class="label">Debt (R)</label><input id="sof-debt" class="input" value="40000"/></div>
          <div><label class="label">Equity (R)</label><input id="sof-equity" class="input" value="60000"/></div>
          <div><label class="label">Cost of debt (pre-tax %)</label><input id="sof-kd" class="input" value="10"/></div>
          <div><label class="label">Corporate tax rate (%)</label><input id="sof-tax" class="input" value="28"/></div>
          <div><label class="label">Cost of equity (Ke %)</label><input id="sof-ke" class="input" value="15"/></div>
        </div>
        <div class="mt-3 flex gap-2"><button id="sof-explain" class="btn btn-primary">Compute WACC</button></div>
        <div id="sof-output" class="mt-4 steps"></div>
      </div>`;
  }

  function rftHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Recording Financial Transactions (RFT)</h2>
        <p class="muted">Double-entry examples and journal entries.</p>
        <div class="mt-3">
          <label class="label">Transaction (description)</label>
          <input id="rft-desc" class="input" placeholder="e.g. Sold goods for R2,000 on credit"/>
          <label class="label mt-2">Amount (R)</label>
          <input id="rft-amt" class="input" value="2000"/>
        </div>
        <div class="mt-3 flex gap-2"><button id="rft-explain" class="btn btn-primary">Show journal</button></div>
        <div id="rft-output" class="mt-4 steps"></div>
      </div>`;
  }

  function aafsHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Adjustments & Annual Financial Statements</h2>
        <p class="muted">Adjusting entries (accruals, prepayments), and preparing simple income statement & balance sheet.</p>
        <div class="mt-3 grid md:grid-cols-2 gap-3">
          <div><label class="label">Prepaid expense (R)</label><input id="aafs-pre" class="input" value="1200"/></div>
          <div><label class="label">Expired portion (%)</label><input id="aafs-exp" class="input" value="50"/></div>
        </div>
        <div class="mt-3 flex gap-2"><button id="aafs-explain" class="btn btn-primary">Adjust & show</button></div>
        <div id="aafs-output" class="mt-4 steps"></div>
      </div>`;
  }

  function fraHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Financial Ratio Analysis (FRA)</h2>
        <p class="muted">Compute liquidity, profitability and gearing ratios with step-by-step interpretation.</p>
        <div class="mt-3 grid md:grid-cols-2 gap-3">
          <div><label class="label">Current assets (R)</label><input id="fra-ca" class="input" value="50000"/></div>
          <div><label class="label">Current liabilities (R)</label><input id="fra-cl" class="input" value="25000"/></div>
          <div><label class="label">Net profit (R)</label><input id="fra-net" class="input" value="8000"/></div>
          <div><label class="label">Sales (R)</label><input id="fra-sales" class="input" value="100000"/></div>
        </div>
        <div class="mt-3 flex gap-2">
          <button id="fra-explain" class="btn btn-primary">Compute ratios</button>
          <button id="fra-example" class="btn btn-ghost">Load example</button>
        </div>
        <div id="fra-output" class="mt-4 steps"></div>
      </div>`;
  }

  function irrHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Investments, Risk & Return (IRR)</h2>
        <p class="muted">Expected return, beta & risk basics. Simple NPV/IRR calculators.</p>
        <div class="mt-3">
          <label class="label">Initial investment (negative R)</label><input id="irr-c0" class="input" value="-100000"/>
          <label class="label mt-2">Cashflow year1 (R)</label><input id="irr-c1" class="input" value="30000"/>
          <label class="label mt-2">Cashflow year2 (R)</label><input id="irr-c2" class="input" value="40000"/>
          <label class="label mt-2">Cashflow year3 (R)</label><input id="irr-c3" class="input" value="50000"/>
        </div>
        <div class="mt-3 flex gap-2"><button id="irr-explain" class="btn btn-primary">Compute NPV & IRR</button></div>
        <div id="irr-output" class="mt-4 steps"></div>
      </div>`;
  }

  function wcmHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Working Capital Management (WCM)</h2>
        <p class="muted">Cash conversion cycle basics and inventory/receivables management.</p>
        <div class="mt-3 grid md:grid-cols-2 gap-3">
          <div><label class="label">Inventory turnover (times)</label><input id="wcm-it" class="input" value="6"/></div>
          <div><label class="label">Days payable outstanding (DPO)</label><input id="wcm-dpo" class="input" value="30"/></div>
        </div>
        <div class="mt-3 flex gap-2"><button id="wcm-explain" class="btn btn-primary">Explain</button></div>
        <div id="wcm-output" class="mt-4 steps"></div>
      </div>`;
  }

  function cvpHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Costs & Cost-Volume-Profit (CVP)</h2>
        <p class="muted">Contribution margin, break-even point and margin of safety.</p>
        <div class="mt-3 grid md:grid-cols-2 gap-3">
          <div><label class="label">Price per unit (R)</label><input id="cvp-price" class="input" value="50"/></div>
          <div><label class="label">Variable cost per unit (R)</label><input id="cvp-var" class="input" value="30"/></div>
          <div><label class="label">Fixed costs (R)</label><input id="cvp-fixed" class="input" value="20000"/></div>
        </div>
        <div class="mt-3 flex gap-2"><button id="cvp-explain" class="btn btn-primary">Compute BEP</button></div>
        <div id="cvp-output" class="mt-4 steps"></div>
      </div>`;
  }

  function budHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Budgeting (BUD)</h2>
        <p class="muted">Prepare flexible budgets and variance analysis basics.</p>
        <div class="mt-3"><label class="label">Budgeted sales (units)</label><input id="bud-sales" class="input" value="1000"/></div>
        <div class="mt-3 flex gap-2"><button id="bud-explain" class="btn btn-primary">Show budget</button></div>
        <div id="bud-output" class="mt-4 steps"></div>
      </div>`;
  }

  function tvmHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Time Value of Money (TVM)</h2>
        <p class="muted">PV, FV, annuities, perpetuities and amortisation schedules.</p>
        <div class="mt-3 grid md:grid-cols-3 gap-3">
          <div><label class="label">Rate (% p.a.)</label><input id="tvm-rate" class="input" value="5"/></div>
          <div><label class="label">Periods (n)</label><input id="tvm-n" class="input" value="5"/></div>
          <div><label class="label">Future value (R) / Payment (R)</label><input id="tvm-fv" class="input" value="1000"/></div>
        </div>
        <div class="mt-3 flex gap-2">
          <button id="tvm-pv" class="btn btn-primary">Compute PV</button>
          <button id="tvm-fv-btn" class="btn btn-ghost">Compute FV (from PV)</button>
          <button id="tvm-annuity" class="btn btn-ghost">Annuity payment (PMT)</button>
        </div>
        <div id="tvm-output" class="mt-4 steps"></div>
      </div>`;
  }

  function valHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Valuations (VAL)</h2>
        <p class="muted">Valuing equity, DCF basics and multiples overview.</p>
        <div class="mt-3">
          <label class="label">Forecast free cash flow (next year R)</label><input id="val-fcf" class="input" value="20000"/>
          <label class="label mt-2">Discount rate (% WACC)</label><input id="val-wacc" class="input" value="10"/>
          <label class="label mt-2">Growth rate (%)</label><input id="val-g" class="input" value="3"/>
        </div>
        <div class="mt-3 flex gap-2"><button id="val-explain" class="btn btn-primary">Terminal value (Gordon) & PV</button></div>
        <div id="val-output" class="mt-4 steps"></div>
      </div>`;
  }

  function cbHTML(){
    return `
      <div>
        <h2 class="text-2xl font-semibold">Capital Budgeting (CB)</h2>
        <p class="muted">NPV, IRR and project selection rules.</p>
        <div class="mt-3">
          <label class="label">Discount rate (%)</label><input id="cb-r" class="input" value="10"/>
          <label class="label mt-2">Initial investment (negative R)</label><input id="cb-c0" class="input" value="-120000"/>
          <label class="label mt-2">Cashflow year1 (R)</label><input id="cb-c1" class="input" value="40000"/>
          <label class="label mt-2">Cashflow year2 (R)</label><input id="cb-c2" class="input" value="50000"/>
          <label class="label mt-2">Cashflow year3 (R)</label><input id="cb-c3" class="input" value="60000"/>
        </div>
        <div class="mt-3 flex gap-2"><button id="cb-explain" class="btn btn-primary">Compute NPV & IRR</button></div>
        <div id="cb-output" class="mt-4 steps"></div>
      </div>`;
  }

  /* -------------------------
     Module binding: calculators and explanations
     ------------------------- */

  function bindModuleEvents(key){
    // intro nothing
    if(key === 'env'){
      document.getElementById('env-load').onclick = ()=>{
        const out = document.getElementById('env-output');
        const loan = 100000, rate = 0.10;
        const interest = loan * rate;
        out.innerHTML = `<p><strong>Worked example</strong></p>
          <p>Loan: R${loan.toLocaleString()}</p>
          <p>Interest rate: ${rate*100}% p.a.</p>
          <p class="block"><strong>Annual interest = Loan × Rate</strong></p>
          <p class="block">$= ${loan} \\times ${rate} = R${fmt(interest,2)}</p>`;
        if(window.MathJax) MathJax.typesetPromise();
      };
    }

    if(key === 'ooa_basic'){
      document.getElementById('ooa-explain').onclick = ()=>{
        const A = Number(document.getElementById('ooa-a').value);
        const L = Number(document.getElementById('ooa-l').value);
        const E = A - L;
        document.getElementById('ooa-output').innerHTML = `
          <p><strong>Given</strong>: Assets = R${fmt(A,2)}, Liabilities = R${fmt(L,2)}</p>
          <p class="block">$Equity = Assets - Liabilities = ${A} - ${L} = R${fmt(E,2)}</p>`;
        if(window.MathJax) MathJax.typesetPromise();
      };
      document.getElementById('ooa-example').onclick = ()=>{ document.getElementById('ooa-a').value=15000; document.getElementById('ooa-l').value=6200; document.getElementById('ooa-explain').click(); };
    }

    if(key === 'ooa_more'){
      document.getElementById('ooam-explain').onclick = ()=>{
        const sale = Number(document.getElementById('ooam-sale').value);
        const cogs = Number(document.getElementById('ooam-cogs').value);
        const grossProfit = sale - cogs;
        const journal = `Dr Accounts Receivable R${fmt(sale,2)}<br>Cr Sales R${fmt(sale,2)}<br><em>(To record credit sale)</em><br><br>
        Dr Cost of Goods Sold R${fmt(cogs,2)}<br>Cr Inventory R${fmt(cogs,2)}<br><em>(To record cost of goods sold)</em>`;
        document.getElementById('ooam-output').innerHTML = `<p><strong>Sale</strong>: R${fmt(sale,2)}; <strong>COGS</strong>: R${fmt(cogs,2)}</p>
          <p class="block">Gross profit = Sale − COGS = R${fmt(grossProfit,2)}</p><div class="solid-divider"></div><p><strong>Journal entries</strong></p><p>${journal}</p>`;
      };
    }

    if(key === 'sof_coc'){
      document.getElementById('sof-explain').onclick = ()=>{
        const D = Number(document.getElementById('sof-debt').value);
        const E = Number(document.getElementById('sof-equity').value);
        const kd = Number(document.getElementById('sof-kd').value)/100;
        const tax = Number(document.getElementById('sof-tax').value)/100;
        const ke = Number(document.getElementById('sof-ke').value)/100;
        const V = D + E;
        const wd = D / V;
        const we = E / V;
        const kd_after = kd * (1 - tax);
        const wacc = wd * kd_after + we * ke;
        document.getElementById('sof-output').innerHTML = `
          <p><strong>Inputs:</strong> Debt R${fmt(D,2)}, Equity R${fmt(E,2)}, kd=${(kd*100).toFixed(2)}%, tax=${(tax*100).toFixed(2)}%, ke=${(ke*100).toFixed(2)}%</p>
          <p class="block">Weights: wd=${(wd*100).toFixed(2)}%, we=${(we*100).toFixed(2)}%</p>
          <p class="block">After-tax cost of debt = kd(1−T) = ${(kd_after*100).toFixed(2)}%</p>
          <p class="block"><strong>WACC = wd×kd(1−T) + we×ke = ${(wacc*100).toFixed(2)}%</strong></p>`;
      };
    }

    if(key === 'rft'){
      document.getElementById('rft-explain').onclick = ()=>{
        const desc = document.getElementById('rft-desc').value || 'Sale on credit';
        const amt = Number(document.getElementById('rft-amt').value);
        // simplistic parser for sale on credit vs cash rent etc - keep explained
        const journal = `Dr Accounts Receivable R${fmt(amt,2)}<br>Cr Sales R${fmt(amt,2)} (to record credit sale)`;
        document.getElementById('rft-output').innerHTML = `<p><strong>Transaction:</strong> ${desc}</p><p class="block">Amount: R${fmt(amt,2)}</p><div class="solid-divider"></div><p><strong>Journal entry</strong></p><p>${journal}</p>`;
      };
    }

    if(key === 'aafs'){
      document.getElementById('aafs-explain').onclick = ()=>{
        const pre = Number(document.getElementById('aafs-pre').value);
        const expPct = Number(document.getElementById('aafs-exp').value)/100;
        const expired = pre * expPct;
        const prepaidRemaining = pre - expired;
        const out = `<p>Prepaid expense (opening): R${fmt(pre,2)}</p>
          <p class="block">Expired portion = ${ (expPct*100).toFixed(2) }% → R${fmt(expired,2)}</p>
          <p class="block">Adjusting entry: Dr Expense R${fmt(expired,2)}; Cr Prepaid expense R${fmt(expired,2)}</p>
          <p class="block">Prepaid balance closing: R${fmt(prepaidRemaining,2)}</p>`;
        document.getElementById('aafs-output').innerHTML = out;
      };
    }

    if(key === 'fra'){
      document.getElementById('fra-explain').onclick = ()=>{
        const ca = Number(document.getElementById('fra-ca').value);
        const cl = Number(document.getElementById('fra-cl').value);
        const net = Number(document.getElementById('fra-net').value);
        const sales = Number(document.getElementById('fra-sales').value);
        const currentRatio = ca / cl;
        const returnOnSales = net / sales;
        const interpretation = `Current ratio ${currentRatio.toFixed(2)} (a higher ratio suggests more short-term liquidity). ROS = ${(returnOnSales*100).toFixed(2)}% (profitability per rand of sales).`;
        document.getElementById('fra-output').innerHTML = `<p><strong>Current ratio</strong> = ${fmt(ca,2)} / ${fmt(cl,2)} = ${currentRatio.toFixed(2)}</p>
          <p class="block"><strong>Return on Sales</strong> = Net profit / Sales = ${fmt(net,2)} / ${fmt(sales,2)} = ${(returnOnSales*100).toFixed(2)}%</p>
          <div class="solid-divider"></div><p>${interpretation}</p>`;
      };
      document.getElementById('fra-example').onclick = ()=>{ document.getElementById('fra-ca').value=120000; document.getElementById('fra-cl').value=60000; document.getElementById('fra-net').value=35000; document.getElementById('fra-sales').value=250000; document.getElementById('fra-explain').click(); };
    }

    if(key === 'irr'){
      document.getElementById('irr-explain').onclick = ()=>{
        const c0 = Number(document.getElementById('irr-c0').value);
        const c1 = Number(document.getElementById('irr-c1').value);
        const c2 = Number(document.getElementById('irr-c2').value);
        const c3 = Number(document.getElementById('irr-c3').value);
        const rate = 0.1;
        function npv(r){ return c0 + c1/Math.pow(1+r,1) + c2/Math.pow(1+r,2) + c3/Math.pow(1+r,3); }
        // simple IRR via math.js built-in (we provide Newton below)
        function irrNewton(cf, guess=0.1){
          let x0 = guess;
          for(let i=0;i<90;i++){
            let f=0, df=0;
            for(let t=0;t<cf.length;t++){ f += cf[t]/Math.pow(1+x0, t); df += -t*cf[t]/Math.pow(1+x0, t+1); }
            if(Math.abs(f) < 1e-9) return x0;
            x0 = x0 - f/df;
          }
          return x0;
        }
        const cf = [c0, c1, c2, c3];
        const irr = irrNewton(cf);
        const npvAt10 = npv(0.10);
        document.getElementById('irr-output').innerHTML = `<p>Cashflows: ${cf.map(x=>`R${fmt(x,2)}`).join(', ')}</p>
          <p class="block">NPV at 10% = R${fmt(npvAt10,2)}</p>
          <p class="block">Approx IRR (root of NPV)= ${(irr*100).toFixed(2)}%</p>
          <div class="solid-divider"></div><p>Interpretation: if IRR > required return accept; if IRR < required return reject.</p>`;
      };
    }

    if(key === 'wcm'){
      document.getElementById('wcm-explain').onclick = ()=>{
        const it = Number(document.getElementById('wcm-it').value);
        const dpo = Number(document.getElementById('wcm-dpo').value);
        // convert turnover to days (assuming 365 days)
        const daysInventory = 365 / it;
        const cashConversionCycle = daysInventory - dpo; // simplified (ignores receivables)
        document.getElementById('wcm-output').innerHTML = `<p>Inventory turnover = ${it} times → Days inventory = 365 / ${it} = ${daysInventory.toFixed(1)} days</p>
          <p class="block">Cash conversion cycle (simplified) = Days inventory − DPO = ${daysInventory.toFixed(1)} − ${dpo} = ${cashConversionCycle.toFixed(1)} days</p>`;
      };
    }

    if(key === 'cvp'){
      document.getElementById('cvp-explain').onclick = ()=>{
        const price = Number(document.getElementById('cvp-price').value);
        const varc = Number(document.getElementById('cvp-var').value);
        const fixed = Number(document.getElementById('cvp-fixed').value);
        const contribution = price - varc;
        const bepUnits = fixed / contribution;
        document.getElementById('cvp-output').innerHTML = `<p>Contribution per unit = Price − Variable cost = ${fmt(price,2)} − ${fmt(varc,2)} = R${fmt(contribution,2)}</p>
          <p class="block">Break-even point (units) = Fixed costs / Contribution = ${fmt(fixed,2)} / ${fmt(contribution,2)} = ${Math.ceil(bepUnits)} units</p>`;
      };
    }

    if(key === 'bud'){
      document.getElementById('bud-explain').onclick = ()=>{
        const sales = Number(document.getElementById('bud-sales').value);
        const price = 50; const varCost = 30; // assumption
        const revenue = sales * price;
        const variable = sales * varCost;
        const fixed = 20000;
        const profit = revenue - variable - fixed;
        document.getElementById('bud-output').innerHTML = `<p>Budgeted sales units = ${sales}</p>
          <p>Revenue = ${sales} × ${price} = R${fmt(revenue,2)}</p>
          <p>Variable costs = ${sales} × ${varCost} = R${fmt(variable,2)}</p>
          <p class="block">Budgeted profit = Revenue − Variable − Fixed = R${fmt(profit,2)}</p>`;
      };
    }

    if(key === 'tvm'){
      document.getElementById('tvm-pv').onclick = ()=>{
        const r = Number(document.getElementById('tvm-rate').value)/100;
        const n = Number(document.getElementById('tvm-n').value);
        const fv = Number(document.getElementById('tvm-fv').value);
        const pv = fv / Math.pow(1+r, n);
        document.getElementById('tvm-output').innerHTML = `<p>PV formula: $PV = \\dfrac{FV}{(1+r)^n}$</p>
          <p class="block">$PV = \\dfrac{${fv}}{(1+${r})^{${n}}} = R${fmt(pv,2)}</p>`;
        if(window.MathJax) MathJax.typesetPromise();
      };
      document.getElementById('tvm-fv-btn').onclick = ()=>{
        const r = Number(document.getElementById('tvm-rate').value)/100;
        const n = Number(document.getElementById('tvm-n').value);
        const pv = Number(document.getElementById('tvm-fv').value);
        const fv = pv * Math.pow(1+r,n);
        document.getElementById('tvm-output').innerHTML = `<p>FV formula: $FV = PV(1+r)^n$</p>
          <p class="block">$FV = ${pv} (1+${r})^{${n}} = R${fmt(fv,2)}</p>`;
        if(window.MathJax) MathJax.typesetPromise();
      };
      document.getElementById('tvm-annuity').onclick = ()=>{
        const r = Number(document.getElementById('tvm-rate').value)/100;
        const n = Number(document.getElementById('tvm-n').value);
        const fv = Number(document.getElementById('tvm-fv').value);
        // PMT from FV of annuity-immediate: PMT = FV * r / ((1+r)^n - 1)
        const pmt = fv * r / (Math.pow(1+r,n) - 1);
        document.getElementById('tvm-output').innerHTML = `<p>Annuity payment (to reach FV): $PMT = \\dfrac{FV \\times r}{(1+r)^n - 1}$</p>
          <p class="block">$PMT = ${fmt(fv,2)} \\times ${r} / ( (1+${r})^{${n}} - 1 ) = R${fmt(pmt,2)}</p>`;
        if(window.MathJax) MathJax.typesetPromise();
      };
    }

    if(key === 'val'){
      document.getElementById('val-explain').onclick = ()=>{
        const fcf = Number(document.getElementById('val-fcf').value);
        const wacc = Number(document.getElementById('val-wacc').value)/100;
        const g = Number(document.getElementById('val-g').value)/100;
        // Gordon growth terminal value: TV = FCF1 * (1+g) / (WACC - g)
        const tv = fcf * (1 + g) / (wacc - g);
        const pv = tv / Math.pow(1 + wacc, 1); // if only one-year forecast for example
        document.getElementById('val-output').innerHTML = `<p>Terminal value (Gordon) = $\\dfrac{FCF_{1} (1+g)}{WACC - g}$</p>
          <p class="block">$TV = \\dfrac{${fcf} (1+${(g*100).toFixed(2)}\\%)}{${(wacc*100).toFixed(2)}\\% - ${(g*100).toFixed(2)}\\%} = R${fmt(tv,2)}</p>
          <p class="muted">Discount TV to present value as required.</p>`;
        if(window.MathJax) MathJax.typesetPromise();
      };
    }

    if(key === 'cb'){
      document.getElementById('cb-explain').onclick = ()=>{
        const r = Number(document.getElementById('cb-r').value)/100;
        const c0 = Number(document.getElementById('cb-c0').value);
        const c1 = Number(document.getElementById('cb-c1').value);
        const c2 = Number(document.getElementById('cb-c2').value);
        const c3 = Number(document.getElementById('cb-c3').value);
        // compute NPV
        const npv = c0 + c1/Math.pow(1+r,1) + c2/Math.pow(1+r,2) + c3/Math.pow(1+r,3);
        // IRR via Newton (same method as before)
        function irrNewton(cf, guess=0.1){
          let x0 = guess;
          for(let i=0;i<100;i++){
            let f=0, df=0;
            for(let t=0;t<cf.length;t++){ f += cf[t]/Math.pow(1+x0, t); df += -t*cf[t]/Math.pow(1+x0, t+1); }
            if(Math.abs(f) < 1e-9) return x0;
            x0 = x0 - f/df;
          }
          return x0;
        }
        const cf = [c0, c1, c2, c3];
        const irr = irrNewton(cf);
        document.getElementById('cb-output').innerHTML = `<p>Cashflows: ${cf.map(x=>`R${fmt(x,2)}`).join(', ')}</p>
          <p class="block"><strong>NPV at ${(r*100).toFixed(2)}% = R${fmt(npv,2)}</strong></p>
          <p class="block">Approx IRR = ${(irr*100).toFixed(2)}%</p>
          <div class="solid-divider"></div>
          <p>Decision rule: NPV > 0 accept; IRR > required return accept (be careful when comparing projects with non-conventional cashflows).</p>`;
      };
    }

    // ensure MathJax typesetting after binding
    if(window.MathJax) MathJax.typesetPromise();
  }

  // default load
  loadModule('intro');

  // Expose applyTheme to window
  window.applyTheme = applyTheme;

})();
