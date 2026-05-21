import {
  loadRequests,
  saveRequest,
  updateRequest,
  deleteRequest,
  subscribeToRequests,
  syncOfflineQueue,
  migrateLocalStorageToSupabase,
} from "./storage.js";
import { toast } from "./ui.js";
import { renderAnalytics } from "./analytics.js";
import { t, setLang, currentLang } from "./translations.js";

/* ══════════════════════════════════════════
   CONFIG — change PIN before deploying
   ══════════════════════════════════════════ */
const SUPERVISOR_PIN = "1234";

/* ── State ── */
let requests    = [];
let currentTab  = "pending";
let currentRole = null;

/* ══════════════════════════════════════════
   DOM HELPERS
   ══════════════════════════════════════════ */

// Safe text setter — only updates the direct text node,
// leaving any child elements (like <span class="cnt">) intact.
function setTxt(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  // Find or create a direct text node at the START of the element
  let textNode = null;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNode = node;
      break;
    }
  }
  if (textNode) {
    textNode.textContent = text + " ";
  } else {
    el.insertBefore(document.createTextNode(text + " "), el.firstChild);
  }
}

// For elements that have NO child elements — safe to set textContent directly
function setTxtFull(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setAttr(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el[attr] = val;
}
function setFirstOption(selectId, text) {
  const el = document.getElementById(selectId);
  if (el && el.options[0]) el.options[0].text = text;
}
function setOption(selectId, value, text) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const opt = [...el.options].find(o => o.value === value);
  if (opt) opt.text = text;
}

/* ══════════════════════════════════════════
   LANGUAGE TOGGLE
   ══════════════════════════════════════════ */
window.toggleLang = function () {
  setLang(currentLang === "fr" ? "en" : "fr");
  applyTranslations();
};

function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll(".lang-toggle").forEach(el => {
    el.textContent = currentLang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR";
  });

  // Gate strings — no child elements, safe to use setTxtFull
  setTxtFull("gate-title",        t("gateTitle"));
  setTxtFull("gate-sub-text",     t("gateSub"));
  setTxtFull("gate-worker-label", t("gateWorkerLabel"));
  setTxtFull("gate-worker-desc",  t("gateWorkerDesc"));
  setTxtFull("gate-super-label",  t("gateSuperLabel"));
  setTxtFull("gate-super-desc",   t("gateSuperDesc"));
  setTxtFull("gate-pin-label",    t("gatePinPrompt"));
  setTxtFull("gate-pin-enter",    t("gatePinEnter"));
  setTxtFull("gate-pin-back",     t("gatePinBack"));
  setTxtFull("gate-pin-error",    t("gatePinError"));

  // Header
  setTxtFull("app-title", t("appTitle"));
  if (currentRole === "supervisor") setTxtFull("header-sub", t("headerSubMgmt"));
  if (currentRole === "worker")     setTxtFull("header-sub", t("headerSubWorker"));
  setTxtFull("sign-out-btn",    t("signOut"));
  setTxtFull("btn-new-request", t("btnNewRequest"));
  setTxtFull("btn-analytics",   t("btnAnalytics"));
  updateRolePill();

  // ── Tabs: use setTxt (safe — preserves the <span class="cnt"> child) ──
  setTxt("tab-pending", t("tabPending"));
  setTxt("tab-urgent",  t("tabUrgent"));
  setTxt("tab-ordered", t("tabOrdered"));
  setTxt("tab-done",    t("tabDone"));
  setTxt("tab-all",     t("tabAll"));

  // Filters
  setFirstOption("filter-site", t("filterAllSites"));
  setFirstOption("filter-cat",  t("filterAllCats"));
  setAttr("filter-search", "placeholder", t("filterSearch"));

  // Form labels — no child elements
  setTxtFull("form-title",     t("formTitle"));
  setTxtFull("label-name",     t("fieldName"));
  setAttr("f-name",        "placeholder", t("fieldNamePH"));
  setTxtFull("label-site",     t("fieldSite"));
  setAttr("f-site",        "placeholder", t("fieldSitePH"));
  setTxtFull("label-product",  t("fieldProduct"));
  setAttr("f-product",     "placeholder", t("fieldProductPH"));
  setTxtFull("label-category", t("fieldCategory"));
  setTxtFull("label-qty",      t("fieldQty"));
  setAttr("f-qty",         "placeholder", t("fieldQtyPH"));
  setTxtFull("label-cost",     t("fieldCost"));
  setAttr("f-cost",        "placeholder", t("fieldCostPH"));
  setTxtFull("label-priority", t("fieldPriority"));
  setTxtFull("label-freq",     t("fieldFreq"));
  setTxtFull("label-supplier", t("fieldSupplier"));
  setAttr("f-supplier",    "placeholder", t("fieldSupplierPH"));
  setTxtFull("label-notes",    t("fieldNotes"));
  setAttr("f-notes",       "placeholder", t("fieldNotesPH"));
  setTxtFull("btn-submit",     t("btnSubmit"));
  setTxtFull("btn-cancel",     t("btnCancel"));

  // Select options
  setOption("f-cat", "Cleaning chemicals", t("catChemicals"));
  setOption("f-cat", "Equipment",          t("catEquipment"));
  setOption("f-cat", "Disposables",        t("catDisposables"));
  setOption("f-cat", "PPE",                t("catPPE"));
  setOption("f-cat", "Paper products",     t("catPaper"));
  setOption("f-cat", "Tools",              t("catTools"));
  setOption("f-cat", "Other",              t("catOther"));
  setOption("f-priority", "normal",        t("priorityNormal"));
  setOption("f-priority", "urgent",        t("priorityUrgent"));
  setOption("f-freq", "one-off",           t("freqOneOff"));
  setOption("f-freq", "weekly",            t("freqWeekly"));
  setOption("f-freq", "monthly",           t("freqMonthly"));
  setOption("f-freq", "as needed",         t("freqAsNeeded"));

  // Worker success screen
  setTxtFull("success-title", t("successTitle"));
  setTxtFull("success-msg",   t("successMsg"));
  setTxtFull("btn-another",   t("btnAnother"));

  // Analytics
  setTxtFull("analytics-title",   t("analyticsTitle"));
  setTxtFull("btn-back-requests", t("btnBackToRequests"));
  setTxtFull("chart-site-hd",     t("chartBySite"));
  setTxtFull("chart-cat-hd",      t("chartByCat"));
  setTxtFull("chart-products-hd", t("chartTopProducts"));
  setTxtFull("chart-workers-hd",  t("chartWorkers"));
  setTxtFull("chart-spend-hd",    t("chartSpend"));
  setTxtFull("export-title",      t("exportTitle"));
  setTxtFull("btn-download-csv",  t("btnDownloadCSV"));

  // Re-render the list so status labels etc. update in the active language
  if (currentRole === "supervisor") {
    render();
    if (document.getElementById("page-analytics").style.display !== "none") {
      renderAnalytics(requests);
    }
  }
}

/* ══════════════════════════════════════════
   ROLE GATE
   ══════════════════════════════════════════ */
window.selectRole = function (role) {
  if (role === "supervisor") {
    document.getElementById("gate-pin-wrap").style.display = "";
    document.getElementById("gate-pin").focus();
    document.querySelector(".gate-btns").style.display = "none";
    setTxtFull("gate-sub-text", t("gatePinSubtitle"));
  } else {
    enterApp("worker");
  }
};

window.confirmPin = function () {
  const pin = document.getElementById("gate-pin").value;
  if (pin === SUPERVISOR_PIN) {
    document.getElementById("gate-pin-error").style.display = "none";
    enterApp("supervisor");
  } else {
    document.getElementById("gate-pin-error").style.display = "";
    document.getElementById("gate-pin").value = "";
    document.getElementById("gate-pin").focus();
  }
};

window.cancelPin = function () {
  document.getElementById("gate-pin-wrap").style.display = "none";
  document.getElementById("gate-pin").value = "";
  document.getElementById("gate-pin-error").style.display = "none";
  document.querySelector(".gate-btns").style.display = "";
  setTxtFull("gate-sub-text", t("gateSub"));
};

window.signOut = function () {
  sessionStorage.removeItem("srt_role");
  currentRole = null;
  requests = [];
  document.getElementById("gate").style.display = "";
  document.getElementById("app").style.display = "none";
  window.cancelPin();
};

async function enterApp(role) {
  currentRole = role;
  sessionStorage.setItem("srt_role", role);
  document.getElementById("gate").style.display = "none";
  document.getElementById("app").style.display = "";

  // Apply role-based visibility FIRST (so mgmt-only elements show/hide correctly)
  applyRole(role);

  // Apply translations AFTER role (tabs are visible now, setTxt will find them)
  applyTranslations();

  // Fetch data — render() is called again after this so counts update correctly
  if (role === "supervisor") {
    showLoading(true);
    requests = await loadRequests();
    showLoading(false);
    rebuildFilters();
    render();

    // Subscribe to realtime updates
    subscribeToRequests((updatedList) => {
      requests = updatedList;
      rebuildFilters();
      render();
      if (document.getElementById("page-analytics").style.display !== "none") {
        renderAnalytics(requests);
      }
    });
  }
}

function applyRole(role) {
  // Cost field grid: 3-col for supervisors, 2-col for workers
  const costGrid = document.getElementById("cost-grid");
  if (costGrid) costGrid.className = role === "supervisor" ? "grid3" : "grid2";

  document.querySelectorAll(".mgmt-only").forEach(el => {
    el.style.display = role === "supervisor" ? "" : "none";
  });

  updateRolePill();

  if (role === "supervisor") {
    showPage("list");
  } else {
    showPage("new");
    document.getElementById("worker-success").style.display = "none";
    document.getElementById("form-card").style.display = "";
  }
}

function updateRolePill() {
  const pill = document.getElementById("role-pill");
  if (!pill || !currentRole) return;
  if (currentRole === "supervisor") {
    pill.textContent = t("rolePillSuper");
    pill.style.background = "#E6F1FB";
    pill.style.color = "#185FA5";
  } else {
    pill.textContent = t("rolePillWorker");
    pill.style.background = "#EAF3DE";
    pill.style.color = "#3B6D11";
  }
}

function showLoading(on) {
  let el = document.getElementById("loading-bar");
  if (!el) {
    el = document.createElement("div");
    el.id = "loading-bar";
    el.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:3px;
      background:var(--color-text-info);z-index:999;
      transition:opacity 0.3s;
    `;
    document.body.appendChild(el);
  }
  el.style.opacity = on ? "1" : "0";
}

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
async function init() {
  // Language first — gate screen must be translated immediately
  applyTranslations();

  // Sync any offline queued operations
  window.addEventListener("online", syncOfflineQueue);
  syncOfflineQueue();

  // Resume session if still valid this browser session
  const savedRole = sessionStorage.getItem("srt_role");
  if (savedRole) {
    await enterApp(savedRole);
    return;
  }

  // One-time migration from old localStorage data if it exists
  const legacyData = localStorage.getItem("cleaning_requests_v2");
  if (legacyData) {
    const count = await migrateLocalStorageToSupabase();
    if (count > 0) toast(`${count} enregistrements migrés ✓`);
  }
}

/* ══════════════════════════════════════════
   PAGE NAVIGATION
   ══════════════════════════════════════════ */
window.showPage = function (p) {
  if (currentRole === "worker" && (p === "list" || p === "analytics")) return;
  document.getElementById("page-list").style.display      = p === "list"      ? "" : "none";
  document.getElementById("page-new").style.display       = p === "new"       ? "" : "none";
  document.getElementById("page-analytics").style.display = p === "analytics" ? "" : "none";
  document.getElementById("main-nav").style.display =
    (p === "list" && currentRole === "supervisor") ? "" : "none";
  if (p === "analytics") renderAnalytics(requests);
};

window.gotoNew = function () {
  rebuildSiteList();
  document.getElementById("worker-success").style.display = "none";
  document.getElementById("form-card").style.display = "";
  showPage("new");
};

window.workerNewRequest = function () {
  document.getElementById("worker-success").style.display = "none";
  document.getElementById("form-card").style.display = "";
  resetForm();
};

/* ── Tabs ── */
window.switchTab = function (tab) {
  currentTab = tab;
  const tabIds = ["tab-pending","tab-urgent","tab-ordered","tab-done","tab-all"];
  const tabKeys = ["pending","urgent","ordered","done","all"];
  tabIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("active", tabKeys[i] === tab);
  });
  render();
};

/* ── Filters / datalists ── */
function rebuildSiteList() {
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))];
  document.getElementById("site-list").innerHTML =
    sites.map(s => `<option value="${escHtml(s)}">`).join("");
}

function rebuildFilters() {
  const sites = [...new Set(requests.map(r => r.site).filter(Boolean))].sort();
  const cats  = [...new Set(requests.map(r => r.category).filter(Boolean))].sort();

  const fs = document.getElementById("filter-site");
  const curSite = fs.value;
  fs.innerHTML = `<option value="">${t("filterAllSites")}</option>` +
    sites.map(s => `<option${curSite===s?" selected":""}>${escHtml(s)}</option>`).join("");

  const fc = document.getElementById("filter-cat");
  const curCat = fc.value;
  fc.innerHTML = `<option value="">${t("filterAllCats")}</option>` +
    cats.map(c => `<option${curCat===c?" selected":""}>${escHtml(c)}</option>`).join("");
}

/* ── Submit ── */
window.submitRequest = async function () {
  const name    = document.getElementById("f-name").value.trim();
  const site    = document.getElementById("f-site").value.trim();
  const product = document.getElementById("f-product").value.trim();
  if (!name || !product || !site) { toast(t("toastRequired")); return; }

  const priority = document.getElementById("f-priority").value;
  const cost     = parseFloat(document.getElementById("f-cost").value) || null;

  const req = {
    name, site, product,
    category:  document.getElementById("f-cat").value,
    qty:       document.getElementById("f-qty").value.trim(),
    cost,
    priority,
    frequency: document.getElementById("f-freq").value,
    supplier:  document.getElementById("f-supplier").value.trim(),
    notes:     document.getElementById("f-notes").value.trim(),
    status:    "pending",
  };

  // Optimistic local insert so UI feels instant
  const tempReq = {
    ...req,
    id:   `temp_${Date.now()}`,
    date: new Date().toLocaleDateString("fr-FR"),
    ts:   Date.now(),
  };
  requests.unshift(tempReq);
  rebuildFilters();

  // Persist to Supabase (or offline queue)
  const saved = await saveRequest(req);

  // Replace temp record with the real server record (has a proper UUID)
  const idx = requests.findIndex(r => r.id === tempReq.id);
  if (idx !== -1) requests[idx] = saved;

  if (currentRole === "worker") {
    document.getElementById("form-card").style.display = "none";
    document.getElementById("worker-success").style.display = "";
    resetForm();
  } else {
    resetForm();
    currentTab = priority === "urgent" ? "urgent" : "pending";
    // Update active tab UI
    window.switchTab(currentTab);
    showPage("list");
    render();
    toast(t("toastSubmitted"));
  }
};

/* ── Status update ── */
window.setStatus = async function (id, status) {
  if (currentRole === "worker") return;
  const r = requests.find(x => x.id === id);
  if (r) r.status = status;
  render();
  await updateRequest(id, { status });
  toast(t("toastUpdated"));
};

/* ── Delete ── */
window.deleteReq = async function (id) {
  if (currentRole === "worker") return;
  if (!confirm(t("confirmRemove"))) return;
  requests = requests.filter(x => x.id !== id);
  rebuildFilters();
  render();
  await deleteRequest(id);
  toast(t("toastRemoved"));
};

/* ── Filtering ── */
function filtered() {
  const site = document.getElementById("filter-site").value;
  const cat  = document.getElementById("filter-cat").value;
  const q    = (document.getElementById("filter-search").value || "").toLowerCase();

  return requests.filter(r => {
    if (currentTab === "pending" && !(r.status === "pending" && r.priority !== "urgent")) return false;
    if (currentTab === "urgent"  && !(r.status === "pending" && r.priority === "urgent"))  return false;
    if (currentTab === "ordered" && r.status !== "ordered") return false;
    if (currentTab === "done"    && r.status !== "done")    return false;
    // "all" tab — no status filter
    if (site && r.site !== site) return false;
    if (cat  && r.category !== cat) return false;
    if (q && !((r.product + r.name + r.site + (r.notes||"")).toLowerCase().includes(q))) return false;
    return true;
  });
}

/* ── Render ── */
window.render = function () {
  // Update tab count badges — target the <span> directly, not the button
  const setPill = (id, n) => {
    const el = document.getElementById(id);
    if (el) el.textContent = n;
  };
  setPill("cnt-pending", requests.filter(r => r.status==="pending" && r.priority!=="urgent").length);
  setPill("cnt-urgent",  requests.filter(r => r.status==="pending" && r.priority==="urgent").length);
  setPill("cnt-ordered", requests.filter(r => r.status==="ordered").length);
  setPill("cnt-done",    requests.filter(r => r.status==="done").length);
  setPill("cnt-all",     requests.length);

  const list = filtered();
  const body = document.getElementById("list-body");
  if (!body) return;

  if (!list.length) {
    body.innerHTML = `<div class="empty">${t("noRequests")}</div>`;
    return;
  }

  body.innerHTML = list.map(r => {
    const bClass = r.status==="done"     ? "b-done"    :
                   r.status==="ordered"  ? "b-ordered" :
                   r.priority==="urgent" ? "b-urgent"  : "b-pending";
    const bLabel = r.status==="done"     ? t("statusDone")    :
                   r.status==="ordered"  ? t("statusOrdered") :
                   r.priority==="urgent" ? t("statusUrgent")  : t("statusPending");

    const btns = [];
    if (r.status === "pending")
      btns.push(`<button class="btn btn-sm" onclick="setStatus('${r.id}','ordered')">${t("btnMarkOrdered")}</button>`);
    if (r.status !== "done")
      btns.push(`<button class="btn btn-sm" style="color:var(--color-text-success);border-color:var(--color-border-success);" onclick="setStatus('${r.id}','done')">${t("btnMarkDone")}</button>`);
    if (r.status === "done")
      btns.push(`<button class="btn btn-sm" onclick="setStatus('${r.id}','pending')">${t("btnReopen")}</button>`);
    btns.push(`<button class="btn btn-sm" onclick="deleteReq('${r.id}')">${t("btnRemove")}</button>`);

    return `<div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <div class="req-title">${escHtml(r.product)}${r.qty?` <span style="font-weight:400;font-size:13px;color:var(--color-text-secondary);">— ${escHtml(r.qty)}</span>`:""}</div>
          <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;">
            <span class="site-chip">${escHtml(r.site)}</span>
            <span class="badge" style="background:var(--color-background-secondary);color:var(--color-text-secondary);">${escHtml(r.category||"")}</span>
          </div>
          <div class="req-meta">
            ${t("cardBy")} <strong>${escHtml(r.name)}</strong> &middot; ${r.date}
            ${r.supplier?` &middot; ${t("cardSupplier")}: ${escHtml(r.supplier)}`:""}
            ${r.frequency&&r.frequency!=="one-off"?` &middot; ${escHtml(r.frequency)}`:""}
            ${r.cost!=null?` &middot; ~${r.cost.toFixed(2)} €`:""}
            ${r.notes?`<br>${escHtml(r.notes)}`:""}
          </div>
        </div>
        <span class="badge ${bClass}" style="flex-shrink:0;">${bLabel}</span>
      </div>
      <div class="row-actions">${btns.join("")}</div>
    </div>`;
  }).join("");
};

/* ── CSV export ── */
window.exportCSV = function () {
  const headers = [t("colDate"),t("colWorker"),t("colSite"),t("colProduct"),t("colCategory"),
                   t("colQty"),t("colPriority"),t("colStatus"),t("colCost"),t("colSupplier"),
                   t("colFrequency"),t("colNotes")];
  const rows = requests.map(r =>
    [r.date,r.name,r.site||"",r.product,r.category||"",r.qty||"",r.priority,r.status,
     r.cost!=null?r.cost.toFixed(2):"",r.supplier||"",r.frequency||"",r.notes||""]
    .map(v=>`"${String(v).replace(/"/g,'""')}"`)
    .join(",")
  );
  const csv = [headers.join(","),...rows].join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "demandes_fournitures.csv";
  a.click();
};

/* ── Helpers ── */
function resetForm() {
  ["f-name","f-site","f-product","f-qty","f-cost","f-supplier","f-notes"]
    .forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("f-priority").value = "normal";
  document.getElementById("f-cat").value = "Cleaning chemicals";
  document.getElementById("f-freq").value = "one-off";
}

function escHtml(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Boot ── */
document.addEventListener("DOMContentLoaded", init);