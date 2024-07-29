import {Suspense} from 'react';
import {getEngine} from './context/engine';
import Router from './router/router';

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
