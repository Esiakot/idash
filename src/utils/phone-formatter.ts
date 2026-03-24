/**
 * Formate un numéro de téléphone en groupes de 2 chiffres : "06 00 00 00 00"
 * Ne garde que les chiffres, limité à 10.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
