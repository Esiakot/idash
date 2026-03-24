"use client";

import styles from "@/styles/si/shared.module.css";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { API_ROUTES } from "@/constants";

interface Props {
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

const LoginModal = ({ onClose, onLoginSuccess }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch(API_ROUTES.AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      onLoginSuccess(data.username);
      onClose();
    } else {
      setError(data.error || data.message || "Identifiants incorrects");
    }
  };

  const modal = (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Connexion</h3>
          <button
            type="button"
            onClick={onClose}
            className={styles.modalClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <input
              className={styles.input}
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnSecondary}>
              Annuler
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(modal, document.body) : null;
};

export default LoginModal;
