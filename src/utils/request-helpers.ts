// src/utils/request-helpers.ts
import { NextRequest } from "next/server";
import { ZodSchema } from "zod";
import { ApiError } from "@/libs/api-wrapper";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/constants";

/**
 * Valide et extrait un paramètre ID numérique depuis les params d'une route dynamique.
 * @throws ApiError si l'ID est invalide
 */
export function parseRouteId(params: { id: string }, label = "ID"): number {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(`${label} invalide`, HTTP_STATUS.BAD_REQUEST);
  }
  return id;
}

/**
 * Valide le body d'une requête avec un schéma Zod
 * Lance une ApiError si la validation échoue ou si le JSON est invalide
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(
      ERROR_MESSAGES.INVALID_JSON,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ApiError(
      ERROR_MESSAGES.INVALID_DATA,
      HTTP_STATUS.BAD_REQUEST,
      result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }))
    );
  }

  return result.data;
}

/**
 * Valide les query params d'une requête avec un schéma Zod
 */
export function validateQueryParams<T>(
  url: URL,
  schema: ZodSchema<T>
): T {
  const params = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ApiError(
      ERROR_MESSAGES.INVALID_DATA,
      HTTP_STATUS.BAD_REQUEST,
      result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }))
    );
  }

  return result.data;
}
