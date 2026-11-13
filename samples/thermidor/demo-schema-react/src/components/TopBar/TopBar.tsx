import {CartButton} from '../Cart/CartButton.js';
import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <CartButton />
    </header>
  );
}
