/* ══════════════════════════════════════════
   TRANSLATIONS  —  translations.js
   Add keys here; use t('key') anywhere in the app.
   ══════════════════════════════════════════ */

export const LANGS = {

  en: {
    /* Gate */
    gateTitle:        "Supply Request Tracker",
    gateSub:          "Who are you signing in as?",
    gateWorkerLabel:  "Worker",
    gateWorkerDesc:   "Submit a new supply request",
    gateSuperLabel:   "Supervisor",
    gateSuperDesc:    "Manage requests & analytics",
    gatePinPrompt:    "Enter supervisor PIN",
    gatePinSubtitle:  "Supervisor access",
    gatePinEnter:     "Enter",
    gatePinBack:      "Back",
    gatePinError:     "Incorrect PIN. Try again.",

    /* Header */
    appTitle:         "Supply Request Tracker",
    headerSubMgmt:    "Products, materials & analytics",
    headerSubWorker:  "Submit a supply request",
    rolePillWorker:   "Worker",
    rolePillSuper:    "Supervisor",
    signOut:          "Sign out",

    /* Nav tabs */
    tabPending:       "Pending",
    tabUrgent:        "Urgent",
    tabOrdered:       "Ordered",
    tabDone:          "Done",
    tabAll:           "All",

    /* Filters */
    filterAllSites:   "All job sites",
    filterAllCats:    "All categories",
    filterSearch:     "Search requests...",

    /* New request form */
    formTitle:        "New supply request",
    fieldName:        "Your name *",
    fieldNamePH:      "e.g. Maria",
    fieldSite:        "Job site *",
    fieldSitePH:      "e.g. Riverside Offices, Block A",
    fieldProduct:     "Product / material *",
    fieldProductPH:   "e.g. Bleach spray, mop heads",
    fieldCategory:    "Category",
    fieldQty:         "Quantity needed",
    fieldQtyPH:       "e.g. 2 boxes",
    fieldCost:        "Est. unit cost ($)",
    fieldCostPH:      "e.g. 4.50",
    fieldPriority:    "Priority",
    priorityNormal:   "Normal",
    priorityUrgent:   "Urgent",
    fieldFreq:        "Frequency of need",
    freqOneOff:       "One-off",
    freqWeekly:       "Weekly",
    freqMonthly:      "Monthly",
    freqAsNeeded:     "As needed",
    fieldSupplier:    "Preferred supplier",
    fieldSupplierPH:  "e.g. CleanCo, Amazon",
    fieldNotes:       "Reason / notes",
    fieldNotesPH:     "Why is it needed? Running low, damaged item, etc.",
    btnSubmit:        "Submit request",
    btnCancel:        "Cancel",

    /* Categories */
    catChemicals:     "Cleaning chemicals",
    catEquipment:     "Equipment",
    catDisposables:   "Disposables",
    catPPE:           "PPE / Safety",
    catPaper:         "Paper products",
    catTools:         "Tools",
    catOther:         "Other",

    /* Worker success */
    successTitle:     "Request submitted!",
    successMsg:       "Your supervisor will be notified. Thank you!",
    btnAnother:       "Submit another request",

    /* Request card */
    cardBy:           "By",
    cardSupplier:     "Supplier",
    btnMarkOrdered:   "Mark ordered",
    btnMarkDone:      "Mark done",
    btnReopen:        "Reopen",
    btnRemove:        "Remove",

    /* Status labels */
    statusPending:    "Pending",
    statusOrdered:    "Ordered",
    statusUrgent:     "Urgent",
    statusDone:       "Done",

    /* Toasts */
    toastSubmitted:   "Request submitted!",
    toastUpdated:     "Updated!",
    toastRemoved:     "Removed.",
    toastRequired:    "Name, job site and product are required.",
    confirmRemove:    "Remove this request?",

    /* Analytics */
    analyticsTitle:       "Analytics dashboard",
    btnBackToRequests:    "Back to requests",
    kpiTotal:             "Total requests",
    kpiPending:           "Pending",
    kpiFulfilled:         "Fulfilled",
    kpiCompletion:        "% completion",
    kpiUrgent:            "Urgent flagged",
    kpiSpend:             "Est. total spend",
    kpiSites:             "Job sites",
    chartBySite:          "Requests by job site",
    chartByCat:           "Requests by category",
    chartTopProducts:     "Top requested products",
    chartWorkers:         "Most active requesters",
    chartSpend:           "Estimated spend by category",
    exportTitle:          "Request log (exportable)",
    btnDownloadCSV:       "Download CSV",
    noData:               "No data yet.",
    noRequests:           "No requests here yet.",

    /* Export table headers */
    colDate:          "Date",
    colWorker:        "Worker",
    colSite:          "Job site",
    colProduct:       "Product",
    colCategory:      "Category",
    colQty:           "Qty",
    colPriority:      "Priority",
    colStatus:        "Status",
    colCost:          "Cost",
    colSupplier:      "Supplier",
    colFrequency:     "Frequency",
    colNotes:         "Notes",
  },

  fr: {
    /* Gate */
    gateTitle:        "Suivi des demandes de fournitures",
    gateSub:          "Qui êtes-vous ?",
    gateWorkerLabel:  "Agent",
    gateWorkerDesc:   "Soumettre une demande de fournitures",
    gateSuperLabel:   "Responsable",
    gateSuperDesc:    "Gérer les demandes et les analyses",
    gatePinPrompt:    "Entrez le code PIN responsable",
    gatePinSubtitle:  "Accès responsable",
    gatePinEnter:     "Confirmer",
    gatePinBack:      "Retour",
    gatePinError:     "Code PIN incorrect. Réessayez.",

    /* Header */
    appTitle:         "Suivi des demandes de fournitures",
    headerSubMgmt:    "Produits, matériaux & analyses",
    headerSubWorker:  "Soumettre une demande de fournitures",
    rolePillWorker:   "Agent",
    rolePillSuper:    "Responsable",
    signOut:          "Déconnexion",

    /* Nav tabs */
    tabPending:       "En attente",
    tabUrgent:        "Urgent",
    tabOrdered:       "Commandé",
    tabDone:          "Terminé",
    tabAll:           "Tout",

    /* Filters */
    filterAllSites:   "Tous les chantiers",
    filterAllCats:    "Toutes les catégories",
    filterSearch:     "Rechercher...",

    /* New request form */
    formTitle:        "Nouvelle demande de fournitures",
    fieldName:        "Votre nom *",
    fieldNamePH:      "ex. Maria",
    fieldSite:        "Chantier *",
    fieldSitePH:      "ex. Bureaux Riverside, Bâtiment A",
    fieldProduct:     "Produit / matériau *",
    fieldProductPH:   "ex. Spray javellisant, têtes de serpillière",
    fieldCategory:    "Catégorie",
    fieldQty:         "Quantité nécessaire",
    fieldQtyPH:       "ex. 2 boîtes",
    fieldCost:        "Coût unitaire estimé (€)",
    fieldCostPH:      "ex. 4,50",
    fieldPriority:    "Priorité",
    priorityNormal:   "Normale",
    priorityUrgent:   "Urgente",
    fieldFreq:        "Fréquence du besoin",
    freqOneOff:       "Ponctuel",
    freqWeekly:       "Hebdomadaire",
    freqMonthly:      "Mensuel",
    freqAsNeeded:     "Selon les besoins",
    fieldSupplier:    "Fournisseur préféré",
    fieldSupplierPH:  "ex. CleanCo, Amazon",
    fieldNotes:       "Motif / remarques",
    fieldNotesPH:     "Pourquoi en avez-vous besoin ? Stock bas, article endommagé, etc.",
    btnSubmit:        "Envoyer la demande",
    btnCancel:        "Annuler",

    /* Categories */
    catChemicals:     "Produits d'entretien",
    catEquipment:     "Équipement",
    catDisposables:   "Consommables",
    catPPE:           "EPI / Sécurité",
    catPaper:         "Papeterie",
    catTools:         "Outillage",
    catOther:         "Autre",

    /* Worker success */
    successTitle:     "Demande envoyée !",
    successMsg:       "Votre responsable en sera informé. Merci !",
    btnAnother:       "Soumettre une autre demande",

    /* Request card */
    cardBy:           "Par",
    cardSupplier:     "Fournisseur",
    btnMarkOrdered:   "Marquer commandé",
    btnMarkDone:      "Marquer terminé",
    btnReopen:        "Rouvrir",
    btnRemove:        "Supprimer",

    /* Status labels */
    statusPending:    "En attente",
    statusOrdered:    "Commandé",
    statusUrgent:     "Urgent",
    statusDone:       "Terminé",

    /* Toasts */
    toastSubmitted:   "Demande envoyée !",
    toastUpdated:     "Mis à jour !",
    toastRemoved:     "Supprimé.",
    toastRequired:    "Le nom, le chantier et le produit sont obligatoires.",
    confirmRemove:    "Supprimer cette demande ?",

    /* Analytics */
    analyticsTitle:       "Tableau de bord analytique",
    btnBackToRequests:    "Retour aux demandes",
    kpiTotal:             "Total des demandes",
    kpiPending:           "En attente",
    kpiFulfilled:         "Traitées",
    kpiCompletion:        "% de complétion",
    kpiUrgent:            "Urgences signalées",
    kpiSpend:             "Dépenses estimées",
    kpiSites:             "Chantiers",
    chartBySite:          "Demandes par chantier",
    chartByCat:           "Demandes par catégorie",
    chartTopProducts:     "Produits les plus demandés",
    chartWorkers:         "Agents les plus actifs",
    chartSpend:           "Dépenses estimées par catégorie",
    exportTitle:          "Journal des demandes (exportable)",
    btnDownloadCSV:       "Télécharger CSV",
    noData:               "Aucune donnée.",
    noRequests:           "Aucune demande pour l'instant.",

    /* Export table headers */
    colDate:          "Date",
    colWorker:        "Agent",
    colSite:          "Chantier",
    colProduct:       "Produit",
    colCategory:      "Catégorie",
    colQty:           "Qté",
    colPriority:      "Priorité",
    colStatus:        "Statut",
    colCost:          "Coût",
    colSupplier:      "Fournisseur",
    colFrequency:     "Fréquence",
    colNotes:         "Remarques",
  }
};

/* Current language — persisted in localStorage */
export let currentLang = localStorage.getItem("srt_lang") || "fr";

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("srt_lang", lang);
}

/* Translate helper */
export function t(key) {
  return (LANGS[currentLang] && LANGS[currentLang][key]) ||
         (LANGS["en"] && LANGS["en"][key]) ||
         key;
}