/* Read-only report: missing route/fleet submissions and range conflicts. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  console, Math, Date, JSON, Set, Intl, window: {},
  document: { addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] }
});
for (const file of ['members.generated.js', 'data.js', 'site.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/js', file), 'utf8'), context);
}
const report = vm.runInContext(`(() => {
  const missingFleet = [], missingRoutes = [], rangeConflicts = [];
  for (const member of MEMBERS) {
    const label = nameOf(member) + ' (' + member.code + ')';
    const fleet = fleetOf(member);
    const sectors = publishedSectors(member);
    if (!fleet.length) missingFleet.push(label);
    if (!sectors.length) missingRoutes.push(label);
    if (!fleet.length) continue;
    for (const [from, to] of sectors) {
      const km = distKm(airport(from), airport(to));
      if (!fleet.some(a => a.maxKm >= km * 1.08)) {
        rangeConflicts.push({ airline: label, sector: from + '–' + to,
          distanceKm: km, requiredRangeKm: Math.ceil(km * 1.08),
          longestDeclaredRangeKm: Math.max(...fleet.map(a => a.maxKm)) });
      }
    }
  }
  return { missingFleet, missingRoutes, rangeConflicts };
})()`, context);
console.log(JSON.stringify(report, null, 2));
