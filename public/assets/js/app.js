import { loadRequests, saveRequests } from "./storage.js";
import { toast } from "./ui.js";
import { renderAnalytics } from "./analytics.js";
import { t, setLang, currentLang } from "./translations.js";

/* ══════════════════════════════════════════
   CONFIG — change PIN before deploying
   ══════════════════════════════════════════ */
const SUPERVISOR_PIN = "1234";

/* ── State ── */
let requests   = [];
let currentTab = "pending";
let currentRole = null; // "worker" | "supervisor"

/* ══════════════════════════════════════════
   LANGUAGE TOGGLE
   ══════════════════════════════════════════ */
window.toggleLang = function () {
  setLang(currentLang === "fr" ? "en" : "fr");
  applyTranslations();
};

function applyTranslations() {
  document.documentElement.lang = currentLang;

  // Button shows the language you'd SWITCH TO
  document.querySelectorAll(".lang-toggle").forEach(el => {
    el.textContent = currentLang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR";
  });

  /* Gate */
  setTxt("gate-title",       t("gateTitle"));
  setTxt("gate-sub-text",    t("gateSub"));
  setTxt("gate-worker-label",t("gateWorkerLabel"));
  setTxt("gate-worker-desc", t("gateWorkerDesc"));
  setTxt("gate-super-label", t("gateSuperLabel"));
  setTxt("gate-super-desc",  t("gateSuperDesc"));
  setTxt("gate-pin-label",   t("gatePinPrompt"));
  setTxt("gate-pin-enter",   t("gatePinEnter"));
  setTxt("gate-pin-back",    t("gatePinBack"));
  setTxt("gate-pin-error",   t("gatePinError"));

  /* Header */
  setTxt("app-title", t("appTitle"));
  if (currentRole === "supervisor") setTxt("header-sub", t("headerSubMgmt"));
  if (currentRole === "worker")     setTxt("header-sub", t("headerSubWorker"));
  setTxt("sign-out-btn",    t("signOut"));
  setTxt("btn-new-request", t("btnNewRequest"));
  setTxt("btn-analytics",   t("btnAnalytics"));
  updateRolePill();

  /* Nav tabs */
  setTxt("tab-pending", t("tabPending"));
  setTxt("tab-urgent",  t("tabUrgent"));
  setTxt("tab-ordered", t("tabOrdered"));
  setTxt("tab-done",    t("tabDone"));
  setTxt("tab-all",     t("tabAll"));

  /* Filters */
  setFirstOption("filter-site", t("filterAllSites"));
  setFirstOption("filter-cat",  t("filterAllCats"));
  setAttr("filter-search", "placeholder", t("filterSearch"));

  /* Form */
  setTxt("form-title",      t("formTitle"));
  setTxt("label-name",      t("fieldName"));
  setAttr("f-name",         "placeholder", t("fieldNamePH"));
  setTxt("label-site",      t("fieldSite"));
  setAttr("f-site",         "placeholder", t("fieldSitePH"));
  setTxt("label-product",   t("fieldProduct"));
  setAttr("f-product",      "placeholder", t("fieldProductPH"));
  setTxt("label-category",  t("fieldCategory"));
  setTxt("label-qty",       t("fieldQty"));
  setAttr("f-qty",          "placeholder", t("fieldQtyPH"));
  setTxt("label-cost",      t("fieldCost"));
  setAttr("f-cost",         "placeholder", t("fieldCostPH"));
  setTxt("label-priority",  t("fieldPriority"));
  setTxt("label-freq",      t("fieldFreq"));
  setTxt("label-supplier",  t("fieldSupplier"));
  setAttr("f-supplier",     "placeholder", t("fieldSupplierPH"));
  setTxt("label-notes",     t("fieldNotes"));
  setAttr("f-notes",        "placeholder", t("fieldNotesPH"));
  setTxt("btn-submit",      t("btnSubmit"));
  setTxt("btn-cancel",      t("btnCancel"));

  /* Select options */
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

  /* Worker success */
  setTxt("success-title", t("successTitle"));
  setTxt("success-msg",   t("successMsg"));
  setTxt("btn-another",   t("btnAnother"));

  /* Analytics */
  setTxt("analytics-title",   t("analyticsTitle"));
  setTxt("btn-back-requests", t("btnBackToRequests"));
  setTxt("chart-site-hd",     t("chartBySite"));
  setTxt("chart-cat-hd",      t("chartByCat"));
  setTxt("chart-products-hd", t("chartTopProducts"));
  setTxt("chart-workers-hd",  t("chartWorkers"));
  setTxt("chart-spend-hd",    t("chartSpend"));
  setTxt("export-title",      t("exportTitle"));
  setTxt("btn-download-csv",  t("btnDownloadCSV"));

  /* Re-render dynamic content */
  if (currentRole === "supervisor") {
    render();
    if (document.getElementById("page-analytics").style.display !== "none") {
      renderAnalytics(requests);
    }
  }
}

/* ── DOM helpers ── */
function setTxt(id, text) {
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
   ROLE GATE
   ══════════════════════════════════════════ */
window.selectRole = function (role) {
  if (role === "supervisor") {
    document.getElementById("gate-pin-wrap").style.display = "";
    document.getElementById("gate-pin").focus();
    document.querySelector(".gate-btns").style.display = "none";
    setTxt("gate-sub-text", t("gatePinSubtitle"));
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
  setTxt("gate-sub-text", t("gateSub"));
};

window.signOut = function () {
  sessionStorage.removeItem("srt_role");
  currentRole = null;
  document.getElementById("gate").style.display = "";
  document.getElementById("app").style.display = "none";
  window.cancelPin();
};

function enterApp(role) {
  currentRole = role;
  sessionStorage.setItem("srt_role", role);
  document.getElementById("gate").style.display = "none";
  document.getElementById("app").style.display = "";
  applyRole(role);
  applyTranslations();
}

function applyRole(role) {
  document.querySelectorAll(".mgmt-only").forEach(el => {
    el.style.display = role === "supervisor" ? "" : "none";
  });
  updateRolePill();
  if (role === "supervisor") {
    showPage("list");
    render();
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

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
function init() {
  requests = loadRequests();
  rebuildFilters();

  // Apply saved language immediately (even on gate screen)
  applyTranslations();

  // Resume session
  const savedRole = sessionStorage.getItem("srt_role");
  if (savedRole) enterApp(savedRole);
}

/* ══════════════════════════════════════════
   PAGE NAVIGATION
   ══════════════════════════════════════════ */
window.showPage = function (p) {
  if (currentRole === "worker" && (p === "list" || p === "analytics")) return;
  document.getElementById("page-list").style.display      = p === "list"      ? "" : "none";
  document.getElementById("page-new").style.display       = p === "new"       ? "" : "none";
  document.getElementById("page-analytics").style.display = p === "analytics" ? "" : "none";
  document.getElementById("main-nav").style.display = (p === "list" && currentRole === "supervisor") ? "" : "none";
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
  ["f-name","f-site","f-product","f-qty","f-cost","f-supplier","f-notes"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("f-priority").value = "normal";
  document.getElementById("f-cat").value = "Cleaning chemicals";
  document.getElementById("f-freq").value = "one-off";
};

/* ── Tabs ── */
window.switchTab = function (tab) {
  currentTab = tab;
  document.querySelectorAll("#main-nav .tab").forEach((el, i) => {
    el.classList.toggle("active", ["pending","urgent","ordered","done","all"][i] === tab);
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
window.submitRequest = function () {
  const name    = document.getElementById("f-name").value.trim();
  const site    = document.getElementById("f-site").value.trim();
  const product = document.getElementById("f-product").value.trim();
  if (!name || !product || !site) { toast(t("toastRequired")); return; }

  const priority = document.getElementById("f-priority").value;
  const cost     = parseFloat(document.getElementById("f-cost").value) || null;

  requests.unshift({
    id: Date.now(), name, site, product,
    category:  document.getElementById("f-cat").value,
    qty:       document.getElementById("f-qty").value.trim(),
    cost, priority,
    frequency: document.getElementById("f-freq").value,
    supplier:  document.getElementById("f-supplier").value.trim(),
    notes:     document.getElementById("f-notes").value.trim(),
    status:    "pending",
    date:      new Date().toLocaleDateString(currentLang === "fr" ? "fr-FR" : "en-GB"),
    ts:        Date.now()
  });

  saveRequests(requests);
  rebuildFilters();

  if (currentRole === "worker") {
    document.getElementById("form-card").style.display = "none";
    document.getElementById("worker-success").style.display = "";
  } else {
    ["f-name","f-site","f-product","f-qty","f-cost","f-supplier","f-notes"].forEach(id => {
      document.getElementById(id).value = "";
    });
    document.getElementById("f-priority").value = "normal";
    document.getElementById("f-cat").value = "Cleaning chemicals";
    document.getElementById("f-freq").value = "one-off";
    currentTab = priority === "urgent" ? "urgent" : "pending";
    showPage("list");
    render();
    toast(t("toastSubmitted"));
  }
};

/* ── Status / delete ── */
window.setStatus = function (id, status) {
  if (currentRole === "worker") return;
  const r = requests.find(x => x.id === id);
  if (r) { r.status = status; saveRequests(requests); render(); toast(t("toastUpdated")); }
};

window.deleteReq = function (id) {
  if (currentRole === "worker") return;
  if (!confirm(t("confirmRemove"))) return;
  requests = requests.filter(x => x.id !== id);
  saveRequests(requests); rebuildFilters(); render(); toast(t("toastRemoved"));
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
    if (site && r.site !== site) return false;
    if (cat  && r.category !== cat) return false;
    if (q && !((r.product+r.name+r.site+r.notes).toLowerCase().includes(q))) return false;
    return true;
  });
}

/* ── Render list ── */
window.render = function () {
  document.getElementById("cnt-pending").textContent = requests.filter(r => r.status==="pending" && r.priority!=="urgent").length;
  document.getElementById("cnt-urgent").textContent  = requests.filter(r => r.status==="pending" && r.priority==="urgent").length;
  document.getElementById("cnt-ordered").textContent = requests.filter(r => r.status==="ordered").length;
  document.getElementById("cnt-done").textContent    = requests.filter(r => r.status==="done").length;
  document.getElementById("cnt-all").textContent     = requests.length;

  const list = filtered();
  const body = document.getElementById("list-body");

  if (!list.length) {
    body.innerHTML = `<div class="empty">${t("noRequests")}</div>`;
    return;
  }

  body.innerHTML = list.map(r => {
    const bClass = r.status==="done"    ? "b-done"    :
                   r.status==="ordered" ? "b-ordered" :
                   r.priority==="urgent"? "b-urgent"  : "b-pending";
    const bLabel = r.status==="done"    ? t("statusDone")    :
                   r.status==="ordered" ? t("statusOrdered") :
                   r.priority==="urgent"? t("statusUrgent")  : t("statusPending");

    const btns = [];
    if (r.status === "pending")
      btns.push(`<button class="btn btn-sm" onclick="setStatus(${r.id},'ordered')">${t("btnMarkOrdered")}</button>`);
    if (r.status !== "done")
      btns.push(`<button class="btn btn-sm" style="color:var(--color-text-success);border-color:var(--color-border-success);" onclick="setStatus(${r.id},'done')">${t("btnMarkDone")}</button>`);
    if (r.status === "done")
      btns.push(`<button class="btn btn-sm" onclick="setStatus(${r.id},'pending')">${t("btnReopen")}</button>`);
    btns.push(`<button class="btn btn-sm" onclick="deleteReq(${r.id})">${t("btnRemove")}</button>`);

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

/* ── Utility ── */
function escHtml(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Boot ── */
document.addEventListener("DOMContentLoaded", init);