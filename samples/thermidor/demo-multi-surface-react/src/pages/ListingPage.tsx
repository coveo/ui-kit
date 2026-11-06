import {InProgress} from '../components/InProgress.js';
import {LISTINGS} from '../navigation.js';
import styles from './pages.module.css';

/** A listing page. The published contract has no view id for listings yet, so nothing is sent. */
export function ListingPage({slug}: {slug: string}) {
  const listing = LISTINGS.find((candidate) => candidate.slug === slug);
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{listing?.name ?? slug}</h1>
      <p className={styles.path}>/{slug}</p>
      <InProgress title="Listing pages">
        The products, facets and sort of this listing. The published contract has no view id for
        listing pages yet, so the preview sends no request.
      </InProgress>
    </main>
  );
}
