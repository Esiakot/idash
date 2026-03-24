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

/**
 * Entrée de l'annuaire (utilisateur avec ses relations)
 */
export interface AnnuaireEntry extends Utilisateur {
  telephones?: Telephone[];
  ordinateurs?: Ordinateur[];
}

// ─── Types Authentification ──────────────────────────────────

/**
 * Résultat d'authentification
 */
export interface AuthResult {
  success: boolean;
  username?: string;
  groupes?: string[];
  message?: string;
}

/**
 * Session utilisateur
 */
export interface UserSession {
  username: string;
  groups: string[];
}

// ─── Types API ───────────────────────────────────────────────

/**
 * Réponse API générique
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: any;
}

/**
 * Filtre pour l'annuaire
 */
export interface AnnuaireFilters {
  search?: string;
  service?: string;
  actif?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Statistiques du dashboard
 */
export interface DashboardStats {
  utilisateurs_total: number;
  utilisateurs_actifs: number;
  ordinateurs_total: number;
  ordinateurs_assignes: number;
  telephones_total: number;
}

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
  timestamp: string;
  action: AuditAction;
  username?: string;
  ip: string;
  details?: Record<string, any>;
  success: boolean;
}

// ─── Types DB (MySQL) ────────────────────────────────────────

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
  utilisateur_id: number | null;
  type: string;
  prenom: string | null;
  nom_utilisateur: string | null;
  activite: number | null;
};
