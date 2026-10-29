/* ============================================================================
   MOLLWEIDE ALLIANCE — booking flow
   Search → results → seat map → confirmation.
   Everything is simulated and stored in this browser only. No network calls.
   ========================================================================== */

const STORE = 'mwa-bookings';
const FEE_LEGROOM = 45;      // extra-legroom seat fee
const FEE_SEAT_Y  = 12;      // standard seat selection in Economy

const state = {
  step: 1,
  trip: 'return',
  from: '', to: '', out: '', ret: '',
  cabin: 'economy', pax: 1,
  sort: 'dep',
  chosen: { out: null, ret: null },
  seats:  {},            // seat per flight, keyed by segment ('out0', 'out1', 'ret0' …)
  leg: 'out0',
  pname: ''
};

/* --- Persistence ---------------------------------------------------------- */
function loadBookings() {
  try { return JSON.parse(localStorage.getItem(STORE) || '[]'); }
  catch (e) { return []; }
}
function saveBookings(list) {
  try { localStorage.setItem(STORE, JSON.stringify(list)); return true; }
  catch (e) { return false; }
}
function makePNR() {
  const AZ = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no ambiguous glyphs
  let s = '';
  for (let i = 0; i < 6; i++) s += AZ[Math.floor(Math.random() * AZ.length)];
  return s;
}

/* ============================================================================
   AIRPORT AUTOCOMPLETE
   ========================================================================== */
function initAutocomplete(input, hint, listEl, onPick) {
  let items = [], active = -1;

  const close = () => { listEl.hidden = true; active = -1; };

  const search = q => {
    q = q.trim().toLowerCase();
    if (!q) return AIRPORTS.filter(a => a.hub).slice(0, 10);
    return AIRPORTS.filter(a =>
      a.code.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().includes(q)   ||
      a.name.toLowerCase().includes(q)   ||
      a.country.toLowerCase().includes(q)
    ).sort((a, b) => {
      const ax = a.code.toLowerCase() === q ? 0 : a.hub ? 1 : 2;
      const bx = b.code.toLowerCase() === q ? 0 : b.hub ? 1 : 2;
      return ax - bx;
    }).slice(0, 10);
  };

  const draw = () => {
    if (!items.length) { close(); return; }
    listEl.innerHTML = items.map((a, i) => `
      <button type="button" class="ac__item" data-code="${a.code}" data-active="${i === active}">
        <span class="ac__code">${a.code}</span>
        <span><span class="ac__city">${a.city}</span><br><span class="ac__apt">${a.name}, ${a.country}</span></span>
        <span class="ac__hub">${a.hub ? 'Hub' : a.focus ? 'Focus' : ''}</span>
      </button>`).join('');
    listEl.hidden = false;
  };

  const choose = a => {
    input.value = `${a.city} (${a.code})`;
    input.dataset.code = a.code;
    hint.innerHTML = `<b>${a.code}</b> · ${a.name}`;
    close();
    onPick && onPick(a.code);
  };

  input.addEventListener('focus', () => { items = search(input.value); active = -1; draw(); });
  input.addEventListener('input', () => {
    input.dataset.code = '';
    hint.textContent = '';
    items = search(input.value); active = -1; draw();
  });
  input.addEventListener('keydown', e => {
    if (listEl.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); draw(); }
    else if (e.key === 'Enter') {
      if (active >= 0) { e.preventDefault(); choose(items[active]); }
      else if (items.length === 1) { e.preventDefault(); choose(items[0]); }
    } else if (e.key === 'Escape') close();
  });
  listEl.addEventListener('mousedown', e => {
    const btn = e.target.closest('.ac__item');
    if (btn) { e.preventDefault(); choose(AP[btn.dataset.code]); }
  });
  document.addEventListener('click', e => {
    if (!listEl.contains(e.target) && e.target !== input) close();
  });

  return {
    set(code) { const a = AP[code]; if (a) choose(a); },
    clear() { input.value = ''; input.dataset.code = ''; hint.textContent = ''; }
  };
}

/* ============================================================================
   STEP MACHINE
   ========================================================================== */
const STEP_NAMES = ['Search', 'Select flights', 'Choose seats', 'Confirmation'];

function setStep(n) {
  state.step = n;
  $$('[data-step]').forEach(s => s.classList.toggle('hide', Number(s.dataset.step) !== n));
  const bar = $('#stepper');
  if (bar) {
    bar.innerHTML = STEP_NAMES.map((nm, i) => {
      const idx = i + 1;
      return `<div class="step" data-on="${idx === n}" data-done="${idx < n}">
          <span class="step__n">${idx < n
            ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4"><path d="M4 12.5l5.5 5.5L20 7"/></svg>'
            : idx}</span><span>${nm}</span>
        </div>` + (idx < STEP_NAMES.length ? '<span class="steps__bar"></span>' : '');
    }).join('');
  }
  window.scrollTo({ top: 0, behavior: state.step === 1 ? 'auto' : 'smooth' });
}

/* ============================================================================
   RESULTS
   ========================================================================== */
function legHTML(f, dir) {
  const A = airport(f.from), B = airport(f.to);
  const stops = f.stops === 0
    ? '<span class="rt__stops" data-direct="true">Direct</span>'
    : `<span class="rt__stops">1 stop · ${f.via}${f.legs && f.legs[0].op !== f.legs[1].op ? ' · codeshare' : ''}</span>`;
  return `<article class="flight" style="--m-color:${f.color}">
    <div class="flight__op">
      <div class="flight__chip">${f.op}</div>
      <div><div class="flight__opname">${f.opName}</div><div class="flight__no">${f.no} · ${
        (f.legs ? f.legs.map(l => l.eq.type) : [f.eq.type]).filter((t, i, a) => a.indexOf(t) === i).join(' + ')}</div></div>
    </div>
    <div class="flight__route">
      <div class="rt__end">
        <div class="rt__time">${hhmm(f.dep)}</div>
        <div class="rt__code">${f.from}</div><div class="rt__city">${A.city}</div>
      </div>
      <div class="rt__mid">
        <div class="rt__dur">${durTxt(f.dur)}</div>
        <div class="rt__line"><span class="rt__plane">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>
        </span></div>
        ${stops}
      </div>
      <div class="rt__end">
        <div class="rt__time">${hhmm(f.arr)}${f.dayGain ? `<sup>+${f.dayGain}</sup>` : ''}</div>
        <div class="rt__code">${f.to}</div><div class="rt__city">${B.city}</div>
      </div>
    </div>
    <div class="flight__buy">
      <div>
        <div class="flight__price">${money(f.total)}<small>${state.pax} pax · ${CURRENCY.code}</small></div>
        ${f.seatsLeft < 9 ? `<div class="flight__seats">${f.seatsLeft} seats left</div>` : ''}
      </div>
      <button class="btn btn--primary btn--sm" data-select="${dir}" data-id="${f.no}">Select</button>
    </div>
  </article>`;
}

function sortList(list) {
  const s = state.sort;
  return list.slice().sort((a, b) =>
    s === 'price' ? a.total - b.total :
    s === 'dur'   ? a.dur - b.dur :
    s === 'arr'   ? a.arr - b.arr : a.dep - b.dep);
}

let cache = { out: [], ret: [] };

function renderResults() {
  const dir = state.chosen.out && state.trip === 'return' ? 'ret' : 'out';
  const from = dir === 'out' ? state.from : state.to;
  const to   = dir === 'out' ? state.to   : state.from;
  const date = dir === 'out' ? state.out  : state.ret;

  cache[dir] = searchFlights(from, to, date, state.cabin, state.pax);
  const list = sortList(cache[dir]);
  const A = airport(from), B = airport(to);
  const dtxt = new Date(date + 'T00:00:00')
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const cab = CABINS.find(c => c.id === state.cabin);

  $('#resultsTitle').innerHTML =
    `<span class="display" style="font-size:clamp(1.4rem,3vw,2.1rem)">${dir === 'ret' ? 'Return' : 'Outbound'} · <b>${A.city} → ${B.city}</b></span>`;
  $('#resultsSub').textContent = `${dtxt} · ${cab.name} · ${state.pax} passenger${state.pax > 1 ? 's' : ''}`;

  const wrap = $('#results');
  if (!list.length) {
    wrap.innerHTML = `<div class="empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <h3 style="font-size:1.25rem;font-weight:700">No published service available for this search</h3>
      <p class="body-copy" style="margin:.75rem auto 0">We could not build a direct or one-stop journey from ${A.city} to ${B.city}
      using the routes and current fleets supplied by members. More services can appear as members add their details.</p>
      <button class="btn btn--line mt-3" data-back="1">Change search</button></div>`;
  } else {
    wrap.innerHTML = list.map(f => legHTML(f, dir)).join('');
  }
  $('#resultsCount').innerHTML = `<b>${list.length}</b> option${list.length === 1 ? '' : 's'}`;

  /* Outbound recap when picking the return leg */
  const recap = $('#outRecap');
  if (dir === 'ret' && state.chosen.out) {
    const f = state.chosen.out;
    recap.classList.remove('hide');
    recap.innerHTML = `<div class="rail__hd"><h3>Outbound selected</h3></div>
      <div class="rail__bd"><div class="rail__row"><dt>${f.from} → ${f.to}</dt><dd>${hhmm(f.dep)}–${hhmm(f.arr)}</dd></div>
      <div class="rail__row"><dt>${f.opName}</dt><dd>${f.no}</dd></div></div>`;
  } else { recap.classList.add('hide'); }
}

/* ============================================================================
   SEAT MAP
   ========================================================================== */
function seatLetters(layout) {
  const L = 'ABCDEFGHJK'; let i = 0;
  return layout.map(n => { const b = []; for (let k = 0; k < n; k++) b.push(L[i++]); return b; });
}

function isExtraLegroom(row, cab) { return row === cab.rows[0] || row === 16 || row === 25; }

/* Every flight in the trip, in order. A connection is two flights, each
   with its own aircraft, seat and boarding pass. */
function segments() {
  const out = [];
  ['out', 'ret'].forEach(d => {
    const f = state.chosen[d];
    if (!f || (d === 'ret' && state.trip !== 'return')) return;
    (f.legs || [f]).forEach((g, i) => out.push({ key: d + i, dir: d, i, f: g, n: (f.legs || [f]).length }));
  });
  return out;
}

function renderSeatMap() {
  const segs = segments();
  const seg = segs.find(x => x.key === state.leg) || segs[0];
  if (!seg) return;
  state.leg = seg.key;
  const f = seg.f;
  const cab = CABINS.find(c => c.id === state.cabin);
  const blocks = seatLetters(seatLayout(f.eq, state.cabin));
  const r = rng(hash(f.no + (seg.dir === 'out' ? state.out : state.ret) + seg.key));

  const legSwitch = segs.length > 1 ? `
    <div class="search-card__hd seg-tabs" style="border-radius:0;margin:-1px -1px 1.5rem;background:transparent;border-bottom:1px solid var(--rule)">
      ${segs.map(x => `<button class="tab" data-leg="${x.key}" aria-selected="${x.key === seg.key}">${
        x.dir === 'out' ? 'Outbound' : 'Return'}${x.n > 1 ? ` ${x.i + 1}/${x.n}` : ''} ${x.f.from}→${x.f.to}${
        state.seats[x.key] ? ' · ' + state.seats[x.key] : ''}</button>`).join('')}
    </div>` : '';

  let rowsHTML = '';
  for (let row = cab.rows[0]; row <= cab.rows[1]; row++) {
    const extra = isExtraLegroom(row, cab);
    let cells = '';
    blocks.forEach((b, bi) => {
      b.forEach(L => {
        const id = row + L;
        const taken = r() < (extra ? 0.22 : 0.42);
        cells += `<button class="seat" data-seat="${id}" data-taken="${taken}" data-extra="${extra}"
                    ${taken ? 'disabled aria-disabled="true"' : ''}
                    aria-pressed="${state.seats[seg.key] === id}"
                    aria-label="Seat ${id}${extra ? ', extra legroom' : ''}${taken ? ', occupied' : ''}">${L}</button>`;
      });
      if (bi < blocks.length - 1) cells += '<div class="aisle"></div>';
    });
    rowsHTML += `<div class="seat-row"><span class="seat-row__n">${row}</span>${cells}</div>`;
  }

  $('#seatPane').innerHTML = `${legSwitch}
    <div class="cabin__nose">${f.eq.type}<small>${blocks.map(b => b.length).join('-')} · ${f.opName}</small></div>
    <div class="cabin__zone">
      <div class="cabin__zonehd"><b>${cab.name}</b> · rows ${cab.rows[0]}–${cab.rows[1]} · ${f.opName} ${f.no}</div>
      <div class="seat-rows">${rowsHTML}</div>
    </div>
    <div class="seat-legend">
      <span><i></i>Available</span><span><i class="sel"></i>Your seat</span>
      <span><i class="taken"></i>Occupied</span><span><i class="extra"></i>Extra legroom +${money(FEE_LEGROOM)}</span>
    </div>`;
  renderRail();
}

function seatFee(key) {
  const s = state.seats[key]; if (!s) return 0;
  const cab = CABINS.find(c => c.id === state.cabin);
  const row = parseInt(s, 10);
  if (isExtraLegroom(row, cab)) return FEE_LEGROOM * state.pax;
  return state.cabin === 'economy' ? FEE_SEAT_Y * state.pax : 0;
}

function priceBreakdown() {
  const legs = ['out'].concat(state.trip === 'return' ? ['ret'] : []);
  let fare = 0, seats = 0;
  legs.forEach(d => { if (state.chosen[d]) fare += state.chosen[d].total; });
  segments().forEach(x => { seats += seatFee(x.key); });
  const taxes = Math.round(fare * 0.14 + 22 * state.pax * legs.length);
  return { fare, seats, taxes, total: fare + seats + taxes, legs };
}

function renderRail() {
  const p = priceBreakdown();
  const cab = CABINS.find(c => c.id === state.cabin);
  const rows = p.legs.map(d => {
    const f = state.chosen[d];
    return `<div class="rail__row"><dt>${d === 'out' ? 'Outbound' : 'Return'} ${f.from}→${f.to}</dt><dd>${money(f.total)}</dd></div>` +
      segments().filter(x => x.dir === d).map(x =>
        `<div class="rail__row"><dt style="font-size:.75rem;opacity:.75">${x.f.opName} ${x.f.no} · ${x.f.from}→${x.f.to}${state.seats[x.key] ? ' · seat ' + state.seats[x.key] : ''}</dt><dd style="font-size:.75rem;opacity:.75">${hhmm(x.f.dep)}–${hhmm(x.f.arr)}</dd></div>`).join('');
  }).join('');

  const ready = segments().every(x => state.seats[x.key]);
  $('#rail').innerHTML = `
    <div class="rail__hd"><h3>Your itinerary</h3></div>
    <div class="rail__bd">
      ${rows}
      <div class="rail__row"><dt>Cabin</dt><dd>${cab.name}</dd></div>
      <div class="rail__row"><dt>Passengers</dt><dd>${state.pax}</dd></div>
      ${p.seats ? `<div class="rail__row"><dt>Seat selection</dt><dd>${money(p.seats)}</dd></div>` : ''}
      <div class="rail__row"><dt>Taxes &amp; charges</dt><dd>${money(p.taxes)}</dd></div>
      <div class="rail__tot"><dt>Total</dt><dd>${money(p.total)}</dd></div>
    </div>
    <div class="rail__ft">
      <label class="field" style="margin-bottom:.875rem">
        <span class="field__lbl">Passenger name</span>
        <input class="field__in" id="pname" placeholder="As shown on ID" value="${state.pname}" autocomplete="name">
      </label>
      <button class="btn btn--primary btn--block" id="confirmBtn" ${ready ? '' : 'disabled'}>
        ${ready ? 'Confirm booking' : `Select a seat on each flight (${segments().filter(x => state.seats[x.key]).length}/${segments().length})`}
      </button>
      <p class="lbl center" style="margin-top:.875rem;line-height:1.6">Simulated booking · no payment is taken</p>
    </div>`;
}

/* ============================================================================
   CONFIRMATION — boarding pass
   ========================================================================== */
function barcodeCSS(pnr) {
  const r = rng(hash(pnr));
  let css = '', pos = 0;
  while (pos < 100) {
    const w = 0.5 + r() * 1.7;
    const dark = r() > 0.42;
    css += `${dark ? 'currentColor' : 'transparent'} ${pos}% ${Math.min(pos + w, 100)}%, `;
    pos += w;
  }
  return `linear-gradient(90deg, ${css.slice(0, -2)})`;
}

/* A simplified fin in the operator's colour, carrying its code — the
   airline's mark on a pass without needing its artwork. */
function finSVG(color, code, cls) {
  return `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M4 60 L28 9 Q31 3 37 3 L60 3 L50 54 Q48.5 60 42 60 Z" fill="${color}"/>
    <path d="M28 9 Q31 3 37 3 L43 3 L19 60 L4 60 Z" fill="#fff" opacity=".18"/>
    <text x="39" y="37" text-anchor="middle" fill="#fff" font-family="Figtree, sans-serif" font-weight="800"
          font-size="${code.length > 2 ? 11 : 14}" transform="rotate(-11 39 33)">${code}</text>
  </svg>`;
}

/* The Mollweide ellipse with its graticule, drawn faintly behind the pass. */
const PASS_GLOBE = (() => {
  const W = 200, H = 100, p = [];
  for (let k = -150; k <= 150; k += 30) {
    const rx = Math.abs(k) / 180 * W / 2;
    p.push(`<ellipse cx="${W/2}" cy="${H/2}" rx="${rx.toFixed(1)}" ry="${H/2}"/>`);
  }
  [-60, -30, 0, 30, 60].forEach(lat => {
    const y = H / 2 - Math.sin(lat * Math.PI / 180) * H / 2, hw = Math.cos(Math.asin((y - H/2) / (H/2))) * W / 2;
    p.push(`<line x1="${(W/2 - hw).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(W/2 + hw).toFixed(1)}" y2="${y.toFixed(1)}"/>`);
  });
  return `<svg class="pass__globe" viewBox="-2 -2 ${W + 4} ${H + 4}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width=".6">
    <ellipse cx="${W/2}" cy="${H/2}" rx="${W/2}" ry="${H/2}" stroke-width="1"/>${p.join('')}</svg>`;
})();

function passHTML(bk, leg) {
  const f = leg;
  const A = airport(f.from), B = airport(f.to);
  const cab = CABINS.find(c => c.id === bk.cabin);
  const m = memberOf(f.op) || {};
  const ink = tintOn(f.color || m.color || '#13398C', '#FFFFFF');   // readable on white, and white on it
  const d = new Date(f.date + 'T00:00:00')
    .toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
  return `<div class="pass" style="--al:${ink}">
    <div class="pass__main">
      ${PASS_GLOBE}
      <div class="pass__hd">
        <div class="pass__alliance">
          <div class="brand">
            <img class="brand__mark" src="assets/img/mark-blue.png" alt="" width="38" height="33">
            <img class="brand__word" src="assets/img/wordmark-blue.png" alt="Mollweide" style="height:17px">
          </div>
          <span>Alliance boarding pass</span>
        </div>
        <div class="pass__op">
          <div><span>Operated by</span><b>${m.name || f.opName}</b></div>
          ${finSVG(ink, f.op || '', 'pass__fin')}
        </div>
      </div>
      <div class="pass__route">
        <div class="pass__ap"><div class="pass__code">${f.from}</div><div class="pass__city">${A.city}</div></div>
        <div class="pass__arc">
          <svg width="96" height="34" viewBox="0 0 96 34" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M3 29C22 4 74 4 93 29" stroke-dasharray="4 4"/>
            <circle cx="3" cy="29" r="3" fill="currentColor" stroke="none"/><circle cx="93" cy="29" r="3" fill="currentColor" stroke="none"/>
            <path d="M48 3.5l9 4.5-9 4.5 2-4.5z" fill="currentColor" stroke="none"/>
          </svg>
          <span>${durTxt(f.dur)}</span>
        </div>
        <div class="pass__ap"><div class="pass__code">${f.to}</div><div class="pass__city">${B.city}</div></div>
      </div>
      <dl class="pass__grid">
        <div class="pass__cell"><dt>Passenger</dt><dd style="font-size:.9375rem">${bk.name.toUpperCase()}</dd></div>
        <div class="pass__cell"><dt>Flight</dt><dd>${f.no}<small>${f.eq.type}</small></dd></div>
        <div class="pass__cell"><dt>Date</dt><dd>${d}</dd></div>
        <div class="pass__cell"><dt>Cabin</dt><dd>${cab.abbr}<small>${cab.name}</small></dd></div>
        <div class="pass__cell"><dt>Departs</dt><dd>${hhmm(f.dep)}<small>${A.name}</small></dd></div>
        <div class="pass__cell"><dt>Arrives</dt><dd>${hhmm(f.arr)}${f.arr >= 1440 ? '<sup>+1</sup>' : ''}<small>${B.name}</small></dd></div>
        <div class="pass__cell"><dt>Gate</dt><dd>${f.gate}</dd></div>
        <div class="pass__cell pass__cell--seat"><dt>Seat</dt><dd>${f.seat}</dd></div>
      </dl>
    </div>
    <div class="pass__stub">
      <span class="pass__notch"></span>
      ${finSVG('rgba(255,255,255,.12)', '', 'pass__stubfin')}
      <div>
        <div class="pass__pnrlbl">Booking reference</div>
        <div class="pass__pnr">${bk.pnr}</div>
      </div>
      <div class="pass__stubgrid">
        <div class="pass__stubrow"><span>Flight</span><span>${f.no}</span></div>
        <div class="pass__stubrow"><span>Route</span><span>${f.from} → ${f.to}</span></div>
        <div class="pass__stubrow"><span>Seat</span><span>${f.seat}</span></div>
        <div class="pass__stubrow"><span>Departs</span><span>${hhmm(f.dep)}</span></div>
        <div class="pass__stubrow"><span>Class</span><span>${cab.name}</span></div>
      </div>
      <div>
        <div class="barcode" style="background-image:${barcodeCSS(bk.pnr + f.no)}"></div>
        <p class="pass__note"><img src="assets/img/mark-white.png" alt="" width="18" height="16"> Mollweide Alliance · ${bk.pnr} · Simulated</p>
      </div>
    </div>
  </div>`;
}

function confirmBooking() {
  const nameEl = $('#pname');
  const name = (nameEl && nameEl.value.trim()) || 'Guest Traveller';
  state.pname = name;
  const p = priceBreakdown();
  const r = rng(hash(name + Date.now()));

  /* One entry, and so one boarding pass, per flight. */
  const legs = segments().map(x => {
    const g = x.f;
    const date = x.dir === 'out' ? state.out : state.ret;
    const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + Math.floor(g.dep / 1440));
    return {
      dir: x.dir, from: g.from, to: g.to, no: g.no, opName: g.opName, op: g.op, color: g.color,
      dep: g.dep % 1440, arr: g.arr - (g.dep - g.dep % 1440), dur: g.dur, eq: g.eq, stops: 0, via: null,
      date: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
      seat: state.seats[x.key],
      gate: String.fromCharCode(65 + Math.floor(r() * 5)) + (1 + Math.floor(r() * 24))
    };
  });

  const bk = {
    pnr: makePNR(), name, cabin: state.cabin, pax: state.pax, trip: state.trip,
    total: p.total, currency: CURRENCY.code, issued: new Date().toISOString(), legs
  };

  const all = loadBookings(); all.unshift(bk);
  const ok = saveBookings(all);

  $('#passes').innerHTML = bk.legs.map(l => passHTML(bk, l)).join('<div style="height:1.5rem"></div>');
  $('#confirmMsg').innerHTML =
    `<span class="display" style="font-size:clamp(1.5rem,3.4vw,2.4rem)">Your booking reference is <b>${bk.pnr}</b></span>`;
  $('#confirmSub').textContent = ok
    ? `This itinerary has been saved to your browser and may be retrieved at any time under My bookings. Total ${money(bk.total)} ${CURRENCY.code}.`
    : `Total ${money(bk.total)} ${CURRENCY.code}. This browser is blocking local storage, so the itinerary could not be saved to My bookings.`;
  setStep(4);
}

/* ============================================================================
   WIRING
   ========================================================================== */
function initBooking() {
  if (!$('#bookingApp')) return;

  /* Cabin + passenger selects built from data */
  $('#cabin').innerHTML = CABINS.slice().reverse()
    .map(c => `<option value="${c.id}"${c.id === 'economy' ? ' selected' : ''}>${c.name}</option>`).join('');
  $('#pax').innerHTML = [1,2,3,4,5,6]
    .map(n => `<option value="${n}">${n} passenger${n > 1 ? 's' : ''}</option>`).join('');

  /* Dates: default to next week, a week apart */
  const t = new Date(); t.setDate(t.getDate() + 7);
  const t2 = new Date(); t2.setDate(t2.getDate() + 14);
  const iso = d => d.toISOString().slice(0, 10);
  $('#dateOut').value = iso(t);  $('#dateOut').min = todayISO();
  $('#dateRet').value = iso(t2); $('#dateRet').min = todayISO();

  const acFrom = initAutocomplete($('#from'), $('#fromHint'), $('#fromAC'));
  const acTo   = initAutocomplete($('#to'),   $('#toHint'),   $('#toAC'));
  acFrom.set('GIG'); acTo.set('JFK');          // a published Dumont service

  /* Trip type */
  $$('[data-trip]').forEach(b => b.addEventListener('click', () => {
    state.trip = b.dataset.trip;
    $$('[data-trip]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $('#retField').classList.toggle('hide', state.trip === 'oneway');
  }));

  /* Swap */
  $('#swap').addEventListener('click', () => {
    const a = $('#from').dataset.code, b = $('#to').dataset.code;
    if (!a || !b) return;
    acFrom.set(b); acTo.set(a);
    const s = $('#swap'); s.dataset.spun = s.dataset.spun === 'true' ? 'false' : 'true';
  });

  /* Search */
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const from = $('#from').dataset.code, to = $('#to').dataset.code;
    if (!from || !to) { toast('Pick an origin and destination from the list.'); return; }
    if (from === to)  { toast('Origin and destination must differ.'); return; }
    Object.assign(state, {
      from, to,
      out: $('#dateOut').value, ret: $('#dateRet').value,
      cabin: $('#cabin').value, pax: Number($('#pax').value),
      chosen: { out: null, ret: null }, seats: {}, leg: 'out0'
    });
    if (state.trip === 'return' && state.ret < state.out) { toast('The return date is before the outbound date.'); return; }
    renderResults();
    setStep(2);
  });

  /* Result selection */
  $('#results').addEventListener('click', e => {
    const back = e.target.closest('[data-back]');
    if (back) { setStep(1); return; }
    const btn = e.target.closest('[data-select]');
    if (!btn) return;
    const dir = btn.dataset.select;
    state.chosen[dir] = cache[dir].find(f => f.no === btn.dataset.id);
    if (dir === 'out' && state.trip === 'return') { renderResults(); }
    else { state.leg = 'out0'; renderSeatMap(); setStep(3); }
  });

  /* Sorting */
  $('#sortset').addEventListener('click', e => {
    const b = e.target.closest('.sortbtn'); if (!b) return;
    state.sort = b.dataset.sort;
    $$('.sortbtn').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderResults();
  });

  /* Seat pane: seat picks and leg switching */
  $('#seatPane').addEventListener('click', e => {
    const tab = e.target.closest('[data-leg]');
    if (tab) { state.leg = tab.dataset.leg; renderSeatMap(); return; }
    const s = e.target.closest('.seat');
    if (!s || s.disabled) return;
    state.seats[state.leg] = state.seats[state.leg] === s.dataset.seat ? null : s.dataset.seat;
    /* Once a seat is picked, move on to the next flight still without one. */
    const next = state.seats[state.leg] && segments().find(x => !state.seats[x.key]);
    if (next) state.leg = next.key;
    renderSeatMap();
  });

  /* Rail: name + confirm (delegated, the rail re-renders constantly) */
  $('#rail').addEventListener('click', e => {
    if (e.target.closest('#confirmBtn')) confirmBooking();
  });
  $('#rail').addEventListener('input', e => {
    if (e.target.id === 'pname') state.pname = e.target.value;
  });

  /* Back links */
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => {
    const n = Number(b.dataset.goto);
    if (n === 2) { renderResults(); }
    setStep(n);
  }));

  $('#printBtn') && $('#printBtn').addEventListener('click', () => window.print());
  $('#againBtn') && $('#againBtn').addEventListener('click', () => {
    state.chosen = { out: null, ret: null }; state.seats = {};
    setStep(1);
  });

  setStep(1);
}

/* ============================================================================
   MY BOOKINGS PAGE
   ========================================================================== */
function initBookingsPage() {
  const list = $('#bkList'); if (!list) return;

  const draw = () => {
    const all = loadBookings();
    $('#bkCount').innerHTML = `<b>${all.length}</b> saved booking${all.length === 1 ? '' : 's'}`;
    if (!all.length) {
      list.innerHTML = `<div class="empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M8 5v14"/></svg>
        <h3 style="font-size:1.25rem;font-weight:700">No bookings yet</h3>
        <p class="body-copy" style="margin:.75rem auto 1.5rem">Pretend bookings you make are stored in this browser only.</p>
        <a class="btn btn--primary" href="book.html">Search flights</a></div>`;
      return;
    }
    list.innerHTML = all.map(bk => {
      const l = bk.legs[0], last = bk.legs[bk.legs.length - 1];
      const d = new Date(l.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const cab = CABINS.find(c => c.id === bk.cabin);
      return `<article class="bk" style="--m-color:${l.color}">
        <div><div class="lbl">Reference</div><div class="bk__pnr">${bk.pnr}</div></div>
        <div class="bk__mid">
          <div class="bk__rt"><b>${l.from} → ${l.to}</b>${bk.legs.length > 1 ? ` <span style="opacity:.5">→ ${last.to}</span>` : ''}</div>
          <div class="bk__meta">
            <span>${d}</span><span>${l.opName} ${l.no}</span><span>${cab.name}</span>
            <span>${bk.pax} pax</span><span>Seat ${l.seat}</span><span>${CURRENCY.symbol}${bk.total.toLocaleString('en-US')}</span>
          </div>
        </div>
        <div class="bk__act">
          <button class="btn btn--line btn--sm" data-view="${bk.pnr}">View pass</button>
          <button class="btn btn--danger btn--sm" data-del="${bk.pnr}">Cancel</button>
        </div>
      </article>`;
    }).join('');
  };

  list.addEventListener('click', e => {
    const v = e.target.closest('[data-view]');
    if (v) {
      const bk = loadBookings().find(b => b.pnr === v.dataset.view);
      $('#bkPass').innerHTML = bk.legs.map(l => passHTML(bk, l)).join('<div style="height:1.5rem"></div>');
      $('#bkPassWrap').classList.remove('hide');
      $('#bkPassWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const d = e.target.closest('[data-del]');
    if (d) {
      const pnr = d.dataset.del;
      if (!confirm(`Cancel booking ${pnr}? This cannot be undone.`)) return;
      saveBookings(loadBookings().filter(b => b.pnr !== pnr));
      $('#bkPassWrap').classList.add('hide');
      draw(); toast(`Booking ${pnr} cancelled.`);
    }
  });

  $('#bkClear') && $('#bkClear').addEventListener('click', () => {
    if (!loadBookings().length) { toast('Nothing to clear.'); return; }
    if (!confirm('Delete every saved booking in this browser?')) return;
    saveBookings([]); $('#bkPassWrap').classList.add('hide'); draw(); toast('All bookings cleared.');
  });
  $('#bkPrint') && $('#bkPrint').addEventListener('click', () => window.print());

  draw();
}

document.addEventListener('DOMContentLoaded', () => { initBooking(); initBookingsPage(); });
