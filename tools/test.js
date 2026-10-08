/* Engine checks — run with:  node tools/test.js  */
const fs = require('fs'), vm = require('vm'), path = require('path');
process.chdir(path.resolve(__dirname, '..'));
const ctx = { console, Math, Date, JSON, Set, Intl, window:{}, requestAnimationFrame:()=>{},
              document: { addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[],
                          createElement:()=>({}), body:{} }, localStorage:null, location:{pathname:'/'} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/js/data.js','utf8'), ctx);
vm.runInContext(fs.readFileSync('assets/js/site.js','utf8'), ctx);
// const-declared bindings are not properties of the VM global; surface them.
vm.runInContext('globalThis._x = {airport, memberOf, distKm, hhmm, durTxt, money, CABINS, AIRCRAFT, MEMBERS, AIRPORTS, ALLIANCE, TIERS, PRESS, HERO_CITIES, PROGRAMME, LOUNGES, JOIN, tintOn, MAP_INK};', ctx);
Object.assign(ctx, ctx._x);
const S = ctx;
let fails = 0;
const ok = (name, cond, extra='') => { console.log((cond?'  PASS  ':'  FAIL  ')+name+(extra?'  '+extra:'')); if(!cond) fails++; };

// --- hero city rotation ----------------------------------------------------
ok('Hero city list is populated', S.HERO_CITIES.length > 50, S.HERO_CITIES.length + ' cities');
ok('Hero city list has no duplicates',
   new Set(S.HERO_CITIES).size === S.HERO_CITIES.length);
ok('Hero city list has no stray whitespace',
   S.HERO_CITIES.every(c => c === c.trim() && c.length > 1));

// --- Mollweide projection --------------------------------------------------
const [x0,y0] = S.mollweide(0,0,0);
ok('Mollweide centre maps to origin', Math.abs(x0)<1e-9 && Math.abs(y0)<1e-9);
const [,yN] = S.mollweide(90,0,0);
ok('North pole maps to +√2', Math.abs(yN - Math.SQRT2) < 1e-6, 'y='+yN.toFixed(6));
const [xE] = S.mollweide(0,179.999,0);
ok('Antimeridian reaches the ellipse edge', Math.abs(Math.abs(xE) - 2*Math.SQRT2) < 1e-3, 'x='+xE.toFixed(6));
const [xW] = S.mollweide(0,-180,0);
ok('Both 180° forms land on the same edge', Math.abs(xW + 2*Math.SQRT2) < 1e-6);
// equal-area sanity: every projected point must sit inside the bounding ellipse
let inside = true;
for (let la=-90; la<=90; la+=7) for (let lo=-180; lo<=180; lo+=13) {
  const [x,y] = S.mollweide(la,lo,0);
  if ((x/(2*Math.SQRT2))**2 + (y/Math.SQRT2)**2 > 1.0000001) inside = false;
}
ok('All points fall inside the projection ellipse', inside);

// --- distances -------------------------------------------------------------
const d = S.distKm(S.airport('LHR'), S.airport('JFK'));
ok('LHR–JFK ≈ 5555 km', Math.abs(d-5555) < 120, d+' km');
const d2 = S.distKm(S.airport('GVA'), S.airport('GIG'));
ok('GVA–GIG ≈ 9200 km', Math.abs(d2-9200) < 400, d2+' km');

// --- flight search ---------------------------------------------------------
const pairs = [['GVA','GIG'],['TBS','BOM'],['LAX','PVG'],['MEX','HNL'],['BEY','CGH'],
               ['OGG','DEL'],['CKG','BSB'],['EVN','OGG'],['SSA','CCU'],['GYD','MEX']];
let allHave = true, badTimes = false, badPrice = false;
pairs.forEach(([a,b]) => {
  const fl = S.searchFlights(a,b,'2026-10-15','economy',2);
  if (!fl.length) { allHave = false; console.log('        no results for '+a+'→'+b); }
  fl.forEach(f => {
    if (f.arr <= f.dep) badTimes = true;
    if (!(f.total > 0) || !isFinite(f.total)) badPrice = true;
    if (f.stops === 1 && (!f.via || f.layover < 55)) badTimes = true;
  });
});
ok('Every tested city pair returns flights', allHave);
ok('Arrival is always after departure', !badTimes);
ok('Totals are positive and finite', !badPrice);

// --- determinism -----------------------------------------------------------
const a1 = JSON.stringify(S.searchFlights('GVA','BOM','2026-11-02','business',1));
const a2 = JSON.stringify(S.searchFlights('GVA','BOM','2026-11-02','business',1));
ok('Identical searches return identical results', a1 === a2);
const a3 = JSON.stringify(S.searchFlights('GVA','BOM','2026-11-03','business',1));
ok('A different date returns different flights', a1 !== a3);

// --- cabins price monotonically -------------------------------------------
const cab = ['economy','premium','business','first'].map(c =>
  S.searchFlights('GVA','GIG','2026-10-15',c,1)[0].price);
ok('Fares rise with cabin class', cab.every((v,i)=> i===0 || v > cab[i-1]), cab.join(' < '));

// --- every member hub is a known airport ----------------------------------
let hubsOK = true;
S.MEMBERS.forEach(m => [].concat(m.hubs||[], m.focus||[]).forEach(h => {
  if (!S.airport(h)) { hubsOK = false; console.log('        unknown airport code: '+h+' ('+m.name+')'); }
}));
ok('Every member hub resolves to an airport', hubsOK);
let tailsOK = true;
S.MEMBERS.forEach(m => { if (!fs.existsSync(m.tail)) { tailsOK = false; console.log('        missing '+m.tail); } });
ok('Every member tail image exists on disk', tailsOK);
ok('Every member has a distinct code',
   new Set(S.MEMBERS.map(m => m.code)).size === S.MEMBERS.length);
ok('Loyalty programme and tiers are named',
   S.PROGRAMME === 'Elara' && S.TIERS.map(t => t.name).join('/') === 'Member/Select/Strata/Aurora',
   S.PROGRAMME + ': ' + S.TIERS.map(t => t.name).join(' → '));

// --- lounges ---------------------------------------------------------------
let loungeRefs = true, loungePhotos = true;
S.LOUNGES.forEach(l => {
  if (!S.airport(l.airport))  { loungeRefs = false; console.log('        unknown airport: ' + l.airport); }
  if (!S.memberOf(l.operator)){ loungeRefs = false; console.log('        unknown operator: ' + l.operator); }
  if (l.photo && !fs.existsSync(l.photo)) { loungePhotos = false; console.log('        missing ' + l.photo); }
});
ok('Every lounge resolves to a real airport and operator', loungeRefs, S.LOUNGES.length + ' lounges');
ok('Every lounge photo that is set exists on disk', loungePhotos);
// --- member colours on the dark map ----------------------------------------
const _lin = v => (v /= 255) <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
const _lum = h => { const c = [1,3,5].map(i => parseInt(h.substr(i,2),16));
                    return 0.2126*_lin(c[0]) + 0.7152*_lin(c[1]) + 0.0722*_lin(c[2]); };
const _cr  = (a,b) => { const x = _lum(a), y = _lum(b);
                        return (Math.max(x,y)+0.05) / (Math.min(x,y)+0.05); };
/* The explorer paints on two surfaces: the dark map panel and the white
   section around it. Both have to hold up. */
[['the dark map panel', S.MAP_INK], ['the white section', '#FFFFFF']].forEach(([where, bg]) => {
  let okAll = true, worst = 99, moved = 0;
  S.MEMBERS.forEach(m => {
    const t = S.tintOn(m.color, bg);
    if (t !== m.color) moved++;
    const c = _cr(t, bg);
    worst = Math.min(worst, c);
    if (c < 3.5) { okAll = false; console.log('        ' + m.code + ' ' + m.color + ' -> ' + t + ' only ' + c.toFixed(2) + ':1'); }
  });
  ok('Every member colour is legible on ' + where, okAll,
     'worst ' + worst.toFixed(2) + ':1 after adjusting ' + moved + ' of ' + S.MEMBERS.length);
});
ok('tintOn leaves an already-legible colour alone',
   S.tintOn('#19A7DE', S.MAP_INK) === '#19A7DE');
ok('tintOn darkens rather than lightens against a white ground',
   _lum(S.tintOn('#19A7DE', '#FFFFFF')) < _lum('#19A7DE'), S.tintOn('#19A7DE', '#FFFFFF'));
ok('tintOn returns a usable hex for a near-black brand colour',
   /^#[0-9a-f]{6}$/.test(S.tintOn('#2A2F38', S.MAP_INK)), S.tintOn('#2A2F38', S.MAP_INK));

// --- membership groups -----------------------------------------------------
const GROUPS = ['connect'];   // anything else is a full alliance member
ok('Every member group is one the site knows about',
   S.MEMBERS.every(m => !m.group || GROUPS.indexOf(m.group) > -1),
   S.MEMBERS.filter(m => m.group).map(m => m.code + ':' + m.group).join(' ') || 'all full members');
/* A Connect carrier is a membership tier, not a separate network: it still has
   to resolve everywhere a full member does. */
S.MEMBERS.filter(m => m.group === 'connect').forEach(m => {
  ok('Connect carrier ' + m.code + ' resolves like any other member',
     !!m.tail && !!m.color && (m.hubs || []).length > 0 &&
     (m.hubs || []).every(h => S.airport(h)));
});
/* Codes are not always two letters — 5K is a real form — so nothing may
   assume a leading letter. */
ok('Every code is two characters, letters or digits',
   S.MEMBERS.every(m => /^[A-Z0-9]{2}$/.test(m.code)),
   S.MEMBERS.map(m => m.code).sort().join(' '));

// --- joining ---------------------------------------------------------------
ok('Both joinable groups are configured', S.JOIN.length === 2,
   S.JOIN.map(j => j.name).join(' / '));
ok('Every group carries an in-game search string',
   S.JOIN.every(j => typeof j.search === 'string' && j.search.length > 2));
/* These strings are typed back into the game verbatim, so stray whitespace or
   a capital letter would send a player looking for a listing that is not
   there. Guard the exact form rather than merely that something is present. */
ok('Search strings are exact — lower case, hyphenated, no stray spaces',
   S.JOIN.every(j => /^[a-z]+(-[a-z]+)*$/.test(j.search)),
   S.JOIN.map(j => j.search).join('  '));
ok('The two groups do not share a search string',
   new Set(S.JOIN.map(j => j.search)).size === S.JOIN.length);
ok('Every group has a name, sub-label, accent and description',
   S.JOIN.every(j => j.name && j.sub && /^#[0-9A-Fa-f]{6}$/.test(j.accent) && j.blurb));

// --- press releases --------------------------------------------------------
ok('Press releases are present', S.PRESS.length > 0, S.PRESS.length + ' releases');
ok('Every release has a date, title, quote and closing paragraphs',
   S.PRESS.every(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.title && r.standfirst &&
                      Array.isArray(r.body) && r.body.length &&
                      r.quote && Array.isArray(r.quote.paras) && r.quote.who &&
                      Array.isArray(r.after) && r.after.length));
ok('Releases are ordered newest first',
   S.PRESS.every((r,i) => i === 0 || r.date <= S.PRESS[i-1].date));

ok('Lounge access refers to real tier names',
   S.LOUNGES.every(l => l.access.every(a =>
     !/\b(Horizon|Meridian|Zenith|Apex|Parallel|Tropic|Equator)\b/.test(a))),
   'no stale tier names');

console.log(fails ? `\n${fails} FAILED` : '\nAll checks passed');
process.exit(fails ? 1 : 0);
