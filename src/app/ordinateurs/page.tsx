"use client";

import styles from "@/styles/si/shared.module.css";
import { useOrdinateursData } from "@/hooks/useOrdinateursData";
import OrdinateurFiltersSidebar from "@/components/si/ordinateurs/OrdinateurFiltersSidebar";
import OrdinateursTable from "@/components/si/ordinateurs/OrdinateursTable";

export default function PageOrdinateurs() {
  const {
    sessionLoading,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedOS,
    setSelectedOS,
    sortBy,
    sortDir,
    handleSort,
    computers,
    facets,
    loading,
    error,
    countLabel,
    resetFilters,
  } = useOrdinateursData();

  if (sessionLoading) {
    return <p className={styles.loading}>Chargement...</p>;
  }

  return (
    <div className={styles.container}>
      <OrdinateurFiltersSidebar
        facets={facets}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedOS={selectedOS}
        onOSChange={setSelectedOS}
      />

      <main className={styles.mainContent}>
        <div className={styles.toolbar}>
          <div>{countLabel}</div>
          <div className={styles.rightTool}>
            <button onClick={resetFilters}>Réinitialiser</button>
          </div>
        </div>

        <OrdinateursTable
          computers={computers}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
}
