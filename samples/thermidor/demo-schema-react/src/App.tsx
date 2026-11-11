import {CartProvider} from './cart/CartProvider.js';
import {SessionProvider} from './context/session.js';
import {AppShell} from './components/AppShell.js';

export default function App() {
  return (
    <CartProvider>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </CartProvider>
  );
}
