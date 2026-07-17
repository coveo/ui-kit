import {NavLink, Outlet} from 'react-router';
import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({isActive}) =>
            `${styles.tab} ${isActive ? styles.active : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/search"
          className={({isActive}) =>
            `${styles.tab} ${isActive ? styles.active : ''}`
          }
        >
          Search
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
