/* ============================================================================
   MOLLWEIDE ALLIANCE — shared engine
   Classic script (no modules) so the site works from file:// as well as from
   GitHub Pages. Loaded after data.js on every page.
   ========================================================================== */

/* --- Small helpers -------------------------------------------------------- */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const CURRENCY = { symbol: '$', code: 'USD' };   // change to '€' / 'EUR' etc.

const AP = {};  AIRPORTS.forEach(a => AP[a.code] = a);
const MB = {};  MEMBERS.forEach(m => MB[m.code] = m);

const airport   = c => AP[c];
const memberOf  = c => MB[c];
const nameOf    = m => m.short || m.name;
const servesSet = m => [].concat(m.hubs || [], m.focus || []);

/* Deterministic pseudo-randomness: the same route + date always yields the
   same flights, so results never shuffle when you go back and forth. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/* Great-circle distance in km */
function distKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

const pad   = n => String(n).padStart(2, '0');
const hhmm  = mins => pad(Math.floor((mins % 1440) / 60)) + ':' + pad(Math.round(mins % 60));
const durTxt = mins => Math.floor(mins / 60) + 'h ' + pad(Math.round(mins % 60)) + 'm';
const money  = n => CURRENCY.symbol + Math.round(n).toLocaleString('en-US');
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ============================================================================
   FLIGHT ENGINE
   ========================================================================== */

/* Which members could operate a given sector? At least one endpoint must be
   an alliance hub or focus city. */
function operatorsFor(fromC, toC) {
  return MEMBERS.filter(m => {
    const s = servesSet(m);
    return s.includes(fromC) || s.includes(toC);
  });
}

function equipmentFor(km, r) {
  const ok = AIRCRAFT.filter(a => a.maxKm >= km * 1.12);
  if (!ok.length) return AIRCRAFT[AIRCRAFT.length - 1];
  // Prefer the smallest aircraft that comfortably covers the sector, with
  // a little variety on top.
  const band = ok.slice(0, Math.min(3, ok.length));
  return pick(r, band);
}

function fareFor(km, cabinId, r) {
  const cabin = CABINS.find(c => c.id === cabinId) || CABINS[3];
  const base  = 52 + km * 0.083;
  const demand = 0.86 + r() * 0.42;                 // route-level demand swing
  return Math.round(base * cabin.mult * demand / 5) * 5;
}

/* Generate the day's direct flights for a sector. Deterministic per date. */
function directFlights(fromC, toC, dateISO, cabinId) {
  const from = airport(fromC), to = airport(toC);
  if (!from || !to || fromC === toC) return [];
  const ops = operatorsFor(fromC, toC);
  if (!ops.length) return [];

  const km   = distKm(from, to);
  const r    = rng(hash(fromC + toC + dateISO));
  const both = (from.hub && to.hub);

  // Frequency: hub-to-hub sectors get more rotations; ultra-long-haul fewer.
  let n = both ? 3 : 2;
  if (km < 2500) n += 1;
  if (km > 11000) n -= 1;
  n = Math.max(1, Math.min(5, n + (r() > 0.72 ? 1 : 0)));

  const blockMin = Math.round(km / 830 * 60) + 30;   // cruise + taxi
  const out = [];

  for (let i = 0; i < n; i++) {
    const op = ops.length === 1 ? ops[0] : pick(r, ops);
    const depMin = Math.round((5.5 + i * (16 / n) + r() * 1.4) * 60);
    const arrMin = depMin + blockMin;
    const eq = equipmentFor(km, r);
    out.push({
      kind:    'direct',
      op:      op.code,
      opName:  nameOf(op),
      color:   op.color,
      no:      op.code + (100 + Math.floor(r() * 880)),
      from:    fromC,
      to:      toC,
      dep:     depMin,
      arr:     arrMin,
      dayGain: Math.floor(arrMin / 1440),
      dur:     blockMin,
      km:      km,
      eq:      eq,
      stops:   0,
      seatsLeft: 2 + Math.floor(r() * 26),
      price:   fareFor(km, cabinId, rng(hash(fromC + toC + dateISO + i + cabinId)))
    });
  }
  return out;
}

/* One-stop itineraries via an alliance hub, used when no direct sector exists
   (and to add depth when only a couple of directs do). */
function connectingFlights(fromC, toC, dateISO, cabinId, want) {
  const from = airport(fromC), to = airport(toC);
  if (!from || !to) return [];
  const hubs = AIRPORTS.filter(a => (a.hub || a.focus) && a.code !== fromC && a.code !== toC);

  // Rank candidate hubs by detour penalty — shortest total distance first.
  const direct = distKm(from, to);
  const ranked = hubs
    .map(h => ({ h, extra: distKm(from, h) + distKm(h, to) - direct }))
    .filter(x => x.extra < direct * 1.25 + 2600)
    .sort((a, b) => a.extra - b.extra)
    .slice(0, 7);

  const out = [];
  for (const { h } of ranked) {
    const leg1 = directFlights(fromC, h.code, dateISO, cabinId);
    const leg2 = directFlights(h.code, toC, dateISO, cabinId);
    if (!leg1.length || !leg2.length) continue;

    for (const a of leg1) {
      // Earliest onward departure leaving a legal 55-minute connection.
      const b = leg2.find(x => x.dep >= a.arr + 55 && x.dep <= a.arr + 330);
      if (!b) continue;
      out.push({
        kind:  'connect',
        op:    a.op, color: a.color,
        // Credit both carriers when the connection changes airline
        opName: a.opName === b.opName ? a.opName : a.opName + ' + ' + b.opName,
        no:    a.no + ' · ' + b.no,
        from:  fromC, to: toC, via: h.code,
        dep:   a.dep, arr: b.arr,
        dayGain: Math.floor(b.arr / 1440),
        dur:   b.arr - a.dep,
        km:    a.km + b.km,
        eq:    a.eq,
        stops: 1,
        layover: b.dep - a.arr,
        legs:  [a, b],
        seatsLeft: Math.min(a.seatsLeft, b.seatsLeft),
        price: Math.round((a.price + b.price) * 0.88 / 5) * 5
      });
      break;
    }
    if (out.length >= (want || 4)) break;
  }
  return out;
}

function searchFlights(fromC, toC, dateISO, cabinId, pax) {
  let list = directFlights(fromC, toC, dateISO, cabinId);
  if (list.length < 4) list = list.concat(connectingFlights(fromC, toC, dateISO, cabinId, 6 - list.length));
  return list.map(f => Object.assign({}, f, { total: f.price * (pax || 1), pax: pax || 1 }))
             .sort((a, b) => a.dep - b.dep);
}

/* ============================================================================
   MOLLWEIDE PROJECTION
   The alliance is named for this equal-area projection, so the network map is
   drawn in it properly — Newton-solved auxiliary angle and all.
   ========================================================================== */

function mollweide(lat, lon, lon0) {
  const rad = Math.PI / 180;
  const phi = lat * rad;
  let lam = (lon - (lon0 || 0));
  lam = ((lam + 540) % 360) - 180;          // normalise to [-180, 180)
  lam *= rad;

  let th = phi;                              // solve 2θ + sin2θ = π·sinφ
  if (Math.abs(Math.abs(phi) - Math.PI / 2) > 1e-9) {
    for (let i = 0; i < 14; i++) {
      const d = (2 * th + Math.sin(2 * th) - Math.PI * Math.sin(phi)) /
                (2 + 2 * Math.cos(2 * th));
      th -= d;
      if (Math.abs(d) < 1e-11) break;
    }
  } else { th = phi; }

  return [ (2 * Math.SQRT2 / Math.PI) * lam * Math.cos(th),   // x ∈ [-2√2, 2√2]
           Math.SQRT2 * Math.sin(th) ];                        // y ∈ [-√2, √2]
}

/* Map world coords into an SVG viewBox of W × H (2:1 gives an exact fit). */
function projector(W, H, lon0) {
  const s = W / (4 * Math.SQRT2);
  return (lat, lon) => {
    const [x, y] = mollweide(lat, lon, lon0);
    return [ W / 2 + x * s, H / 2 - y * s ];
  };
}

/* Great-circle path between two points, sampled and projected. Splits the
   path when it crosses the projection's edge so lines never streak across. */
function gcPath(a, b, proj, lon0, steps) {
  const rad = Math.PI / 180, n = steps || 64;
  const v = p => {
    const la = p.lat * rad, lo = p.lon * rad;
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  };
  const v1 = v(a), v2 = v(b);
  let dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
  dot = Math.max(-1, Math.min(1, dot));
  const om = Math.acos(dot);
  if (om < 1e-8) return '';

  const segs = [];
  let cur = [], prevLon = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * om) / Math.sin(om);
    const s2 = Math.sin(t * om) / Math.sin(om);
    const x = s1*v1[0] + s2*v2[0], y = s1*v1[1] + s2*v2[1], z = s1*v1[2] + s2*v2[2];
    const lat = Math.atan2(z, Math.hypot(x, y)) / rad;
    const lon = Math.atan2(y, x) / rad;

    // Break the line where it wraps past the antimeridian of this projection.
    const rel = ((lon - (lon0 || 0) + 540) % 360) - 180;
    if (prevLon !== null && Math.abs(rel - prevLon) > 180) { segs.push(cur); cur = []; }
    prevLon = rel;
    cur.push(proj(lat, lon));
  }
  segs.push(cur);

  return segs.filter(s => s.length > 1)
             .map(s => 'M' + s.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L'))
             .join(' ');
}

/* Coarse coastlines in [lon, lat] — decorative geographic anchoring only. */
const LAND = [
  [[-168,65.5],[-166,60],[-162,58],[-157,57],[-152,58],[-148,60],[-140,60],[-135,57],[-130,54],[-125,50],[-124,46],[-124,42],[-121,36],[-117,33],[-114,31],[-110,24],[-106,23],[-97,26],[-94,29],[-89,29],[-85,30],[-82,27],[-80,25],[-81,31],[-76,35],[-74,40],[-70,43],[-67,45],[-64,46],[-60,47],[-56,51],[-64,53],[-68,58],[-78,62],[-80,67],[-85,70],[-95,69],[-105,69],[-115,70],[-125,70],[-133,69],[-141,70],[-150,71],[-157,71],[-165,68],[-168,65.5]],
  [[-81,-4],[-80,0],[-77,1],[-75,5],[-72,11],[-66,11],[-62,10],[-60,8],[-55,6],[-51,4],[-50,0],[-45,-1],[-41,-3],[-37,-6],[-35,-9],[-38,-13],[-39,-18],[-41,-22],[-48,-25],[-52,-32],[-57,-35],[-62,-39],[-63,-42],[-65,-45],[-68,-50],[-69,-53],[-74,-53],[-75,-48],[-74,-43],[-73,-37],[-71,-30],[-70,-23],[-71,-18],[-76,-14],[-79,-8],[-81,-4]],
  [[-17,15],[-17,21],[-13,28],[-10,31],[-6,36],[0,36],[10,37],[11,34],[15,32],[20,31],[25,32],[30,31],[33,29],[35,24],[37,21],[39,15],[43,12],[48,12],[51,11],[48,5],[44,2],[41,-2],[40,-8],[40,-15],[36,-21],[33,-26],[30,-31],[26,-34],[20,-35],[18,-32],[15,-27],[13,-22],[12,-16],[9,-1],[10,3],[5,5],[0,5],[-5,5],[-8,4],[-13,9],[-16,12],[-17,15]],
  [[-10,36],[-9,39],[-9,43],[-2,43],[-1,46],[-4,48],[0,49],[3,51],[4,52],[7,53],[9,54],[13,54],[10,57],[8,57],[11,59],[5,59],[5,62],[8,63],[12,65],[15,67],[19,69],[22,70],[26,71],[31,70],[36,68],[41,67],[44,66],[47,67],[52,69],[58,70],[62,70],[67,69],[69,73],[75,73],[81,73],[87,75],[92,76],[100,77],[106,77],[112,76],[116,73],[123,73],[130,73],[137,73],[144,72],[152,71],[159,70],[166,69],[172,68],[179,65],[179,62],[172,62],[165,60],[162,57],[159,56],[156,51],[155,50],[150,59],[143,59],[140,54],[135,54],[131,47],[128,42],[126,39],[122,39],[119,39],[122,37],[121,34],[122,31],[120,28],[117,24],[113,22],[110,21],[108,17],[109,13],[106,10],[104,9],[100,13],[98,16],[94,18],[91,22],[88,22],[85,20],[80,16],[77,8],[75,12],[73,16],[72,21],[70,23],[67,24],[62,25],[57,25],[54,25],[51,29],[48,30],[44,30],[40,28],[38,24],[35,28],[34,31],[36,36],[31,40],[26,40],[23,40],[24,38],[20,40],[19,42],[14,45],[12,45],[15,42],[17,41],[18,40],[16,38],[12,38],[10,44],[8,44],[4,43],[3,42],[0,40],[-2,38],[-5,36],[-7,37],[-9,38],[-10,36]],
  [[113,-22],[114,-26],[115,-32],[118,-35],[123,-34],[129,-32],[133,-32],[136,-35],[140,-38],[144,-38],[147,-38],[150,-37],[153,-31],[153,-27],[152,-25],[149,-21],[146,-19],[143,-14],[140,-17],[137,-12],[132,-11],[130,-12],[126,-14],[122,-17],[117,-21],[113,-22]],
  [[-45,60],[-50,64],[-53,68],[-55,71],[-50,76],[-45,80],[-32,83],[-22,80],[-20,75],[-24,71],[-30,68],[-38,64],[-45,60]],
  [[44,-12],[50,-15],[50,-19],[47,-25],[45,-25],[43,-21],[43,-16],[44,-12]],
  [[130,31],[132,34],[135,34],[137,37],[141,41],[142,45],[145,44],[141,39],[140,36],[137,35],[133,33],[130,31]],
  [[-5,50],[-3,51],[1,51],[2,53],[0,54],[-1,56],[-3,58],[-5,58],[-5,55],[-3,54],[-5,52],[-5,50]],
  [[173,-35],[175,-37],[178,-38],[177,-40],[174,-41],[171,-43],[167,-46],[168,-47],[172,-44],[174,-41],[173,-35]],
  [[95,6],[103,2],[106,-3],[106,-7],[114,-9],[116,-9],[110,-7],[105,-6],[100,1],[95,6]],
  [[109,1],[115,5],[119,5],[117,-1],[114,-4],[110,-3],[109,1]],
  [[120,18],[122,18],[124,13],[126,10],[123,10],[120,14],[120,18]]
];

/* Draw the network map into an <svg>. */
function renderMap(svg, opts) {
  if (!svg) return;
  const W = 400, H = 200, lon0 = (opts && opts.lon0) || 10;
  const proj = projector(W, H, lon0);
  svg.setAttribute('viewBox', `-6 -6 ${W + 12} ${H + 12}`);

  const parts = [];

  /* Projection outline — the Mollweide ellipse */
  parts.push(`<ellipse class="map__ocean" cx="${W/2}" cy="${H/2}" rx="${W/2}" ry="${H/2}"/>`);

  /* Graticule: meridians every 30°, parallels every 30° */
  for (let lon = -180 + 30; lon < 180; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 3) pts.push(proj(lat, lon + lon0));
    parts.push(`<path class="map__grat" d="M${pts.map(p => p[0].toFixed(2)+' '+p[1].toFixed(2)).join('L')}"/>`);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 3) pts.push(proj(lat, lon + lon0));
    parts.push(`<path class="map__grat" d="M${pts.map(p => p[0].toFixed(2)+' '+p[1].toFixed(2)).join('L')}"/>`);
  }

  /* Landmasses */
  LAND.forEach(poly => {
    const segs = []; let cur = []; let prev = null;
    poly.forEach(([lon, lat]) => {
      const rel = ((lon - lon0 + 540) % 360) - 180;
      if (prev !== null && Math.abs(rel - prev) > 180) { segs.push(cur); cur = []; }
      prev = rel; cur.push(proj(lat, lon));
    });
    segs.push(cur);
    segs.filter(s => s.length > 2).forEach(s => {
      parts.push(`<path class="map__land" d="M${s.map(p => p[0].toFixed(2)+' '+p[1].toFixed(2)).join('L')}Z"/>`);
    });
  });

  /* Routes, built the way a real alliance map is:
       · trunk arcs between each member's PRIMARY hub
       · feeder arcs from secondary hubs to their own primary and nearest hubs
       · one spoke from each destination to its closest hub
     Drawing all 210 hub pairs turns the map into mush, so we don't. */
  const hubs    = AIRPORTS.filter(a => a.hub);
  const spokes  = AIRPORTS.filter(a => !a.hub && !a.focus);
  const primary = {};                      // member code -> its first hub
  MEMBERS.forEach(m => { if (m.hubs && m.hubs[0]) primary[m.code] = m.hubs[0]; });
  const primaryCodes = Array.from(new Set(Object.values(primary)));

  const seen = new Set();
  const lines = [];
  const add = (a, b) => {
    if (!a || !b || a.code === b.code) return;
    const k = [a.code, b.code].sort().join('-');
    if (seen.has(k)) return;
    seen.add(k); lines.push([a, b]);
  };

  // Trunk network between primary hubs
  primaryCodes.forEach((a, i) => primaryCodes.slice(i + 1)
    .forEach(b => { if (distKm(AP[a], AP[b]) > 700) add(AP[a], AP[b]); }));

  /* A member's own bases link up. Small multi-hub carriers interconnect fully;
     a carrier with many bases radiates from its primary instead, because
     drawing every pair of seventeen bases buries the map in its own lines. */
  MEMBERS.forEach(m => {
    const hs = (m.hubs || []).concat(m.focus || []);
    if (hs.length <= 4) {
      hs.forEach((h, i) => hs.slice(i + 1).forEach(h2 => add(AP[h], AP[h2])));
    } else {
      hs.slice(1).forEach(h => add(AP[hs[0]], AP[h]));
    }
  });

  // Secondary hubs reach their two nearest alliance hubs
  hubs.filter(h => primaryCodes.indexOf(h.code) === -1).forEach(h => {
    hubs.filter(x => x.code !== h.code)
        .sort((a, b) => distKm(h, a) - distKm(h, b))
        .slice(0, 2).forEach(n => add(h, n));
  });

  // Every destination feeds its closest hub
  spokes.forEach(sp => {
    let best = null, bd = Infinity;
    hubs.forEach(h => { const d = distKm(sp, h); if (d < bd) { bd = d; best = h; } });
    add(sp, best);
  });

  lines.forEach((pair, i) => {
    const d = gcPath(pair[0], pair[1], proj, lon0);
    if (d) parts.push(`<path class="map__route" d="${d}" style="animation-delay:${(i % 26) * 55}ms"/>`);
  });

  /* Points */
  spokes.forEach(a => {
    const [x, y] = proj(a.lat, a.lon);
    parts.push(`<circle class="map__spoke" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1"><title>${a.city} (${a.code})</title></circle>`);
  });

  /* Hubs, with greedy label decluttering so codes never overprint */
  const placed = [];
  const fits = (x, y, w, h) => !placed.some(p =>
    x < p.x + p.w + 1 && x + w + 1 > p.x && y < p.y + p.h + 1 && y + h + 1 > p.y);

  hubs.slice().sort((a, b) => primaryCodes.indexOf(b.code) - primaryCodes.indexOf(a.code))
      .forEach(a => {
    const [x, y] = proj(a.lat, a.lon);
    parts.push(`<circle class="map__ring" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.6"/>`);
    parts.push(`<circle class="map__hub" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.5"><title>${a.city} (${a.code}) — ${a.name}</title></circle>`);

    // try right-above, then left-above, then right-below, then left-below
    const W = 11, H = 5;
    const spots = [[x + 4, y - 4], [x - 4 - W, y - 4], [x + 4, y + 7], [x - 4 - W, y + 7]];
    for (const [lx, ly] of spots) {
      if (fits(lx, ly - H, W, H)) {
        placed.push({ x: lx, y: ly - H, w: W, h: H });
        parts.push(`<text class="map__label" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}">${a.code}</text>`);
        break;
      }
    }
  });

  svg.innerHTML = parts.join('');
}

/* ============================================================================
   SHARED UI
   ========================================================================== */

function initChrome() {
  /* Year + alliance name anywhere they are slotted */
  $$('[data-slot="year"]').forEach(e => e.textContent = new Date().getFullYear());
  $$('[data-slot="alliance"]').forEach(e => e.textContent = ALLIANCE.name);
  $$('[data-slot="tagline"]').forEach(e => e.textContent = ALLIANCE.tagline);
  $$('[data-slot="programme"]').forEach(e => e.textContent = PROGRAMME);

  /* Mark the current page in the nav */
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav__link').forEach(a => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  /* Mobile drawer */
  const burger = $('.burger'), links = $('.nav__links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      links.dataset.open = String(!open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    links.addEventListener('click', e => {
      if (e.target.closest('a')) {
        burger.setAttribute('aria-expanded', 'false');
        links.dataset.open = 'false';
        document.body.style.overflow = '';
      }
    });
  }

  observeReveals(document);
}

/* Reveal-on-scroll, safe to call again after injecting markup. */
let _io = null;
function observeReveals(root) {
  const els = $$('[data-rv]', root === document ? document : root);
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.dataset.in = 'true'); return; }
  if (!_io) {
    _io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) { en.target.dataset.in = 'true'; _io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px' });
  }
  els.forEach(e => { if (e.dataset.in !== 'true') _io.observe(e); });
}

let toastTimer;
function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.dataset.show = 'true');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.dataset.show = 'false', 3400);
}

/* --- Renderers used across pages ----------------------------------------- */

/* The member wall: liveries side by side, the airline named on hover.
   The name is always in the DOM for assistive tech, and is shown permanently
   on touch devices, where there is no hover state. */
function renderMembers(el, limit) {
  if (!el) return;
  const list = limit ? MEMBERS.slice(0, limit) : MEMBERS;
  el.innerHTML = list.map((m, i) => `
    <figure class="livery" id="${m.code}" tabindex="0" data-rv style="transition-delay:${i * 40}ms">
      <img class="livery__img" src="${m.tail}" alt="${m.name} aircraft livery"
           loading="lazy" width="380" height="285" decoding="async">
      <figcaption class="livery__name">${m.name}</figcaption>
    </figure>`).join('');
  observeReveals(el);
}

function renderTiers(el) {
  if (!el) return;
  el.innerHTML = TIERS.map(t => `<div class="tier" style="--t-color:${t.color}">
      <div class="tier__bar"></div>
      <div><div class="tier__name">${t.name}</div>
      <div class="tier__need">${t.need ? t.need.toLocaleString('en-US') + ' miles' : 'On joining'}</div></div>
      <ul class="tier__perks">${t.perks.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>`).join('');
}

/* Full press releases, laid out as a newsroom would: dateline, standfirst,
   body, a pull quote from the alliance, then the closing paragraphs. */
function renderPress(el, limit) {
  if (!el || typeof PRESS === 'undefined' || !PRESS.length) return;
  const list = limit ? PRESS.slice(0, limit) : PRESS;

  el.innerHTML = list.map((r, i) => {
    const d = new Date(r.date + 'T00:00:00');
    const ds = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    return `<article class="release" id="${r.date}" data-rv style="transition-delay:${i * 50}ms">
      <header class="release__hd">
        <p class="release__meta"><span class="release__tag">${r.tag}</span>
          <time datetime="${r.date}">${ds}</time></p>
        <h2 class="release__ttl">${r.title}</h2>
      </header>
      <p class="release__standfirst">
        <span class="release__dateline">${r.dateline} &mdash; ${ds} &mdash;</span> ${r.standfirst}
      </p>
      ${r.body.map(p => `<p class="release__p">${p}</p>`).join('')}
      <blockquote class="release__quote">
        ${r.quote.paras.map(p => `<p>${p}</p>`).join('')}
        <cite><b>${r.quote.who}</b>${r.quote.role ? '<span>' + r.quote.role + '</span>' : ''}</cite>
      </blockquote>
      ${r.after.map(p => `<p class="release__p">${p}</p>`).join('')}
      <p class="release__ends">Ends</p>
    </article>`;
  }).join('');
  observeReveals(el);
}

/* ============================================================================
   LOUNGE FINDER
   ========================================================================== */
function renderLounges(el, filter) {
  if (!el) return;
  const list = (!filter || filter === 'all')
    ? LOUNGES
    : LOUNGES.filter(l => l.airport === filter);

  if (!list.length) {
    el.innerHTML = `<div class="empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <h3 style="font-size:1.25rem;font-weight:700">No alliance lounge here yet</h3>
      <p class="body-copy" style="margin:.75rem auto 0">Choose another airport, or view every lounge in the network.</p>
    </div>`;
    return;
  }

  el.innerHTML = list.map((l, i) => {
    const m  = memberOf(l.operator) || {};
    const ap = airport(l.airport)   || {};
    /* No photograph yet: a panel in the operator's own colour reads as
       deliberate, where a broken image or grey box would not. */
    const visual = l.photo
      ? `<img src="${l.photo}" alt="${l.name} at ${ap.city}" loading="lazy" width="600" height="450" decoding="async">`
      : `<div class="lounge__placeholder">
           <img src="assets/img/mark-white.png" alt="" width="52" height="45">
           <span>Photography to follow</span>
         </div>`;

    return `<article class="lounge" data-rv style="--m-color:${m.color || 'var(--blue)'};transition-delay:${i * 40}ms">
      <div class="lounge__visual">${visual}</div>
      <div class="lounge__bd">
        <p class="lounge__op">${m.name || l.operator}</p>
        <h3 class="lounge__name">${l.name}</h3>
        <p class="lounge__where">
          <span class="code">${l.airport}</span> ${ap.city} &middot; ${ap.name}
        </p>
        <dl class="lounge__facts">
          <div><dt>Location</dt><dd>${l.location}</dd></div>
          <div><dt>Hours</dt><dd>${l.hours}</dd></div>
          <div><dt>Access</dt><dd>${l.access.join('<br>')}</dd></div>
        </dl>
        <ul class="lounge__amen">${l.amenities.map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
    </article>`;
  }).join('');
  observeReveals(el);
}

/* Airports that actually have a lounge, for the finder's selector. */
function loungeAirports() {
  return Array.from(new Set(LOUNGES.map(l => l.airport)))
    .map(c => airport(c))
    .filter(Boolean)
    .sort((a, b) => a.city.localeCompare(b.city));
}

/* ============================================================================
   HOMEPAGE HEADLINE — "We take you from A to B"
   Cycles pairs drawn from HERO_CITIES. The two halves change on an offset so
   the line never swaps both names at once.
   ========================================================================== */
function startCityRotator(aEl, bEl) {
  if (!aEl || !bEl || typeof HERO_CITIES === 'undefined' || HERO_CITIES.length < 2) return;
  const h1 = aEl.closest('h1') || aEl.parentElement;

  /* Reserve the tallest pairing so a swap never moves the page. Measured at
     runtime rather than guessed, because the answer depends on the viewport,
     the font and the city list — all of which change. */
  const probes = HERO_CITIES.slice().sort((x, y) => y.length - x.length).slice(0, 6);
  function lockHeight() {
    const a0 = aEl.textContent, b0 = bEl.textContent;
    h1.style.minHeight = '';
    let tallest = 0;
    probes.forEach(c => {
      aEl.textContent = c; bEl.textContent = c;
      tallest = Math.max(tallest, h1.getBoundingClientRect().height);
    });
    aEl.textContent = a0; bEl.textContent = b0;
    h1.style.minHeight = Math.ceil(tallest) + 'px';
  }

  const pick = () => HERO_CITIES[Math.floor(Math.random() * HERO_CITIES.length)];
  let a = pick(), b = pick();
  while (b === a) b = pick();
  aEl.textContent = a;
  bEl.textContent = b;

  lockHeight();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockHeight);
  let rzTimer;
  window.addEventListener('resize', () => { clearTimeout(rzTimer); rzTimer = setTimeout(lockHeight, 150); });

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced && reduced.matches) return;      // one static pair, no cycling

  const swap = (el, avoid, assign) => {
    let next = pick(), guard = 0;
    while ((next === el.textContent || next === avoid()) && guard++ < 20) next = pick();
    el.dataset.out = 'true';
    setTimeout(() => { el.textContent = next; assign(next); el.dataset.out = 'false'; }, 190);
  };

  let timerA, timerB, startB;
  const run = () => {
    timerA = setInterval(() => swap(aEl, () => b, v => a = v), 3400);
    startB = setTimeout(() => {
      timerB = setInterval(() => swap(bEl, () => a, v => b = v), 3400);
    }, 1700);
  };
  const stop = () => { clearInterval(timerA); clearInterval(timerB); clearTimeout(startB); };
  run();

  /* Don't cycle in a background tab. */
  document.addEventListener('visibilitychange', () => { stop(); if (!document.hidden) run(); });
}

document.addEventListener('DOMContentLoaded', initChrome);
