import coveoLogo from '../assets/coveo-logo.svg';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div>
      <div className={styles.header}>
        <img src={coveoLogo} alt="Coveo" className={styles.logo} />
        <h1 className={styles.title}>Thermidor + React Sample</h1>
      </div>
      <div className={styles.content}>
        <p>
          This sample demonstrates how to integrate Thermidor controllers with
          React using best practices for lifecycle management:
        </p>
        <ul>
          <li>
            <strong>Engine</strong> — global, created once at the app level and
            disposed when the app unmounts.
          </li>
          <li>
            <strong>Search Interface</strong> — scoped to the Search page,
            created on navigation and disposed when leaving the page.
          </li>
          <li>
            <strong>Controllers</strong> — created inside each component via a
            custom <code>useBuildController</code> hook, tied to the component
            lifecycle.
          </li>
        </ul>
        <p>
          Navigate to the <strong>Search</strong> tab to see the interface in
          action. Navigate back here to observe the interface being disposed.
        </p>
      </div>
    </div>
  );
}
