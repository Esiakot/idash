"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ordinateur, Telephone, Utilisateur, SortDirection } from "@/types";
import { PIN_TRIGRAMMES, ANNUAIRE_CATEGORIES } from "@/constants";
import { flagOn } from "@/utils/formatters";
import {
  useLocalStorageBool,
  useLocalStorageString,
  useLocalStorageJson,
  useLocalStorageSort,
} from "@/hooks/useLocalStorage";
import type { ComputersByUserId, PhonesByUserId } from "@/hooks/useAnnuaireData";

const categories = ANNUAIRE_CATEGORIES;

function norm(s: any) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useAnnuaireFilters(
  users: Utilisateur[],
  computersByUserId: ComputersByUserId,
  phonesByUserId: PhonesByUserId,
) {
  const allGroups = useMemo(() => Object.values(categories).flat(), []);

  const [filterActif, setFilterActif] = useLocalStorageBool("filterActif", true);
  const [filterInactif, setFilterInactif] = useLocalStorageBool("filterInactif", true);
  const [filterTypeUtilisateur, setFilterTypeUtilisateur] = useLocalStorageBool("filterTypeUtilisateur", true);
  const [filterTypeAutre, setFilterTypeAutre] = useLocalStorageBool("filterTypeAutre", true);
  const [filterTypeStagiaire, setFilterTypeStagiaire] = useLocalStorageBool("filterTypeStagiaire", true);
  const [pinLeaders, setPinLeaders] = useLocalStorageBool("pinLeaders", true);
  const [query, setQuery] = useLocalStorageString("annuaireQuery", "");

  const defaultGroups = useMemo(() => {
    const def: Record<string, boolean> = {};
    allGroups.forEach((g) => (def[g] = true));
    return def;
  }, [allGroups]);

  const [filterGroups, setFilterGroups] = useLocalStorageJson<Record<string, boolean>>("filterGroups", defaultGroups);

  // Merge saved groups with all known groups (in case new groups were added)
  const mergedFilterGroups = useMemo(() => {
    const merged: Record<string, boolean> = {};
    allGroups.forEach((g) => {
      merged[g] = Object.prototype.hasOwnProperty.call(filterGroups, g) ? filterGroups[g] : true;
    });
    return merged;
  }, [allGroups, filterGroups]);

  const { sortColumn, setSortColumn, sortDirection, setSortDirection } = useLocalStorageSort();

  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState<Record<string, number>>({});

  const handleHeaderClick = (col: string) => {
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
  };

  const isPinned = (u: Utilisateur) =>
    pinLeaders && PIN_TRIGRAMMES.includes((u.trigramme || "").toString().toUpperCase());

  const [filteredUsers, setFilteredUsers] = useState<Utilisateur[]>([]);

  useEffect(() => {
    const q = norm(query);
    let result = users.filter((user) => {
      if (user.samaccountname === "greg.pourtest") return false;
      if (user.activite === "Actif" && !filterActif) return false;
      if (user.activite === "Inactif" && !filterInactif) return false;

      const isStagiaire =
        user.type_utilisateur === "Stagiaire" ||
        (typeof user.isStagiaire === "boolean"
          ? user.isStagiaire
          : flagOn(user["Glo_Stagiaire"]));

      if (!filterTypeStagiaire && isStagiaire) return false;

      if (!isStagiaire) {
        if (user.type_utilisateur === "Utilisateur" && !filterTypeUtilisateur) return false;
        if (user.type_utilisateur === "Autre" && !filterTypeAutre) return false;
        if (
          !["Utilisateur", "Autre", "Stagiaire"].includes(user.type_utilisateur) &&
          !filterTypeUtilisateur
        )
          return false;
      }

      if (q) {
        const pcs = computersByUserId[user.id] ?? [];
        const pcNames = pcs.map((p) => p.nom || "").join(" ");
        const tels = phonesByUserId[user.id] ?? [];
        const telText = tels.map((t) => `${t.poste} ${t.lignes_internes}`).join(" ");
        const enabledGroups = allGroups.filter((g) => flagOn((user as any)[g])).join(" ");
        const haystack = norm(
          [
            user.trigramme,
            user.prenom,
            user.nom,
            user.samaccountname,
            user.mobiles,
            user.type_utilisateur,
            user.activite,
            pcNames,
            telText,
            enabledGroups,
          ].join(" "),
        );
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const compareUsers = (a: Utilisateur, b: Utilisateur) => {
      const aPinned = isPinned(a);
      const bPinned = isPinned(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (!sortColumn || !sortDirection) return 0;
      const toComparable = (u: Utilisateur) => {
        if (sortColumn === "ordinateurs") {
          return (computersByUserId[u.id] ?? [])
            .map((p) => p.nom?.toLowerCase() || "")
            .sort()
            .join(", ");
        }
        if (sortColumn === "telephones") {
          return (phonesByUserId[u.id] ?? [])
            .map((t) => `${t.poste ?? ""} ${t.lignes_internes ?? ""}`.toLowerCase())
            .sort()
            .join(", ");
        }
        if (allGroups.includes(sortColumn)) {
          return flagOn(u[sortColumn]) ? "1" : "0";
        }
        return (u[sortColumn] ?? "").toString().toLowerCase();
      };
      const va = toComparable(a);
      const vb = toComparable(b);
      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    };

    result.sort(compareUsers);
    setFilteredUsers(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    users,
    filterActif,
    filterInactif,
    filterTypeUtilisateur,
    filterTypeAutre,
    filterTypeStagiaire,
    sortColumn,
    sortDirection,
    computersByUserId,
    phonesByUserId,
    pinLeaders,
    query,
    allGroups,
  ]);

  return {
    allGroups,
    categories,
    filteredUsers,
    // Filters
    filterActif,
    setFilterActif,
    filterInactif,
    setFilterInactif,
    filterTypeUtilisateur,
    setFilterTypeUtilisateur,
    filterTypeAutre,
    setFilterTypeAutre,
    filterTypeStagiaire,
    setFilterTypeStagiaire,
    filterGroups: mergedFilterGroups,
    setFilterGroups,
    pinLeaders,
    setPinLeaders,
    // Sort
    sortColumn,
    sortDirection,
    handleHeaderClick,
    // UI
    hoveredGroup,
    setHoveredGroup,
    query,
    setQuery,
  };
}
