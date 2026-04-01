"use client";

import styles from "@/styles/si/shared.module.css";
import type { PdfUtilisateur, PdfTelephone } from "@/types";
import {
  resolveTelephonesList,
  stringifyPostes,
  stringifyFixes,
} from "@/utils/pdf-helpers";

type Props = {
  data: PdfUtilisateur[];
  phonesByUserId?: Record<string | number, PdfTelephone[]>;
  fileName?: string;
  title?: string;
};

export default function ExportPdfButton({
  data,
  phonesByUserId = {},
  fileName = "annuaire_utilisateurs",
  title = "Annuaire",
}: Props) {
  const onExport = async () => {
    if (!data || data.length === 0) {
      alert("Aucune donnée à exporter. Ajustez vos filtres.");
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Métadonnées
      doc.setProperties({
        title,
        subject: "Export des données utilisateurs",
        author: "Symetrie",
        creator: "Application Annuaire",
      });

      // En-tête
      doc.setFontSize(16);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      const now = new Date();
      const dateStr = now.toLocaleString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      doc.setFontSize(10);
      doc.text(
        `Exporté le ${dateStr}`,
        doc.internal.pageSize.getWidth() / 2,
        22,
        { align: "center" }
      );
      doc.text(
        `Nombre d'utilisateurs exportés: ${data.length}`,
        doc.internal.pageSize.getWidth() / 2,
        28,
        { align: "center" }
      );

      // Colonnes: Nom | Prénom | Trig. | Poste(s) | Ligne(s) interne(s) | Mobile
      const head = [
        ["Nom", "Prénom", "Trig.", "Poste", "Ligne interne", "Mobile"],
      ];

      const body = data.map((u) => {
        const tels = resolveTelephonesList(u, phonesByUserId);
        const postes = stringifyPostes(tels);
        const fixes = stringifyFixes(tels);
        return [
          (u.nom ?? "").toString(),
          (u.prenom ?? "").toString(),
          (u.trigramme ?? "").toString(),
          postes,
          fixes,
          (u.mobiles ?? "").toString(),
        ];
      });

      autoTable(doc, {
        head,
        body,
        startY: 35,
        theme: "striped",
        styles: {
          fontSize: 9,
          cellPadding: 2,
          lineWidth: 0.2,
          lineColor: [100, 100, 100],
        },
        headStyles: {
          fillColor: [0, 51, 160],
          textColor: [255, 255, 255],
          halign: "center",
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          0: { cellWidth: 38 }, // Nom
          1: { cellWidth: 32 }, // Prénom
          2: { cellWidth: 16, halign: "center" }, // Trig.
          3: { cellWidth: 30 }, // Poste(s)
          4: { cellWidth: 44 }, // Ligne(s) interne(s)
          5: { cellWidth: 30 }, // Mobile
        },
        margin: { top: 35, right: 5, bottom: 15, left: 5 },
        didParseCell: (c) => {
          if (c.section === "body" && [3, 4, 5].includes(c.column.index)) {
            c.cell.styles.cellWidth = "wrap";
            c.cell.styles.overflow = "linebreak";
          }
        },
      });

      // Pagination
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`${fileName}.pdf`);
    } catch (e) {
      console.error("Erreur export PDF:", e);
      alert("Erreur pendant la génération du PDF (voir console).");
    }
  };

  return (
    <button
      type="button"
      onClick={onExport}
      className={styles.btnSecondary}
      title="Exporter en PDF"
    >
      Exporter PDF
    </button>
  );
}
