/**
 * Page d'accueil - Route : /
 * Rôle : afficher le hub de navigation principal (cartes Annuaire et Ordinateurs).
 * Composant très mince qui délègue tout l'affichage à HubGrid.
 */
"use client";

import HubGrid from "@/components/common/HubGrid";

export default function Home() {
  return (
    <HubGrid
      title="Tableau de bord"
      subtitle="Bienvenue sur le dashboard Symétrie."
    />
  );
}
