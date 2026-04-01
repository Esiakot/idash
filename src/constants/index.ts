// Constantes partagées pour l'application

// ─── Groupes d'accès ──────────────────────────────────────────

/**
 * Groupes autorisés à accéder à l'application
 */
export const GROUPS_AUTORISES = [
  "Glo_ServiceInfo",
  "Glo_Commercial",
  "Glo_Direction",
  "Glo_Symetrie",
  "Administrateurs",
  "Glo_Comptabilite",
  "Glo_Production",
  "Glo_RH",
] as const;

/**
 * Groupe requis pour les opérations CRUD sur les ressources SI
 */
export const GROUP_SERVICE_INFO = "Glo_ServiceInfo";
export const GROUP_DIRECTION = "Glo_Direction";
export const GROUPES_EDITION_ANNUAIRE = [GROUP_SERVICE_INFO, GROUP_DIRECTION];

/**
 * Mapping des colonnes DB vers les groupes
 * Utilisé pour reconstruire les groupes d'un utilisateur depuis les colonnes de la table utilisateurs
 */
export const DB_GROUP_COLUMNS = [
  { column: "Glo_Stagiaire", group: "Glo_Stagiaire" },
  { column: "Glo_ServiceInfo", group: "Glo_ServiceInfo" },
  { column: "Glo_Commercial", group: "Glo_Commercial" },
  { column: "Glo_Direction", group: "Glo_Direction", extras: ["Glo_CODIR"] },
  { column: "Glo_Symetrie", group: "Glo_Symetrie" },
  { column: "Glo_Comptabilite", group: "Glo_Comptabilite" },
  { column: "Glo_Production", group: "Glo_Production" },
  { column: "Glo_RH", group: "Glo_RH" },
] as const;

// ─── API Endpoints ────────────────────────────────────────────

export const API_ROUTES = {
  AUTH: "/api/auth",
  SESSION: "/api/session",
  ANNUAIRE: "/api/annuaire",
  ORDINATEURS: "/api/ordinateurs",
  ORDINATEURS_ANNUAIRE: "/api/ordinateurs/annuaire",
  TELEPHONES: "/api/telephones",
  UTILISATEUR_MOBILE: (id: number | string) => `/api/utilisateurs/${id}/mobile`,
} as const;

// ─── Tokens spéciaux ─────────────────────────────────────────

export const NULL_TOKEN = "__NULL__";

// ─── Événements Custom ───────────────────────────────────────

export const EVENTS = {
  OPEN_LOGIN_MODAL: "open-login-modal",
} as const;

// ─── Rate Limiter ─────────────────────────────────────────────

export const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ─── Base de données ──────────────────────────────────────────

export const DB_CONFIG = {
  CONNECTION_LIMIT: 10,
  QUEUE_LIMIT: 0,
  DEFAULT_PORT: 3306,
} as const;

// ─── Health Check ─────────────────────────────────────────────

export const REQUIRED_ENV_VARS = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "COOKIE_SECRET",
] as const;

// ─── Messages d'erreur ───────────────────────────────────────

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Accès refusé: utilisateur non authentifié",
  FORBIDDEN: "Accès refusé: groupes non autorisés",
  NOT_FOUND: "Ressource non trouvée",
  INTERNAL_ERROR: "Erreur interne serveur",
  INVALID_DATA: "Données invalides",
  INVALID_JSON: "Corps de la requête invalide (JSON attendu)",
  DUPLICATE_ENTRY: "Cette entrée existe déjà",
  REFERENCE_ERROR: "Référence invalide (utilisateur ou ressource inexistant)",
  CREDENTIALS_REQUIRED: "Identifiants requis",
  INVALID_CREDENTIALS: "Identifiants incorrects",
  RATE_LIMITED: (seconds: number) => `Trop de tentatives. Réessayez dans ${seconds} secondes`,
  COMPUTER_NOT_FOUND: "Ordinateur introuvable",
  ONLY_STATIONS_ASSIGNABLE: "Seules les Stations sont assignables",
  COMPUTER_ALREADY_ASSIGNED: "Ordinateur déjà assigné",
  COMPUTER_ALREADY_FREE: "Ordinateur déjà libre",
  PHONE_NOT_FOUND: "Téléphone non trouvé",
  USER_NOT_FOUND: "Utilisateur non trouvé",
  NETWORK_ERROR: "Erreur réseau",
  ASSIGN_ERROR: "Erreur d'assignation",
  CREATE_FAILED: "Création échouée",
  UPDATE_FAILED: "Mise à jour échouée",
  DELETE_FAILED: "Suppression échouée",
} as const;

// ─── Codes de statut HTTP ────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ─── Configuration des cookies ───────────────────────────────

export const COOKIE_CONFIG = {
  AUTH_TOKEN: "auth_token",
  AUTH_GROUPS: "auth_groups",
  MAX_AGE: 8 * 60 * 60, // 8 heures
  SECURE: process.env.NODE_ENV === "production",
  HTTP_ONLY: true,
  SAME_SITE: "lax" as const,
  PATH: "/",
} as const;

// ─── Labels affichage groupes ────────────────────────────────

export const GROUP_LABEL_OVERRIDES: Record<string, string> = {
  Administrateurs_de_l_entreprise: "Administrateurs de l'entreprise",
  Propri_taires_cr_ateurs_de_la_strat_gie_de_groupe:
    "Propriétaires créateurs de la stratégie de groupe",
  Glo_Qualit_: "Glo Qualité",
  Glo_ServiceInfo: "Glo Service Info",
  Glo_Symetrie: "Glo Symétrie",
  Glo_Projet: "Glo Projet",
  Glo_CODIR: "Glo CODIR",
  Glo_COMEX: "Glo COMEX",
  SYM_Employes: "SYM Employés",
  SYM_BE: "SYM BE",
  Invit_s: "Invités",
  Utilisateurs_du_Bureau___distance: "Utilisateurs du Bureau à distance",
  Groupe_de_r_plication_dont_le_mot_de_passe_RODC_est_refus_:
    "Groupe de réplication dont le mot de passe RODC est refusé",
  sst_symetrie_fr: "SST Symétrie FR",
};

// ─── Annuaire ────────────────────────────────────────────────

export const PIN_TRIGRAMMES: string[] = ["OLA", "TRO", "GDI"];

/**
 * Colonnes de la table utilisateurs SANS le mot de passe.
 * Utilisé pour les SELECT explicites évitant la fuite du hash.
 */
export const USER_COLUMNS_NO_PASSWORD = [
  "id", "trigramme", "prenom", "nom", "samaccountname",
  "mobile", "type_utilisateur", "activite",
  "`Glo_Stagiaire`", "`Glo_ServiceInfo`", "`Glo_Commercial`",
  "`Glo_Direction`", "`Glo_Symetrie`", "`Glo_Comptabilite`",
  "`Glo_Production`", "`Glo_RH`",
  "created_at", "updated_at",
].join(", ");

export const ANNUAIRE_CATEGORIES: Record<string, string[]> = {
  Groupes: [
    "Glo_Stagiaire",
    "Glo_ServiceInfo",
    "Glo_Commercial",
    "Glo_Direction",
    "Glo_Symetrie",
    "Glo_Comptabilite",
    "Glo_Production",
    "Glo_RH",
  ],
};

// ─── Types d'ordinateur ──────────────────────────────────────

export const COMPUTER_TYPES = {
  STATION: "Station",
  SERVEUR: "Serveur",
  PORTABLE: "Portable",
  AUTRE: "Autre",
} as const;

// ─── Types d'utilisateur ─────────────────────────────────────

export const USER_TYPES = {
  UTILISATEUR: "Utilisateur",
  STAGIAIRE: "Stagiaire",
  AUTRE: "Autre",
} as const;

// ─── Statuts d'activité ──────────────────────────────────────

export const ACTIVITY_STATUS = {
  ACTIF: "Actif",
  INACTIF: "Inactif",
} as const;

// ─── Statuts d'affectation ordinateur ────────────────────────

export const ASSIGNMENT_STATUS = {
  TOUS: "Tous",
  AFFECTE: "Affecté",
  NON_AFFECTE: "Non affecté",
} as const;

// ─── Health Check statuts ────────────────────────────────────

export const HEALTH_STATUS = {
  OK: "ok",
  ERROR: "error",
  WARNING: "warning",
  HEALTHY: "healthy",
  UNHEALTHY: "unhealthy",
  DEGRADED: "degraded",
} as const;

// ─── Ordinateurs: mapping tri SQL ────────────────────────────

export const ORDINATEUR_SORT_MAP: Record<string, string> = {
  nom: "o.nom",
  type: "o.type",
  os: "o.systeme_exploitation",
  utilisateur: "u.prenom, u.nom",
};

// ─── Query params ────────────────────────────────────────────

export const QUERY_PARAMS = {
  FREE: "free",
  TRUE: "true",
} as const;

// ─── Codes erreur MySQL ──────────────────────────────────────

export const MYSQL_ERRORS = {
  DUPLICATE_ENTRY: "ER_DUP_ENTRY",
  REFERENCE_ERROR: "ER_NO_REFERENCED_ROW_2",
} as const;

// ─── Labels d'affichage ──────────────────────────────────────

export const DISPLAY_LABELS = {
  NON_SPECIFIE: "Non spécifié",
  NON_AFFECTE: "Non affecté",
} as const;
