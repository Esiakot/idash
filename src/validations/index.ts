// src/validations/index.ts
import { z } from "zod";
import { ASSIGNMENT_STATUS } from "@/constants";

const assignmentValues = Object.values(ASSIGNMENT_STATUS) as [string, ...string[]];

// ─── Champs partagés Téléphone ──────────────────────────────────

const telephoneFields = {
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
};

const idField = (label: string) =>
  z.number().int(`L'${label} doit être un entier`).positive(`L'${label} doit être positif`);

// ─── Schémas Téléphone ──────────────────────────────────────

export const CreateTelephoneSchema = z.object({
  ...telephoneFields,
  utilisateur_id: idField("ID utilisateur"),
});

export const UpdateTelephoneSchema = z.object({
  id: idField("ID du téléphone"),
  ...telephoneFields,
  utilisateur_id: idField("ID utilisateur").optional(),
});

export const DeleteTelephoneSchema = z.object({
  id: idField("ID du téléphone"),
});

// ─── Schéma Authentification ────────────────────────────────

export const AuthSchema = z.object({
  username: z.string().trim().min(1, "Le nom d'utilisateur est requis").max(100, "Nom d'utilisateur trop long"),
  password: z.string().min(1, "Le mot de passe est requis").max(128, "Mot de passe trop long"),
});

// ─── Schémas Ordinateur ────────────────────────────────────

export const AssignComputerSchema = z.object({
  ordinateur_id: idField("ID de l'ordinateur"),
  utilisateur_id: idField("ID utilisateur"),
});

export const UnassignComputerSchema = z.object({
  ordinateur_id: idField("ID de l'ordinateur"),
});

// ─── Schéma Mobile ────────────────────────────────────────
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

// ─── Schéma Ordinateurs Annuaire (query params) ────────────
export const OrdinateursAnnuaireQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(assignmentValues).optional(),
  os: z.string().optional(),
  sortBy: z.enum(["nom", "type", "os", "utilisateur"]).default("nom"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});
