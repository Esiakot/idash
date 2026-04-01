"use client";

import styles from "@/styles/si/shared.module.css";
import type { Telephone } from "@/types";

export default function UserPhones({
  tels,
  fixedWidth = true,
  canEdit = false,
  onEdit,
}: {
  tels: Telephone[];
  fixedWidth?: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  const hasTels = !!tels && tels.length > 0;

  return (
    <div className={styles.chipRow} style={{ alignItems: "center", gap: 6 }}>
      {!hasTels ? (
        canEdit && onEdit ? (
          // Chip "Assigner" cliquable quand aucun téléphone n'est attribué
          <button
            type="button"
            className={`${styles.chip} ${fixedWidth ? styles.chipFixed : ""}`}
            title="Assigner un téléphone"
            aria-label="Assigner un téléphone"
            onClick={onEdit}
          >
            <span className={styles.chipLabel}>Assigner</span>
          </button>
        ) : (
          <span className={styles.muted}>—</span>
        )
      ) : (
        // Liste des téléphones existants
        tels.map((t) => (
          <div key={t.id} className={styles.chipRow} style={{ gap: 4 }}>
            <span
              className={`${styles.chip} ${fixedWidth ? styles.chipFixed : ""}`}
              title={`Poste : ${t.poste}`}
            >
              <span className={styles.chipLabel}>Poste {t.poste}</span>
            </span>
            <span
              className={`${styles.chip} ${fixedWidth ? styles.chipFixed : ""}`}
              title={`Fixe : ${t.lignes_internes}`}
            >
              <span className={styles.chipLabel}>
                {t.lignes_internes}
                {canEdit && onEdit && (
                  <button
                    type="button"
                    className={styles.chipClose}
                    title="Modifier les téléphones"
                    aria-label="Modifier les téléphones"
                    onClick={onEdit}
                  >
                    ×
                  </button>
                )}
              </span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}
