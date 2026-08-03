import {EngineProvider} from './context/engine.js';
import {GenerativeInterfaceProvider} from './context/generative-interface.js';
import {ConversePage} from './components/ConversePage/ConversePage.js';
import styles from './App.module.css';

export default function App() {
  return (
    <EngineProvider>
      <GenerativeInterfaceProvider>
        <div className={styles.root}>
          <ConversePage />
        </div>
      </GenerativeInterfaceProvider>
    </EngineProvider>
  );
}
