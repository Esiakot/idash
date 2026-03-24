"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/si/shared.module.css";
import { API_ROUTES } from "@/constants";
import { formatPhone } from "@/utils/phone-formatter";

type Props = {
  open: boolean;
  userId: number | null;
  label?: string; // nom/prénom affiché
  currentMobile: string;
  onClose: () => void;
  onSaved: (newMobile: string) => void; // après sauvegarde, valeur à refléter côté UI ("" si NULL)
};

export default function MobileEditorModal({
  open,
  userId,
  label,
  currentMobile,
  onClose,
  onSaved,
}: Props) {
  const [val, setVal] = useState(currentMobile || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setVal(currentMobile ? formatPhone(currentMobile) : "");
      setErr(null);
    }
  }, [open, currentMobile]);

  if (!open || !userId) return null;

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(formatPhone(e.target.value));
  };

  const save = async () => {
    setErr(null);
    setLoading(true);
    try {
      const trimmed = (val ?? "").trim();
      // Le backend (UpdateMobileSchema) s'attend à "mobile", pas "mobiles"
      const payload = trimmed === "" ? { mobile: null } : { mobile: trimmed };

      const res = await fetch(API_ROUTES.UTILISATEUR_MOBILE(userId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // On lit d’abord en texte pour éviter le crash si la réponse n’est pas JSON
      const text = await res.text();
      let j: any = null;
      try {
        j = JSON.parse(text);
      } catch {
        // pas JSON, on gardera text pour afficher une erreur lisible
      }

      if (!res.ok) {
        throw new Error(j?.error || text || "Échec de la mise à jour");
      }

      // Si la DB renvoie null, on reflète "" dans l’UI
      const newVal = j?.mobiles == null ? "" : String(j.mobiles);
      onSaved(newVal);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Modifier le mobile</h3>
          <button
            onClick={onClose}
            className={styles.modalClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>
            <strong>Utilisateur :</strong> {label || userId}
          </p>
          <input
            className={styles.input}
            placeholder="Numéro de mobile… (laisser vide pour nul)"
            value={val}
            onChange={handleMobileChange}
            maxLength={14} // 10 chiffres + 4 espaces
          />
          {err && <p className={styles.error}>{err}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Annuler
          </button>
          <button
            onClick={save}
            className={styles.btnPrimary}
            disabled={loading}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
