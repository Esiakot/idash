"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/si/shared.module.css";

const NULL_TOKEN = "__NULL__";

type Session = {
  authenticated: boolean;
  username?: string;
  groups?: string[];
};

type Ordinateur = {
  id: number;
  nom: string;
  systeme_exploitation: string | null;
  version: string | null;
  utilisateur_id: number | null;
  type:
    | "Station"
    | "Serveur"
    | "Portable"
    | "Autre";
  prenom?: string | null;
  nom_utilisateur?: string | null;
  activite?: number | null;
};

type Facets = {
  types: string[];
  osList: (string | null)[];
  stats: {
    total: number;
    assigned: number;
    nonAssigned: number;
    station: number;
    serveur: number;
    other: number;
  };
};

type ApiResponse = {
  computers: Ordinateur[];
  facets: Facets;
};

type SortKey = "nom" | "type" | "os" | "utilisateur";

export default function PageOrdinateurs() {
  const router = useRouter();
  
  // Session
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Filtres
  const [selectedType, setSelectedType] = useState<string>(""); // "" = Tous
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // "" = Tous
  const [selectedOS, setSelectedOS] = useState<string>(""); // "" = Tous, "__NULL__" = Non spécifié

  // Tri
  const [sortBy, setSortBy] = useState<SortKey>("nom");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Données
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((s) => setSession(s))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  // Requête côté client vers l’API Next
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedType) params.set("type", selectedType); // ✅ singulier
      if (selectedStatus) params.set("status", selectedStatus);
      if (selectedOS) params.set("os", selectedOS);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortDir) params.set("sortDir", sortDir);

      const res = await fetch(
        `/api/si/ordinateurs/annuaire?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedStatus, selectedOS, sortBy, sortDir, sessionLoading]);

  const computers = data?.computers ?? [];
  const facets = data?.facets;

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const countLabel = useMemo(() => {
    const n = computers.length;
    return `${n} ordinateur${n > 1 ? "s" : ""} trouvé${n > 1 ? "s" : ""}`;
  }, [computers.length]);

  const resetFilters = () => {
    setSelectedType("");
    setSelectedStatus("");
    setSelectedOS("");
  };

  // Affichage du chargement
  if (sessionLoading) {
    return <p className={styles.loading}>Chargement...</p>;
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2>Gestion des Ordinateurs</h2>

        <div className={styles.filters}>
          {/* Type */}
          <div className={styles.filterCard}>
            <strong className={styles.sectionTitle}>Type d’ordinateur</strong>

            <label>
              <input
                type="radio"
                name="type"
                checked={selectedType === ""}
                onChange={() => setSelectedType("")}
              />
              Tous les types
            </label>

            {(facets?.types ?? []).map((t) => (
              <label key={t}>
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === t}
                  onChange={() => setSelectedType(t)}
                />
                {t}
              </label>
            ))}
          </div>

          {/* Statut */}
          <div className={styles.filterCard}>
            <strong className={styles.sectionTitle}>
              Statut d’affectation
            </strong>

            <label>
              <input
                type="radio"
                name="status"
                checked={selectedStatus === ""}
                onChange={() => setSelectedStatus("")}
              />
              Tous
            </label>

            <label>
              <input
                type="radio"
                name="status"
                checked={selectedStatus === "Affecté"}
                onChange={() => setSelectedStatus("Affecté")}
              />
              Affecté
            </label>

            <label>
              <input
                type="radio"
                name="status"
                checked={selectedStatus === "Non affecté"}
                onChange={() => setSelectedStatus("Non affecté")}
              />
              Non affecté
            </label>
          </div>

          {/* OS */}
          <div className={styles.filterCard}>
            <strong className={styles.sectionTitle}>
              Système d’exploitation
            </strong>

            <label>
              <input
                type="radio"
                name="os"
                checked={selectedOS === ""}
                onChange={() => setSelectedOS("")}
              />
              Tous les OS
            </label>

            {(facets?.osList ?? []).map((osRaw) => {
              const value = osRaw ?? NULL_TOKEN;
              const label = osRaw || "Non spécifié";
              return (
                <label key={label}>
                  <input
                    type="radio"
                    name="os"
                    checked={selectedOS === value}
                    onChange={() => setSelectedOS(value)}
                  />
                  {label}
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
                      (facets.stats.assigned / facets.stats.total) * 100
                    )
                  : 0}
                %)
              </li>
              <li>
                <strong>Non affectés :</strong> {facets.stats.nonAssigned} (
                {facets.stats.total
                  ? Math.round(
                      (facets.stats.nonAssigned / facets.stats.total) * 100
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

      {/* Contenu principal */}
      <main className={styles.mainContent}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div>{countLabel}</div>
          <div className={styles.rightTool}>
            <button onClick={resetFilters}>Réinitialiser</button>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          {loading && <div className={styles.loading}>Chargement…</div>}
          {error && <div className={styles.error}>Erreur : {error}</div>}
          {!loading && !error && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <Th
                    label="Nom"
                    active={sortBy === "nom"}
                    dir={sortDir}
                    onClick={() => handleSort("nom")}
                  />
                  <Th
                    label="Type"
                    active={sortBy === "type"}
                    dir={sortDir}
                    onClick={() => handleSort("type")}
                  />
                  <Th
                    label="Système"
                    active={sortBy === "os"}
                    dir={sortDir}
                    onClick={() => handleSort("os")}
                  />
                  <Th
                    label="Utilisateur"
                    active={sortBy === "utilisateur"}
                    dir={sortDir}
                    onClick={() => handleSort("utilisateur")}
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
                        <td>{c.systeme_exploitation ?? "Non spécifié"}</td>
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
                                title={c.activite ? "Actif" : "Inactif"}
                              />
                              {userName}
                            </>
                          ) : (
                            <span className={styles.unassigned}>
                              Non affecté
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
      </main>
    </div>
  );
}

// Header triable
function Th({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const thClass = [active ? (dir === "asc" ? "sorted-asc" : "sorted-desc") : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <th
      className={thClass}
      onClick={onClick}
      {...(active ? { "data-sort-active": dir } : {})}
    >
      {label}
    </th>
  );
}
