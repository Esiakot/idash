/**
 * Composant SortableHeader - En-tête de colonne triable.
 * Utilisé dans : OrdinateursTable (et réutilisable pour tout tableau trié).
 * Props :
 * - label : texte affiché
 * - active : true si la colonne est la colonne de tri active
 * - direction : sens du tri (asc/desc) appliqué quand active=true
 * - onClick : callback pour basculer le tri
 */
"use client";

type SortableHeaderProps = {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
};

/**
 * Rend un <th> stylisé selon l'état de tri courant et expose un attribut data
 * pour l'icône flèche en CSS (▲/▼).
 */
export default function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: SortableHeaderProps) {
  const className = active
    ? direction === "asc"
      ? "sorted-asc"
      : "sorted-desc"
    : "";

  return (
    <th
      className={className || undefined}
      onClick={onClick}
      {...(active ? { "data-sort-active": direction } : {})}
    >
      {label}
    </th>
  );
}
