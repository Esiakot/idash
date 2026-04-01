"use client";

type SortableHeaderProps = {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
};

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
