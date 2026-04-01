// src/services/audit-logger.ts
import type { AuditAction, AuditLog } from "@/types";

/**
 * Logger d'audit
 * En production, envoyer vers un système de logging externe (ELK, Datadog, etc.)
 */
class AuditLogger {
  /**
   * Enregistre une action auditée
   * @param log - Les informations du log
   */
  log(log: AuditLog): void {
    const logEntry = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    // En développement : log dans la console
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [AUDIT]", JSON.stringify(logEntry, null, 2));
    } else {
      // En production : log structuré pour parsing
      console.log(JSON.stringify(logEntry));
    }

    // TODO: En production, envoyer vers:
    // - Base de données dédiée aux logs
    // - Service externe (Datadog, Sentry, etc.)
    // - Fichier de log rotatif
  }

  /**
   * Log une authentification réussie
   */
  logAuthSuccess(username: string, ip: string, groups: string[]): void {
    this.log({
      action: "AUTH_SUCCESS",
      username,
      ip,
      details: { groups },
      success: true,
    } as AuditLog);
  }

  /**
   * Log une tentative d'authentification échouée
   */
  logAuthFailed(username: string, ip: string, reason?: string): void {
    this.log({
      action: "AUTH_FAILED",
      username,
      ip,
      details: { reason },
      success: false,
    } as AuditLog);
  }

  /**
   * Log un rate limiting
   */
  logRateLimited(ip: string, endpoint: string): void {
    this.log({
      action: "AUTH_RATE_LIMITED",
      ip,
      details: { endpoint },
      success: false,
    } as AuditLog);
  }

  /**
   * Log une création de téléphone
   */
  logTelephoneCreate(
    username: string,
    ip: string,
    telephoneId: number,
    details: { poste: string; utilisateur_id: number }
  ): void {
    this.log({
      action: "TELEPHONE_CREATE",
      username,
      ip,
      details: { telephoneId, ...details },
      success: true,
    } as AuditLog);
  }

  /**
   * Log une mise à jour de téléphone
   */
  logTelephoneUpdate(
    username: string,
    ip: string,
    telephoneId: number,
    details: { poste: string }
  ): void {
    this.log({
      action: "TELEPHONE_UPDATE",
      username,
      ip,
      details: { telephoneId, ...details },
      success: true,
    } as AuditLog);
  }

  /**
   * Log une suppression de téléphone
   */
  logTelephoneDelete(
    username: string,
    ip: string,
    telephoneId: number
  ): void {
    this.log({
      action: "TELEPHONE_DELETE",
      username,
      ip,
      details: { telephoneId },
      success: true,
    } as AuditLog);
  }

  /**
   * Log une assignation d'ordinateur
   */
  logComputerAssign(
    username: string,
    ip: string,
    computerId: number,
    userId: number
  ): void {
    this.log({
      action: "COMPUTER_ASSIGN",
      username,
      ip,
      details: { computerId, userId },
      success: true,
    } as AuditLog);
  }

  /**
   * Log une désassignation d'ordinateur
   */
  logComputerUnassign(
    username: string,
    ip: string,
    computerId: number
  ): void {
    this.log({
      action: "COMPUTER_UNASSIGN",
      username,
      ip,
      details: { computerId },
      success: true,
    } as AuditLog);
  }

  /**
   * Log une mise à jour du mobile utilisateur
   */
  logMobileUpdate(
    username: string,
    ip: string,
    userId: number,
    newMobile: string
  ): void {
    this.log({
      action: "USER_MOBILE_UPDATE",
      username,
      ip,
      details: { userId, newMobile },
      success: true,
    } as AuditLog);
  }

  /**
   * Log un accès non autorisé
   */
  logUnauthorizedAccess(
    username: string | undefined,
    ip: string,
    endpoint: string,
    requiredGroup?: string
  ): void {
    this.log({
      action: "UNAUTHORIZED_ACCESS",
      username,
      ip,
      details: { endpoint, requiredGroup },
      success: false,
    } as AuditLog);
  }
}

// Instance globale
export const auditLogger = new AuditLogger();
