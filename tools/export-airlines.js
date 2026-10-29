#!/usr/bin/env node
/* One-time migration helper: split the old MEMBERS block into individual files. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'content', 'airlines');
fs.mkdirSync(DIR, { recursive: true });
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
vm.runInContext('globalThis.__members = MEMBERS', ctx);
const slug = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
ctx.__members.forEach((member, order) => {
  const value = JSON.parse(JSON.stringify(member));
  value.order = order + 1;
  fs.writeFileSync(path.join(DIR, `${String(order + 1).padStart(2, '0')}-${slug(value.short || value.name)}.json`), `${JSON.stringify(value, null, 2)}\n`);
});
console.log(`Exported ${ctx.__members.length} airlines to ${path.relative(ROOT, DIR)}.`);
