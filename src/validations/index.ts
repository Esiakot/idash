// src/validations/index.ts
import { z } from "zod";

/**
 * Schéma de validation pour la création d'un téléphone
 */
export const CreateTelephoneSchema = z.object({
  poste: z
    .string()
    .trim()
    .length(2, "Le numéro de poste doit contenir exactement 2 chiffres")
    .regex(/^[0-9]+$/, "Le poste doit contenir uniquement des chiffres"),
  lignes_internes: z
    .string()
    .trim()
    .min(1, "Les lignes internes sont requises")
    .max(100, "Les lignes internes ne peuvent pas dépasser 100 caractères"),
  utilisateur_id: z
    .number()
    .int("L'ID utilisateur doit être un entier")
    .positive("L'ID utilisateur doit être positif"),
});

/**
 * Schéma de validation pour la mise à jour d'un téléphone
 */
export const UpdateTelephoneSchema = z.object({
  id: z
    .number()
    .int("L'ID du téléphone doit être un entier")
    .positive("L'ID du téléphone doit être positif"),
  poste: z
    .string()
    .trim()
    .length(2, "Le numéro de poste doit contenir exactement 2 chiffres")
    .regex(/^[0-9]+$/, "Le poste doit contenir uniquement des chiffres"),
  lignes_internes: z
    .string()
    .trim()
    .min(1, "Les lignes internes sont requises")
    .max(100, "Les lignes internes ne peuvent pas dépasser 100 caractères"),
  utilisateur_id: z
    .number()
    .int("L'ID utilisateur doit être un entier")
    .positive("L'ID utilisateur doit être positif")
    .optional(),
});

/**
 * Schéma de validation pour la suppression d'un téléphone
 */
export const DeleteTelephoneSchema = z.object({
  id: z
    .number()
    .int("L'ID du téléphone doit être un entier")
    .positive("L'ID du téléphone doit être positif"),
});

/**
 * Schéma de validation pour l'authentification
 */
export const AuthSchema = z.object({
  username: z.string().trim().min(1, "Le nom d'utilisateur est requis").max(100, "Nom d'utilisateur trop long"),
  password: z.string().min(1, "Le mot de passe est requis").max(128, "Mot de passe trop long"),
});

/**
 * Schéma de validation pour l'assignation d'un ordinateur
 */
export const AssignComputerSchema = z.object({
  ordinateur_id: z
    .number()
    .int("L'ID de l'ordinateur doit être un entier")
    .positive("L'ID de l'ordinateur doit être positif"),
  utilisateur_id: z
    .number()
    .int("L'ID utilisateur doit être un entier")
    .positive("L'ID utilisateur doit être positif"),
});

/**
 * Schéma de validation pour le désassignation d'un ordinateur
 */
export const UnassignComputerSchema = z.object({
  ordinateur_id: z
    .number()
    .int("L'ID de l'ordinateur doit être un entier")
    .positive("L'ID de l'ordinateur doit être positif"),
});

/**
 * Schéma de validation pour la mise à jour du numéro mobile
 * (seul le champ mobile vient du body ; user_id vient de l'URL)
 */
export const UpdateMobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .max(50, "Le numéro mobile ne peut pas dépasser 50 caractères")
    .refine(
      (val) => val === "" || /^[\d\s+()-]+$/.test(val),
      "Format de numéro de téléphone invalide"
    )
    .optional()
    .nullable()
    .transform((val) => val ?? ""),
});

/**
 * Schéma de validation pour les query params de l'annuaire ordinateurs
 */
export const OrdinateursAnnuaireQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(["Tous", "Affecté", "Non affecté"]).optional(),
  os: z.string().optional(),
  sortBy: z.enum(["nom", "type", "os", "utilisateur"]).default("nom"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});
