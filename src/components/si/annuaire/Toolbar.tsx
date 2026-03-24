"use client";

import { ReactNode } from "react";
import styles from "@/styles/si/shared.module.css";

type ToolbarProps = {
  count: number;
  hoveredGroup: string | null;

  // recherche
  query: string;
  onQueryChange: (q: string) => void;
  onClear?: () => void;

  // contenu à droite (ex: bouton Export PDF)
  rightSlot?: ReactNode;
};

export default function Toolbar({
  count,
  hoveredGroup,
  query,
  onQueryChange,
  onClear,
  rightSlot,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.rightTool}>
        {/* Gauche : compteur */}
        <span>{count} utilisateur(s) affiché(s)</span>

        {/* Centre : recherche */}
        <div>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher (trigramme, nom, prénom, PC, groupe...)"
            className={styles.input}
            aria-label="Rechercher dans l'annuaire"
            style={{ minWidth: 240 }}
          />
          {query && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => (onClear ? onClear() : onQueryChange(""))}
              title="Effacer la recherche"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
      {/* Droite : slot + info colonne hover */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {rightSlot}
        <span>{hoveredGroup ? `Colonne: ${hoveredGroup}` : ""}</span>
      </div>
    </div>
  );
}
