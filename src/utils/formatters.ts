/**
 * Normalise un flag DB (Buffer BIT(1), 1/0, bool, "✔", etc.) en boolean
 */
export function flagOn(val: any): boolean {
  if (val == null) return false;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  // Real Buffer (server-side mysql2 BIT(1))
  if (Buffer.isBuffer(val)) return val[0] !== 0;
  // Serialized Buffer (JSON from API response)
  if (
    typeof val === "object" &&
    val?.type === "Buffer" &&
    Array.isArray(val?.data)
  ) {
    return val.data.some((x: number) => x !== 0);
  }
  const s = String(val).trim().toLowerCase();
  return ["1", "true", "✔", "x", "yes", "oui"].includes(s);
}

export const formatEuro = (value: number | undefined) => {
  return (value ?? 0)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatPourcentage = (dep: number, prev: number) => {
  if (!prev || prev === 0) return "N/A";
  return ((dep / prev) * 100).toFixed(1).replace(".", ",") + " %";
};

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR");
};

/**
 * Tronque un texte à une longueur maximale avec "…" si dépassement
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/**
 * Transforme une clé de groupe AD brute en label lisible.
 * Utilise GROUP_LABEL_OVERRIDES si disponible, sinon applique des heuristiques.
 */
export function prettifyGroupKey(
  key: string,
  overrides: Record<string, string> = {},
): string {
  if (overrides[key]) return overrides[key];

  let label = key;

  // Triple underscore => " à "
  label = label.replace(/___/g, " à ");
  // Simple underscore => espace
  label = label.replace(/_/g, " ");

  // Corrections d'accents fréquentes (best-effort)
  label = label
    .replace(/\bQualit\b/g, "Qualité")
    .replace(/\bSymetrie\b/g, "Symétrie")
    .replace(/\bEmployes\b/g, "Employés")
    .replace(/\br plication\b/g, "réplication")
    .replace(/\bPropri taires\b/g, "Propriétaires")
    .replace(/\bcr ateurs\b/g, "créateurs")
    .replace(/\bstrat gie\b/g, "stratégie")
    .replace(/\brefus\b$/g, "refusé");

  label = label.replace(/\s+/g, " ").trim();
  label = label.replace(/^Glo\b/, "Glo");

  return label;
}
