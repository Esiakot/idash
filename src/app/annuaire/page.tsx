"use client";

import styles from "@/styles/si/shared.module.css";
import ExportPdfButton from "@/components/si/annuaire/ExportPdfButton";
import FiltersSidebar from "@/components/si/annuaire/FiltersSidebar";
import Toolbar from "@/components/si/annuaire/Toolbar";
import AnnuaireTable from "@/components/si/annuaire/AnnuaireTable";
import AssignPcModal from "@/components/si/annuaire/AssignPcModal";
import PhonesEditorModal from "@/components/si/annuaire/PhonesEditorModal";
import MobileEditorModal from "@/components/si/annuaire/MobileEditorModal";
import { useAnnuaireData, useAnnuaireFilters, useAnnuaireActions } from "@/hooks/useAnnuaire";

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

  const {
    assignOpen,
    assignUserId,
    assignUserLabel,
    openAssignFor,
    closeAssign,
    onAssigned,
    unassignPc,
    phonesEditorOpen,
    phonesEditorUser,
    openPhonesEditor,
    closePhonesEditor,
    onPhonesSaved,
    mobileEditorOpen,
    mobileEditorUser,
    openMobileEditor,
    closeMobileEditor,
    onMobileSaved,
  } = useAnnuaireActions({
    isServiceInfo,
    setComputersByUserId,
    setPhonesByUserId,
    setUsers,
  });

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
        onClose={closeAssign}
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
        onClose={closePhonesEditor}
        onSaved={onPhonesSaved}
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
        onClose={closeMobileEditor}
        onSaved={onMobileSaved}
      />
    </div>
  );
}
