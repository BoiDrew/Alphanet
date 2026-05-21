/* ══════════════════════════════════════════════════════════════
   storage.js  —  Supabase backend + offline queue fallback
   Replaces all localStorage logic for requests.
   Language preference (srt_lang) stays in localStorage — that's fine,
   it's just a UI setting, not data.
   ══════════════════════════════════════════════════════════════ */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ── 1. Supabase client ─────────────────────────────────────── */
const SUPABASE_URL  = "https://ladegkuspzuyqauupbje.supabase.co";   // e.g. https://xyzxyz.supabase.co
const SUPABASE_ANON = "sb_publishable_NQoCtnl8xD6xBTG92Ih-2w_z6lHP7tD";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── 2. Offline queue (localStorage) ───────────────────────── */
const QUEUE_KEY = "srt_offline_queue";

function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
  catch { return []; }
}

function saveQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }
  catch (e) { console.error("Queue save failed:", e); }
}

function addToQueue(op) {
  const q = getQueue();
  q.push({ ...op, queuedAt: Date.now() });
  saveQueue(q);
}

/* ── 3. Sync queued operations when back online ─────────────── */
export async function syncOfflineQueue() {
  const q = getQueue();
  if (!q.length) return;

  const remaining = [];
  for (const op of q) {
    try {
      if (op.type === "insert") {
        const { error } = await supabase.from("supply_requests").insert(op.data);
        if (error) throw error;
      } else if (op.type === "update") {
        const { error } = await supabase
          .from("supply_requests")
          .update(op.data)
          .eq("id", op.id);
        if (error) throw error;
      } else if (op.type === "delete") {
        const { error } = await supabase
          .from("supply_requests")
          .delete()
          .eq("id", op.id);
        if (error) throw error;
      }
    } catch {
      remaining.push(op); // keep failed ops for next sync attempt
    }
  }

  saveQueue(remaining);
  if (remaining.length === 0) console.log("Offline queue fully synced.");
  else console.warn(`${remaining.length} operations still queued.`);
}

/* ── 4. loadRequests ────────────────────────────────────────── */
export async function loadRequests() {
  try {
    const { data, error } = await supabase
      .from("supply_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(dbRowToApp);
  } catch (e) {
    console.warn("Supabase load failed, offline mode:", e.message);
    return [];
  }
}

/* ── 5. saveRequest (single insert) ────────────────────────── */
export async function saveRequest(req) {
  const row = appToDbRow(req);

  try {
    const { data, error } = await supabase
      .from("supply_requests")
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return dbRowToApp(data); // return the saved record (with server-generated id)
  } catch (e) {
    console.warn("Offline: queuing insert.", e.message);
    addToQueue({ type: "insert", data: row });
    return req; // return optimistically
  }
}

/* ── 6. updateRequest ───────────────────────────────────────── */
export async function updateRequest(id, changes) {
  // Map app-field names → db column names
  const dbChanges = {};
  if (changes.status    !== undefined) dbChanges.status      = changes.status;
  if (changes.priority  !== undefined) dbChanges.priority    = changes.priority;
  if (changes.notes     !== undefined) dbChanges.notes       = changes.notes;
  if (changes.supplier  !== undefined) dbChanges.supplier    = changes.supplier;
  if (changes.cost      !== undefined) dbChanges.estimated_cost = changes.cost;
  dbChanges.updated_at = new Date().toISOString();
  if (changes.status === "done") dbChanges.completed_at = new Date().toISOString();

  try {
    const { error } = await supabase
      .from("supply_requests")
      .update(dbChanges)
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.warn("Offline: queuing update.", e.message);
    addToQueue({ type: "update", id, data: dbChanges });
  }
}

/* ── 7. deleteRequest ───────────────────────────────────────── */
export async function deleteRequest(id) {
  try {
    const { error } = await supabase
      .from("supply_requests")
      .delete()
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.warn("Offline: queuing delete.", e.message);
    addToQueue({ type: "delete", id });
  }
}

/* ── 8. Realtime subscription ───────────────────────────────── */
// Pass a callback that receives the updated full list.
let realtimeChannel = null;

export function subscribeToRequests(onUpdate) {
  if (realtimeChannel) realtimeChannel.unsubscribe();

  realtimeChannel = supabase
    .channel("supply_requests_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "supply_requests" },
      async () => {
        // Re-fetch the full list on any change so state is always consistent
        const requests = await loadRequests();
        onUpdate(requests);
      }
    )
    .subscribe();

  return realtimeChannel;
}

export function unsubscribeFromRequests() {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
    realtimeChannel = null;
  }
}

/* ── 9. Data migration: localStorage → Supabase ────────────── */
export async function migrateLocalStorageToSupabase() {
  const OLD_KEY = "cleaning_requests_v2";
  const raw = localStorage.getItem(OLD_KEY);
  if (!raw) { console.log("No legacy data to migrate."); return 0; }

  let legacy;
  try { legacy = JSON.parse(raw); }
  catch { console.error("Could not parse legacy data."); return 0; }

  if (!Array.isArray(legacy) || !legacy.length) return 0;

  // Check for duplicates: skip IDs already in Supabase
  const { data: existing } = await supabase
    .from("supply_requests")
    .select("id");
  const existingIds = new Set((existing || []).map(r => String(r.id)));

  const toInsert = legacy
    .filter(r => !existingIds.has(String(r.id)))
    .map(r => ({
      // Try to use the old numeric id as a note in description
      worker_name:    r.name    || "Unknown",
      job_site:       r.site    || "",
      product:        r.product || "Unknown",
      category:       r.category || "Other",
      quantity:       r.qty     || "",
      estimated_cost: r.cost    || null,
      priority:       r.priority === "urgent" ? "urgent" : "normal",
      frequency:      r.frequency || "one-off",
      supplier:       r.supplier  || "",
      notes:          r.notes     || "",
      status:         r.status    || "pending",
      created_at:     new Date().toISOString(), // best approximation
      updated_at:     new Date().toISOString(),
    }));

  if (!toInsert.length) {
    console.log("All legacy records already migrated.");
    return 0;
  }

  const { error } = await supabase.from("supply_requests").insert(toInsert);
  if (error) {
    console.error("Migration insert failed:", error.message);
    return 0;
  }

  // Archive the old key so we don't migrate twice
  localStorage.setItem(OLD_KEY + "_migrated_backup", raw);
  localStorage.removeItem(OLD_KEY);
  console.log(`Migrated ${toInsert.length} records.`);
  return toInsert.length;
}

/* ── 10. Field mapping helpers ──────────────────────────────── */

// Supabase DB row  →  app object (matches what the rest of the app expects)
function dbRowToApp(r) {
  return {
    id:        r.id,
    name:      r.worker_name,
    site:      r.job_site,
    product:   r.product,
    category:  r.category,
    qty:       r.quantity,
    cost:      r.estimated_cost,
    priority:  r.priority,
    frequency: r.frequency,
    supplier:  r.supplier,
    notes:     r.notes,
    status:    r.status,
    date:      r.created_at
               ? new Date(r.created_at).toLocaleDateString("fr-FR")
               : "",
    ts:        r.created_at
               ? new Date(r.created_at).getTime()
               : 0,
  };
}

// App object  →  Supabase DB row (for inserts)
function appToDbRow(req) {
  return {
    worker_name:    req.name      || "",
    job_site:       req.site      || "",
    product:        req.product   || "",
    category:       req.category  || "Other",
    quantity:       req.qty       || "",
    estimated_cost: req.cost      || null,
    priority:       req.priority  || "normal",
    frequency:      req.frequency || "one-off",
    supplier:       req.supplier  || "",
    notes:          req.notes     || "",
    status:         "pending",
    created_at:     new Date().toISOString(),
    updated_at:     new Date().toISOString(),
  };
}