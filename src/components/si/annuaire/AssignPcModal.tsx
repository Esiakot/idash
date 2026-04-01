"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/si/shared.module.css";
import type { Ordinateur } from "@/types";
import { API_ROUTES, ERROR_MESSAGES, QUERY_PARAMS } from "@/constants";

type Props = {
  open: boolean;
  userId: number | null;
  userLabel?: string;
  onClose: () => void;
  onAssigned: (pc: Ordinateur) => void;
};

export default function AssignPcModal({
  open,
  userId,
  userLabel,
  onClose,
  onAssigned,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [pcs, setPcs] = useState<Ordinateur[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`${API_ROUTES.ORDINATEURS}?${QUERY_PARAMS.FREE}=${QUERY_PARAMS.TRUE}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPcs(data);
        else setPcs([]);
      })
      .catch(() => setPcs([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return pcs;
    return pcs.filter((p) => (p.nom || "").toLowerCase().includes(qq));
  }, [pcs, q]);

  const assign = async () => {
    if (!userId || !selected) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.ORDINATEURS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilisateur_id: userId,
          ordinateur_id: selected,
        }),
      });
      if (!res.ok) {
        const msg = (await res.json())?.error || ERROR_MESSAGES.ASSIGN_ERROR;
        setError(msg);
      } else {
        const pc = pcs.find((p) => p.id === selected);
        if (pc) onAssigned(pc);
        onClose();
      }
    } catch (e: any) {
      setError(e?.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Assigner un PC</h3>
          <button onClick={onClose} className={styles.modalClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>
            <strong>Utilisateur :</strong> {userLabel || userId}
          </p>

          <input
            placeholder="Rechercher un PC (nom)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles.input}
          />

          {loading ? (
            <p>Chargement des PC libres…</p>
          ) : filtered.length === 0 ? (
            <p>Aucun PC 'Station' libre.</p>
          ) : (
            <div className={styles.pcList}>
              {filtered.map((pc) => (
                <label key={pc.id} className={styles.pcOption}>
                  <input
                    type="radio"
                    name="pc"
                    value={pc.id}
                    checked={selected === pc.id}
                    onChange={() => setSelected(pc.id)}
                  />
                  <span>
                    <strong>{pc.nom}</strong>{" "}
                    <small className={styles.smallMuted}>
                      {pc.systeme_exploitation || "OS ?"}{" "}
                      {pc.version ? `(${pc.version})` : ""}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Annuler
          </button>
          <button
            onClick={assign}
            className={styles.btnPrimary}
            disabled={!selected || loading}
          >
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}
