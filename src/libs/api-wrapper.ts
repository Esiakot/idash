// src/lib/api-wrapper.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Type pour les handlers d'API
 */
type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
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

      // Erreur de validation Zod
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Données invalides",
            details: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      // Erreurs MySQL spécifiques
      if (error?.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Cette entrée existe déjà" },
          { status: 409 }
        );
      }

      if (error?.code === "ER_NO_REFERENCED_ROW_2") {
        return NextResponse.json(
          { error: "L'entité référencée n'existe pas" },
          { status: 404 }
        );
      }

      // Erreur générique
      return NextResponse.json(
        {
          error: "Erreur interne du serveur",
          message:
            process.env.NODE_ENV === "development"
              ? error?.message
              : undefined,
        },
        { status: 500 }
      );
    }
  };
}


