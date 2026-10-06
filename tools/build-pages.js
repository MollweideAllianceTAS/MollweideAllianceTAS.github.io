/* ---------------------------------------------------------------------------
 *  PAGE GENERATOR  —  run with:  node tools/build-pages.js
 *
 *  WARNING: this OVERWRITES every .html file in the project root —
 *  index, members, network, lounges, news, join, submit, book and bookings.
 *  The header, footer and nav live here so you
 *  only edit them once. If you have hand-edited those .html files, either
 *  port your change into this file first, or simply never run this script
 *  again and edit the .html files directly.
 * ------------------------------------------------------------------------ */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const NAV = [
  ['index.html',    'Home'],
  ['members.html',  'Members'],
  ['network.html',  'Network'],
  ['lounges.html',  'Lounges'],
  ['news.html',     'Newsroom'],
  ['bookings.html', 'My bookings']
];

const head = (title, desc) => `<!DOCTYPE html>
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
<meta property="og:image" content="assets/img/photos/lineup-six.jpg">
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
      <p class="ft__about">Nineteen carriers. One network. Named for the equal-area projection that shows every part of the world at its true size.</p>
      <p class="tracked" style="margin-top:1.5rem;font-size:.625rem">Further together · A wider world</p>
    </div>
    <div>
      <h4>Alliance</h4>
      <ul>
        <li><a href="members.html">Member airlines</a></li>
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
<script src="assets/js/data.js"></script>
<script src="assets/js/site.js"></script>`;

/* ========================================================================== */
/*  INDEX                                                                     */
/* ========================================================================== */
const index = head('Mollweide Alliance', 'Nineteen airlines, one network. Explore the Mollweide Alliance route map, member carriers and book a simulated flight.')
+ chrome('index.html') + `
<section class="hero">
  <img class="hero__bg" src="assets/img/photos/hero-departures.jpg" alt="" width="1800" height="667" fetchpriority="high">
  <div class="wrap hero__in">
    <div class="hero__grid">
      <div>
        <p class="tracked" data-rv>Further together · A wider world</p>
        <h1 class="display mt-2" data-rv style="transition-delay:80ms">
          <span class="hero__line">We take you from <b class="hero__city" id="cityA">Tbilisi</b></span>
          <span class="hero__line">to <b class="hero__city" id="cityB">Rio de Janeiro</b></span>
        </h1>
        <div class="brandrule" data-rv style="transition-delay:140ms"></div>
        <p class="lede mt-3" data-rv style="transition-delay:200ms">Nineteen independently operated carriers under one standard of service, one loyalty programme and one coordinated network.</p>
        <div class="hero__actions" data-rv style="transition-delay:260ms">
          <a class="btn btn--sky btn--lg" href="book.html">Book a flight <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <a class="btn btn--ghost btn--lg" href="network.html">Explore the network</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <p class="eyebrow" data-rv>The alliance</p>
        <h2 class="display" data-rv>Named for a projection that <b>shows the world at true size.</b></h2>
      </div>
      <a class="btn btn--line" href="network.html" data-rv>The route network</a>
    </div>
    <div class="two-col">
      <p class="lede" data-rv>Mollweide Alliance brings nineteen independently operated airlines together under one standard of service, one loyalty programme and one coordinated schedule. The name comes from the equal-area projection that shows every part of the world at its true size — a fair description of how the network is put together, region by region, around the carriers that know each one best.</p>
      <div data-rv style="transition-delay:80ms">
        <p class="body-copy">What that means for your journey is simple. Travel across several members and it is still <strong style="color:var(--blue)">one booking, on one reference</strong>, with your bags checked through to where you are going. Our airlines carry one another's flight numbers, so a route no single carrier operates still sells as a single through service.</p>
        <p class="body-copy mt-2">Miles you earn on any member count towards status on every other, and from <strong style="color:var(--blue)">Strata</strong> upwards that status opens alliance lounges across the network. Schedules are timed into connecting waves at each hub, so the onward flight is there when you land — and if a connection slips, it is the alliance that looks after you, not a hand-off between airlines.</p>
      </div>
    </div>
  </div>
</section>

<section class="section on-wash">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow" data-rv>Member airlines</p>
      <h2 class="display" data-rv>Nineteen carriers, <b>each strongest at home.</b></h2></div>
      <a class="btn btn--line" href="members.html" data-rv>View all members</a>
    </div>
    <div class="rail" data-rv data-at="start">
      <button class="rail__nav rail__nav--prev" type="button" data-rail="prev" aria-label="Previous airlines">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
      </button>
      <div class="liveries liveries--rail" id="membersHome"></div>
      <button class="rail__nav rail__nav--next" type="button" data-rail="next" aria-label="Next airlines">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div>
      <h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Plan a journey across <b>the alliance network.</b></h2>
      <p class="lede mt-2" style="color:rgba(255,255,255,.8)">Search every member carrier on a single itinerary.</p>
    </div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="book.html">Book a flight <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  renderMembers(document.getElementById('membersHome'));
  initRail(document.querySelector('.rail'));
  startCityRotator(document.getElementById('cityA'), document.getElementById('cityB'));
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;

/* ========================================================================== */
/*  MEMBERS                                                                   */
/* ========================================================================== */
const members = head('Member airlines', 'The nineteen carriers of the Mollweide Alliance, their hubs and home markets.')
+ chrome('members.html') + `
<section class="phead">
  <img class="phead__bg" src="assets/img/photos/lineup-four.jpg" alt="" width="1440" height="380">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Member airlines</nav>
    <h1 class="display">Nineteen carriers, <b>one standard.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">Each member keeps its own livery, its own cabin and its own home market. What they share is a schedule, a loyalty programme and a promise that a connection onto another member's aircraft feels like the same journey.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow">The members</p><h2 class="display">The <b>member airlines.</b></h2></div>
      <p class="lbl" style="line-height:1.8;white-space:nowrap">Hover to identify each carrier</p>
    </div>
    <div class="liveries" id="membersAll"></div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Nineteen carriers, <b>one booking.</b></h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="book.html">Search flights <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  renderMembers(document.getElementById('membersAll'));
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');

</script>
</body></html>`;

/* ========================================================================== */
/*  NETWORK                                                                   */
/* ========================================================================== */
const network = head('Network', 'The Mollweide Alliance route network, drawn on a true equal-area Mollweide projection.')
+ chrome('network.html') + `
<section class="phead">
  <img class="phead__bg" src="assets/img/photos/aranya-aloha.jpg" alt="" width="1440" height="424">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Network</nav>
    <h1 class="display">The network, <b>at true size.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">Plotted on the Mollweide equal-area projection. Every arc is a real great circle — the shortest path an aircraft would actually fly — so the shape of the network is honest about distance and area alike.</p>
  </div>
</section>

<section class="section" id="hubs">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow">Hub airports</p>
      <h2 class="display">Principal <b>connecting points.</b></h2>
      <p class="lede mt-2">Choose a carrier to lift its own bases out of the network. The rest of the alliance stays on the map, so you can see where each airline sits within it — plotted on the Mollweide equal-area projection the alliance is named for, central meridian 10&deg;E.</p></div>
    </div>

    <div class="hubx" id="hubx">
      <div class="hubx__side" data-hx="side" role="group" aria-label="Choose a carrier"></div>
      <div>
        <div class="map-frame"><svg data-hx="map" role="img" aria-label="Alliance hub airports"></svg></div>
        <p class="hx__note" data-hx="note"></p>
        <ul class="hx__hubs" data-hx="list"></ul>
      </div>
    </div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Search <b>the network.</b></h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="book.html">Search flights <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');

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
      <p class="lede mt-2">Search every member carrier on a single itinerary. Bookings are simulated and stored only in this browser.</p>

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
        <article class="feat"><span class="feat__n">01</span><h3 class="feat__t">Hub-to-hub service</h3><p class="feat__b">Geneva&ndash;Rio de Janeiro, Tbilisi&ndash;Mumbai and Los Angeles&ndash;Shanghai are among the most densely served sectors on the network.</p></article>
        <article class="feat"><span class="feat__n">02</span><h3 class="feat__t">Connecting itineraries</h3><p class="feat__b">Where no member operates a sector directly, the search constructs a one-stop itinerary through the most efficient alliance hub.</p></article>
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
        <p class="eyebrow" style="justify-content:center">Booking confirmed</p>
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
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');
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
      <div class="sec-head"><div><p class="eyebrow">Boarding pass</p></div></div>
      <div id="bkPass"></div>
    </div>
  </div>
</section>
` + footer() + `
<script src="assets/js/booking.js"></script>
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');
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
      <div><p class="eyebrow">Loyalty</p>
      <h2 class="display"><b data-slot="programme">Elara</b></h2>
      <p class="lede mt-2">The alliance loyalty programme, and how lounge access is earned. Four tiers, recognised identically by all nineteen members: miles accrued on any carrier count towards status on every other.</p></div>
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
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');

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
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Nineteen carriers, <b>one network.</b></h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="members.html">Meet the members <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  renderPress(document.getElementById('releases'));
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');
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
      <div><p class="eyebrow">The basics</p>
      <h2 class="display">Six things that <b>get you on the page.</b></h2>
      <p class="lede mt-2">Each one drives something the site renders, so having all six to hand saves a round of questions. If one is still undecided, send the rest anyway.</p></div>
    </div>

    <ol class="spec">
      <li class="spec__item"><span class="spec__n">01</span><div>
        <h3 class="spec__t">Airline name</h3>
        <p class="spec__b">Exactly as it should appear, including any accents. If you also use a shorter trading name, send both and say which is which — the long form is used on your card, the short form in flight results and footers.</p>
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
      <div><p class="eyebrow">Artwork</p>
      <h2 class="display">One livery image, <b>and how it sits.</b></h2>
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
      <div><p class="eyebrow">Optional</p>
      <h2 class="display">Lounges and <b>press releases.</b></h2>
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
      <div><p class="eyebrow">Sending it</p>
      <h2 class="display">Where it goes, <b>and what happens next.</b></h2>
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
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="members.html">The member airlines <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');

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
const join = head('Join the alliance', 'How to join the Mollweide Alliance or Mollweide Connect from inside The Airline Simulator.')
+ chrome('join.html') + `
<section class="phead">
  <img class="phead__bg" src="assets/img/photos/lineup-six.jpg" alt="" width="1440" height="296">
  <div class="wrap phead__in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> <span>/</span> Join the alliance</nav>
    <h1 class="display">Two ways in, <b>both starting in the game.</b></h1>
    <div class="brandrule"></div>
    <p class="lede mt-3">New carriers are always welcome. Find us in the alliance search in <span data-slot="game">The Airline Simulator</span>, then come and say hello on Discord — the rest is a conversation rather than a form.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow" data-rv>The two groups</p>
      <h2 class="display" data-rv>Mollweide Alliance, <b>and Mollweide Connect.</b></h2>
      <p class="lede mt-2" data-rv>Each is listed separately in game. The names below are what the game matches on, so it is worth copying them across rather than typing them out.</p></div>
    </div>
    <div class="joins" id="joinGroups"></div>
  </div>
</section>

<section class="section on-wash">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow">How it works</p>
      <h2 class="display">Three steps, <b>and none of them here.</b></h2>
      <p class="lede mt-2">There is no application form — not on this site and not in the game. Finding us and getting in touch is the whole of it.</p></div>
    </div>

    <ol class="spec">
      <li class="spec__item"><span class="spec__n">01</span><div>
        <h3 class="spec__t">Find us in the game</h3>
        <p class="spec__b">Open the alliance search and look up whichever of the two groups you are interested in. Both names are above, and both can be copied straight from this page.</p>
      </div></li>

      <li class="spec__item"><span class="spec__n">02</span><div>
        <h3 class="spec__t">Come and say hello on Discord</h3>
        <p class="spec__b">The invite links are given in game rather than published here. Since there is nothing to apply through, the channel is where joining is actually arranged — introduce your airline and someone will pick it up from there.</p>
      </div></li>

      <li class="spec__item"><span class="spec__n">03</span><div>
        <h3 class="spec__t">Send a few details when you are ready</h3>
        <p class="spec__b">Once you are in, we will add your carrier to this site: the member wall, the route map, and flight search as an operating carrier. The submissions page sets out what is useful to send, though there is no hurry about it.</p>
        <p class="spec__eg"><b>Next</b> &nbsp;<a href="submit.html" style="color:var(--blue);font-weight:600">What to send for the website</a></p>
      </div></li>
    </ol>
  </div>
</section>

<section class="section on-ink" style="background:var(--blue-ink)">
  <div class="wrap">
    <div class="sec-head">
      <div><p class="eyebrow">Discord</p>
      <h2 class="display">Where the alliance <b>actually happens.</b></h2>
      <p class="lede mt-2">We ask every member airline to be in the channel. It is how the alliance keeps in touch, and it is the only way we have of reaching you.</p></div>
    </div>
    <div class="two-col">
      <ul class="reqs">
        <li><b>The invite links are given in game.</b> We do not publish them here, so the in-game listing is the place to look.</li>
        <li><b>Both groups share the same channel</b>, so you will find everyone in one place whichever you join through.</li>
        <li><b>Anything you would like shown on this site is sent there</b> — airline details, livery artwork, lounges and news.</li>
      </ul>
      <div>
        <p class="lede" style="font-size:1rem">It is also where route coordination and codeshare requests are handled, so it is worth being around for reasons beyond the formality.</p>
        <p class="body-copy mt-3" style="color:var(--tx-on-ink-soft)">If you have found us in game but cannot see an invite anywhere, just mention it when you get in touch and someone will send one over.</p>
      </div>
    </div>
  </div>
</section>

<section class="band section--tight">
  <div class="wrap band__in">
    <div><h2 class="display" style="font-size:clamp(1.6rem,3.4vw,2.6rem)">Already in? <b>Here is what helps.</b></h2></div>
    <a class="btn btn--lg" style="background:#fff;color:var(--blue)" href="submit.html">Member submissions <svg class="btn__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  </div>
</section>
` + footer() + `
<script>
  renderJoin(document.getElementById('joinGroups'));
  initCopy();
  document.getElementById('ftMembers').innerHTML =
    MEMBERS.slice(0,6).map(m => '<li><a href="members.html#'+m.code+'">'+ (m.short||m.name) +'</a></li>').join('');
</script>
</body></html>`;

/* ========================================================================== */
const pages = { 'index.html': index, 'members.html': members, 'network.html': network,
                'lounges.html': lounges, 'news.html': news, 'join.html': join, 'submit.html': submit,
                'book.html': book, 'bookings.html': bookings };
Object.entries(pages).forEach(([f, html]) => {
  fs.writeFileSync(`${ROOT}/${f}`, html);
  console.log(`  ${f.padEnd(16)} ${(html.length/1024).toFixed(1)} KB`);
});
