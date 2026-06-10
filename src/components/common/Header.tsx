/**
 * Composant Header - Barre de navigation principale.
 * Utilisé dans : layout.tsx (rendu sur toutes les pages).
 * Affiche le logo, le nom de l'utilisateur connecté et le bouton login/logout.
 * Écoute l'événement custom EVENTS.OPEN_LOGIN_MODAL pour permettre à d'autres pages
 * (ex : UnauthorizedClient) de déclencher l'ouverture de la modale de connexion.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/styles/components/Header.module.css";
import Link from "next/link";
import Image from "next/image";
import LoginModal from "@/components/auth/LoginModal";
import { useRouter, useSearchParams } from "next/navigation";
import { API_ROUTES, EVENTS } from "@/constants";

const Header = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [showLogin, setShowLogin] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Déconnexion : appelle DELETE /api/session pour effacer les cookies, puis retour accueil
  const handleLogout = async () => {
    await fetch(API_ROUTES.SESSION, { method: "DELETE" });
    setUsername(null);
    setGroups([]);
    router.push("/");
  };

  // Récupère la session courante depuis l'API et met à jour l'état local
  const checkSession = useCallback(async () => {
    const res = await fetch(API_ROUTES.SESSION);
    if (res.ok) {
      const data = await res.json();
      setUsername(data.username ?? null);

      // Type guard pour filtrer uniquement les chaînes
      setGroups(
        Array.isArray(data.groups)
          ? data.groups.filter(
              (g: unknown): g is string => typeof g === "string"
            )
          : []
      );
    }
  }, []);

  // Au montage : vérifie la session + abonne le composant à l'événement custom
  // qui permet à d'autres pages de déclencher l'ouverture de la modale.
  useEffect(() => {
    checkSession();

    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener(EVENTS.OPEN_LOGIN_MODAL, handleOpenLogin);
    return () => {
      window.removeEventListener(EVENTS.OPEN_LOGIN_MODAL, handleOpenLogin);
    };
  }, [checkSession]);

  // Après connexion réussie : rafraîchit la session et redirige vers la page d'origine si présente.
  const handleLoginSuccess = useCallback((user: string) => {
    setUsername(user);
    checkSession();

    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
    } else {
      router.refresh();
    }
  }, [checkSession, searchParams, router]);

  return (
    <>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={400} height={40} />
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/">Accueil</Link>

          {username ? (
            <div className={styles.userContainer}>
              <span className={styles.username}>👤 {username}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              className={styles.loginBtn}
              onClick={() => setShowLogin(true)}
            >
              Se connecter
            </button>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
