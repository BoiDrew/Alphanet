async function load() {
  try {
    const r = await window.storage.get(SK, true);
    if (r && r.value) requests = JSON.parse(r.value);
  } catch(e) { requests = []; }
  rebuildFilters();
  render();
}

async function save() {
  try { await window.storage.set(SK, JSON.stringify(requests), true); } catch(e) {}
}