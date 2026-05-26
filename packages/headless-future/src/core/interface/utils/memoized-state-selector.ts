export type StateSelector<TState, TResult> = (state: TState) => TResult;

type SelectorTuple<TState, TDeps extends readonly unknown[]> = {
  [K in keyof TDeps]: StateSelector<TState, TDeps[K]>;
};

export const createMemoizedStateSelector = <
  TState,
  TDeps extends readonly unknown[],
  TResult,
>(
  selectors: SelectorTuple<TState, TDeps>,
  projector: (...deps: TDeps) => TResult
): StateSelector<TState, TResult> => {
  let hasCachedResult = false;
  let previousDeps = [] as unknown as TDeps;
  let previousResult: TResult;

  return (state: TState): TResult => {
    const currentDeps = selectors.map((selector) =>
      selector(state)
    ) as unknown as TDeps;

    if (hasCachedResult && areDepsEqual(previousDeps, currentDeps)) {
      return previousResult;
    }

    previousDeps = currentDeps;
    previousResult = projector(...currentDeps);
    hasCachedResult = true;

    return previousResult;
  };
};

const areDepsEqual = (
  previousDeps: readonly unknown[],
  currentDeps: readonly unknown[]
): boolean => {
  if (previousDeps.length !== currentDeps.length) {
    return false;
  }

  for (let i = 0; i < previousDeps.length; i++) {
    if (!Object.is(previousDeps[i], currentDeps[i])) {
      return false;
    }
  }

  return true;
};
