# Mollweide Alliance

A corporate-style website for the Mollweide Alliance, a fan-made airline alliance
in *The Airline Simulator*. Static HTML, CSS and JavaScript — no build step, no
dependencies, no server. It works by double-clicking `index.html`, and deploys to
GitHub Pages by pushing the folder.

**Pages** — Home · Members · Network · Lounges · Newsroom · Join the alliance · Member submissions · Book a flight · My bookings

---

## Deploying to GitHub Pages

1. Create a new repository on GitHub (public, so Pages is free).
2. Push this folder to it:

```bash
git init && git add . && git commit -m "Mollweide Alliance site" && git branch -M main
```

Then add your remote and push:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git && git push -u origin main
```

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

Every path in the site is relative, so it works from a repo subfolder without
changes. `.nojekyll` is included so GitHub serves the files as-is.

### Previewing locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>. (A plain double-click on `index.html` also
works — nothing here needs a server.)

---

## Editing the content

**Almost everything lives in one file: [`assets/js/data.js`](assets/js/data.js).**
You do not need to touch HTML or CSS to change the alliance, its members, its
airports or its fares.

| What you want to change | Where |
|---|---|
| Alliance name, tagline, HQ, statement | `ALLIANCE` at the top of `data.js` |
| Member airlines, hubs, colours, blurbs | `MEMBERS` |
| Airports the search and map know about | `AIRPORTS` |
| Cabins, fare multipliers, seat layouts | `CABINS` |
| Aircraft types by range | `AIRCRAFT` |
| Loyalty tiers (Member / Select / Strata / Aurora) | `TIERS` and `PROGRAMME` (the programme is called **Elara**) |
| Cities in the rotating homepage headline | `HERO_CITIES` |
| Lounges, their operator, access rules and photos | `LOUNGES` |
| The two in-game groups and their search strings | `JOIN` |
| Press releases | `PRESS` |
| Where members send material | `ALLIANCE.submitTo` |
| Currency | `CURRENCY` near the top of `assets/js/site.js` |

Items marked `// TODO` in `data.js` are guesses worth confirming — currently the
founding year, the aircraft count, the HQ city, and **Californio Air's hub**
(assumed LAX with SFO as a focus city, since you didn't specify one).

### Adding a member airline

Add an entry to `MEMBERS`, drop a livery render into `assets/img/members/`, and
make sure every code in its `hubs` array also exists in `AIRPORTS`. Run
`node tools/test.js` to confirm nothing is dangling. The livery wall, network
map, footer and flight search all pick it up automatically.

### How members are presented

Members appear as a **livery wall**: the aircraft renders sit side by side with
nothing else on show, and the carrier is named only when you hover (or focus it
with the keyboard). No hubs, countries, fleet counts or descriptions are
displayed. On touch devices, where there is no hover, the names are shown
permanently.

The `hubs`, `focus`, `country`, `joined` and `blurb` fields stay in `data.js`
because the flight engine and the network map still use them — they are simply
not rendered on the member wall.

### The rotating headline

The homepage headline reads *"We take you from A to B"*, cycling pairs drawn at
random from `HERO_CITIES` in `data.js`. Each half changes on an offset so the
line never swaps both names at once, the same city never appears twice in a
pair, and rotation pauses while the browser tab is hidden. Readers who ask for
reduced motion get a single random pair with no animation.

The headline reserves its own height: on load, and again after web fonts settle
and on resize, `startCityRotator()` measures the tallest possible city pairing
at the current viewport and pins `min-height` to it. A name swap therefore never
moves the rest of the page. This is measured rather than hard-coded, because the
right answer depends on the viewport, the font and the city list. Without
JavaScript nothing is reserved — and nothing needs to be, since the names then
never change.

`HERO_CITIES` is **display text only**. Naming a city there does not make it
bookable — for that it also needs an entry in `AIRPORTS` with coordinates. Say
the word if you want the headline cities wired into the search and the map too.

### Typography

Two faces, and the split between them is deliberate. **Figtree** carries
everything readable — headlines, body copy and every small-caps label.
**DM Mono** is reserved for genuine aviation data: times, airport and flight
codes, seat numbers, booking references and map labels. The full list is the
`MONOSPACED DATA` block at the foot of `site.css`; nothing else is monospaced.

### Carriers with many bases

A member's bases are drawn on the network map as follows: carriers with four or
fewer interconnect all of them, while a carrier with more radiates from its
first listed hub. Avni Airlines has seventeen bases and StrayaJet eighteen — drawing every pair
would have added well over 250 lines between them and buried the map under two
airlines' networks. The first entry in a member's `hubs` array is therefore its primary
hub, and worth putting in a sensible order.

### The two Aranya carriers

**Aranya Air** and **Aranya Rukmanidoot** are separate members, not one airline
under two names — the press releases of 23 and 27 September 2026 announce them
individually. They carry the same flowering livery on different airframes:
Aranya Air on the jet (`aranya-air.webp`), Aranya Rukmanidoot on the turboprop
(`aranya-rukmanidoot.webp`). **That pairing is a guess**; swap the two `tail:`
paths in `data.js` if it is the wrong way round.

Their hubs follow their respective releases — Aranya Air at Mumbai, Delhi,
Bangalore, Hyderabad and Chennai; Aranya Rukmanidoot at Mumbai, Delhi,
Bangalore and Kolkata.

### Where things live

- **Home** — headline, what the alliance is, the five benefits, the member
  livery wall, the network map.
- **Lounges** — the lounge finder, then the **Elara** loyalty tiers, since
  lounge access is what the tiers buy.
- **Newsroom** — press releases, from `PRESS` in `data.js`.

### Joining

`join.html` is the page the "Join the Alliance" button in the header points at.
It carries the two groups listed in game, each with the exact string to search
for, and the three steps around them.

**There is no application form** — not on the site and not in the game. The
page says so plainly: find the alliance in the in-game search, then arrange it
on Discord. Do not reintroduce an "apply in game" step.

Both entries live in `JOIN` in `data.js`. `search` is reproduced on the page
character for character and is typed straight back into the game, so a stray
space or a capital letter would send someone looking for a listing that is not
there — `node tools/test.js` holds it to lower-case hyphenated words and checks
the two do not collide.

The two lockups are the real mark and wordmark, differing only in the sub-label
beneath, which is the same `.brand` component the header uses at a larger size.
There is no separate Connect artwork; if one exists, drop it in and replace the
lockup in `renderJoin()`.

The Discord invite is deliberately **not** on the site. It is given in game, and
the page says so.

### Tone

The join and submissions pages are written to invite rather than to instruct.
They set out what helps and why, and say that a partial submission is fine and
will simply prompt a question. If you are editing either page, keep that
register: no "required", no "must", no "cannot be published".

### Member submissions

`submit.html` is the checklist member airlines work from: the six required
fields, the livery artwork specification, and the optional lounge and press
material. The list of two-letter codes already in use and the airport counts are
generated from the live data at page load, so the guidance cannot drift out of
date as members join.

Set `ALLIANCE.submitTo` in `data.js` to wherever material should actually be
sent — it currently reads "the alliance Discord" as a placeholder.

### The hub explorer

`network.html` is a carrier picker beside the projection. It replaced a grid of
sixty hub cards, and then the full route map that used to sit above it. Choosing an airline lifts its bases
out of the map in its own colour, draws arcs from the primary to the rest, and
dims every other hub so the carrier is still seen in context. `initHubExplorer()`
drives it; the base layer — ellipse, graticule and coastlines — comes from
`mapBase()`, shared with the route map.

The section runs light and only the map panel inside `.map-frame` is dark, so
the explorer paints on two surfaces. `tintOn(hex, bg)` walks a colour's
lightness away from whichever ground it is on until it clears 3.6:1, keeping
hue and saturation so the airline still reads as itself — up against the map's
navy, down against the white section. Brand colours are chosen for white, so
fifteen of the seventeen need lifting for the map (Dumont's sits at 1.47:1,
which is invisible) and two need darkening for the page. A test asserts every
member clears the threshold on both, so a new member with an awkward livery
colour cannot quietly disappear.

### The route map

`renderMap()` draws the full network: trunk arcs between primary hubs, feeders,
and a spoke from every destination. **Nothing calls it at the moment.** It was
on the home page and above the hub explorer, and both were removed — the
explorer answers the same question with far less on screen. The function, its
`.map__*` styles and its tests are kept because it is the piece the alliance is
named for, and putting it back is one call against a `.map-frame` holding an
empty `<svg>`.

### The member rail

On the home page the member liveries run along one horizontal rail rather than
wrapping into rows — seventeen tails stacked four deep was more page than the
section warranted. `members.html` still shows the full wall; the difference is
the `liveries--rail` class on the container.

The card width is set so a fraction of the next card always shows, which is what
tells a reader there is more to the right. Arrows appear from 768px up and
paginate by whole cards; they are hidden on touch screens, where swiping is the
obvious gesture. The edge fade is a CSS mask rather than a coloured gradient, so
it works over whatever the section background happens to be.

`renderMembers()` skips the per-card reveal animation inside a rail: the cards
off to the right sit in a clipped box, so revealing them on intersection would
leave most of the line blank until it was scrolled to.

### The lounge finder

`lounges.html` lists alliance lounges, filtered by airport. Each entry names the
**operating carrier** and the **lounge**, and is tinted with that airline's
colour. Entries come from `LOUNGES` in `data.js`:

- `operator` is a member code from `MEMBERS`; `airport` is a code from `AIRPORTS`.
  Both are checked by `node tools/test.js`, so a typo fails loudly.
- `photo` may be `null`. The card then shows a panel in the operator's own
  colour rather than a broken image, so a lounge awaiting photography still
  looks deliberate. Nothing uses that fallback at the moment.
- Guarulhos deliberately points at the same file as Galeão. Sharing one URL
  means the browser downloads it once and paints it twice; give Guarulhos its
  own file whenever a photograph of that lounge exists.
- Lounge names are invented — change them freely.

### No published figures

The site deliberately shows **no statistics** — no destination counts, country
counts, fleet totals or similar. The band that used to carry them has been
removed from every page.

---

## The artwork

Your supplied key visuals were processed into reusable assets:

- `assets/img/mark-blue.png` — the globe mark, transparent background
- `assets/img/wordmark-blue.png` — the MOLLWEIDE wordmark, transparent background
- `assets/img/members/*.webp` — each airline's livery, as supplied: transparent
  cutouts, so they sit cleanly on any background
- `assets/img/photos/*.jpg` — the ramp photography with the marketing text cropped out

`assets/img/members/aranya-turboprop.webp` is a spare second Aranya frame that is
not currently used anywhere.

**To use different artwork**, overwrite these files, keeping the same filenames.
The livery renders are stored at 760px wide, which is twice their display size.

---

## Notes on how it works

- **The network map is a real Mollweide projection.** The alliance is named after
  an equal-area map projection, so the map is drawn in one — the auxiliary angle
  is solved by Newton iteration, and every route is a true great circle sampled
  and projected, splitting cleanly where it crosses the antimeridian. See
  `mollweide()` and `gcPath()` in `assets/js/site.js`.
- **Flight results are deterministic.** The same route, date and cabin always
  produce the same flights, so nothing reshuffles when you navigate back. Change
  the date and you get a different day's schedule.
- **Routes are generated, not listed.** A direct sector exists when at least one
  member serves either end. If none does, the engine builds a one-stop itinerary
  via the alliance hub with the smallest detour, honouring a 55-minute minimum
  connection. Interline connections credit both carriers ("Lemanair + Dumont").
- **Bookings are stored in `localStorage`** under the key `mwa-bookings`. Nothing
  is sent anywhere — there is no backend and no analytics. Bookings are per
  browser and per device, and clearing browser data removes them.
- **The site is light-only**, in the manner of SkyTeam and oneworld — there is
  no dark theme and no theme switch. Reduced-motion preferences are respected.
- The ribbon above the masthead carries a standing disclaimer on every page.
- The homepage hero is a departures-hall photograph. The simulated departure
  boards (the hero ticker and the one on the network page) have both been
  removed, along with their renderers and styles.
- Section labels are plain small-caps text. The thin rule that used to trail
  each one was removed.

---

## Project layout

```
index.html  members.html  network.html  lounges.html  news.html
join.html   submit.html   book.html     bookings.html
assets/
  css/site.css        design system — colours, type, every component
  js/data.js          ← all content lives here
  js/site.js          shared engine: flights, Mollweide projection, renderers
  js/booking.js       search → results → seat map → boarding pass
  img/                mark, wordmark, member liveries, lounges, photography
tools/
  build-pages.js      regenerates the five HTML files (see warning below)
  test.js             engine checks — node tools/test.js
```

### About `tools/build-pages.js`

The header, footer and navigation are identical on all five pages, so they are
defined once in this generator. Running `node tools/build-pages.js` rewrites all
five HTML files from it — handy for adding a nav link or a new page in one place.

> **It overwrites the HTML files.** If you edit a page by hand and then run the
> generator, your edit is lost. Either make your changes inside the generator, or
> just edit the HTML directly and never run it again. Both are fine; pick one.

---

## Disclaimer

This is a fan project for a simulation game. Mollweide Alliance and its member
airlines are fictional. Flights, fares, schedules and bookings are simulated —
no real travel is sold and no payment is ever taken.
