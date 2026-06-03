import {getEngine} from './context/engine.js';
import Router from './router/router.js';

export default function App() {
  const engine = getEngine();

  return <Router engine={engine} />;
}
