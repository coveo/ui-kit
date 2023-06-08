import {SearchEngine, Unsubscribe} from '@coveo/headless';

function isFirstSearchExecuted(engine: SearchEngine) {
  return engine?.state.search.response.searchUid !== '';
}

export async function executeFirstSearch(engine: SearchEngine) {
  if (isFirstSearchExecuted(engine)) {
    return;
  }
  let unsubscribe: Unsubscribe;
  const promise = new Promise<void>(
    (resolve) =>
      (unsubscribe = engine!.subscribe(
        () => isFirstSearchExecuted(engine) && resolve()
      ))
  ).then(() => unsubscribe());
  engine.executeFirstSearch();
  return promise;
}
