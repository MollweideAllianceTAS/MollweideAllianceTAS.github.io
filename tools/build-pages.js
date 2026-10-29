/* ---------------------------------------------------------------------------
 *  PAGE GENERATOR  —  run with:  node tools/build-pages.js
 *
 *  WARNING: this OVERWRITES every .html file in the project root —
 *  index, members, network, lounges, news, join, submit, book and bookings,
 *  plus one airline-<slug>.html per member with a `profile` in data.js.
 *  Airline pages for members that no longer have a profile are deleted.
 *  The header, footer and nav live here so you
 *  only edit them once. If you have hand-edited those .html files, either
 *  port your change into this file first, or simply never run this script
 *  again and edit the .html files directly.
 * ------------------------------------------------------------------------ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');

/* The carrier count is written out in nine places. Typing it by hand went
   wrong twice — once silently, and once when a find-and-replace for the count
   also caught a member's base count — so it is read off the data instead. */
/* site.js is loaded too, so the airline pages are named, and their airports
   and colours resolved, by exactly the functions the browser uses. */
const DATA = (() => {
  const ctx = vm.createContext({ console, Math, Date, JSON, Set, Intl, window:{},
    document:{ addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[] } });
  vm.runInContext(fs.readFileSync(`${ROOT}/assets/js/members.generated.js`, 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(`${ROOT}/assets/js/data.js`, 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(`${ROOT}/assets/js/site.js`, 'utf8'), ctx);
  vm.runInContext('globalThis._x = { ALLIANCE, MEMBERS, JOIN, airport, nameOf, groupOf, memberPage, tintOn };', ctx);
  return ctx._x;
})();
const { airport, nameOf, groupOf, memberPage, tintOn } = DATA;
/* The join page names and counts the groups from JOIN in data.js. */
const GROUPS = DATA.JOIN.map(j => j.name);
const groupList = GROUPS.slice(0, -1).join(', ') + ' or ' + GROUPS[GROUPS.length - 1];
const WORDS = ['zero','one','two','three','four','five','six','seven','eight',
  'nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
  'seventeen','eighteen','nineteen','twenty'];
const TENS = { 20:'twenty', 30:'thirty', 40:'forty', 50:'fifty' };
const words = n => n <= 20 ? WORDS[n]
  : (TENS[Math.floor(n / 10) * 10] || String(n)) + (n % 10 ? '-' + WORDS[n % 10] : '');
/* The alliance's stated size in game. The site itself lists only the
   featured airlines, which are counted from MEMBERS wherever a page needs it. */
const SIZE = DATA.ALLIANCE.size;
const Size = SIZE[0].toUpperCase() + SIZE.slice(1);

const NAV = [
  ['index.html',    'Home'],
  ['members.html',  'Members'],
  ['network.html',  'Network'],
  ['lounges.html',  'Lounges'],
  ['news.html',     'Newsroom'],
  ['bookings.html', 'My bookings']
];

const head = (title, desc, image = 'assets/img/photos/lineup-six.jpg') => `<!DOCTYPE html>
<html lang="en">
<head>
<script>document.documentElement.classList.add('js')</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title === "Mollweide Alliance" ? title : title + " · Mollweide Alliance"}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#13398C">
<meta property="og:title" content="${title === "Mollweide Alliance" ? title : title + " · Mollweide Alliance"}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<link rel="icon" href="assets/img/mark-blue.png">
<link rel="apple-touch-icon" href="assets/img/mark-blue.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body>`;

const chrome = (current) => `
<div class="topbar">
  <div class="wrap topbar__in">
    <p>The Mollweide Alliance is a fictitious alliance created for The Airline Simulator</p>
  </div>
</div>

<header class="nav">
  <div class="wrap nav__in">
    <a class="brand" href="index.html" aria-label="Mollweide Alliance home">
      <img class="brand__mark" src="assets/img/mark-blue.png" alt="" width="38" height="33">
      <span class="brand__txt">
        <img class="brand__word" src="assets/img/wordmark-blue.png" alt="Mollweide" width="200" height="17">
        <span class="brand__sub">Alliance</span>
      </span>
    </a>
    <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="navlinks"><span></span><span></span><span></span></button>
    <nav class="nav__links" id="navlinks" data-open="false" aria-label="Main">
      ${NAV.map(([h, l]) => `<a class="nav__link" href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n      ')}
      <a class="btn btn--line nav__cta" href="join.html"${current === 'join.html' ? ' aria-current="page"' : ''}>Join the Alliance</a>
      <a class="btn btn--primary nav__cta" href="book.html">Book</a>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="ft">
  <div class="wrap ft__top">
    <div>
      <a class="brand" href="index.html" aria-label="Mollweide Alliance home">
        <img class="brand__mark" src="assets/img/mark-blue.png" alt="" width="38" height="33">
        <span class="brand__txt">
          <img class="brand__word" src="assets/img/wordmark-blue.png" alt="Mollweide" width="200" height="17">
          <span class="brand__sub">Alliance</span>
        </span>
      </a>
      <p class="ft__about">${Size} carriers. One network. Named for the equal-area projection that shows every part of the world at its true size.</p>
    </div>
    <div>
      <h4>Alliance</h4>
      <ul>
        <li><a href="members.html">Featured airlines</a></li>
        <li><a href="network.html">Route network</a></li>
        <li><a href="lounges.html#loyalty">Elara programme</a></li>
        <li><a href="news.html">Newsroom</a></li>
        <li><a href="join.html">Join the alliance</a></li>
        <li><a href="submit.html">Member submissions</a></li>
      </ul>
    </div>
    <div>
      <h4>Travel</h4>
      <ul>
        <li><a href="book.html">Book a flight</a></li>
        <li><a href="bookings.html">My bookings</a></li>
        <li><a href="lounges.html">Lounges</a></li>
        <li><a href="network.html#hubs">Hub airports</a></li>
      </ul>
    </div>
    <div>
      <h4>Members</h4>
      <ul id="ftMembers"></ul>
    </div>
  </div>
  <div class="wrap ft__bot">
    <p class="ft__disc"><strong>This is a fan-made site for a simulation game.</strong> Mollweide Alliance and its member airlines are fictional entities
      created for <span data-slot="game">The Airline Simulator</span>. Flights, fares, schedules and bookings shown here are simulated.
      No real travel is sold, no payment is taken, and bookings are stored only in your own browser.</p>
    <div class="ft__legal">
      <span>© <span data-slot="year"></span> Mollweide Alliance · Fan project</span>
      <span>Built for <span data-slot="game"></span></span>
    </div>
  </div>
</footer>
<script src="assets/js/members.generated.js"></script>
<script src="assets/js/data.js"></script>
<script src="assets/js/site.js"></script>`;

/* ========================================================================== */
/*  INDEX                                                                     */
/* ========================================================================== */
const index = head('Mollweide Alliance', `${Size} airlines, one network. Explore the Mollweide Alliance route map, its featured airlines, and book a simulated flight.`)
  .replace('</head>', '<link rel="stylesheet" href="assets/css/cinematic.css">\n</head>')
  .replace('<body>', '<body class="cinema">')
+ chrome('index.html') + `
<div class="c-progress" aria-hidden="true"><span></span></div>

<main>
<section class="c-hero" aria-labelledby="c-hero-title">
  <div class="c-hero__grid" aria-hidden="true"></div>
  <div class="c-hero__orbit c-hero__orbit--one" aria-hidden="true"></div>
  <div class="c-hero__orbit c-hero__orbit--two" aria-hidden="true"></div>
  <canvas class="c-hero__globe" id="globe" aria-hidden="true"></canvas>
  <div class="wrap c-hero__inner">
    <div class="c-hero__copy">
      <p class="c-kicker c-reveal">Mollweide Alliance · The Airline Simulator</p>
      <h1 id="c-hero-title" class="c-title c-reveal">The world,<br><strong>at true size.</strong></h1>
      <p class="c-hero__lede c-reveal">Mollweide brings airlines together in The Airline Simulator, offering greater visibility, codeshare opportunities and an active community of operators.</p>
      <div class="c-hero__actions c-reveal">
        <a class="btn btn--sky btn--lg" href="join.html">Discover the alliance <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a class="c-textlink" href="network.html">Explore the network <span>↗</span></a>
      </div>
      <div class="c-route c-reveal" aria-label="A sample journey across the alliance">
        <span class="c-route__code">MWA</span>
        <span><b id="cityA">Tbilisi</b><small>From</small></span>
        <i><span class="c-route__flight" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21.8 11.2 14 7.1V2.8a2 2 0 0 0-4 0v4.3l-7.8 4.1c-.7.4-.7 1.4 0 1.8L10 15v4.2l-2.2 1.5v1.1l4.2-.8 4.2.8v-1.1L14 19.2V15l7.8-2c.8-.2.8-1.4 0-1.8Z"/></svg></span></i>
        <span><b id="cityB">Rio de Janeiro</b><small>To</small></span>
      </div>
    </div>
    <div class="c-hero__facts c-reveal" aria-label="Alliance overview">
      <span><strong>${SIZE}</strong> carriers in game</span>
      <span><strong>${DATA.MEMBERS.length}</strong> featured stories</span>
      <span><strong>1</strong> shared community</span>
    </div>
  </div>
  <a class="c-scroll" href="#meaning" aria-label="Continue to the story"><span></span>Scroll to explore</a>
</section>

<section class="c-intro" id="meaning">
  <div class="wrap c-intro__grid">
    <p class="c-index c-reveal">01 · The meaning</p>
    <div>
      <h2 class="c-heading c-reveal">A map projection became<br><strong>a way of seeing the world.</strong></h2>
      <p class="c-intro__lead c-reveal">Named after an equal-area map projection, Mollweide brings airlines from different regions together to share opportunities and make their networks more visible.</p>
    </div>
  </div>
</section>

<section class="c-story" aria-label="The Mollweide idea">
  <div class="c-story__visual" aria-hidden="true">
    <div class="c-story__phase">
      <span data-map-phase="1"><b>01</b> Entering the network</span>
      <span data-map-phase="2"><b>02</b> Connecting airlines</span>
      <span data-map-phase="3"><b>03</b> Growing together</span>
    </div>
    <div class="c-map">
      <div class="c-map__grid"></div>
      <img class="c-map__aircraft" src="assets/img/brand/mollweide-aircraft.png" alt="" width="2054" height="766">
      <span class="c-map__route c-map__route--a"></span>
      <span class="c-map__route c-map__route--b"></span>
      <span class="c-map__route c-map__route--c"></span>
    </div>
    <p><span data-story-number>01</span> / 03</p>
  </div>
  <div class="c-story__chapters">
    <article class="c-chapter" data-story-step="1">
      <p class="c-kicker">Equal-area by design</p>
      <h3>Every market has its place.</h3>
      <p>The Mollweide projection preserves the relative area of regions across the world. It gives the alliance its name and reflects the breadth of markets represented by its members.</p>
    </article>
    <article class="c-chapter" data-story-step="2">
      <p class="c-kicker">Member visibility</p>
      <h3>Give your airline a wider audience.</h3>
      <p>Member profiles introduce airlines, their hubs and routes to the wider alliance and to visitors exploring the network.</p>
    </article>
    <article class="c-chapter" data-story-step="3">
      <p class="c-kicker">Working together</p>
      <h3>More opportunities to connect.</h3>
      <p>Members can find codeshare partners, coordinate routes and take part in a growing market, with discounts of up to 70% on offers.</p>
    </article>
  </div>
</section>

<section class="c-history">
  <div class="wrap">
    <div class="c-sectionhead">
      <div>
        <p class="c-index c-reveal">02 · Our story</p>
        <h2 class="c-heading c-reveal">A growing alliance.<br><strong>A shared network.</strong></h2>
      </div>
      <p class="c-sectionhead__copy c-reveal">Mollweide brings operators in The Airline Simulator together to share routes, opportunities and ideas across a growing network.</p>
    </div>
    <div class="c-timeline">
      <article class="c-moment c-reveal">
        <time>${DATA.ALLIANCE.founded}</time><i></i>
        <h3>The alliance takes shape</h3>
        <p>Mollweide was founded to bring airlines together across the simulator.</p>
      </article>
      <article class="c-moment c-reveal">
        <time>Today</time><i></i>
        <h3>${Size} carriers in game</h3>
        <p>Carriers across every inhabited continent, with ${DATA.MEMBERS.length} member stories already featured here.</p>
      </article>
      <article class="c-moment c-reveal">
        <time>Next</time><i></i>
        <h3>A growing network</h3>
        <p>More member profiles and routes give airlines further opportunities to be seen.</p>
      </article>
    </div>
  </div>
</section>

<section class="c-members">
  <div class="wrap">
    <div class="c-sectionhead c-sectionhead--light">
      <div>
        <p class="c-index c-reveal">03 · The members</p>
        <h2 class="c-heading c-reveal">Meet the airlines<br><strong>in our network.</strong></h2>
      </div>
      <div class="c-sectionhead__aside c-reveal">
        <p>Explore member airlines, their home markets and the hubs that connect them.</p>
        <a class="c-textlink" href="members.html">Meet the featured airlines <span>↗</span></a>
      </div>
    </div>
  </div>
  <div class="c-members__rail">
    <div class="rail rail--tails" data-at="start">
      <button class="rail__nav rail__nav--prev" type="button" data-rail="prev" aria-label="Previous airlines"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="tails" id="membersHome"></div>
      <button class="rail__nav rail__nav--next" type="button" data-rail="next" aria-label="Next airlines"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
  </div>
</section>

<section class="c-join" id="why-join">
  <div class="wrap">
    <div class="c-sectionhead">
      <div>
        <p class="c-index c-reveal">04 · Why Mollweide</p>
        <h2 class="c-heading c-reveal">More opportunities<br><strong>for your airline.</strong></h2>
      </div>
      <a class="btn btn--primary btn--lg c-reveal" href="join.html">How to join <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>
    <div class="c-benefits">
      <article class="c-benefit c-reveal"><span>01</span><h3>Airline visibility</h3><p>Present your airline, its routes and its hubs to the alliance and a wider audience.</p></article>
      <article class="c-benefit c-reveal"><span>02</span><h3>Codeshare opportunities</h3><p>Meet other operators and explore partnerships that connect your networks.</p></article>
      <article class="c-benefit c-reveal"><span>03</span><h3>An active market</h3><p>Explore a growing market with discounts of up to 70% on offers.</p></article>
      <article class="c-benefit c-reveal"><span>04</span><h3>A growing community</h3><p>Connect with fellow members on Discord to exchange ideas and coordinate opportunities.</p></article>
    </div>
  </div>
</section>

<section class="c-final">
  <div class="c-final__lines" aria-hidden="true"></div>
  <div class="wrap c-final__inner">
    <div class="c-final__brand c-reveal" aria-label="Mollweide Alliance">
      <img class="c-final__brand-mark" src="assets/img/mark-white.png" alt="" width="598" height="524">
      <span class="c-final__brand-type">
        <img class="c-final__brand-word" src="assets/img/wordmark-white.png" alt="Mollweide" width="1980" height="162">
        <span>Alliance</span>
      </span>
    </div>
    <p class="c-kicker c-reveal">The next route starts here</p>
    <h2 class="c-reveal">Explore what your airline<br><strong>can do next.</strong></h2>
    <div class="c-final__actions c-reveal">
      <a class="btn btn--sky btn--lg" href="join.html">Join the alliance</a>
      <a class="btn btn--ghost btn--lg" href="book.html">Experience the network</a>
    </div>
  </div>
</section>
</main>
` + footer() + `
<script src="assets/js/land.js"></script>
<script src="assets/js/cinematic.js"></script>
<script src="assets/js/landing.js"></script>
<script>
  renderTails(document.getElementById('membersHome'));
  initRail(document.querySelector('.rail'));
  startCityRotator(document.getElementById('cityA'), document.getElementById('cityB'),
                   heroGlobe(document.getElementById('globe')));
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;

/* ========================================================================== */
/*  MEMBERS                                                                   */
/* ========================================================================== */
const memberCountries = new Set(DATA.MEMBERS.map(m => m.country)).size;
const memberHubs = new Set(DATA.MEMBERS.flatMap(m => m.hubs || [])).size;
const memberProfiles = DATA.MEMBERS.filter(m => m.profile).length;
const members = head('Featured airlines', `The featured airlines of the Mollweide Alliance, their hubs and home markets.`)
  .replace('</head>', '<link rel="stylesheet" href="assets/css/members-cinematic.css">\n</head>')
  .replace('<body>', '<body class="members-page">')
+ chrome('members.html') + `
<main>
<section class="m-hero">
  <img class="m-hero__image" src="assets/img/photos/hero-departures.jpg" alt="Alliance departures displayed inside an airport terminal" width="1800" height="667">
  <div class="m-hero__veil" aria-hidden="true"></div>
  <div class="wrap m-hero__inner">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Members</nav>
    <p class="m-kicker">The airlines behind the network</p>
    <h1>Our airlines.<br><strong>One alliance.</strong></h1>
    <p class="m-hero__lede">Discover the airlines, home markets and hubs represented across Mollweide's network.</p>
    <div class="m-hero__facts" aria-label="Featured member overview">
      <span><strong>${DATA.MEMBERS.length}</strong> featured airlines</span>
      <span><strong>${memberCountries}</strong> home countries</span>
      <span><strong>${memberHubs}</strong> listed hubs</span>
    </div>
  </div>
  <div class="m-hero__manifest" aria-hidden="true">
    <div>${DATA.MEMBERS.map(m => `<span><i>${m.code}</i>${nameOf(m)}</span>`).join('')}</div>
    <div>${DATA.MEMBERS.map(m => `<span><i>${m.code}</i>${nameOf(m)}</span>`).join('')}</div>
  </div>
</section>

<section class="m-directory" id="directory">
  <div class="wrap">
    <div class="m-directory__head">
      <div><p class="m-index">01 · Member directory</p><h2>${DATA.MEMBERS.length} airlines.<br><strong>${memberCountries} countries.</strong></h2></div>
      <p>One searchable manifest. Find a member by airline, home country or hub.</p>
    </div>
    <div class="m-tools">
      <label class="m-search"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m16.5 16.5 4 4"></path></svg><input id="memberSearch" type="search" aria-label="Search members" placeholder="Search airline, country or hub" autocomplete="off"></label>
      <div class="m-filters" aria-label="Filter members">
        <button type="button" data-member-filter="all" aria-pressed="true">All <span>${DATA.MEMBERS.length}</span></button>
        <button type="button" data-member-filter="profile" aria-pressed="false">Stories <span>${memberProfiles}</span></button>
        <button type="button" data-member-filter="connect" aria-pressed="false">Connect</button>
      </div>
      <p class="m-count" aria-live="polite"><span id="memberCount">${DATA.MEMBERS.length}</span> airlines shown</p>
    </div>
    <div class="member-grid" id="membersAll"></div>
    <p class="m-empty" id="memberEmpty" hidden>No airlines match that search yet.</p>
  </div>
</section>

<section class="m-exit">
  <div class="wrap m-exit__inner">
    <p class="m-index">02 · Continue the journey</p>
    <h2>Explore the network.<br><strong>Find a connection.</strong></h2>
    <div class="m-exit__foot">
      <p>Turn the alliance line-up into a connected itinerary across the network.</p>
      <a class="btn btn--sky btn--lg" href="book.html">Search alliance flights <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>
  </div>
</section>
</main>
` + footer() + `
<script>
  renderMembers(document.getElementById('membersAll'));
  (function () {
    const directory = document.getElementById('membersAll');
    const search = document.getElementById('memberSearch');
    const buttons = Array.from(document.querySelectorAll('[data-member-filter]'));
    const count = document.getElementById('memberCount');
    const empty = document.getElementById('memberEmpty');
    let filter = 'all';
    function updateMembers() {
      const query = search.value.trim().toLowerCase();
      let shown = 0;
      directory.querySelectorAll('[data-member]').forEach(card => {
        const kindMatch = filter === 'all' || card.dataset[filter] === 'true';
        const textMatch = !query || card.dataset.search.includes(query);
        card.hidden = !(kindMatch && textMatch);
        if (!card.hidden) shown += 1;
      });
      count.textContent = shown;
      empty.hidden = shown !== 0;
    }
    search.addEventListener('input', updateMembers);
    buttons.forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.memberFilter;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      updateMembers();
    }));
  }());
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');

</script>
</body></html>`;

/* ========================================================================== */
/*  NETWORK                                                                   */
/* ========================================================================== */
const network = head('Network', 'The Mollweide Alliance route network on an interactive globe: every hub, and where it connects, by airline.')
.replace('</head>', '<link rel="stylesheet" href="assets/css/network-join.css">\n</head>')
.replace('<body>', '<body class="network-page">')
+ chrome('network.html') + `
<main>
<section class="n-hero">
  <img class="n-hero__image" src="assets/img/photos/hero-departures.jpg" alt="Alliance departures displayed across an airport terminal board" width="1800" height="667">
  <div class="n-hero__veil" aria-hidden="true"></div>
  <div class="wrap n-hero__inner">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Network</nav>
    <p class="n-kicker">Alliance network · Live directory</p>
    <h1>${memberHubs} hubs.<br><strong>${DATA.MEMBERS.length} airlines.</strong></h1>
    <p class="n-hero__lede">Every listed base and member route, drawn on one globe. The lines follow real great circles rather than a flattened map.</p>
    <a class="n-hero__jump" href="#hubs">Explore the network <span aria-hidden="true">↓</span></a>
  </div>
</section>

<section class="n-explorer" id="hubs">
  <div class="wrap">
    <div class="n-sectionhead">
      <div><p class="n-index">01 · Interactive network</p><h2>Turn the globe.<br><strong>Read the routes.</strong></h2></div>
      <p>Choose an airline to isolate its bases and routes. Choose a hub to see the airlines and destinations connected through it.</p>
    </div>

    <div class="hubx" id="hubx">
      <div class="hubx__side" data-hx="side" role="group" aria-label="Choose an airline"></div>
      <div class="map-frame hxg__frame">
        <canvas class="hx__globe" data-hx="globe" aria-label="Globe of the alliance's hub airports. Choose a hub from the list beside the globe to see its routes."></canvas>
        <div class="hx__zoom"><button type="button" data-hx-zoom="in" aria-label="Zoom in">+</button><button type="button" data-hx-zoom="out" aria-label="Zoom out">&minus;</button></div>
      </div>
      <aside class="hxp">
        <div class="hxp__browse" data-hx="browse">
          <div class="hxp__tools">
            <label class="hxp__search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
              <input type="search" data-hx="q" placeholder="Search a city, code or airline" aria-label="Search hubs" autocomplete="off"></label>
            <select class="hxp__country" data-hx="country" aria-label="Filter hubs by country"></select>
          </div>
          <p class="hx__note" data-hx="note"></p>
          <ul class="hx__hubs" data-hx="list"></ul>
        </div>
        <div class="hxd" data-hx="detail" hidden aria-live="polite"></div>
      </aside>
    </div>
  </div>
</section>

<section class="n-next">
  <div class="wrap n-next__inner">
    <div><p class="n-index">02 · Use the network</p><h2>Turn a route into<br><strong>an itinerary.</strong></h2></div>
    <div class="n-next__action"><p>Flight search uses these same members and hubs to build direct and connecting journeys.</p><a class="btn btn--sky btn--lg" href="book.html">Search alliance flights <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
  </div>
</section>
</main>
` + footer() + `
<script src="assets/js/land.js"></script>
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');

  initHubExplorer(document.getElementById('hubx'));

</script>
</body></html>`;

/* ========================================================================== */
/*  BOOK                                                                      */
/* ========================================================================== */
const book = head('Book a flight', 'Search the Mollweide Alliance network and make a simulated booking — flights, seat map and boarding pass.')
+ chrome('book.html') + `
<section class="phead" style="padding-block:clamp(2rem,4vw,3rem)">
  <img class="phead__bg" src="assets/img/photos/lineup-aloha.jpg" alt="" width="1080" height="388">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Book a flight</nav>
    <div class="steps" id="stepper"></div>
  </div>
</section>

<main id="bookingApp">

  <!-- STEP 1 ------------------------------------------------------------- -->
  <section class="section" data-step="1" style="padding-top:clamp(2rem,4vw,3rem)">
    <div class="wrap">
      <h1 class="display" style="font-size:clamp(1.75rem,4vw,3rem)">Plan <b>your journey.</b></h1>
      <p class="lede mt-2">Search published member routes, with aircraft from their current fleets. Bookings are simulated and stored only in this browser.</p>

      <form class="search-card mt-4" id="searchForm" autocomplete="off">
        <div class="search-card__hd" role="tablist" aria-label="Trip type">
          <button type="button" class="tab" role="tab" data-trip="return" aria-selected="true">Return</button>
          <button type="button" class="tab" role="tab" data-trip="oneway" aria-selected="false">One way</button>
        </div>
        <div class="search-card__bd">
          <div class="field-grid">
            <div class="field">
              <label class="field__lbl" for="from">From</label>
              <input class="field__in" id="from" placeholder="City or airport" aria-describedby="fromHint" role="combobox" aria-expanded="false" aria-autocomplete="list">
              <span class="field__hint" id="fromHint"></span>
              <div class="ac" id="fromAC" hidden role="listbox" aria-label="Origin suggestions"></div>
              <button type="button" class="swap" id="swap" aria-label="Swap origin and destination">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4v13M7 20l-3-3M7 20l3-3M17 20V7M17 4l-3 3M17 4l3 3"/></svg>
              </button>
            </div>
            <div class="field">
              <label class="field__lbl" for="to">To</label>
              <input class="field__in" id="to" placeholder="City or airport" aria-describedby="toHint" role="combobox" aria-expanded="false" aria-autocomplete="list">
              <span class="field__hint" id="toHint"></span>
              <div class="ac" id="toAC" hidden role="listbox" aria-label="Destination suggestions"></div>
            </div>
            <div class="field">
              <label class="field__lbl" for="dateOut">Departing</label>
              <input class="field__in" type="date" id="dateOut" required>
              <span class="field__hint"></span>
            </div>
            <div class="field" id="retField">
              <label class="field__lbl" for="dateRet">Returning</label>
              <input class="field__in" type="date" id="dateRet">
              <span class="field__hint"></span>
            </div>
            <div class="field">
              <label class="field__lbl" for="cabin">Cabin</label>
              <select class="field__in" id="cabin"></select>
              <span class="field__hint"></span>
            </div>
          </div>
          <div style="display:grid;gap:1rem;grid-template-columns:1fr;margin-top:1rem" class="pax-row">
            <div class="field">
              <label class="field__lbl" for="pax">Passengers</label>
              <select class="field__in" id="pax"></select>
            </div>
            <button class="btn btn--primary btn--lg" type="submit" style="align-self:end;min-height:50px">
              Search flights
              <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </form>

      <div class="feats mt-6" style="grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))">
        <article class="feat"><span class="feat__n">01</span><h3 class="feat__t">Published services</h3><p class="feat__b">Explore routes supplied by member airlines. Aircraft are selected from their declared current fleets, within the site's range limits.</p></article>
        <article class="feat"><span class="feat__n">02</span><h3 class="feat__t">Connecting itineraries</h3><p class="feat__b">One-stop journeys combine published flight sectors, including member stopover services. Results depend on the route and fleet details available.</p></article>
        <article class="feat"><span class="feat__n">03</span><h3 class="feat__t">Simulated service</h3><p class="feat__b">No payment is taken and no data leaves your device. Itineraries are held in this browser's local storage.</p></article>
      </div>
    </div>
  </section>

  <!-- STEP 2 ------------------------------------------------------------- -->
  <section class="section hide" data-step="2" style="padding-top:clamp(2rem,4vw,3rem)">
    <div class="wrap">
      <div id="resultsTitle"></div>
      <p class="lbl mt-1" id="resultsSub" style="font-size:.6875rem"></p>
      <div class="rail hide mt-3" id="outRecap" style="position:static;max-width:26rem"></div>
      <div class="results-bar mt-4">
        <span class="results-bar__n" id="resultsCount"></span>
        <div class="sortset" id="sortset">
          <button class="sortbtn" data-sort="dep" aria-pressed="true">Departure</button>
          <button class="sortbtn" data-sort="arr" aria-pressed="false">Arrival</button>
          <button class="sortbtn" data-sort="dur" aria-pressed="false">Duration</button>
          <button class="sortbtn" data-sort="price" aria-pressed="false">Price</button>
        </div>
      </div>
      <div class="results" id="results"></div>
      <button class="btn btn--line mt-4" data-goto="1">← Change search</button>
    </div>
  </section>

  <!-- STEP 3 ------------------------------------------------------------- -->
  <section class="section hide" data-step="3" style="padding-top:clamp(2rem,4vw,3rem)">
    <div class="wrap">
      <h2 class="display" style="font-size:clamp(1.5rem,3.4vw,2.4rem)">Select <b>your seat.</b></h2>
      <p class="lede mt-2">Seats shown in grey are unavailable. Rows outlined in green offer additional legroom.</p>
      <div class="seat-layout mt-4">
        <div class="cabin" id="seatPane"></div>
        <div class="rail" id="rail"></div>
      </div>
      <button class="btn btn--line mt-4" data-goto="2">← Back to flights</button>
    </div>
  </section>

  <!-- STEP 4 ------------------------------------------------------------- -->
  <section class="section hide" data-step="4" style="padding-top:clamp(2rem,4vw,3rem);background:var(--paper-2)">
    <div class="wrap">
      <div class="center" style="max-width:48rem;margin-inline:auto">
        <div id="confirmMsg"></div>
        <p class="lede mt-2" id="confirmSub" style="margin-inline:auto"></p>
      </div>
      <div class="mt-6" id="passes"></div>
      <div class="flexbtns mt-6 no-print" style="justify-content:center">
        <button class="btn btn--primary" id="printBtn">Print or save as PDF</button>
        <a class="btn btn--line" href="bookings.html">My bookings</a>
        <button class="btn btn--line" id="againBtn">Make another booking</button>
      </div>
    </div>
  </section>
</main>
` + footer() + `
<script src="assets/js/booking.js"></script>
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
<style>@media(min-width:680px){.pax-row{grid-template-columns:1fr auto!important}.pax-row .field{max-width:16rem}}</style>
</body></html>`;

/* ========================================================================== */
/*  MY BOOKINGS                                                               */
/* ========================================================================== */
const bookings = head('My bookings', 'Your saved Mollweide Alliance pretend bookings, stored in this browser.')
+ chrome('bookings.html') + `
<section class="phead" style="padding-block:clamp(2rem,5vw,3.5rem)">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> My bookings</nav>
    <h1 class="display">Your <b>itineraries.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">Itineraries are held in this browser only. They will not appear on another device, and clearing your browsing data removes them.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="results-bar">
      <span class="results-bar__n" id="bkCount"></span>
      <div class="sortset no-print">
        <a class="btn btn--primary btn--sm" href="book.html">New booking</a>
        <button class="btn btn--line btn--sm" id="bkPrint">Print</button>
        <button class="btn btn--danger btn--sm" id="bkClear">Clear all</button>
      </div>
    </div>
    <div class="bk-list" id="bkList"></div>

    <div class="hide mt-6" id="bkPassWrap">
      <div class="sec-head"><div></div></div>
      <div id="bkPass"></div>
    </div>
  </div>
</section>
` + footer() + `
<script src="assets/js/booking.js"></script>
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;


/* ========================================================================== */
/*  LOUNGES                                                                   */
/* ========================================================================== */
const lounges = head('Lounges', 'Find Mollweide Alliance lounges across the network, with the operating carrier and access rules.')
+ chrome('lounges.html') + `
<section class="phead">
  <img class="phead__bg" src="assets/img/lounges/caucausair-tbs.jpg" alt="" width="1200" height="900">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Lounges</nav>
    <h1 class="display">Somewhere to wait, <b>properly.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">Member carriers operate lounges across the network and open them to one another. Eligibility earned on one airline is honoured by every other.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="lounge-bar">
      <label class="field">
        <span class="field__lbl">Airport</span>
        <select class="field__in" id="loungeAirport"></select>
      </label>
      <span class="lounge-bar__n" id="loungeCount"></span>
    </div>
    <div class="lounges" id="lounges"></div>
  </div>
</section>

<section class="section on-ink" id="loyalty" style="background:#0A2050">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="display"><b data-slot="programme">Elara</b></h2>
      <p class="lede mt-2">The alliance loyalty programme, and how lounge access is earned. Four tiers, recognised identically by every member: miles accrued on any carrier count towards status on every other.</p></div>
    </div>
    <div class="tiers" id="tiers"></div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Lounge access from <b>Strata</b> upwards.</h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="book.html">Book a flight <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');

  renderTiers(document.getElementById('tiers'));

  var sel = document.getElementById('loungeAirport');
  sel.innerHTML = '<option value="all">All airports</option>' +
    loungeAirports().map(function(a){ return '<option value="'+a.code+'">'+a.city+' ('+a.code+')</option>'; }).join('');

  function drawLounges(){
    renderLounges(document.getElementById('lounges'), sel.value);
    var n = document.querySelectorAll('#lounges .lounge').length;
    document.getElementById('loungeCount').innerHTML = '<b>'+n+'</b> lounge'+(n===1?'':'s');
  }
  sel.addEventListener('change', drawLounges);
  drawLounges();
</script>
</body></html>`;


/* ========================================================================== */
/*  NEWSROOM                                                                  */
/* ========================================================================== */
const news = head('Newsroom', 'Press releases and announcements from the Mollweide Alliance.')
+ chrome('news.html') + `
<section class="phead">
  <img class="phead__bg" src="assets/img/photos/lineup-six.jpg" alt="" width="1440" height="300">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Newsroom</nav>
    <h1 class="display">Alliance <b>announcements.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">Press releases from Mollweide Alliance on membership, network and product.</p>
  </div>
</section>

<section class="section">
  <div class="wrap" style="display:grid;gap:clamp(2rem,5vw,4.5rem);grid-template-columns:1fr" id="newsWrap">
    <div class="releases" id="releases"></div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">${Size} carriers, <b>one network.</b></h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="members.html">Meet the members <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  renderPress(document.getElementById('releases'));
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;


/* ========================================================================== */
/*  MEMBER SUBMISSIONS                                                        */
/* ========================================================================== */
const submit = head('Member submissions', 'What member airlines need to send for the Mollweide Alliance website to be updated.')
+ chrome('submit.html') + `
<section class="phead">
  <img class="phead__bg" src="assets/img/photos/lineup-four.jpg" alt="" width="1440" height="296">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Member submissions</nav>
    <h1 class="display">What to send us, <b>and roughly what form.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">Everything on this site comes out of one data file, so an airline can be added or changed in a few minutes. This page is a guide to what helps rather than a set of hurdles — send what you have and we will fill in the gaps together.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="display">Six things that <b>get you on the page.</b></h2>
      <p class="lede mt-2">Each one drives something the site renders, so having all six to hand saves a round of questions. If one is still undecided, send the rest anyway.</p></div>
    </div>

    <ol class="spec">
      <li class="spec__item"><span class="spec__n">01</span><div>
        <h3 class="spec__t">Airline name</h3>
        <p class="spec__b">Exactly as it should appear, including any accents. If you also trade under a shorter name, send both and say which is which — the short form is what appears on the member wall, in flight results and in footers, with the registered name kept behind it.</p>
        <p class="spec__eg"><b>Example</b> &nbsp;Dumont Linhas Aéreas, short form Dumont</p>
      </div></li>

      <li class="spec__item"><span class="spec__n">02</span><div>
        <h3 class="spec__t">Two-letter code</h3>
        <p class="spec__b">Used on your flight numbers, on result rows and on boarding passes. It needs to be unique, so have a glance at the list below — and a second choice is handy in case your first is already taken.</p>
        <p class="spec__eg"><b>Codes already in use</b></p>
        <div class="codes mt-1" id="codesInUse"></div>
      </div></li>

      <li class="spec__item"><span class="spec__n">03</span><div>
        <h3 class="spec__t">Country of registration</h3>
        <p class="spec__b">The country the airline is based in, written out in full. It appears on your member card and nowhere else.</p>
      </div></li>

      <li class="spec__item"><span class="spec__n">04</span><div>
        <h3 class="spec__t">Brand colour</h3>
        <p class="spec__b">One hex value. It tints your member card, your rows in flight results, your seat map and any lounge you operate. The dominant colour of your tail usually works better than the lightest, since it has to hold up as a thin rule and as small text.</p>
        <p class="spec__eg"><b>Example</b> &nbsp;<code>#1B3A63</code></p>
      </div></li>

      <li class="spec__item"><span class="spec__n">05</span><div>
        <h3 class="spec__t">Hubs, in order of importance</h3>
        <p class="spec__b">IATA codes preferred; full airport names are fine if you are unsure. <strong style="color:var(--blue)">The first hub you list is treated as your primary</strong> — on the network map your routes radiate from it, so it is worth putting your real base first. Focus cities are welcome too, just say which is which. If you are based somewhere not already in the network, mention it: we will need its latitude and longitude before the map can plot it.</p>
        <p class="spec__eg"><b>Example</b> &nbsp;Hubs: GIG, GRU &nbsp;·&nbsp; Focus cities: none<br><span id="netSize"></span></p>
      </div></li>

      <li class="spec__item"><span class="spec__n">06</span><div>
        <h3 class="spec__t">A short description</h3>
        <p class="spec__b">One or two sentences, around forty words, written in the third person. What the airline does and where it flies tends to read better than how good it is, since the rest of the site is written that way. A rough draft is fine — we are happy to tidy it.</p>
        <p class="spec__eg"><b>Example</b> &nbsp;“The alliance's African member, linking East and West Africa through twin hubs at Nairobi and Dakar.”</p>
      </div></li>
    </ol>
  </div>
</section>

<section class="section on-ink" style="background:var(--blue-ink)">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="display">One livery image, <b>and how it sits.</b></h2>
      <p class="lede mt-2">This is the part that most often needs a second go, so it is worth a closer look. Every member appears as a cutout on a white page beside the rest of the fleet, which means an image framed differently from the others tends to show.</p></div>
    </div>
    <div class="two-col">
      <ul class="reqs">
        <li><b>A side view of the rear fuselage and tail</b>, nose to the left and tail to the right, which is how the rest of the fleet is framed.</li>
        <li><b>A transparent background</b> — PNG or WebP with a real alpha channel. A white rectangle will show as a white box on the page.</li>
        <li><b>Around 1448 × 1086 pixels or larger</b>, in a 4:3 frame. We resize to 760 pixels wide, so anything much smaller softens.</li>
        <li><b>No lettering</b> — titles, registrations, captions and watermarks all tend to fight with the layout.</li>
        <li><b>Nothing behind the aircraft</b> — no sky, no tarmac, no neighbours.</li>
      </ul>
      <div>
        <p class="lede" style="font-size:1rem">If all you have is a photograph, send it anyway and say so. We can use one in the meantime — it will simply look a little different from the rest of the wall until a cutout comes along.</p>
        <p class="body-copy mt-3" style="color:var(--tx-on-ink-soft)">It also helps if the aircraft fills roughly as much of the frame as its neighbours do. The images sit side by side with no borders, so a tail much larger or smaller than the rest is the first thing the eye lands on. If yours is framed differently we can usually re-crop it.</p>
      </div>
    </div>
  </div>
</section>

<section class="section on-wash">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="display">Lounges and <b>press releases.</b></h2>
      <p class="lede mt-2">Neither is needed to join, and neither is expected. Send them whenever you have them.</p></div>
    </div>
    <div class="feats" style="grid-template-columns:repeat(auto-fit,minmax(18rem,1fr))">
      <article class="feat">
        <span class="feat__n">Lounge</span>
        <h3 class="feat__t">What a lounge entry needs</h3>
        <p class="feat__b">The lounge name, the airport, where it is inside the terminal, opening hours, who may use it, and a handful of facilities. A photograph is a bonus — a 4:3 image of around 1200 × 900 pixels, and an ordinary photograph is fine here rather than a cutout. Without one the card simply falls back to a panel in your brand colour, which looks perfectly deliberate.</p>
      </article>
      <article class="feat">
        <span class="feat__n">Press</span>
        <h3 class="feat__t">What a press release needs</h3>
        <p class="feat__b">A headline, the city and date it is issued from, an opening sentence that stands alone, the body in paragraphs, and a quote with the name and job title of whoever is speaking. Plain text is ideal — the newsroom applies its own formatting on top.</p>
      </article>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="display">Where it goes, <b>and what happens next.</b></h2>
      <p class="lede mt-2">Nothing here is set in stone. If you are unsure about any of it, send what you have and ask.</p></div>
    </div>
    <div class="two-col">
      <p class="lede">Send it in one message to <strong style="color:var(--blue)" data-slot="submitTo">the alliance Discord</strong>, with any images attached rather than linked. If something is missing we will just ask, though gathering it first usually gets you on the site sooner.</p>
      <div>
        <p class="body-copy">Changes to an existing airline work the same way: say what is changing and send only the parts that differ. Hub changes are the most common, and the order matters — if your primary base has moved, do mention it, because that is what anchors your routes on the map.</p>
        <p class="body-copy mt-2">Once published, your airline appears on the member wall, in flight search as an operating carrier, on the network map, and in any connecting itinerary the search builds through your hubs.</p>
      </div>
    </div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">See how it <b>ends up looking.</b></h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="members.html">The featured airlines <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');

  // Generated from the live data so the guidance can never go stale
  document.getElementById('codesInUse').innerHTML =
    MEMBERS.map(m => m.code).sort().map(c => '<span>'+c+'</span>').join('');
  document.getElementById('netSize').textContent =
    'The network currently holds ' + AIRPORTS.length + ' airports, of which ' +
    AIRPORTS.filter(function(a){return a.hub;}).length + ' are alliance hubs.';
  document.querySelectorAll('[data-slot="submitTo"]').forEach(function(e){ e.textContent = ALLIANCE.submitTo; });
</script>
</body></html>`;

/* ========================================================================== */
/*  JOIN                                                                      */
/* ========================================================================== */
const join = head('Join the alliance', `How to join the ${groupList} from inside The Airline Simulator.`)
.replace('</head>', '<link rel="stylesheet" href="assets/css/network-join.css">\n</head>')
.replace('<body>', '<body class="join-page">')
+ chrome('join.html') + `
<main>
<section class="j-hero">
  <img class="j-hero__image" src="assets/img/photos/join-mollweide-projection.png" alt="" width="1672" height="941">
  <div class="j-hero__veil" aria-hidden="true"></div>
  <div class="j-hero__brand-scene" aria-hidden="true">
    <span class="j-hero__orbit j-hero__orbit--outer"></span>
    <span class="j-hero__orbit j-hero__orbit--inner"></span>
    <img class="j-hero__mark" src="assets/img/mark-white.png" alt="" width="598" height="524">
    <span class="j-hero__brandline">Mollweide · Alliance</span>
  </div>
  <div class="wrap j-hero__inner">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Join the alliance</nav>
    <p class="j-kicker">Membership · The Airline Simulator</p>
    <h1>No form.<br><strong>Start in the game.</strong></h1>
    <p class="j-hero__lede">Join a growing community of operators, find codeshare partners and give your airline greater visibility. Find Mollweide in The Airline Simulator and connect with members on Discord.</p>
    <div class="j-hero__facts" aria-label="How joining works">
      <span><b>${GROUPS.length}</b> in-game listings</span>
      <span><b>1</b> shared Discord</span>
      <span><b>0</b> website forms</span>
    </div>
  </div>
</section>

<section class="j-groups">
  <div class="wrap">
    <div class="j-sectionhead">
      <div><p class="j-index">01 · Find the listing</p><h2>Three names<br><strong>inside the game.</strong></h2></div>
      <p>Each group appears separately in alliance search. Copy the exact search string for the group you have been directed to.</p>
    </div>
    <div class="joins" id="joinGroups"></div>
  </div>
</section>

<section class="j-process">
  <div class="wrap">
    <div class="j-process__intro">
      <p class="j-index">02 · What happens next</p>
      <h2>From search<br><strong>to membership.</strong></h2>
      <p>There is no application form on this website. These are the only steps.</p>
    </div>

    <ol class="j-steps">
      <li><span class="j-steps__n">01</span><div>
        <h3 class="spec__t">Find us in the game</h3>
        <p class="spec__b">Open the alliance search and look up whichever of the ${words(GROUPS.length)} groups you are interested in. Every name is above, and each can be copied straight from this page.</p>
      </div></li>

      <li><span class="j-steps__n">02</span><div>
        <h3 class="spec__t">Come and say hello on Discord</h3>
        <p class="spec__b">The invite links are given in game rather than published here. Since there is nothing to apply through, the channel is where joining is actually arranged — introduce your airline and someone will pick it up from there.</p>
      </div></li>

      <li><span class="j-steps__n">03</span><div>
        <h3 class="spec__t">Send a few details when you are ready</h3>
        <p class="spec__b">Once you are in, we will add your carrier to this site: the member wall, the route map, and flight search as an operating carrier. The submissions page sets out what is useful to send, though there is no hurry about it.</p>
        <a class="j-steps__link" href="submit.html">What to send for the website ↗</a>
      </div></li>
    </ol>
  </div>
</section>

<section class="j-channel">
  <div class="wrap j-channel__inner">
    <div class="j-channel__title">
      <p class="j-index">03 · The shared channel</p>
      <h2>The alliance<br><strong>meets on Discord.</strong></h2>
      <p>Every member airline is asked to be there. It is how the alliance stays in contact.</p>
    </div>
    <div class="j-channel__details">
      <ul>
        <li><b>The invite links are given in game.</b> We do not publish them here, so the in-game listing is the place to look.</li>
        <li><b>All ${words(GROUPS.length)} groups share the same channel</b>, so you will find everyone in one place whichever you join through.</li>
        <li><b>Anything you would like shown on this site is sent there</b> — airline details, livery artwork, lounges and news.</li>
      </ul>
      <p>Route coordination and codeshare requests happen there too. If the invite is missing from an in-game listing, ask a member for the current link.</p>
    </div>
  </div>
</section>

<section class="j-next">
  <div class="wrap j-next__inner">
    <div><p class="j-index">Already a member?</p><h2>Prepare your<br><strong>airline profile.</strong></h2></div>
    <div><p>The submissions guide explains the few details and images needed to add an airline to the website.</p><a class="btn btn--primary btn--lg" href="submit.html">Open submissions guide <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>
  </div>
</section>
</main>
` + footer() + `
<script>
  renderJoin(document.getElementById('joinGroups'));
  initCopy();
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;

/* ========================================================================== */
/*  AIRLINE PAGES — one per member with a `profile`                          */
/*  Every page has the same four parts in the same order — profile, network, */
/*  fleet, then the booking band — so members read alike whatever they sent. */
/* ========================================================================== */
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const groupBy = (rows, key) => rows.reduce((g, r) => {
  const k = key(r); (g.get(k) || g.set(k, []).get(k)).push(r); return g;
}, new Map());

const fleetBlock = rows => `
    <div class="al-fleet">${[...groupBy(rows, r => r[0])].map(([maker, types]) => `
      <div class="al-fleet__grp">
        <p class="al-fleet__mk">${esc(maker)}</p>
        <ul class="al-fleet__list">${types.map(([, type, note]) => `
          <li><span class="al-fleet__t">${esc(type)}</span>${note ? `<span class="al-fleet__n">${esc(note)}</span>` : ''}</li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>`;

const airlinePage = m => {
  const P = m.profile, nm = nameOf(m), hub = airport(m.hubs[0]);
  const group = groupOf(m).name;
  return head(nm, m.blurb, m.tail) + chrome('members.html') + `
<main class="al" style="--al:${tintOn(m.color, '#FFFFFF')};--al-ink:${tintOn(m.color, '#071A45')}">
<section class="phead">
  <img class="phead__bg" src="assets/img/photos/lineup-four.jpg" alt="" width="1440" height="380">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> <a href="members.html">Featured airlines</a> <span>/</span> ${esc(nm)}</nav>
    <h1 class="display"><b>${esc(nm)}</b></h1>${m.short ? `
    <p class="al-reg">${esc(m.name)}</p>` : ''}
    <div class="brandrule al-rule"></div>
    <p class="lede mt-3">${esc(m.blurb)}</p>
  </div>
</section>

<section class="section">
  <div class="wrap two-col">
    <div>
      <h2 class="display">The airline, <b>in brief.</b></h2>
      ${P.about.map(t => `<p class="body-copy al-p">${esc(t)}</p>`).join('\n      ')}
    </div>
    <aside class="al-card">
      <img class="al-card__img" src="${m.tail}" alt="${esc(m.name)} aircraft livery" width="380" height="285">
      <dl class="al-facts">
        <div><dt>Airline code</dt><dd><span class="code">${m.code}</span></dd></div>
        <div><dt>Country</dt><dd>${esc(m.country)}</dd></div>
${P.founded ? `        <div><dt>Founded</dt><dd>${esc(P.founded)}</dd></div>
` : ''}        <div><dt>Primary hub</dt><dd>${esc(hub.city)} ${esc(hub.name)} <span class="code">${hub.code}</span></dd></div>
        <div><dt>Membership</dt><dd>${group}, since ${m.joined}</dd></div>
      </dl>
    </aside>
  </div>
</section>

<section class="section on-wash">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="display">Where it <b>flies.</b></h2></div></div>
    <div class="${(P.routes || []).length ? 'two-col' : 'al-solo'}">
      <div>
        ${P.network.map(t => `<p class="body-copy al-p">${esc(t)}</p>`).join('\n        ')}
        <h3 class="al-sub">Hubs</h3>
        <ul class="al-hubs">${m.hubs.map((c, i) => { const a = airport(c); return `
          <li class="al-hub"><span class="al-hub__code code">${c}</span><span class="al-hub__city">${esc(a.city)}${i === 0 ? ' <em>Primary</em>' : ''}</span><span class="al-hub__apt">${esc(a.name)}, ${esc(a.country)}</span></li>`; }).join('')}
        </ul>${(m.focus || []).length ? `
        <h3 class="al-sub">Focus cities</h3>
        <ul class="al-hubs">${m.focus.map(c => { const a = airport(c); return `
          <li class="al-hub"><span class="al-hub__code code">${c}</span><span class="al-hub__city">${esc(a.city)}</span><span class="al-hub__apt">${esc(a.name)}, ${esc(a.country)}</span></li>`; }).join('')}
        </ul>` : ''}
      </div>${(P.routes || []).length ? `
      <div>
        <h3 class="al-sub al-sub--top">Key routes</h3>${[...groupBy(P.routes, r => r[0])].map(([from, rows]) => `
        <div class="al-rgrp">
          <p class="al-rgrp__from">From ${esc(airport(from).city)} <span class="code">${from}</span></p>
          <ul class="al-routes">${rows.map(([, to, via]) => { const a = airport(to); return `
            <li><span class="code">${to}</span><span class="al-routes__city">${esc(a.city)}${via ? ` <span class="al-routes__via">via ${esc(airport(via).city)} <span class="code">${via}</span></span>` : ''}</span><span class="al-routes__ctry">${esc(a.country)}</span></li>`; }).join('')}
          </ul>
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="display">What it <b>flies.</b></h2></div></div>
    <h3 class="al-sub al-sub--top">In service</h3>${fleetBlock(P.fleet.current)}${P.fleet.incoming.length ? `
    <h3 class="al-sub">Joining the fleet</h3>${fleetBlock(P.fleet.incoming)}` : ''}
  </div>
</section>
</main>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Fly ${esc(nm)}, <b>book with the alliance.</b></h2></div>
    <div class="flexbtns">
      <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="book.html">Search flights <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      <a class="btn btn--lg btn--ghost" href="members.html">All members</a>
    </div>
  </div>
</section>
` + footer() + `
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="'+(memberPage(m)||'members.html#'+m.code)+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;
};

const airlines = Object.fromEntries(DATA.MEMBERS.filter(m => m.profile)
  .map(m => [memberPage(m), airlinePage(m)]));
fs.readdirSync(ROOT).filter(f => /^airline-.+\.html$/.test(f) && !airlines[f]).forEach(f => {
  fs.unlinkSync(`${ROOT}/${f}`);
  console.log(`  ${f.padEnd(16)} removed (no profile)`);
});

/* ========================================================================== */
const pages = { 'index.html': index, 'members.html': members, 'network.html': network,
                'lounges.html': lounges, 'news.html': news, 'join.html': join, 'submit.html': submit,
                'book.html': book, 'bookings.html': bookings, ...airlines };
/* GitHub Pages lets browsers keep a file for ten minutes, so a returning
   visitor could get a fresh page running yesterday's data.js. Each script and
   stylesheet is requested with a hash of its contents, which changes exactly
   when the file does. Run this generator after editing any of them. */
const stamp = html => html.replace(/((?:src|href)="(assets\/(?:js|css)\/[\w.-]+\.(?:js|css)))"/g,
  (_, attr, file) => `${attr}?v=${crypto.createHash('sha1')
    .update(fs.readFileSync(`${ROOT}/${file}`)).digest('hex').slice(0, 8)}"`);

Object.entries(pages).forEach(([f, html]) => {
  html = stamp(html);
  fs.writeFileSync(`${ROOT}/${f}`, html);
  console.log(`  ${f.padEnd(16)} ${(html.length/1024).toFixed(1)} KB`);
});
