// src/lib/api-wrapper.ts
import { NextRequest, NextResponse } from "next/server";
import type { ApiHandler } from "@/types";
import { HTTP_STATUS, ERROR_MESSAGES, MYSQL_ERRORS } from "@/constants";

/**
 * Erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Wrapper pour gérer les erreurs de manière centralisée
 * @param handler - Le handler de route API
 * @returns Un handler wrappé avec gestion d'erreurs
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error("API Error:", error);

      // ApiError personnalisée (auth, validation, métier)
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            details: error.details,
          },
          { status: error.statusCode }
        );
      }

      // Erreurs MySQL spécifiques
      if (error?.code === MYSQL_ERRORS.DUPLICATE_ENTRY) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.DUPLICATE_ENTRY },
          { status: HTTP_STATUS.CONFLICT }
        );
      }

      if (error?.code === MYSQL_ERRORS.REFERENCE_ERROR) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.REFERENCE_ERROR },
          { status: HTTP_STATUS.NOT_FOUND }
        );
      }

      // Erreur générique
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INTERNAL_ERROR,
          message:
            process.env.NODE_ENV === "development"
              ? error?.message
              : undefined,
        },
        { status: HTTP_STATUS.INTERNAL_ERROR }
      );
    }
  };
}


