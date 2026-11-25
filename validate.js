// Cleans whatever the admin page sends before it is stored. Unknown fields are dropped.
const crypto = require('crypto');

function str(v, max) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
}
function newId(prefix) { return prefix + crypto.randomBytes(5).toString('hex'); }
function fail(msg) { const e = new Error(msg); e.status = 400; throw e; }

function cleanMenu(input) {
  if (!input || !Array.isArray(input.categories)) fail('Menu data is missing.');
  if (input.categories.length > 60) fail('Too many categories (max 60).');
  let total = 0;
  const seen = new Set();
  const uniq = (id, prefix) => {
    id = str(id, 40).replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id || seen.has(id)) id = newId(prefix);
    seen.add(id);
    return id;
  };

  const categories = input.categories.map((c, ci) => {
    const name = str(c && c.name, 60);
    if (!name) fail('Category ' + (ci + 1) + ' needs a name.');
    const rawItems = Array.isArray(c.items) ? c.items : [];
    if (rawItems.length > 400) fail('Too many dishes in "' + name + '" (max 400).');
    const items = rawItems.map((it) => {
      const iname = str(it && it.name, 80);
      if (!iname) fail('A dish in "' + name + '" has no name.');
      const prices = (Array.isArray(it.prices) ? it.prices : []).slice(0, 4).map((p) => {
        const price = Math.round(Number(p && p.price));
        if (!Number.isFinite(price) || price < 0 || price > 99999) fail('Check the price of "' + iname + '".');
        return { label: str(p.label, 20), price };
      });
      if (!prices.length) fail('"' + iname + '" needs at least one price.');
      total += 1;
      return {
        id: uniq(it.id, 'i'),
        name: iname,
        desc: str(it.desc, 200),
        section: str(it.section, 60),
        type: it.type === 'veg' || it.type === 'nonveg' ? it.type : '',
        available: it.available !== false,
        prices,
      };
    });
    return {
      id: uniq(c.id, 'c'),
      name,
      group: c.group === 'bev' ? 'bev' : 'food',
      hidden: !!c.hidden,
      items,
    };
  });
  if (total > 1500) fail('Too many dishes in total.');
  return { categories, updatedAt: new Date().toISOString() };
}

module.exports = { cleanMenu };
