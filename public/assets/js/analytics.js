export function renderAnalytics(requests) {
  if (!requests) return;

  /* KPIs */
  const total = requests.length;
  const pending = requests.filter(r => r.status === "pending").length;
  const done = requests.filter(r => r.status === "done").length;
  const urgent = requests.filter(r => r.priority === "urgent").length;
  const spend = requests.filter(r => r.cost).reduce((s, r) => s + r.cost, 0);
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))].length;

  const kpi = document.getElementById("kpi-row");
  if (kpi) {
    kpi.innerHTML = `
      <div class="metric">
        <div class="metric-label">Total requests</div>
        <div class="metric-val">${total}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Pending</div>
        <div class="metric-val">${pending}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Fulfilled</div>
        <div class="metric-val">${done}</div>
        <div class="metric-sub">${total ? Math.round(done / total * 100) : 0}% completion</div>
      </div>
      <div class="metric">
        <div class="metric-label">Urgent flagged</div>
        <div class="metric-val">${urgent}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Est. total spend</div>
        <div class="metric-val">$${spend.toFixed(0)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Job sites</div>
        <div class="metric-val">${sites}</div>
      </div>
    `;
  }

  function byKey(key) {
    const map = {};
    requests.forEach(r => {
      const k = r[key] || "Unknown";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v }));
  }

  barChart("chart-site", byKey("site").slice(0, 8));
  barChart("chart-cat", byKey("category").slice(0, 7), "amber");
  barChart("chart-workers", byKey("name").slice(0, 8), "amber");

  /* Products */
  const prodMap = {};
  requests.forEach(r => { if (r.product) prodMap[r.product] = (prodMap[r.product] || 0) + 1; });
  const topProds = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ k, v }));
  barChart("chart-products", topProds, "teal");

  /* Spend */
  const spendMap = {};
  requests.filter(r => r.cost).forEach(r => {
    const k = r.category || "Other";
    spendMap[k] = (spendMap[k] || 0) + r.cost;
  });
  const spendData = Object.entries(spendMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v: Math.round(v) }));
  barChart("chart-spend", spendData, "teal");

  renderExportTable(requests);
}

function renderExportTable(requests) {
  const tbl = document.getElementById("export-table");
  if (!tbl) return;
  tbl.innerHTML = `
    <thead><tr>
      <th>Date</th><th>Worker</th><th>Job site</th><th>Product</th>
      <th>Category</th><th>Qty</th><th>Priority</th><th>Status</th>
      <th>Cost</th><th>Supplier</th><th>Frequency</th><th>Notes</th>
    </tr></thead>
    <tbody>
      ${requests.map(r => `<tr>
        <td>${r.date}</td>
        <td>${escHtml(r.name)}</td>
        <td>${escHtml(r.site || "")}</td>
        <td>${escHtml(r.product)}</td>
        <td>${escHtml(r.category || "")}</td>
        <td>${escHtml(r.qty || "")}</td>
        <td>${r.priority}</td>
        <td>${r.status}</td>
        <td>${r.cost != null ? "$" + r.cost.toFixed(2) : ""}</td>
        <td>${escHtml(r.supplier || "")}</td>
        <td>${escHtml(r.frequency || "")}</td>
        <td>${escHtml(r.notes || "")}</td>
      </tr>`).join("")}
    </tbody>
  `;
}

function barChart(containerId, data, colorClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!data.length) { el.innerHTML = '<div class="empty">No data yet.</div>'; return; }
  const max = Math.max(...data.map(d => d.v));
  el.innerHTML = data.map(d => `
    <div class="bar-row">
      <div class="bar-label" title="${escHtml(d.k)}">${escHtml(d.k)}</div>
      <div class="bar-track">
        <div class="bar-fill ${colorClass || ""}" style="width:${max ? Math.round(d.v / max * 100) : 0}%"></div>
      </div>
      <div class="bar-val">${d.v}</div>
    </div>
  `).join("");
}

function escHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}