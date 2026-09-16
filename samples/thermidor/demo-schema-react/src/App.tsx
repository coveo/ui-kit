import {EngineProvider} from './context/engine.js';
import {GenerativeInterfaceProvider} from './context/generative-interface.js';
import {AppShell} from './components/Layout/AppShell.js';

export default function App() {
  return (
    <EngineProvider>
      <GenerativeInterfaceProvider>
        <AppShell />
      </GenerativeInterfaceProvider>
    </EngineProvider>
  );
}
