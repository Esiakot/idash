"use client";

import styles from "@/styles/si/shared.module.css";
import SortableHeader from "@/components/common/SortableHeader";
import type { OrdinateurWithUser, OrdinateurSortKey } from "@/types";
import { ACTIVITY_STATUS, ASSIGNMENT_STATUS, DISPLAY_LABELS } from "@/constants";

type OrdinateursTableProps = {
  computers: OrdinateurWithUser[];
  sortBy: OrdinateurSortKey;
  sortDir: "asc" | "desc";
  onSort: (key: OrdinateurSortKey) => void;
  loading: boolean;
  error: string | null;
};

export default function OrdinateursTable({
  computers,
  sortBy,
  sortDir,
  onSort,
  loading,
  error,
}: OrdinateursTableProps) {
  return (
    <div className={styles.tableWrapper}>
      {loading && <div className={styles.loading}>Chargement…</div>}
      {error && <div className={styles.error}>Erreur : {error}</div>}
      {!loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              <SortableHeader
                label="Nom"
                active={sortBy === "nom"}
                direction={sortDir}
                onClick={() => onSort("nom")}
              />
              <SortableHeader
                label="Type"
                active={sortBy === "type"}
                direction={sortDir}
                onClick={() => onSort("type")}
              />
              <SortableHeader
                label="Système"
                active={sortBy === "os"}
                direction={sortDir}
                onClick={() => onSort("os")}
              />
              <SortableHeader
                label="Utilisateur"
                active={sortBy === "utilisateur"}
                direction={sortDir}
                onClick={() => onSort("utilisateur")}
              />
            </tr>
          </thead>
          <tbody>
            {computers.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.textCenter}>
                  Aucun ordinateur trouvé
                </td>
              </tr>
            ) : (
              computers.map((c) => {
                const userName =
                  c.utilisateur_id && (c.prenom || c.nom_utilisateur)
                    ? `${c.prenom ?? ""} ${c.nom_utilisateur ?? ""}`.trim()
                    : null;
                return (
                  <tr key={c.id}>
                    <td>{c.nom}</td>
                    <td>{c.type}</td>
                    <td>{c.systeme_exploitation ?? DISPLAY_LABELS.NON_SPECIFIE}</td>
                    <td>
                      {userName ? (
                        <>
                          <span
                            className={[
                              styles["activity-badge"],
                              c.activite
                                ? styles["activity-active"]
                                : styles["activity-inactive"],
                              styles.badgeGap,
                            ].join(" ")}
                            title={c.activite ? ACTIVITY_STATUS.ACTIF : ACTIVITY_STATUS.INACTIF}
                          />
                          {userName}
                        </>
                      ) : (
                        <span className={styles.unassigned}>
                          {DISPLAY_LABELS.NON_AFFECTE}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
