import { loadRequests, saveRequests } from "./storage.js";
import { toast } from "./ui.js";
import { renderAnalytics } from "./analytics.js";

/* ══════════════════════════════════════════
   CONFIGURATION —  PIN 
   ══════════════════════════════════════════ */
const SUPERVISOR_PIN = "1234"; // ← change this before deploying

/* ── State ── */
let requests = [];
let currentTab = "pending";
let currentRole = null; // "worker" | "supervisor"

/* ══════════════════════════════════════════
   ROLE GATE
   ══════════════════════════════════════════ */

// Expose gate functions globally (called from inline onclick)
window.selectRole = function (role) {
  if (role === "supervisor") {
    // Show PIN prompt
    document.getElementById("gate-pin-wrap").style.display = "";
    document.getElementById("gate-pin").focus();
    // Hide the two role buttons so user focuses on PIN entry
    document.querySelector(".gate-btns").style.display = "none";
    document.querySelector(".gate-sub").textContent = "Supervisor access";
  } else {
    // Workers go straight through
    enterApp("worker");
  }
};

window.confirmPin = function () {
  const pin = document.getElementById("gate-pin").value;
  const err = document.getElementById("gate-pin-error");
  if (pin === SUPERVISOR_PIN) {
    err.style.display = "none";
    enterApp("supervisor");
  } else {
    err.style.display = "";
    document.getElementById("gate-pin").value = "";
    document.getElementById("gate-pin").focus();
  }
};

window.cancelPin = function () {
  document.getElementById("gate-pin-wrap").style.display = "none";
  document.getElementById("gate-pin").value = "";
  document.getElementById("gate-pin-error").style.display = "none";
  document.querySelector(".gate-btns").style.display = "";
  document.querySelector(".gate-sub").textContent = "Who are you signing in as?";
};

window.signOut = function () {
  sessionStorage.removeItem("srt_role");
  currentRole = null;
  // Show gate, hide app
  document.getElementById("gate").style.display = "";
  document.getElementById("app").style.display = "none";
  // Reset PIN UI in case supervisor was signed in
  window.cancelPin();
};

function enterApp(role) {
  currentRole = role;
  sessionStorage.setItem("srt_role", role);
  applyRole(role);
  document.getElementById("gate").style.display = "none";
  document.getElementById("app").style.display = "";
}

function applyRole(role) {
  // Role pill label
  const pill = document.getElementById("role-pill");
  if (role === "supervisor") {
    pill.textContent = "Supervisor";
    pill.style.background = "#E6F1FB";
    pill.style.color = "#185FA5";
  } else {
    pill.textContent = "Worker";
    pill.style.background = "#EAF3DE";
    pill.style.color = "#3B6D11";
  }

  // Show/hide role-specific elements
  document.querySelectorAll(".mgmt-only").forEach(el => {
    el.style.display = role === "supervisor" ? "" : "none";
  });

  if (role === "supervisor") {
    document.getElementById("header-sub").textContent = "Products, materials & analytics";
    // Supervisor starts on the list page
    showPage("list");
    render();
  } else {
    document.getElementById("header-sub").textContent = "Submit a supply request";
    // Workers go straight to the form
    showPage("new");
    document.getElementById("worker-success").style.display = "none";
    document.getElementById("form-card").style.display = "";
  }
}

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
function init() {
  requests = loadRequests();
  rebuildFilters();

  // Resume session if role was already set this session
  const savedRole = sessionStorage.getItem("srt_role");
  if (savedRole) {
    enterApp(savedRole);
  }
  // Otherwise the gate stays visible
}

/* ══════════════════════════════════════════
   PAGE NAVIGATION
   ══════════════════════════════════════════ */
window.showPage = function (p) {
  // Guard: workers cannot access list or analytics
  if (currentRole === "worker" && (p === "list" || p === "analytics")) return;

  document.getElementById("page-list").style.display = p === "list" ? "" : "none";
  document.getElementById("page-new").style.display = p === "new" ? "" : "none";
  document.getElementById("page-analytics").style.display = p === "analytics" ? "" : "none";
  document.getElementById("main-nav").style.display = (p === "list" && currentRole === "supervisor") ? "" : "none";

  if (p === "analytics") renderAnalytics(requests);
};

window.gotoNew = function () {
  rebuildSiteList();
  // Reset form UI
  document.getElementById("worker-success").style.display = "none";
  document.getElementById("form-card").style.display = "";
  showPage("new");
};

/* Worker: show success screen, then allow another */
window.workerNewRequest = function () {
  document.getElementById("worker-success").style.display = "none";
  document.getElementById("form-card").style.display = "";
  // Clear form
  ["f-name", "f-site", "f-product", "f-qty", "f-cost", "f-supplier", "f-notes"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("f-priority").value = "normal";
  document.getElementById("f-cat").value = "Cleaning chemicals";
  document.getElementById("f-freq").value = "one-off";
};

/* ── Tabs ── */
window.switchTab = function (t) {
  currentTab = t;
  document.querySelectorAll("#main-nav .tab").forEach((el, i) => {
    el.classList.toggle("active", ["pending", "urgent", "ordered", "done", "all"][i] === t);
  });
  render();
};

/* ── Filters / datalists ── */
function rebuildSiteList() {
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))];
  const dl = document.getElementById("site-list");
  dl.innerHTML = sites.map(s => `<option value="${escHtml(s)}">`).join("");
}

function rebuildFilters() {
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))].sort();
  const cats = [...new Set(requests.map(r => r.category).filter(Boolean))].sort();

  const fs = document.getElementById("filter-site");
  const curSite = fs.value;
  fs.innerHTML = '<option value="">All job sites</option>' +
    sites.map(s => `<option${curSite === s ? " selected" : ""}>${escHtml(s)}</option>`).join("");

  const fc = document.getElementById("filter-cat");
  const curCat = fc.value;
  fc.innerHTML = '<option value="">All categories</option>' +
    cats.map(c => `<option${curCat === c ? " selected" : ""}>${escHtml(c)}</option>`).join("");
}

/* ── Submit ── */
window.submitRequest = function () {
  const name = document.getElementById("f-name").value.trim();
  const site = document.getElementById("f-site").value.trim();
  const product = document.getElementById("f-product").value.trim();
  if (!name || !product || !site) { toast("Name, job site and product are required."); return; }

  const priority = document.getElementById("f-priority").value;
  const cost = parseFloat(document.getElementById("f-cost").value) || null;

  requests.unshift({
    id: Date.now(),
    name, site, product,
    category: document.getElementById("f-cat").value,
    qty: document.getElementById("f-qty").value.trim(),
    cost,
    priority,
    frequency: document.getElementById("f-freq").value,
    supplier: document.getElementById("f-supplier").value.trim(),
    notes: document.getElementById("f-notes").value.trim(),
    status: "pending",
    date: new Date().toLocaleDateString("en-GB"),
    ts: Date.now()
  });

  saveRequests(requests);
  rebuildFilters();

  if (currentRole === "worker") {
    // Show success screen instead of going to list
    document.getElementById("form-card").style.display = "none";
    document.getElementById("worker-success").style.display = "";
  } else {
    // Supervisor gets normal flow
    ["f-name", "f-site", "f-product", "f-qty", "f-cost", "f-supplier", "f-notes"].forEach(id => {
      document.getElementById(id).value = "";
    });
    document.getElementById("f-priority").value = "normal";
    document.getElementById("f-cat").value = "Cleaning chemicals";
    document.getElementById("f-freq").value = "one-off";
    currentTab = priority === "urgent" ? "urgent" : "pending";
    showPage("list");
    render();
    toast("Request submitted!");
  }
};

/* ── Status / delete ── */
window.setStatus = function (id, status) {
  if (currentRole === "worker") return; // guard
  const r = requests.find(x => x.id === id);
  if (r) { r.status = status; saveRequests(requests); render(); toast("Updated!"); }
};

window.deleteReq = function (id) {
  if (currentRole === "worker") return; // guard
  if (!confirm("Remove this request?")) return;
  requests = requests.filter(x => x.id !== id);
  saveRequests(requests); rebuildFilters(); render(); toast("Removed.");
};

/* ── Filtering ── */
function filtered() {
  const site = document.getElementById("filter-site").value;
  const cat = document.getElementById("filter-cat").value;
  const q = (document.getElementById("filter-search").value || "").toLowerCase();
  return requests.filter(r => {
    if (currentTab === "pending" && !(r.status === "pending" && r.priority !== "urgent")) return false;
    if (currentTab === "urgent" && !(r.status === "pending" && r.priority === "urgent")) return false;
    if (currentTab === "ordered" && r.status !== "ordered") return false;
    if (currentTab === "done" && r.status !== "done") return false;
    if (site && r.site !== site) return false;
    if (cat && r.category !== cat) return false;
    if (q && !((r.product + r.name + r.site + r.notes).toLowerCase().includes(q))) return false;
    return true;
  });
}

/* ── Render ── */
window.render = function () {
  document.getElementById("cnt-pending").textContent = requests.filter(r => r.status === "pending" && r.priority !== "urgent").length;
  document.getElementById("cnt-urgent").textContent = requests.filter(r => r.status === "pending" && r.priority === "urgent").length;
  document.getElementById("cnt-ordered").textContent = requests.filter(r => r.status === "ordered").length;
  document.getElementById("cnt-done").textContent = requests.filter(r => r.status === "done").length;
  document.getElementById("cnt-all").textContent = requests.length;

  const list = filtered();
  const body = document.getElementById("list-body");

  if (!list.length) {
    body.innerHTML = '<div class="empty">No requests here yet.</div>';
    return;
  }

  body.innerHTML = list.map(r => {
    const bClass = r.status === "done" ? "b-done" : r.status === "ordered" ? "b-ordered" : r.priority === "urgent" ? "b-urgent" : "b-pending";
    const bLabel = r.status === "done" ? "Done" : r.status === "ordered" ? "Ordered" : r.priority === "urgent" ? "Urgent" : "Pending";

    const actionBtns = [];
    if (r.status === "pending") actionBtns.push(`<button class="btn btn-sm" onclick="setStatus(${r.id},'ordered')">Mark ordered</button>`);
    if (r.status !== "done") actionBtns.push(`<button class="btn btn-sm" style="color:var(--color-text-success);border-color:var(--color-border-success);" onclick="setStatus(${r.id},'done')">Mark done</button>`);
    if (r.status === "done") actionBtns.push(`<button class="btn btn-sm" onclick="setStatus(${r.id},'pending')">Reopen</button>`);
    actionBtns.push(`<button class="btn btn-sm" onclick="deleteReq(${r.id})">Remove</button>`);

    return `<div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <div class="req-title">${escHtml(r.product)}${r.qty ? ` <span style="font-weight:400;font-size:13px;color:var(--color-text-secondary);">— ${escHtml(r.qty)}</span>` : ""}</div>
          <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;">
            <span class="site-chip">${escHtml(r.site)}</span>
            <span class="badge" style="background:var(--color-background-secondary);color:var(--color-text-secondary);">${escHtml(r.category || "")}</span>
          </div>
          <div class="req-meta">
            By <strong>${escHtml(r.name)}</strong> &middot; ${r.date}
            ${r.supplier ? ` &middot; Supplier: ${escHtml(r.supplier)}` : ""}
            ${r.frequency && r.frequency !== "one-off" ? ` &middot; ${escHtml(r.frequency)}` : ""}
            ${r.cost != null ? ` &middot; ~$${r.cost.toFixed(2)} each` : ""}
            ${r.notes ? `<br>${escHtml(r.notes)}` : ""}
          </div>
        </div>
        <span class="badge ${bClass}" style="flex-shrink:0;">${bLabel}</span>
      </div>
      <div class="row-actions">${actionBtns.join("")}</div>
    </div>`;
  }).join("");
};

/* ── CSV export ── */
window.exportCSV = function () {
  const headers = ["Date", "Worker", "Job site", "Product", "Category", "Qty", "Priority", "Status", "Cost", "Supplier", "Frequency", "Notes"];
  const rows = requests.map(r =>
    [r.date, r.name, r.site || "", r.product, r.category || "", r.qty || "", r.priority, r.status,
     r.cost != null ? r.cost.toFixed(2) : "", r.supplier || "", r.frequency || "", r.notes || ""]
    .map(v => `"${String(v).replace(/"/g, '""')}"`)
    .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "supply_requests.csv";
  a.click();
};

/* ── Utility ── */
function escHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── Boot ── */
document.addEventListener("DOMContentLoaded", init);