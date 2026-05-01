/* ══════════════════════════════════════════
   translations.js
   All UI strings in EN and FR.
   ══════════════════════════════════════════ */

const strings = {

  /* ── Gate ── */
  gateTitle:        { en: "Supply Request Tracker",          fr: "Suivi des demandes de fournitures" },
  gateSub:          { en: "Who are you signing in as?",      fr: "Qui êtes-vous ?" },
  gatePinSubtitle:  { en: "Supervisor access",               fr: "Accès superviseur" },
  gateWorkerLabel:  { en: "Worker",                          fr: "Agent" },
  gateWorkerDesc:   { en: "Submit a new supply request",     fr: "Soumettre une demande de fournitures" },
  gateSuperLabel:   { en: "Supervisor",                      fr: "Superviseur" },
  gateSuperDesc:    { en: "Manage requests & analytics",     fr: "Gérer les demandes et les analyses" },
  gatePinPrompt:    { en: "Enter supervisor PIN",            fr: "Entrez le code superviseur" },
  gatePinEnter:     { en: "Enter",                           fr: "Valider" },
  gatePinBack:      { en: "Back",                            fr: "Retour" },
  gatePinError:     { en: "Incorrect PIN. Try again.",       fr: "Code incorrect. Réessayez." },

  /* ── Header ── */
  appTitle:         { en: "Supply Request Tracker",          fr: "Suivi des demandes de fournitures" },
  headerSubMgmt:    { en: "Products, materials & analytics", fr: "Produits, matériaux et analyses" },
  headerSubWorker:  { en: "Submit a supply request",         fr: "Soumettre une demande de fournitures" },
  signOut:          { en: "Sign out",                        fr: "Déconnexion" },
  rolePillWorker:   { en: "Worker",                          fr: "Agent" },
  rolePillSuper:    { en: "Supervisor",                      fr: "Superviseur" },
  btnNewRequest:    { en: "+ New request",                   fr: "+ Nouvelle demande" },
  btnAnalytics:     { en: "Analytics",                       fr: "Analyses" },

  /* ── Nav tabs ── */
  tabPending:       { en: "Pending",                         fr: "En attente" },
  tabUrgent:        { en: "Urgent",                          fr: "Urgent" },
  tabOrdered:       { en: "Ordered",                         fr: "Commandé" },
  tabDone:          { en: "Done",                            fr: "Terminé" },
  tabAll:           { en: "All",                             fr: "Tout" },

  /* ── Filters ── */
  filterAllSites:   { en: "All job sites",                   fr: "Tous les chantiers" },
  filterAllCats:    { en: "All categories",                  fr: "Toutes les catégories" },
  filterSearch:     { en: "Search requests…",               fr: "Rechercher des demandes…" },

  /* ── Form ── */
  formTitle:        { en: "New supply request",              fr: "Nouvelle demande de fournitures" },
  fieldName:        { en: "Your name *",                     fr: "Votre nom *" },
  fieldNamePH:      { en: "e.g. Maria",                      fr: "ex. Marie" },
  fieldSite:        { en: "Job site *",                      fr: "Chantier *" },
  fieldSitePH:      { en: "e.g. Riverside Offices, Block A", fr: "ex. Bureau Central, Bloc A" },
  fieldProduct:     { en: "Product / material *",            fr: "Produit / matériel *" },
  fieldProductPH:   { en: "e.g. Bleach spray, mop heads",    fr: "ex. Spray javel, têtes de balai" },
  fieldCategory:    { en: "Category",                        fr: "Catégorie" },
  fieldQty:         { en: "Quantity needed",                 fr: "Quantité nécessaire" },
  fieldQtyPH:       { en: "e.g. 2 boxes",                    fr: "ex. 2 boîtes" },
  fieldCost:        { en: "Est. unit cost ($)",              fr: "Coût unitaire estimé (€)" },
  fieldCostPH:      { en: "e.g. 4.50",                       fr: "ex. 4,50" },
  fieldPriority:    { en: "Priority",                        fr: "Priorité" },
  fieldFreq:        { en: "Frequency of need",               fr: "Fréquence du besoin" },
  fieldSupplier:    { en: "Preferred supplier",              fr: "Fournisseur préféré" },
  fieldSupplierPH:  { en: "e.g. CleanCo, Amazon",            fr: "ex. CleanCo, Amazon" },
  fieldNotes:       { en: "Reason / notes",                  fr: "Raison / remarques" },
  fieldNotesPH:     { en: "Why is it needed? Running low, damaged item…", fr: "Pourquoi en avez-vous besoin ? Stock bas, article endommagé…" },
  btnSubmit:        { en: "Submit request",                  fr: "Soumettre la demande" },
  btnCancel:        { en: "Cancel",                          fr: "Annuler" },

  /* ── Category options ── */
  catChemicals:     { en: "Cleaning chemicals",              fr: "Produits chimiques" },
  catEquipment:     { en: "Equipment",                       fr: "Équipement" },
  catDisposables:   { en: "Disposables",                     fr: "Consommables" },
  catPPE:           { en: "PPE / Safety",                    fr: "EPI / Sécurité" },
  catPaper:         { en: "Paper products",                  fr: "Produits en papier" },
  catTools:         { en: "Tools",                           fr: "Outils" },
  catOther:         { en: "Other",                           fr: "Autre" },

  /* ── Priority options ── */
  priorityNormal:   { en: "Normal",                          fr: "Normal" },
  priorityUrgent:   { en: "Urgent",                          fr: "Urgent" },

  /* ── Frequency options ── */
  freqOneOff:       { en: "One-off",                         fr: "Ponctuel" },
  freqWeekly:       { en: "Weekly",                          fr: "Hebdomadaire" },
  freqMonthly:      { en: "Monthly",                         fr: "Mensuel" },
  freqAsNeeded:     { en: "As needed",                       fr: "Selon les besoins" },

  /* ── Worker success screen ── */
  successTitle:     { en: "Request submitted!",              fr: "Demande envoyée !" },
  successMsg:       { en: "Your supervisor will be notified. Thank you!", fr: "Votre superviseur sera notifié. Merci !" },
  btnAnother:       { en: "Submit another request",          fr: "Soumettre une autre demande" },

  /* ── Request card ── */
  cardBy:           { en: "By",                              fr: "Par" },
  cardSupplier:     { en: "Supplier",                        fr: "Fournisseur" },
  statusPending:    { en: "Pending",                         fr: "En attente" },
  statusUrgent:     { en: "Urgent",                          fr: "Urgent" },
  statusOrdered:    { en: "Ordered",                         fr: "Commandé" },
  statusDone:       { en: "Done",                            fr: "Terminé" },
  btnMarkOrdered:   { en: "Mark ordered",                    fr: "Marquer commandé" },
  btnMarkDone:      { en: "Mark done",                       fr: "Marquer terminé" },
  btnReopen:        { en: "Reopen",                          fr: "Rouvrir" },
  btnRemove:        { en: "Remove",                          fr: "Supprimer" },
  noRequests:       { en: "No requests here yet.",           fr: "Aucune demande ici pour l'instant." },

  /* ── Toasts ── */
  toastRequired:    { en: "Name, job site and product are required.", fr: "Le nom, le chantier et le produit sont obligatoires." },
  toastSubmitted:   { en: "Request submitted!",              fr: "Demande soumise !" },
  toastUpdated:     { en: "Updated!",                        fr: "Mis à jour !" },
  toastRemoved:     { en: "Removed.",                        fr: "Supprimé." },
  confirmRemove:    { en: "Remove this request?",            fr: "Supprimer cette demande ?" },

  /* ── Analytics ── */
  analyticsTitle:   { en: "Analytics dashboard",            fr: "Tableau de bord analytique" },
  btnBackToRequests:{ en: "Back to requests",               fr: "Retour aux demandes" },
  kpiTotal:         { en: "Total requests",                  fr: "Total des demandes" },
  kpiPending:       { en: "Pending",                         fr: "En attente" },
  kpiFulfilled:     { en: "Fulfilled",                       fr: "Satisfaites" },
  kpiCompletion:    { en: "completion",                      fr: "complétées" },
  kpiUrgent:        { en: "Urgent flagged",                  fr: "Urgentes signalées" },
  kpiSpend:         { en: "Est. total spend",                fr: "Dépense totale estimée" },
  kpiSites:         { en: "Job sites",                       fr: "Chantiers" },
  chartBySite:      { en: "Requests by job site",            fr: "Demandes par chantier" },
  chartByCat:       { en: "Requests by category",            fr: "Demandes par catégorie" },
  chartTopProducts: { en: "Top requested products",          fr: "Produits les plus demandés" },
  chartWorkers:     { en: "Most active requesters",          fr: "Agents les plus actifs" },
  chartSpend:       { en: "Estimated spend by category",     fr: "Dépense estimée par catégorie" },
  exportTitle:      { en: "Request log (exportable)",        fr: "Journal des demandes (exportable)" },
  btnDownloadCSV:   { en: "Download CSV",                    fr: "Télécharger CSV" },
  noData:           { en: "No data yet.",                    fr: "Aucune donnée pour l'instant." },

  /* ── CSV column headers ── */
  colDate:          { en: "Date",                            fr: "Date" },
  colWorker:        { en: "Worker",                          fr: "Agent" },
  colSite:          { en: "Job site",                        fr: "Chantier" },
  colProduct:       { en: "Product",                         fr: "Produit" },
  colCategory:      { en: "Category",                        fr: "Catégorie" },
  colQty:           { en: "Qty",                             fr: "Qté" },
  colPriority:      { en: "Priority",                        fr: "Priorité" },
  colStatus:        { en: "Status",                          fr: "Statut" },
  colCost:          { en: "Cost",                            fr: "Coût" },
  colSupplier:      { en: "Supplier",                        fr: "Fournisseur" },
  colFrequency:     { en: "Frequency",                       fr: "Fréquence" },
  colNotes:         { en: "Notes",                           fr: "Remarques" },
};

/* ── Active language (default: French) ── */
export let currentLang = localStorage.getItem("srt_lang") || "fr";

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("srt_lang", lang);
}

export function t(key) {
  const entry = strings[key];
  if (!entry) { console.warn("Missing translation key:", key); return key; }
  return entry[currentLang] ?? entry.en ?? key;
}