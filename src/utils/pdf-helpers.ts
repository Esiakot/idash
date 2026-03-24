/**
 * Helpers dédiés à l'export PDF de l'annuaire.
 *
 * Les types sont volontairement plus souples que les types partagés (@/types)
 * afin de gérer les formats hétérogènes renvoyés par l'API (champs optionnels,
 * noms de colonnes alternatifs, données déjà stringifiées, etc.).
 */

// ———————————— Types PDF (souples) ————————————

export type PdfTelephone = {
  id?: number | string;
  poste?: string | number | null;
  lignes_internes?: string | null;
  fixe?: string | null;
  ligne_fixe?: string | null;
  utilisateur_id?: number | string | null;
  [k: string]: any;
};

export type PdfUtilisateur = {
  id: number | string;
  trigramme: string;
  prenom: string;
  nom: string;
  mobiles?: string;
  telephones?: string | PdfTelephone[];
  poste?: string | number | null;
  lignes_internes?: string | null;
  fixe?: string | null;
  ligne_fixe?: string | null;
  [key: string]: any;
};

// ———————————— Helpers ————————————

export function normFixeFromObj(anyObj: Record<string, any> = {}): string {
  return (
    anyObj.lignes_internes ??
    anyObj.fixe ??
    anyObj.ligne_fixe ??
    anyObj["ligne"] ??
    anyObj["telephone_fixe"] ??
    ""
  );
}

export function labelTel(t: PdfTelephone): string {
  const poste = t.poste ? `Poste ${String(t.poste)}` : "";
  const fixeVal = normFixeFromObj(t);
  const fixe = fixeVal ? `Fixe ${fixeVal}` : "";
  if (poste && fixe) return `${poste} — ${fixe}`;
  return poste || fixe || "";
}

export function joinLabels(arr: PdfTelephone[]): string {
  return arr.map(labelTel).filter(Boolean).join(", ");
}

function findByUtilisateurId(
  phonesByUserId: Record<string | number, PdfTelephone[]>,
  uid: string | number,
): PdfTelephone[] {
  const res: PdfTelephone[] = [];
  for (const arr of Object.values(phonesByUserId || {})) {
    for (const t of arr || []) {
      if (
        t &&
        (t.utilisateur_id === uid || String(t.utilisateur_id) === String(uid))
      ) {
        res.push(t);
      }
    }
  }
  return res;
}

/**
 * Résout les téléphones d'un utilisateur sous forme de liste,
 * afin de pouvoir séparer postes et lignes internes dans des colonnes distinctes.
 */
export function resolveTelephonesList(
  u: PdfUtilisateur,
  phonesByUserId: Record<string | number, PdfTelephone[]> = {},
): PdfTelephone[] {
  // 1) déjà un tableau
  if (Array.isArray(u.telephones)) {
    const arr = (u.telephones as PdfTelephone[]).filter(Boolean);
    if (arr.length) return arr;
  }

  // 2) lookup direct par id
  const arrDirect =
    phonesByUserId[u.id as number] ?? phonesByUserId[String(u.id)];
  if (arrDirect?.length) return arrDirect;

  // 3) recherche par utilisateur_id dans les valeurs
  const arrByUid = findByUtilisateurId(phonesByUserId, u.id);
  if (arrByUid.length) return arrByUid;

  // 4) fallback sur champs plats de l'utilisateur
  const altPoste = u.poste ?? null;
  const altFixe = u.lignes_internes ?? u.fixe ?? u.ligne_fixe ?? null;
  if (altPoste != null || altFixe != null) {
    return [
      {
        poste: altPoste as any,
        lignes_internes: (altFixe as any) ?? null,
        utilisateur_id: u.id,
      },
    ];
  }

  return [];
}

/** Chaîne "Poste(s)" dédupliquée et triée */
export function stringifyPostes(tels: PdfTelephone[]): string {
  const vals = tels
    .map((t) => (t.poste == null ? "" : String(t.poste).trim()))
    .filter(Boolean);
  const uniq = Array.from(new Set(vals)).sort();
  return uniq.length ? uniq.join(", ") : "—";
}

/** Chaîne "Ligne(s) interne(s)" dédupliquée et triée */
export function stringifyFixes(tels: PdfTelephone[]): string {
  const vals = tels
    .map((t) => String(normFixeFromObj(t) || "").trim())
    .filter(Boolean);
  const uniq = Array.from(new Set(vals)).sort();
  return uniq.length ? uniq.join(", ") : "—";
}
