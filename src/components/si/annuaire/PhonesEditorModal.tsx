"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/si/shared.module.css";
import type { Telephone, UserLite } from "@/types";
import { API_ROUTES } from "@/constants";
import { formatPhone } from "@/utils/phone-formatter";

type Props = {
  open: boolean;
  user: UserLite | null;
  tels: Telephone[];
  onClose: () => void;
  onSaved: (next: Telephone[]) => void; // renvoyer la liste finale pour ce user
};

export default function PhonesEditorModal({
  open,
  user,
  tels,
  onClose,
  onSaved,
}: Props) {
  const [rows, setRows] = useState<Telephone[]>([]);
  const [newPoste, setNewPoste] = useState("");
  const [newFixe, setNewFixe] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRows([...tels].sort((a, b) => a.poste.localeCompare(b.poste)));
      setNewPoste("");
      setNewFixe("");
      setErr(null);
    }
  }, [open, tels]);

  if (!open || !user) return null;

  const createTel = async () => {
    const poste = newPoste.trim();
    const lignes = newFixe.trim();
    if (poste.length !== 2) {
      setErr("Le poste doit contenir exactement 2 chiffres.");
      return;
    }
    if (!lignes) {
      setErr("Renseigne 'fixe'.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.TELEPHONES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilisateur_id: user.id,
          poste,
          lignes_internes: lignes,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Création échouée");
      const created: Telephone = j.telephone;
      const next = [...rows, created].sort((a, b) =>
        a.poste.localeCompare(b.poste)
      );
      setRows(next);
      onSaved(next);
      setNewPoste("");
      setNewFixe("");
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const saveRow = async (row: Telephone) => {
    const poste = (row.poste ?? "").trim();
    const lignes = (row.lignes_internes ?? "").trim();
    if (poste.length !== 2) {
      setErr("Le poste doit contenir exactement 2 chiffres.");
      return;
    }
    if (!lignes) {
      setErr("Le champ 'fixe' ne peut pas être vide.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.TELEPHONES, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, poste, lignes_internes: lignes }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Mise à jour échouée");
      const next = rows.map((r) =>
        r.id === row.id ? { ...row, poste, lignes_internes: lignes } : r
      );
      setRows(next);
      onSaved(next);
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (rowId: number) => {
    if (!confirm("Supprimer ce téléphone ?")) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.TELEPHONES, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Suppression échouée");
      const next = rows.filter((r) => r.id !== rowId);
      setRows(next);
      onSaved(next);
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const titleUser =
    [user.nom, user.prenom].filter(Boolean).join(" ").trim() ||
    user.trigramme ||
    `#${user.id}`;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Éditer les téléphones</h3>
          <button onClick={onClose} className={styles.modalClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>
            <strong>Utilisateur :</strong> {titleUser}
          </p>

          {/* Ajout */}
          <div className={styles.inlineRow}>
            <input
              className={`${styles.input} ${styles.inputNarrow}`}
              placeholder="Poste (2 chiffres)"
              value={newPoste}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                setNewPoste(val);
              }}
            />
            <input
              className={`${styles.input} ${styles.inputMedium}`}
              placeholder="Fixe (ex: 04 66 ...)"
              value={newFixe}
              onChange={(e) => setNewFixe(formatPhone(e.target.value))}
              maxLength={14}
            />
            <button
              className={styles.btnPrimary}
              onClick={createTel}
              disabled={loading}
            >
              Ajouter
            </button>
          </div>

          {/* Liste existante */}
          {rows.length === 0 ? (
            <p className={styles.muted}>Aucun téléphone</p>
          ) : (
            <div className={styles.editGrid}>
              <div className={styles.editGridHeader}>Poste</div>
              <div className={styles.editGridHeader}>Fixe</div>
              <div />
              {rows.map((r) => (
                <FragmentRow
                  key={r.id}
                  row={r}
                  onChange={(next) =>
                    setRows(rows.map((rr) => (rr.id === r.id ? next : rr)))
                  }
                  onSave={() => saveRow(r)}
                  onDelete={() => deleteRow(r.id)}
                  saving={loading}
                />
              ))}
            </div>
          )}

          {err && <p className={styles.error}>{err}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  row,
  onChange,
  onSave,
  onDelete,
  saving,
}: {
  row: Telephone;
  onChange: (r: Telephone) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  return (
    <>
      <input
        className={styles.input}
        value={row.poste}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 2);
          onChange({ ...row, poste: val });
        }}
      />
      <input
        className={styles.input}
        value={row.lignes_internes}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
          const formatted = digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
          onChange({ ...row, lignes_internes: formatted });
        }}
        maxLength={14}
      />
      <div className={styles.rowActions}>
        <button
          onClick={onSave}
          className={styles.btnPrimary}
          disabled={saving}
        >
          Enregistrer
        </button>
        <button
          onClick={onDelete}
          className={styles.btnDanger}
          disabled={saving}
        >
          Supprimer
        </button>
      </div>
    </>
  );
}
