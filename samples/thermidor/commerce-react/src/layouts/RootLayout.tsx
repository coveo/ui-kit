import {NavLink, Outlet} from 'react-router';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav} aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className={({isActive}) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/commerce"
          className={({isActive}) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          Commerce
        </NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
