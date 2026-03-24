"use client";

import { useState } from "react";
import styles from "@/styles/si/shared.module.css";
import ExportPdfButton from "@/components/si/annuaire/ExportPdfButton";
import FiltersSidebar from "@/components/si/annuaire/FiltersSidebar";
import Toolbar from "@/components/si/annuaire/Toolbar";
import AnnuaireTable from "@/components/si/annuaire/AnnuaireTable";
import AssignPcModal from "@/components/si/annuaire/AssignPcModal";
import PhonesEditorModal from "@/components/si/annuaire/PhonesEditorModal";
import MobileEditorModal from "@/components/si/annuaire/MobileEditorModal";
import type { Ordinateur, Telephone, Utilisateur } from "@/types";
import { flagOn } from "@/utils/formatters";
import { useAnnuaireData } from "@/hooks/useAnnuaireData";
import type { ComputersByUserId } from "@/hooks/useAnnuaireData";
import { useAnnuaireFilters } from "@/hooks/useAnnuaireFilters";

export default function Page() {
  const {
    users,
    setUsers,
    loading,
    error,
    computersByUserId,
    setComputersByUserId,
    phonesByUserId,
    setPhonesByUserId,
    isServiceInfo,
  } = useAnnuaireData();

  const {
    allGroups,
    categories,
    filteredUsers,
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
    filterGroups,
    setFilterGroups,
    pinLeaders,
    setPinLeaders,
    sortColumn,
    sortDirection,
    handleHeaderClick,
    hoveredGroup,
    setHoveredGroup,
    query,
    setQuery,
  } = useAnnuaireFilters(users, computersByUserId, phonesByUserId);

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
    const res = await fetch("/api/si/ordinateurs", {
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
  const openMobileEditor = (user: Utilisateur) => {
    if (!isServiceInfo) return;
    setMobileEditorUser(user);
    setMobileEditorOpen(true);
  };

  const onPhonesSaved = (userId: number, next: Telephone[]) => {
    setPhonesByUserId((prev) => ({ ...prev, [userId]: next }));
  };

  const onMobileSaved = (userId: number, newMobile: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, mobiles: newMobile } : u)),
    );
  };

  if (loading) return <p className={styles.loading}>Chargement...</p>;
  if (error) return <p className={styles.error}>Erreur : {error}</p>;

  return (
    <div className={styles.container}>
      <FiltersSidebar
        filterActif={filterActif}
        filterInactif={filterInactif}
        filterTypeUtilisateur={filterTypeUtilisateur}
        filterTypeAutre={filterTypeAutre}
        filterTypeStagiaire={filterTypeStagiaire}
        onToggleActif={() => setFilterActif(!filterActif)}
        onToggleInactif={() => setFilterInactif(!filterInactif)}
        onToggleTypeUtilisateur={() => setFilterTypeUtilisateur(!filterTypeUtilisateur)}
        onToggleTypeAutre={() => setFilterTypeAutre(!filterTypeAutre)}
        onToggleTypeStagiaire={() => setFilterTypeStagiaire(!filterTypeStagiaire)}
        pinLeaders={pinLeaders}
        onTogglePinLeaders={() => setPinLeaders(!pinLeaders)}
        categories={categories}
        filterGroups={filterGroups}
        onToggleGroup={(g) => setFilterGroups((prev) => ({ ...prev, [g]: !prev[g] }))}
      />

      <div className={styles.mainContent}>
        <Toolbar
          count={filteredUsers.length}
          hoveredGroup={hoveredGroup}
          query={query}
          onQueryChange={setQuery}
          onClear={() => setQuery("")}
          rightSlot={
            <ExportPdfButton
              data={filteredUsers}
              phonesByUserId={phonesByUserId}
              fileName="annuaire_utilisateurs"
              title="Annuaire"
            />
          }
        />

        <AnnuaireTable
          users={filteredUsers}
          allGroups={allGroups}
          filterGroups={filterGroups}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onHeaderClick={handleHeaderClick}
          hoveredGroup={hoveredGroup}
          setHoveredGroup={setHoveredGroup}
          flagOn={flagOn}
          computersByUserId={computersByUserId}
          phonesByUserId={phonesByUserId}
          isServiceInfo={isServiceInfo}
          onOpenAssignModal={openAssignFor}
          onUnassignPc={unassignPc}
          onOpenPhonesEditor={openPhonesEditor}
          onOpenMobileEditor={openMobileEditor}
        />
      </div>

      <AssignPcModal
        open={assignOpen}
        userId={assignUserId}
        userLabel={assignUserLabel}
        onClose={() => setAssignOpen(false)}
        onAssigned={onAssigned}
      />

      <PhonesEditorModal
        open={phonesEditorOpen}
        user={
          phonesEditorUser
            ? {
                id: phonesEditorUser.id,
                nom: phonesEditorUser.nom,
                prenom: phonesEditorUser.prenom,
                trigramme: phonesEditorUser.trigramme,
              }
            : null
        }
        tels={phonesByUserId[phonesEditorUser?.id ?? -1] ?? []}
        onClose={() => setPhonesEditorOpen(false)}
        onSaved={(next) => {
          if (phonesEditorUser) onPhonesSaved(phonesEditorUser.id, next);
        }}
      />

      <MobileEditorModal
        open={mobileEditorOpen}
        userId={mobileEditorUser?.id ?? null}
        label={
          mobileEditorUser
            ? `${mobileEditorUser.nom ?? ""} ${mobileEditorUser.prenom ?? ""}`.trim() ||
              mobileEditorUser.trigramme
            : undefined
        }
        currentMobile={mobileEditorUser?.mobiles ?? ""}
        onClose={() => setMobileEditorOpen(false)}
        onSaved={(newMobile) => {
          if (mobileEditorUser) onMobileSaved(mobileEditorUser.id, newMobile);
        }}
      />
    </div>
  );
}
