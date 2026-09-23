import {SessionProvider} from './context/session.js';
import {AppShell} from './components/AppShell.js';

export default function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  );
}
