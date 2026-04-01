"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClientSession, Ordinateur, Telephone, Utilisateur, ComputersByUserId, PhonesByUserId } from "@/types";
import { API_ROUTES, GROUP_SERVICE_INFO, PIN_TRIGRAMMES, ANNUAIRE_CATEGORIES, ACTIVITY_STATUS, USER_TYPES } from "@/constants";
import { flagOn } from "@/utils/formatters";
import {
  useLocalStorageBool,
  useLocalStorageString,
  useLocalStorageJson,
  useLocalStorageSort,
} from "@/hooks/useLocalStorage";

// ─── useAnnuaireData ─────────────────────────────────────────

export function useAnnuaireData() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [computersByUserId, setComputersByUserId] = useState<ComputersByUserId>({});
  const [phonesByUserId, setPhonesByUserId] = useState<PhonesByUserId>({});
  const [session, setSession] = useState<ClientSession | null>(null);

  const isServiceInfo = !!session?.groups?.includes(GROUP_SERVICE_INFO);

  useEffect(() => {
    fetch(API_ROUTES.SESSION)
      .then((r) => r.json())
      .then((s) => setSession(s))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(API_ROUTES.ANNUAIRE).then((r) => r.json()),
      fetch(API_ROUTES.ORDINATEURS).then((r) => r.json()),
      fetch(API_ROUTES.TELEPHONES).then((r) => r.json()),
    ])
      .then(([usersData, pcsData, telsData]) => {
        // Utilisateurs
        if (usersData.error) setError(usersData.error);
        else setUsers(usersData);

        // Ordinateurs
        if (Array.isArray(pcsData)) {
          const pcMap: ComputersByUserId = {};
          for (const pc of pcsData as Ordinateur[]) {
            if (!pc.utilisateur_id) continue;
            if (!pcMap[pc.utilisateur_id]) pcMap[pc.utilisateur_id] = [];
            pcMap[pc.utilisateur_id].push(pc);
          }
          setComputersByUserId(pcMap);
        }

        // Téléphones
        if (Array.isArray(telsData)) {
          const telMap: PhonesByUserId = {};
          for (const t of telsData as Telephone[]) {
            if (!t.utilisateur_id) continue;
            if (!telMap[t.utilisateur_id]) telMap[t.utilisateur_id] = [];
            telMap[t.utilisateur_id].push(t);
          }
          setPhonesByUserId(telMap);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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

// ─── useAnnuaireActions ──────────────────────────────────────

interface AnnuaireActionsInput {
  isServiceInfo: boolean;
  setComputersByUserId: React.Dispatch<React.SetStateAction<ComputersByUserId>>;
  setPhonesByUserId: React.Dispatch<React.SetStateAction<PhonesByUserId>>;
  setUsers: React.Dispatch<React.SetStateAction<Utilisateur[]>>;
}

export function useAnnuaireActions({
  isServiceInfo,
  setComputersByUserId,
  setPhonesByUserId,
  setUsers,
}: AnnuaireActionsInput) {
  // --- Assign PC modal ---
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<number | null>(null);
  const [assignUserLabel, setAssignUserLabel] = useState<string | undefined>(undefined);

  const openAssignFor = (user: Utilisateur) => {
    if (!isServiceInfo) return;
    setAssignUserId(user.id);
    setAssignUserLabel(`${user.nom} ${user.prenom}`.trim());
    setAssignOpen(true);
  };

  const closeAssign = () => setAssignOpen(false);

  const onAssigned = (pc: Ordinateur) => {
    if (!assignUserId) return;
    setComputersByUserId((prev) => {
      const next: ComputersByUserId = {};
      for (const k of Object.keys(prev)) {
        const uid = Number(k);
        next[uid] = (prev[uid] || []).filter((p) => p.id !== pc.id);
      }
      next[assignUserId] = [
        ...(next[assignUserId] || []),
        { ...pc, utilisateur_id: assignUserId },
      ];
      return next;
    });
  };

  const unassignPc = async (pcId: number, userId: number) => {
    if (!isServiceInfo) return;
    const ok = confirm("Désassigner ce PC ?");
    if (!ok) return;
    const res = await fetch(API_ROUTES.ORDINATEURS, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordinateur_id: pcId }),
    });
    if (res.ok) {
      setComputersByUserId((prev) => {
        const next = { ...prev };
        next[userId] = (next[userId] || []).filter((p) => p.id !== pcId);
        return next;
      });
    } else {
      const msg = (await res.json())?.error || "Impossible de désassigner.";
      alert(msg);
    }
  };

  // --- Phone / Mobile editors ---
  const [phonesEditorOpen, setPhonesEditorOpen] = useState(false);
  const [phonesEditorUser, setPhonesEditorUser] = useState<Utilisateur | null>(null);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [mobileEditorUser, setMobileEditorUser] = useState<Utilisateur | null>(null);

  const openPhonesEditor = (user: Utilisateur) => {
    if (!isServiceInfo) return;
    setPhonesEditorUser(user);
    setPhonesEditorOpen(true);
  };

  const closePhonesEditor = () => setPhonesEditorOpen(false);

  const openMobileEditor = (user: Utilisateur) => {
    if (!isServiceInfo) return;
    setMobileEditorUser(user);
    setMobileEditorOpen(true);
  };

  const closeMobileEditor = () => setMobileEditorOpen(false);

  const onPhonesSaved = (next: Telephone[]) => {
    if (phonesEditorUser) {
      setPhonesByUserId((prev) => ({ ...prev, [phonesEditorUser.id]: next }));
    }
  };

  const onMobileSaved = (newMobile: string) => {
    if (mobileEditorUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === mobileEditorUser.id ? { ...u, mobiles: newMobile } : u,
        ),
      );
    }
  };

  return {
    // Assign PC
    assignOpen,
    assignUserId,
    assignUserLabel,
    openAssignFor,
    closeAssign,
    onAssigned,
    unassignPc,
    // Phones editor
    phonesEditorOpen,
    phonesEditorUser,
    openPhonesEditor,
    closePhonesEditor,
    onPhonesSaved,
    // Mobile editor
    mobileEditorOpen,
    mobileEditorUser,
    openMobileEditor,
    closeMobileEditor,
    onMobileSaved,
  };
}

// ─── useAnnuaireFilters ──────────────────────────────────────

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

  const { sortColumn, setSortColumn, sortDirection, setSortDirection } = useLocalStorageSort("annuaire");

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

  const filteredUsers = useMemo(() => {
    const isPinned = (u: Utilisateur) =>
      pinLeaders && PIN_TRIGRAMMES.includes((u.trigramme || "").toString().toUpperCase());

    const q = norm(query);
    const result = users.filter((user) => {
      if (user.activite === ACTIVITY_STATUS.ACTIF && !filterActif) return false;
      if (user.activite === ACTIVITY_STATUS.INACTIF && !filterInactif) return false;

      const isStagiaire =
        user.type_utilisateur === USER_TYPES.STAGIAIRE ||
        (typeof user.isStagiaire === "boolean"
          ? user.isStagiaire
          : flagOn(user["Glo_Stagiaire"]));

      if (!filterTypeStagiaire && isStagiaire) return false;

      if (!isStagiaire) {
        if (user.type_utilisateur === USER_TYPES.UTILISATEUR && !filterTypeUtilisateur) return false;
        if (user.type_utilisateur === USER_TYPES.AUTRE && !filterTypeAutre) return false;
        if (
          !Object.values(USER_TYPES).includes(user.type_utilisateur as any) &&
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

    return [...result].sort(compareUsers);
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
