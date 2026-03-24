"use client";

import styles from "@/styles/si/shared.module.css";
import { GROUP_LABEL_OVERRIDES } from "@/constants";
import { prettifyGroupKey } from "@/utils/formatters";

type FiltersSidebarProps = {
  filterActif: boolean;
  filterInactif: boolean;
  filterTypeUtilisateur: boolean;
  filterTypeAutre: boolean;
  filterTypeStagiaire: boolean;
  onToggleActif: () => void;
  onToggleInactif: () => void;
  onToggleTypeUtilisateur: () => void;
  onToggleTypeAutre: () => void;
  onToggleTypeStagiaire: () => void;

  // nouveau
  pinLeaders: boolean;
  onTogglePinLeaders: () => void;

  categories: Record<string, string[]>;
  filterGroups: Record<string, boolean>;
  onToggleGroup: (groupName: string) => void;
};

export default function FiltersSidebar({
  filterActif,
  filterInactif,
  filterTypeUtilisateur,
  filterTypeAutre,
  filterTypeStagiaire,
  onToggleActif,
  onToggleInactif,
  onToggleTypeUtilisateur,
  onToggleTypeAutre,
  onToggleTypeStagiaire,
  pinLeaders,
  onTogglePinLeaders,
  categories,
  filterGroups,
  onToggleGroup,
}: FiltersSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <h2>Filtres</h2>
      <div className={styles.filters}>
        <strong>Activité :</strong>
        <label>
          <input
            type="checkbox"
            checked={filterActif}
            onChange={onToggleActif}
          />{" "}
          Actif
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterInactif}
            onChange={onToggleInactif}
          />{" "}
          Inactif
        </label>

        <strong>Type :</strong>
        <label>
          <input
            type="checkbox"
            checked={filterTypeUtilisateur}
            onChange={onToggleTypeUtilisateur}
          />{" "}
          Utilisateur
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterTypeAutre}
            onChange={onToggleTypeAutre}
          />{" "}
          Autre
        </label>
        <label>
          <input
            type="checkbox"
            checked={filterTypeStagiaire}
            onChange={onToggleTypeStagiaire}
          />{" "}
          Stagiaire
        </label>

        {/* Nouveau bloc d'affichage */}
        <strong>Affichage :</strong>
        <label title="Toujours placer GDI, TRO et OLA en tête de liste">
          <input
            type="checkbox"
            checked={pinLeaders}
            onChange={onTogglePinLeaders}
          />{" "}
          Prioriser GDI / TRO / OLA
        </label>

        <strong>Groupes :</strong>
        {Object.entries(categories).map(([catName, groups]) => (
          <div className={styles.catname1} key={catName}>
            <em>{catName}</em>
            {groups.map((g) => (
              <label key={g} title={g /* tooltip: clé brute si besoin */}>
                <input
                  type="checkbox"
                  checked={filterGroups[g]}
                  onChange={() => onToggleGroup(g)}
                />
                {prettifyGroupKey(g, GROUP_LABEL_OVERRIDES)}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}