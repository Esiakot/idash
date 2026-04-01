"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_ROUTES, EVENTS } from "@/constants";

export default function UnauthorizedClient() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();

  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Vérifie la session
  useEffect(() => {
    fetch(API_ROUTES.SESSION).then((res) => {
      if (res.ok) {
        setTimeout(() => setShouldRedirect(true), 500);
      }
    });
  }, []);

  // Redirection si la session est valide
  useEffect(() => {
    if (shouldRedirect) router.replace(redirect);
  }, [shouldRedirect, redirect, router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>⛔ Accès refusé</h1>
        <p>Vous n’avez pas les droits pour accéder à cette section.</p>
        <p>
          Si vous êtes membre d’un groupe autorisé, veuillez vous reconnecter :
        </p>
        <button
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          onClick={() =>
            window.dispatchEvent(new CustomEvent(EVENTS.OPEN_LOGIN_MODAL))
          }
        >
          🔐 Se reconnecter
        </button>
    </div>
  );
}
