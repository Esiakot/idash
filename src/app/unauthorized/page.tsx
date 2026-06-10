/**
 * Page Accès refusé - Route : /unauthorized
 * Rôle : affichée par le middleware Edge quand un utilisateur tente d'accéder à
 * une page sans appartenir aux groupes autorisés. Propose un bouton de reconnexion.
 * `force-dynamic` : empêche le prérendu (la page lit useSearchParams).
 */
// app/unauthorized/page.tsx
export const dynamic = "force-dynamic"; // <-- empêche le prérendu côté serveur

import UnauthorizedClient from "@/components/common/UnauthorizedClient";

export default function UnauthorizedPage() {
  return <UnauthorizedClient />;
}
