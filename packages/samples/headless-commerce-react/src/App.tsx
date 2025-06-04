import {getEngine} from './context/engine.js';
import Router from './router/router.js';

export default function App() {
  const engine = getEngine();

  console.log(engine.relay.getMeta('').clientId);
  console.log(engine.navigatorContext.clientId);

  return <Router engine={engine} />;
}
