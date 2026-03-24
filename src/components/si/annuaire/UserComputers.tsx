"use client";

import styles from "@/styles/si/shared.module.css";
import type { Ordinateur } from "@/types";

export type { Ordinateur };

export default function UserComputers({
  pcs,
  canEdit = false,
  onUnassign,
  fixedWidth = false,
}: {
  pcs: Ordinateur[];
  canEdit?: boolean;
  onUnassign?: (pcId: number) => void;
  fixedWidth?: boolean; // <— NEW: uniformise la largeur
}) {
  if (!pcs || pcs.length === 0) {
    return (
      <span className={styles.muted} title="Aucun ordinateur">
        —
      </span>
    );
  }

  return (
    <div className={styles.chipRow}>
      {pcs.map((pc) => {
        const tooltip = [
          pc.nom,
          pc.systeme_exploitation ? `OS: ${pc.systeme_exploitation}` : null,
          pc.version ? `Version: ${pc.version}` : null,
          pc.type ? `Type: ${pc.type}` : null,
        ]
          .filter(Boolean)
          .join(" • ");

        return (
          <span
            key={pc.id}
            className={`${styles.chip} ${fixedWidth ? styles.chipFixed : ""}`}
            title={tooltip}
          >
            <span className={styles.chipLabel}>{pc.nom}</span>
            {canEdit && onUnassign && (
              <button
                type="button"
                aria-label={`Désassigner ${pc.nom}`}
                title={`Désassigner ${pc.nom}`}
                onClick={() => onUnassign(pc.id)}
                className={styles.chipClose}
              >
                ×
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
