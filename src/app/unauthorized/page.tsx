// app/unauthorized/page.tsx
export const dynamic = "force-dynamic"; // <-- empêche le prérendu côté serveur

import UnauthorizedClient from "@/components/common/UnauthorizedClient";

export default function UnauthorizedPage() {
  return <UnauthorizedClient />;
}
