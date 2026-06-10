/**
 * Hooks de persistance dans le localStorage du navigateur.
 * Rôle : factoriser le pattern useState + lecture/écriture localStorage,
 * utilisé partout pour conserver les filtres et tri entre les visites.
 * Tous les hooks gèrent le SSR (window indisponible) en retournant la valeur par défaut.
 */
"use client";

import { useState, useEffect } from "react";
import type { SortDirection } from "@/types";

/**
 * Persiste un booléen dans localStorage. Convention de stockage : "true"/"false".
 */
export function useLocalStorageBool(key: string, defaultValue = true): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    return stored === null ? defaultValue : stored !== "false";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue];
}

/**
 * Persiste une chaîne de caractères (ex : terme de recherche).
 */
export function useLocalStorageString(key: string, defaultValue = ""): [string, (v: string) => void] {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return defaultValue;
    return localStorage.getItem(key) ?? defaultValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
}

/**
 * Persiste un objet JSON sérialisable. Tombe sur defaultValue si parsing impossible
 * (données corrompues par une mise à jour de schema).
 */
export function useLocalStorageJson<T>(key: string, defaultValue: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

/**
 * Persiste l'état de tri d'un tableau (colonne + direction) sous deux clés préfixées.
 * Le préfixe permet d'avoir des tris indépendants entre tableaux (ex : annuaire vs ordinateurs).
 */
export function useLocalStorageSort(prefix = ""): {
  sortColumn: string | null;
  setSortColumn: (v: string | null) => void;
  sortDirection: SortDirection;
  setSortDirection: (v: SortDirection) => void;
} {
  const colKey = prefix ? `${prefix}_sortColumn` : "sortColumn";
  const dirKey = prefix ? `${prefix}_sortDirection` : "sortDirection";

  const [sortColumn, setSortColumn] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(colKey) || null;
  });

  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(dirKey);
    return v === "asc" || v === "desc" ? v : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(colKey, sortColumn ?? "");
    localStorage.setItem(dirKey, sortDirection ?? "");
  }, [colKey, dirKey, sortColumn, sortDirection]);

  return { sortColumn, setSortColumn, sortDirection, setSortDirection };
}
