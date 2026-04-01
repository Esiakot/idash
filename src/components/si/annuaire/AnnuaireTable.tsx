"use client";

import { useMemo } from "react";
import UserComputers from "./UserComputers";
import UserPhones from "./UserPhones";
import styles from "@/styles/si/shared.module.css";
import type { Ordinateur, Telephone, Utilisateur, SortDirection } from "@/types";
import { truncateText, flagOn } from "@/utils/formatters";
import { ACTIVITY_STATUS } from "@/constants";

type AnnuaireTableProps = {
  users: Utilisateur[];
  allGroups: string[];
  filterGroups: Record<string, boolean>;
  sortColumn: string | null;
  sortDirection: SortDirection;
  onHeaderClick: (col: string) => void;
  hoveredGroup: string | null;
  setHoveredGroup: (g: string | null) => void;

  computersByUserId?: Record<number, Ordinateur[]>;
  phonesByUserId?: Record<number, Telephone[]>;

  // Gestion assignation/désassignation PC
  isServiceInfo?: boolean;
  onOpenAssignModal?: (user: Utilisateur) => void;
  onUnassignPc?: (pcId: number, userId: number) => void;

  // NEW: édition téléphones & mobile
  onOpenPhonesEditor?: (user: Utilisateur) => void;
  onOpenMobileEditor?: (user: Utilisateur) => void;
};

export default function AnnuaireTable({
  users,
  allGroups,
  filterGroups,
  sortColumn,
  sortDirection,
  onHeaderClick,
  hoveredGroup,
  setHoveredGroup,
  computersByUserId = {},
  phonesByUserId = {},
  isServiceInfo = false,
  onOpenAssignModal,
  onUnassignPc,
  onOpenPhonesEditor,
  onOpenMobileEditor,
}: AnnuaireTableProps) {
  const columns = useMemo(
    () => [
      "trigramme",
      "prenom",
      "nom",
      "samaccountname",
      "mobiles", // ✏️ ici
      "telephones", // bouton "Modifier"
      "ordinateurs",
      ...allGroups,
    ],
    [allGroups]
  );

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isGroupCol = allGroups.includes(col);
              const hidden = isGroupCol && filterGroups[col] === false;
              return (
                <th
                  key={col}
                  className={isGroupCol ? styles.groupCol : ""}
                  style={{ display: hidden ? "none" : "" }}
                  onMouseEnter={() =>
                    isGroupCol ? setHoveredGroup(col) : null
                  }
                  onMouseLeave={() =>
                    isGroupCol ? setHoveredGroup(null) : null
                  }
                  onClick={() => onHeaderClick(col)}
                  title={
                    col === "ordinateurs"
                      ? "Ordinateurs liés"
                      : col === "telephones"
                      ? "Téléphones (poste & fixe)"
                      : isGroupCol
                      ? col
                      : undefined
                  }
                >
                  {col === "ordinateurs"
                    ? "Ordinateurs"
                    : col === "telephones"
                    ? "Téléphones"
                    : isGroupCol
                    ? truncateText(col, 15)
                    : col}
                  {sortColumn === col
                    ? sortDirection === "asc"
                      ? " 🔼"
                      : sortDirection === "desc"
                      ? " 🔽"
                      : ""
                    : ""}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              {columns.map((col) => {
                const isGroupCol = allGroups.includes(col);
                const hidden = isGroupCol && filterGroups[col] === false;
                if (hidden) return null;

                if (col === "trigramme") {
                  return (
                    <td key={col}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          className={`${styles["activity-badge"]} ${
                            user.activite === ACTIVITY_STATUS.ACTIF
                              ? styles["activity-active"]
                              : styles["activity-inactive"]
                          }`}
                        />
                        {user.trigramme}
                      </span>
                    </td>
                  );
                }

                if (col === "mobiles") {
                  return (
                    <td key={col}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span className={styles.chip}>
                          {user.mobiles ?? ""}
                          {isServiceInfo && onOpenMobileEditor && (
                            <button
                              type="button"
                              className={styles.chipClose}
                              title="Modifier le mobile"
                              onClick={() => onOpenMobileEditor(user)}
                              aria-label="Modifier le mobile"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      </span>
                    </td>
                  );
                }

                if (col === "telephones") {
                  const tels = phonesByUserId[user.id] ?? [];
                  return (
                    <td key={col}>
                      <UserPhones
                        tels={tels}
                        fixedWidth
                        canEdit={isServiceInfo && !!onOpenPhonesEditor}
                        onEdit={() =>
                          onOpenPhonesEditor && onOpenPhonesEditor(user)
                        }
                      />
                    </td>
                  );
                }

                if (col === "ordinateurs") {
                  const pcs = computersByUserId[user.id] ?? [];
                  return (
                    <td key={col}>
                      <div className={styles.chipRow}>
                        {isServiceInfo && (
                          <button
                            className={`${styles.chipButton} ${styles.chipFixed}`}
                            onClick={() =>
                              onOpenAssignModal && onOpenAssignModal(user)
                            }
                            type="button"
                            title="Assigner un PC"
                          >
                            <span className={styles.chipLabel}>Assigner</span>
                          </button>
                        )}
                        <UserComputers
                          pcs={pcs}
                          canEdit={isServiceInfo}
                          onUnassign={
                            isServiceInfo && onUnassignPc
                              ? (pcId) => onUnassignPc(pcId, user.id)
                              : undefined
                          }
                          fixedWidth
                        />
                      </div>
                    </td>
                  );
                }

                if (isGroupCol) {
                  return (
                    <td key={col} style={{ textAlign: "center" }}>
                      <span className={styles.groupCheck}>
                        {flagOn(user[col]) ? "✔" : ""}
                      </span>
                    </td>
                  );
                }

                return <td key={col}>{user[col] ?? ""}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
