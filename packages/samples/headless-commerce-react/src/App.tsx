import {Suspense} from 'react';
import {getEngine} from './context/engine.js';
import Router from './router/router.js';

export default function App() {
  const engine = getEngine();

  return (
    <Suspense fallback={<BigSpinner />}>
      <Router engine={engine} />
    </Suspense>
  );
}

function BigSpinner() {
  return <h2>🌀 Loading...</h2>;
}
