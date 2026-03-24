import Link from "next/link";
import styles from "@/styles/si/si.module.css";

interface HubGridProps {
  title: string;
  subtitle: string;
}

export default function HubGrid({ title, subtitle }: HubGridProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      <div className={styles.grid}>
        <Link href="/si/annuaire">
          <div className={styles.card}>
            <span className={styles.cardIcon}>📇</span>
            <h2>Annuaire</h2>
            <p className={styles.cardDesc}>
              Consultez et gérez les utilisateurs, leurs groupes AD,
              téléphones et postes assignés.
            </p>
            <ul className={styles.cardTags}>
              <li>Utilisateurs</li>
              <li>Groupes AD</li>
              <li>Téléphones</li>
            </ul>
          </div>
        </Link>
        <Link href="/si/ordinateurs">
          <div className={styles.card}>
            <span className={styles.cardIcon}>💻</span>
            <h2>Ordinateurs</h2>
            <p className={styles.cardDesc}>
              Parcourez le parc informatique, filtrez par type, OS
              et statut d&apos;affectation.
            </p>
            <ul className={styles.cardTags}>
              <li>Parc IT</li>
              <li>Affectations</li>
              <li>Statistiques</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  );
}
