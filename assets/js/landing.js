/* Final approach: a hidden landing game. Tap the plane on the homepage route
   twice (or open index.html#land) to play. Every visitor flies the same
   approach on a given day, so scores shared on Discord are comparable. */
(function () {
  const trigger = document.querySelector('.c-route__flight');
  let taps = 0, tapTimer = 0, game = null;

  if (trigger) trigger.addEventListener('pointerdown', e => {
    e.preventDefault();
    taps++; clearTimeout(tapTimer);
    if (taps >= 2) { taps = 0; open(); }
    else tapTimer = setTimeout(() => { taps = 0; }, 450);
  });
  /* ---- today's approach ----------------------------------------------- */
  const today = new Date();
  const dayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const dayLabel = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  function rng(seed) {                                   // mulberry32
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function approach() {
    const r = rng(+dayKey.replace(/-/g, ''));
    const sky = [];
    for (let i = 0; i < 70; i++) sky.push([r() * 1600, r() * .6, .4 + r() * 1.2]);
    const town = [];
    for (let x = -400; x < 4200; x += 18 + r() * 40) town.push([x, 14 + r() * 46, 12 + r() * 26]);
    return {
      rwy:   Math.round(1900 + r() * 900),               // runway length, m
      aim:   300,                                        // aiming point, m past the threshold
      x0:    -1150,                                      // start, m before the threshold
      alt0:  48 + r() * 30,                              // start height, m (on the slope is about 76)
      gust:  .5 + r() * 1.1,                             // gust strength, m/s²
      phase: [r() * 6.3, r() * 6.3, r() * 6.3],
      sky, town
    };
  }

  /* ---- shell ----------------------------------------------------------- */
  function open() {
    if (game) return;
    const city = (document.getElementById('cityB') || {}).textContent || 'the alliance';
    const el = document.createElement('div');
    el.className = 'lg';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Final approach, a landing game');
    el.innerHTML = `
      <div class="lg__panel">
        <header class="lg__head">
          <div><h2>Final approach</h2><p>Today's approach into ${esc(city)} · ${dayLabel}</p></div>
          <button class="lg__close" type="button" aria-label="Close">×</button>
        </header>
        <div class="lg__stage">
          <canvas class="lg__canvas"></canvas>
          <div class="lg__card" data-card></div>
        </div>
        <p class="lg__hint">Hold to raise the nose, let go to descend. Space or ↑ works too.</p>
      </div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add('lg-open');
    game = play(el, city);
    el.querySelector('.lg__close').addEventListener('click', close);
    el.addEventListener('pointerdown', e => { if (e.target === el) close(); });
  }
  function close() {
    if (!game) return;
    game.stop();
    game.el.remove();
    game = null;
    document.documentElement.classList.remove('lg-open');
    if (location.hash === '#land') history.replaceState(null, '', location.pathname + location.search);
  }
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  if (location.hash === '#land') open();

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]); }
  function store(key, val) {
    try { if (val === undefined) return +localStorage.getItem(key) || 0; localStorage.setItem(key, val); } catch (e) { return 0; }
  }

  /* ---- the game -------------------------------------------------------- */
  function play(el, city) {
    const A = approach();
    const canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d');
    const card = el.querySelector('[data-card]');
    let W = 0, H = 0, raf = 0, last = 0, hold = false, s;

    function size() {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      draw();
    }
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    function reset() {
      s = { phase: 'ready', t: 0, x: A.x0, alt: A.alt0, vs: -3.6, v: 72, pitch: 0, end: 0, result: null };
      intro();
    }

    /* input */
    const down = e => { if (e.button > 0) return; e.preventDefault(); hold = true; if (s.phase === 'ready') start(); };
    const up = () => { hold = false; };
    canvas.addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    const key = e => {
      if (e.key !== ' ' && e.key !== 'ArrowUp') return;
      if (e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      hold = e.type === 'keydown';
      if (hold && s.phase === 'ready') start();
    };
    addEventListener('keydown', key);
    addEventListener('keyup', key);

    function start() {
      card.hidden = true;
      if (document.activeElement) document.activeElement.blur();
      s.phase = 'fly';
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function tick(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      step(dt);
      draw();
      if (s.phase !== 'done') raf = requestAnimationFrame(tick);
    }

    function step(dt) {
      s.t += dt;
      if (s.phase === 'fly') {
        const p = A.phase, t = s.t;
        const gust = A.gust * (Math.sin(t * 1.3 + p[0]) + .6 * Math.sin(t * 2.9 + p[1]) + .3 * Math.sin(t * 5.1 + p[2]));
        s.v = Math.max(50, Math.min(74, s.v + (hold ? -1.6 : .7) * dt));
        const target = s.v < 58 ? -7 : hold ? 1.6 : -4.6;   // too slow and it sinks whatever you do
        s.vs += ((target - s.vs) * 1.25 + gust) * dt;
        s.x += s.v * dt;
        s.alt += s.vs * dt;
        s.pitch += ((hold ? .1 : -.03) + s.vs * .012 - s.pitch) * Math.min(1, dt * 4);
        if (s.alt <= 0) touchdown();
        else if (s.alt > 160 || s.x > A.rwy) finish(0, 'Went around', 'You never touched down. Have another go.');
      } else if (s.phase === 'roll') {
        s.v = Math.max(0, s.v - (s.result.crash ? 30 : 12) * dt);
        s.x += s.v * dt;
        s.pitch += (0 - s.pitch) * Math.min(1, dt * 5);
        if (s.t - s.end > 1.6) { s.phase = 'done'; showResult(); }
      }
    }

    function touchdown() {
      s.alt = 0;
      const fpm = Math.round(-s.vs * 196.85), off = Math.round(s.x - A.aim);
      if (s.x < 0) return finish(0, 'Short of the runway', 'The grass was softer than expected.', fpm, off, true);
      if (fpm > 720) return finish(0, 'Hard landing', 'The engineers would like a word.', fpm, off, true);
      const soft = 600 * Math.max(0, Math.min(1, (720 - fpm) / 660));
      const long = s.x > A.rwy - 650;
      const zone = long ? 0 : 400 * Math.max(0, 1 - Math.abs(off) / 500);
      const score = Math.round(soft + zone);
      const [title, line] =
        long ? ['Long landing', 'Down safely, with not much runway to spare.'] :
        score >= 900 ? ['Butter', 'Passengers asked whether you had landed yet.'] :
        score >= 750 ? ['Smooth', 'A landing to be proud of.'] :
        score >= 500 ? ['Solid', 'Safe, and nobody spilled their coffee.'] :
                       ['Firm, but safe', 'The overhead bins opened themselves.'];
      finish(score, title, line, fpm, off);
    }

    function finish(score, title, line, fpm, off, crash) {
      s.result = { score, title, line, fpm, off, crash: !!crash };
      s.phase = 'roll'; s.end = s.t;
      if (crash) s.v = Math.min(s.v, 30);
    }

    function showResult() {
      const r = s.result;
      const bestKey = 'mw-landing-' + dayKey;
      const best = Math.max(store(bestKey), r.score);
      store(bestKey, best);
      const facts = r.fpm === undefined ? '' :
        `<dl class="lg__facts">
           <div><dt>Touchdown</dt><dd>${r.fpm} fpm</dd></div>
           <div><dt>From the aiming point</dt><dd>${r.off > 0 ? '+' : ''}${r.off} m</dd></div>
           <div><dt>Today's best</dt><dd>${best}</dd></div>
         </dl>`;
      card.innerHTML = `
        <p class="lg__score"><b>${r.score}</b> points</p>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.line)}</p>
        ${facts}
        <div class="lg__actions">
          <button class="btn btn--sky" type="button" data-again>Fly again</button>
          <button class="btn btn--ghost" type="button" data-share>Copy for Discord</button>
        </div>
        <p class="lg__note" data-note></p>`;
      card.hidden = false;
      card.querySelector('[data-again]').addEventListener('click', () => { reset(); start(); });
      card.querySelector('[data-share]').addEventListener('click', () => share(r, best));
      card.querySelector('[data-again]').focus();
    }

    function share(r, best) {
      const url = location.origin + location.pathname.replace(/[^/]*$/, '') + '#land';
      const detail = r.fpm === undefined ? r.title.toLowerCase() : `${r.fpm} fpm, ${Math.abs(r.off)} m ${r.off >= 0 ? 'past' : 'before'} the aiming point`;
      const text = `✈️ Mollweide final approach, ${dayLabel}: ${r.score} points (${detail}). Today's best: ${best}. Beat it: ${url}`;
      const note = card.querySelector('[data-note]');
      const done = () => { note.textContent = 'Copied. Paste it into the alliance Discord.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => { note.textContent = text; });
      else note.textContent = text;
    }

    function intro() {
      card.innerHTML = `
        <h3>Bring it down gently</h3>
        <p>Land on the runway as softly as you can, as close to the aiming point as you can. The four lights tell you if you're too high (white) or too low (red).</p>
        <div class="lg__actions"><button class="btn btn--sky" type="button" data-go>Start the approach</button></div>`;
      card.hidden = false;
      card.querySelector('[data-go]').addEventListener('click', start);
    }

    /* ---- drawing ------------------------------------------------------- */
    function draw() {
      if (!W || !s) return;
      // heights to scale, distances squeezed so the runway shows well ahead
      const gy = H * .78, k = (gy - H * .12) / 95, kx = k * .28, px = W * .22;
      const sx = x => px + (x - s.x) * kx;

      const g = ctx.createLinearGradient(0, 0, 0, gy);
      g.addColorStop(0, '#071A45'); g.addColorStop(1, '#1B4A8F');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, gy);

      // stars drift slowly, a little parallax
      ctx.fillStyle = 'rgba(143,196,232,.5)';
      for (const [x, y, r] of A.sky) {
        const X = ((x - s.x * .05) % 1600 + 1600) % 1600 * (W / 1600);
        ctx.beginPath(); ctx.arc(X, y * gy, r, 0, 7); ctx.fill();
      }
      // skyline beyond the airfield
      ctx.fillStyle = 'rgba(12,37,96,.85)';
      for (const [x, h, w] of A.town) {
        const X = px + (x - s.x) * kx * .5;
        if (X > -60 && X < W + 60) ctx.fillRect(X, gy - h * k * .35, w * kx * 1.4, h * k * .35);
      }
      ctx.fillStyle = '#0C2560'; ctx.fillRect(0, gy, W, H - gy);

      // runway, lights and markings
      const t0 = sx(0), t1 = sx(A.rwy);
      ctx.fillStyle = '#3B4E78'; ctx.fillRect(t0, gy, t1 - t0, 6);
      ctx.fillStyle = '#F2F6FC';
      for (let x = 0; x < 60; x += 10) ctx.fillRect(sx(x + 6), gy + 1, 5 * kx, 4);
      ctx.fillRect(sx(A.aim - 30), gy - 1, 60 * kx, 4);
      for (let x = 120; x < A.rwy - 40; x += 60) ctx.fillRect(sx(x), gy + 2, 30 * kx, 1.5);
      for (let x = 0; x <= A.rwy; x += 90) light(sx(x), gy - 1, '#FFFFFF');
      for (let x = -300; x < 0; x += 30) light(sx(x), gy - 1, '#8FC4E8');
      light(t1, gy - 1, '#E2544A');

      // aircraft
      plane(px, gy - s.alt * k, s.pitch, s.result && s.result.crash && s.phase !== 'fly');

      hud(gy);
    }

    function light(x, y, c) {
      if (x < -10 || x > W + 10) return;
      ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function plane(x, y, pitch, bent) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-pitch + (bent ? .12 : 0));
      const u = Math.max(.75, Math.min(1.25, W / 760));
      ctx.scale(u, u);
      ctx.fillStyle = '#13398C';                         // far wing, behind the body
      ctx.beginPath(); ctx.moveTo(-2, -9); ctx.lineTo(14, -20); ctx.lineTo(20, -20); ctx.lineTo(14, -9); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();                                   // fuselage, nose to the right, wheels at y = 0
      ctx.moveTo(-44, -13); ctx.lineTo(40, -13);
      ctx.quadraticCurveTo(54, -12, 56, -7); ctx.quadraticCurveTo(54, -3, 44, -3);
      ctx.lineTo(-34, -3); ctx.lineTo(-48, -10); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#13398C';                         // fin and tailplane
      ctx.beginPath(); ctx.moveTo(-30, -13); ctx.lineTo(-46, -32); ctx.lineTo(-38, -32); ctx.lineTo(-18, -13); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-40, -11); ctx.lineTo(-52, -15); ctx.lineTo(-46, -15); ctx.lineTo(-34, -11); ctx.fill();
      ctx.fillStyle = '#4E9BD4';                         // cheatline
      ctx.fillRect(-42, -8.5, 92, 1.5);
      ctx.fillStyle = 'rgba(19,57,140,.55)';             // windows
      for (let w = -30; w < 36; w += 5) ctx.fillRect(w, -11.5, 2, 1.6);
      ctx.fillStyle = '#0C2560'; ctx.fillRect(46, -11.5, 4, 2);
      ctx.fillStyle = '#8FC4E8';                         // engine
      ctx.beginPath(); ctx.ellipse(8, -3, 9, 3.2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#A9BBD6';                         // gear
      ctx.fillRect(-1, -3, 1.5, 2); ctx.fillRect(38, -3, 1.5, 2);
      ctx.beginPath(); ctx.arc(-.3, -1, 1.8, 0, 7); ctx.arc(38.7, -1, 1.5, 0, 7); ctx.fill();
      ctx.restore();
    }

    function hud(gy) {
      const ft = Math.max(0, Math.round(s.alt * 3.281)), fpm = Math.round(s.vs * 196.85);
      const kt = Math.round(s.v * 1.944), dist = Math.round(A.aim - s.x);
      ctx.font = '500 12px "DM Mono", ui-monospace, monospace';
      ctx.textBaseline = 'top';
      const rows = [['Height', ft + ' ft'], ['Descent', fpm + ' fpm'], ['Speed', kt + ' kt'],
                    ['To aim', (dist > 0 ? dist : 0) + ' m']];
      rows.forEach(([a, b], i) => {
        ctx.fillStyle = 'rgba(169,187,214,.8)'; ctx.fillText(a, 16, 14 + i * 18);
        ctx.fillStyle = (a === 'Speed' && s.v < 60) || (a === 'Descent' && s.alt < 15 && fpm < -720) ? '#F0897F' : '#F2F6FC';
        ctx.fillText(b, 86, 14 + i * 18);
      });
      // approach lights: white over red is on the slope
      const ang = Math.atan2(s.alt, Math.max(1, A.aim - s.x)) * 180 / Math.PI;
      [3.5, 3.17, 2.83, 2.5].forEach((th, i) => {
        const c = s.x < A.aim && ang > th ? '#FFFFFF' : '#E2544A';
        ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(W - 70 + i * 16, 22, 4, 0, 7); ctx.fill();
      });
      ctx.shadowBlur = 0;
      if (s.v < 60 && s.phase === 'fly') {
        ctx.fillStyle = '#F0897F'; ctx.textAlign = 'right';
        ctx.fillText('Too slow, let go', W - 16, 40); ctx.textAlign = 'left';
      }
    }

    reset();
    return {
      el,
      stop() {
        cancelAnimationFrame(raf); ro.disconnect();
        removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        removeEventListener('keydown', key); removeEventListener('keyup', key);
      }
    };
  }
})();
