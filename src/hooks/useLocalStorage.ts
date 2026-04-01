"use client";

import { useState, useEffect } from "react";
import type { SortDirection } from "@/types";

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
