# Booking route rules

Booking uses `profile.routes` and `profile.fleet.current` from each airline's content file. A hub listing, a description of a region, or aircraft on order does not create a bookable flight. Members without route or current fleet details remain visible in the directory and network, but do not receive invented booking services.

Routes use `[origin, destination]` or `[origin, destination, via]`. A via route becomes origin → via → destination. Services can be searched in either direction. Connections join two published, in-range sectors and can use a stopover airport that is not marked as a hub. Onward flights can depart the following day; they must still meet the 55–330 minute connection window. Connections may add at most 45% to the direct distance, or 600 km for short sectors, to avoid unreasonable geographic detours.

Aircraft must belong to the operator's current fleet and have a catalogue range at least 1.08 times the sector's great-circle distance. This is the existing simulation rule, not a calculation of payload, weather or runway performance. Aircraft assignment and schedules remain simulated.

Run `npm run audit:routes` to see missing submissions and range conflicts. The reported DNX OTP–SYD and Avni CCU–SCL services currently exceed this range rule for their declared fleets and are excluded from those airlines' booking results. Their supplied route descriptions are preserved for review. Resolve them with confirmed aircraft or an actual intermediate stop rather than increasing catalogue ranges to make a route fit.

The published lists contain key routes rather than guaranteed complete schedules. Fewer search results are expected until members submit additional routes and fleet details.
