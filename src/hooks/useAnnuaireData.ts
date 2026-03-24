"use client";

import { useEffect, useState } from "react";
import type { Ordinateur, Telephone, Utilisateur } from "@/types";

export type ComputersByUserId = Record<number, Ordinateur[]>;
export type PhonesByUserId = Record<number, Telephone[]>;

type Session = {
  authenticated: boolean;
  username?: string;
  groups?: string[];
};

export function useAnnuaireData() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [computersByUserId, setComputersByUserId] = useState<ComputersByUserId>({});
  const [phonesByUserId, setPhonesByUserId] = useState<PhonesByUserId>({});
  const [session, setSession] = useState<Session | null>(null);

  const isServiceInfo = !!session?.groups?.includes("Glo_ServiceInfo");

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((s) => setSession(s))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    fetch("/api/si/annuaire")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUsers(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/si/ordinateurs")
      .then((res) => res.json())
      .then((pcs: Ordinateur[] | { error: string }) => {
        if (!Array.isArray(pcs)) return;
        const map: ComputersByUserId = {};
        for (const pc of pcs) {
          if (!pc.utilisateur_id) continue;
          if (!map[pc.utilisateur_id]) map[pc.utilisateur_id] = [];
          map[pc.utilisateur_id].push(pc);
        }
        setComputersByUserId(map);
      })
      .catch(() => setComputersByUserId({}));
  }, []);

  useEffect(() => {
    fetch("/api/si/telephones")
      .then((res) => res.json())
      .then((rows: Telephone[] | { error: string }) => {
        if (!Array.isArray(rows)) return;
        const map: PhonesByUserId = {};
        for (const t of rows) {
          if (!t.utilisateur_id) continue;
          if (!map[t.utilisateur_id]) map[t.utilisateur_id] = [];
          map[t.utilisateur_id].push(t);
        }
        setPhonesByUserId(map);
      })
      .catch(() => setPhonesByUserId({}));
  }, []);

  return {
    users,
    setUsers,
    loading,
    error,
    computersByUserId,
    setComputersByUserId,
    phonesByUserId,
    setPhonesByUserId,
    isServiceInfo,
  };
}
