// src/types/index.ts
/**
 * Types partagés de l'application
 */

// ─── Types de base Ordinateur ────────────────────────────────

/**
 * Types d'ordinateur possibles dans l'AD
 */
export type OrdinateurType =
  | "Station"
  | "Serveur"
  | "Portable"
  | "Autre";

/**
 * Ordinateur (utilisé dans les composants front et API)
 */
export interface Ordinateur {
  id: number;
  nom: string;
  systeme_exploitation?: string | null;
  version?: string | null;
  utilisateur_id?: number | null;
  type: OrdinateurType;
}

// ─── Types de base Téléphone ─────────────────────────────────

/**
 * Téléphone fixe
 */
export interface Telephone {
  id: number;
  poste: string;
  lignes_internes: string;
  utilisateur_id?: number | null;
}

// ─── Types Utilisateur ───────────────────────────────────────

/**
 * Utilisateur de l'annuaire (vue front complète)
 */
export interface Utilisateur {
  id: number;
  trigramme: string;
  prenom: string;
  nom: string;
  samaccountname: string;
  mobiles: string;
  type_utilisateur: string;
  activite: "Actif" | "Inactif" | string;
  isStagiaire?: boolean;
  [key: string]: any;
}

/**
 * Utilisateur allégé (pour les modales d'édition)
 */
export interface UserLite {
  id: number;
  nom?: string;
  prenom?: string;
  trigramme?: string;
}

// ─── Types Annuaire ──────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

// ─── Types Authentification ──────────────────────────────────

/**
 * Session côté client (réponse de /api/session)
 */
export interface ClientSession {
  authenticated: boolean;
  username?: string;
  groups?: string[];
}

// ─── Types page Ordinateurs ─────────────────────────────────

/**
 * Ordinateur enrichi avec les infos utilisateur (vue table)
 */
export interface OrdinateurWithUser extends Ordinateur {
  prenom?: string | null;
  nom_utilisateur?: string | null;
  activite?: number | null;
}

/**
 * Facettes pour les filtres de la page ordinateurs
 */
export interface OrdinateurFacets {
  types: string[];
  osList: (string | null)[];
  stats: {
    total: number;
    assigned: number;
    nonAssigned: number;
    station: number;
    serveur: number;
    other: number;
  };
}

/**
 * Réponse API du endpoint /api/ordinateurs/annuaire
 */
export interface OrdinateursApiResponse {
  computers: OrdinateurWithUser[];
  facets: OrdinateurFacets;
}

/**
 * Clés de tri pour la table ordinateurs
 */
export type OrdinateurSortKey = "nom" | "type" | "os" | "utilisateur";

// ─── Types Audit ─────────────────────────────────────────────

/**
 * Actions auditées dans l'application
 */
export type AuditAction =
  | "AUTH_SUCCESS"
  | "AUTH_FAILED"
  | "AUTH_RATE_LIMITED"
  | "TELEPHONE_CREATE"
  | "TELEPHONE_UPDATE"
  | "TELEPHONE_DELETE"
  | "COMPUTER_ASSIGN"
  | "COMPUTER_UNASSIGN"
  | "USER_MOBILE_UPDATE"
  | "UNAUTHORIZED_ACCESS";

/**
 * Structure d'un log d'audit
 */
export interface AuditLog {
  timestamp?: string;
  action: AuditAction;
  username?: string;
  ip: string;
  details?: Record<string, any>;
  success: boolean;
}

// ─── Types PDF (souples) ─────────────────────────────────────

export type PdfTelephone = {
  id?: number | string;
  poste?: string | number | null;
  lignes_internes?: string | null;
  fixe?: string | null;
  ligne_fixe?: string | null;
  utilisateur_id?: number | string | null;
  [k: string]: any;
};

export type PdfUtilisateur = {
  id: number | string;
  trigramme: string;
  prenom: string;
  nom: string;
  mobiles?: string;
  telephones?: string | PdfTelephone[];
  poste?: string | number | null;
  lignes_internes?: string | null;
  fixe?: string | null;
  ligne_fixe?: string | null;
  [key: string]: any;
};

// ─── Types Annuaire (maps) ───────────────────────────────────

export type ComputersByUserId = Record<number, Ordinateur[]>;
export type PhonesByUserId = Record<number, Telephone[]>;

// ─── Types Middleware / API ──────────────────────────────────

export interface AuthContext {
  username: string;
  groups: string[];
  ip: string;
}

export type ApiHandler = (req: import("next/server").NextRequest, context?: any) => Promise<import("next/server").NextResponse>;

// ─── Types DB (MySQL2) ───────────────────────────────────────

import type { RowDataPacket } from "mysql2";

export type TypeRow = RowDataPacket & {
  type: string;
};

export type OSRow = RowDataPacket & {
  systeme_exploitation: string | null;
};

export type CountRow = RowDataPacket & {
  total?: number;
  assigned?: number;
  station?: number;
  serveur?: number;
  other?: number;
};

export type ComputerRow = RowDataPacket & {
  id: number;
  nom: string;
  systeme_exploitation: string | null;
  version?: string | null;
  utilisateur_id: number | null;
  type: string;
  prenom: string | null;
  nom_utilisateur: string | null;
  activite: number | null;
};


