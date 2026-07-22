import {EngineProvider} from './context/engine.js';
import {GenerativeInterfaceProvider} from './context/generative-interface.js';

export default function App() {
  return (
    <EngineProvider>
      <GenerativeInterfaceProvider>
        <main>
          <h1>Generative Experience Demo</h1>
        </main>
      </GenerativeInterfaceProvider>
    </EngineProvider>
  );
}
