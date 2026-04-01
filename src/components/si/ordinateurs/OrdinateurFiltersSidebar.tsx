"use client";

import styles from "@/styles/si/shared.module.css";
import type { OrdinateurFacets } from "@/types";
import { ASSIGNMENT_STATUS, DISPLAY_LABELS, NULL_TOKEN } from "@/constants";

type OrdinateurFiltersSidebarProps = {
  facets: OrdinateurFacets | null;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedOS: string;
  onOSChange: (os: string) => void;
};

export default function OrdinateurFiltersSidebar({
  facets,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedOS,
  onOSChange,
}: OrdinateurFiltersSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h2>Gestion des Ordinateurs</h2>

      <div className={styles.filters}>
        {/* Type */}
        <div className={styles.filterCard}>
          <strong className={styles.sectionTitle}>Type d&apos;ordinateur</strong>

          <label>
            <input
              type="radio"
              name="type"
              checked={selectedType === ""}
              onChange={() => onTypeChange("")}
            />
            Tous les types
          </label>

          {(facets?.types ?? []).map((t) => (
            <label key={t}>
              <input
                type="radio"
                name="type"
                checked={selectedType === t}
                onChange={() => onTypeChange(t)}
              />
              {t}
            </label>
          ))}
        </div>

        {/* Statut */}
        <div className={styles.filterCard}>
          <strong className={styles.sectionTitle}>
            Statut d&apos;affectation
          </strong>

          <label>
            <input
              type="radio"
              name="status"
              checked={selectedStatus === ""}
              onChange={() => onStatusChange("")}
            />
            {ASSIGNMENT_STATUS.TOUS}
          </label>

          <label>
            <input
              type="radio"
              name="status"
              checked={selectedStatus === ASSIGNMENT_STATUS.AFFECTE}
              onChange={() => onStatusChange(ASSIGNMENT_STATUS.AFFECTE)}
            />
            {ASSIGNMENT_STATUS.AFFECTE}
          </label>

          <label>
            <input
              type="radio"
              name="status"
              checked={selectedStatus === ASSIGNMENT_STATUS.NON_AFFECTE}
              onChange={() => onStatusChange(ASSIGNMENT_STATUS.NON_AFFECTE)}
            />
            {ASSIGNMENT_STATUS.NON_AFFECTE}
          </label>
        </div>

        {/* OS */}
        <div className={styles.filterCard}>
          <strong className={styles.sectionTitle}>
            Système d&apos;exploitation
          </strong>

          <label>
            <input
              type="radio"
              name="os"
              checked={selectedOS === ""}
              onChange={() => onOSChange("")}
            />
            Tous les OS
          </label>

          {(facets?.osList ?? []).map((osRaw) => {
            const value = osRaw ?? NULL_TOKEN;
            const displayLabel = osRaw || DISPLAY_LABELS.NON_SPECIFIE;
            return (
              <label key={displayLabel}>
                <input
                  type="radio"
                  name="os"
                  checked={selectedOS === value}
                  onChange={() => onOSChange(value)}
                />
                {displayLabel}
              </label>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <h2>Statistiques</h2>
        {facets ? (
          <ul className={styles.statsList}>
            <li>
              <strong>Total :</strong> {facets.stats.total}
            </li>
            <li>
              <strong>Affectés :</strong> {facets.stats.assigned} (
              {facets.stats.total
                ? Math.round(
                    (facets.stats.assigned / facets.stats.total) * 100,
                  )
                : 0}
              %)
            </li>
            <li>
              <strong>Non affectés :</strong> {facets.stats.nonAssigned} (
              {facets.stats.total
                ? Math.round(
                    (facets.stats.nonAssigned / facets.stats.total) * 100,
                  )
                : 0}
              %)
            </li>
            <li>
              <strong>Stations :</strong> {facets.stats.station}
            </li>
            <li>
              <strong>Serveurs :</strong> {facets.stats.serveur}
            </li>
            <li>
              <strong>Autres :</strong> {facets.stats.other}
            </li>
          </ul>
        ) : (
          <div className={styles.loading}>Chargement…</div>
        )}
      </div>
    </aside>
  );
}
