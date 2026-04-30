const SK = 'cleaning_requests_v2';
let requests = [];
let currentTab = 'pending';
let currentPage = 'list';





function showPage(p) {
  currentPage = p;
  document.getElementById('page-list').style.display = p === 'list' ? '' : 'none';
  document.getElementById('page-new').style.display = p === 'new' ? '' : 'none';
  document.getElementById('page-analytics').style.display = p === 'analytics' ? '' : 'none';
  document.getElementById('main-nav').style.display = p === 'list' ? '' : 'none';
  if (p === 'analytics') renderAnalytics();
}

function gotoNew() {
  rebuildSiteList();
  showPage('new');
}

function switchTab(t) {
  currentTab = t;
  document.querySelectorAll('#main-nav .tab').forEach((el, i) => {
    el.classList.toggle('active', ['pending','urgent','ordered','done','all'][i] === t);
  });
  render();
}

function rebuildSiteList() {
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))];
  const dl = document.getElementById('site-list');
  dl.innerHTML = sites.map(s => `<option value="${escHtml(s)}">`).join('');
}

function rebuildFilters() {
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))].sort();
  const cats = [...new Set(requests.map(r => r.category).filter(Boolean))].sort();
  const fs = document.getElementById('filter-site');
  const curSite = fs.value;
  fs.innerHTML = '<option value="">All job sites</option>' + sites.map(s => `<option${curSite===s?' selected':''}>${escHtml(s)}</option>`).join('');
  const fc = document.getElementById('filter-cat');
  const curCat = fc.value;
  fc.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option${curCat===c?' selected':''}>${escHtml(c)}</option>`).join('');
}

function submitRequest() {
  const name = document.getElementById('f-name').value.trim();
  const site = document.getElementById('f-site').value.trim();
  const product = document.getElementById('f-product').value.trim();
  if (!name || !product || !site) { toast('Name, job site and product are required.'); return; }
  const cost = parseFloat(document.getElementById('f-cost').value) || null;
  requests.unshift({
    id: Date.now(),
    name, site, product,
    category: document.getElementById('f-cat').value,
    qty: document.getElementById('f-qty').value.trim(),
    cost,
    priority: document.getElementById('f-priority').value,
    frequency: document.getElementById('f-freq').value,
    supplier: document.getElementById('f-supplier').value.trim(),
    notes: document.getElementById('f-notes').value.trim(),
    status: 'pending',
    date: new Date().toLocaleDateString('en-GB'),
    ts: Date.now()
  });
  save();
  ['f-name','f-site','f-product','f-qty','f-cost','f-supplier','f-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-priority').value = 'normal';
  document.getElementById('f-cat').value = 'Cleaning chemicals';
  document.getElementById('f-freq').value = 'one-off';
  currentTab = document.getElementById('f-priority').value === 'urgent' ? 'urgent' : 'pending';
  rebuildFilters();
  showPage('list');
  render();
  toast('Request submitted!');
}

function setStatus(id, status) {
  const r = requests.find(x => x.id === id);
  if (r) { r.status = status; save(); render(); toast('Updated!'); }
}

function deleteReq(id) {
  requests = requests.filter(x => x.id !== id);
  save(); rebuildFilters(); render(); toast('Removed.');
}

function filtered() {
  const site = document.getElementById('filter-site').value;
  const cat = document.getElementById('filter-cat').value;
  const q = (document.getElementById('filter-search').value || '').toLowerCase();
  return requests.filter(r => {
    if (currentTab === 'pending' && !(r.status === 'pending' && r.priority !== 'urgent')) return false;
    if (currentTab === 'urgent' && !(r.status === 'pending' && r.priority === 'urgent')) return false;
    if (currentTab === 'ordered' && r.status !== 'ordered') return false;
    if (currentTab === 'done' && r.status !== 'done') return false;
    if (site && r.site !== site) return false;
    if (cat && r.category !== cat) return false;
    if (q && !((r.product+r.name+r.site+r.notes).toLowerCase().includes(q))) return false;
    return true;
  });
}

function render() {
  const pending = requests.filter(r => r.status === 'pending' && r.priority !== 'urgent').length;
  const urgent = requests.filter(r => r.status === 'pending' && r.priority === 'urgent').length;
  const ordered = requests.filter(r => r.status === 'ordered').length;
  const done = requests.filter(r => r.status === 'done').length;
  document.getElementById('cnt-pending').textContent = pending;
  document.getElementById('cnt-urgent').textContent = urgent;
  document.getElementById('cnt-ordered').textContent = ordered;
  document.getElementById('cnt-done').textContent = done;
  document.getElementById('cnt-all').textContent = requests.length;

  const list = filtered();
  const body = document.getElementById('list-body');
  if (!list.length) {
    body.innerHTML = '<div class="empty">No requests here yet.</div>';
    return;
  }
  body.innerHTML = list.map(r => {
    const bClass = r.status === 'done' ? 'b-done' : r.status === 'ordered' ? 'b-ordered' : r.priority === 'urgent' ? 'b-urgent' : 'b-pending';
    const bLabel = r.status === 'done' ? 'Done' : r.status === 'ordered' ? 'Ordered' : r.priority === 'urgent' ? 'Urgent' : 'Pending';
    const actionBtns = [];
    if (r.status === 'pending') actionBtns.push(`<button class="btn btn-sm" onclick="setStatus(${r.id},'ordered')">Mark ordered</button>`);
    if (r.status !== 'done') actionBtns.push(`<button class="btn btn-sm" style="color:var(--color-text-success);border-color:var(--color-border-success);" onclick="setStatus(${r.id},'done')">Mark done</button>`);
    if (r.status === 'done') actionBtns.push(`<button class="btn btn-sm" onclick="setStatus(${r.id},'pending')">Reopen</button>`);
    actionBtns.push(`<button class="btn btn-sm" onclick="deleteReq(${r.id})">Remove</button>`);
    return `<div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <div class="req-title">${escHtml(r.product)}${r.qty?` <span style="font-weight:400;font-size:13px;color:var(--color-text-secondary);">— ${escHtml(r.qty)}</span>`:''}</div>
          <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;">
            <span class="site-chip">${escHtml(r.site)}</span>
            <span class="badge" style="background:var(--color-background-secondary);color:var(--color-text-secondary);">${escHtml(r.category||'')}</span>
          </div>
          <div class="req-meta">
            By <strong>${escHtml(r.name)}</strong> &middot; ${r.date}
            ${r.supplier?` &middot; Supplier: ${escHtml(r.supplier)}`:''}
            ${r.frequency && r.frequency!=='one-off'?` &middot; ${escHtml(r.frequency)}`:''}
            ${r.cost!=null?` &middot; ~$${r.cost.toFixed(2)} each`:''}
            ${r.notes?`<br>${escHtml(r.notes)}`:''}
          </div>
        </div>
        <span class="badge ${bClass}" style="flex-shrink:0;">${bLabel}</span>
      </div>
      <div class="row-actions">${actionBtns.join('')}</div>
    </div>`;
  }).join('');
}



function exportCSV() {
  const headers = ['Date','Worker','Job site','Product','Category','Qty','Priority','Status','Unit cost','Supplier','Frequency','Notes'];
  const rows = requests.map(r => [r.date,r.name,r.site||'',r.product,r.category||'',r.qty||'',r.priority,r.status,r.cost!=null?r.cost.toFixed(2):'',r.supplier||'',r.frequency||'',r.notes||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'supply_requests.csv';
  a.click();
}

function escHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

load();