"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ClientSession,
  OrdinateursApiResponse,
  OrdinateurWithUser,
  OrdinateurFacets,
  OrdinateurSortKey,
} from "@/types";
import { API_ROUTES, ERROR_MESSAGES } from "@/constants";

export function useOrdinateursData() {
  // Session
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Filtres
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOS, setSelectedOS] = useState("");

  // Tri
  const [sortBy, setSortBy] = useState<OrdinateurSortKey>("nom");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Données
  const [data, setData] = useState<OrdinateursApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification
  useEffect(() => {
    fetch(API_ROUTES.SESSION)
      .then((r) => r.json())
      .then((s) => setSession(s))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  // Requête côté client vers l'API Next
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedType) params.set("type", selectedType);
      if (selectedStatus) params.set("status", selectedStatus);
      if (selectedOS) params.set("os", selectedOS);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortDir) params.set("sortDir", sortDir);

      const res = await fetch(
        `${API_ROUTES.ORDINATEURS_ANNUAIRE}?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      const json: OrdinateursApiResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedStatus, selectedOS, sortBy, sortDir, sessionLoading]);

  const computers = data?.computers ?? [];
  const facets = data?.facets ?? null;

  const handleSort = (key: OrdinateurSortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const countLabel = useMemo(() => {
    const n = computers.length;
    return `${n} ordinateur${n > 1 ? "s" : ""} trouvé${n > 1 ? "s" : ""}`;
  }, [computers.length]);

  const resetFilters = () => {
    setSelectedType("");
    setSelectedStatus("");
    setSelectedOS("");
  };

  return {
    sessionLoading,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedOS,
    setSelectedOS,
    sortBy,
    sortDir,
    handleSort,
    computers,
    facets,
    loading,
    error,
    countLabel,
    resetFilters,
  };
}
