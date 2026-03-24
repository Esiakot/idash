"use client";

import { useState, useEffect, useCallback } from "react";

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

type SortDir = "asc" | "desc" | null;

export function useLocalStorageSort(): {
  sortColumn: string | null;
  setSortColumn: (v: string | null) => void;
  sortDirection: SortDir;
  setSortDirection: (v: SortDir) => void;
} {
  const [sortColumn, setSortColumn] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("sortColumn") || null;
  });

  const [sortDirection, setSortDirection] = useState<SortDir>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem("sortDirection");
    return v === "asc" || v === "desc" ? v : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sortColumn", sortColumn ?? "");
    localStorage.setItem("sortDirection", sortDirection ?? "");
  }, [sortColumn, sortDirection]);

  return { sortColumn, setSortColumn, sortDirection, setSortDirection };
}

export function useSortCycle() {
  const [clickCount, setClickCount] = useState<Record<string, number>>({});
  const { sortColumn, setSortColumn, sortDirection, setSortDirection } = useLocalStorageSort();

  const handleHeaderClick = useCallback((col: string) => {
    const count = ((clickCount[col] || 0) + 1) % 3;
    setClickCount({ [col]: count });
    if (count === 1) {
      setSortColumn(col);
      setSortDirection("asc");
    } else if (count === 2) {
      setSortColumn(col);
      setSortDirection("desc");
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  }, [clickCount, setSortColumn, setSortDirection]);

  return { sortColumn, sortDirection, handleHeaderClick };
}
