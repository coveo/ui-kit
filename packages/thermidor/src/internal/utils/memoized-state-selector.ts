export type StateSelector<TState, TResult> = (state: TState) => TResult;

// Overload: 1 input selector
export function createMemoizedStateSelector<TState, S1, TResult>(
  s1: (state: TState) => S1,
  projector: (s1: S1) => TResult
): StateSelector<TState, TResult>;

// Overload: 2 input selectors
export function createMemoizedStateSelector<TState, S1, S2, TResult>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  projector: (s1: S1, s2: S2) => TResult
): StateSelector<TState, TResult>;

// Overload: 3 input selectors
export function createMemoizedStateSelector<TState, S1, S2, S3, TResult>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  projector: (s1: S1, s2: S2, s3: S3) => TResult
): StateSelector<TState, TResult>;

// Overload: 4 input selectors
export function createMemoizedStateSelector<TState, S1, S2, S3, S4, TResult>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4) => TResult
): StateSelector<TState, TResult>;

// Overload: 5 input selectors
export function createMemoizedStateSelector<
  TState,
  S1,
  S2,
  S3,
  S4,
  S5,
  TResult,
>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  s5: (state: TState) => S5,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => TResult
): StateSelector<TState, TResult>;

// Overload: 6 input selectors
export function createMemoizedStateSelector<
  TState,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  TResult,
>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  s5: (state: TState) => S5,
  s6: (state: TState) => S6,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => TResult
): StateSelector<TState, TResult>;

// Overload: 7 input selectors
export function createMemoizedStateSelector<
  TState,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  TResult,
>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  s5: (state: TState) => S5,
  s6: (state: TState) => S6,
  s7: (state: TState) => S7,
  projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7) => TResult
): StateSelector<TState, TResult>;

// Overload: 8 input selectors
export function createMemoizedStateSelector<
  TState,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  TResult,
>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  s5: (state: TState) => S5,
  s6: (state: TState) => S6,
  s7: (state: TState) => S7,
  s8: (state: TState) => S8,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8
  ) => TResult
): StateSelector<TState, TResult>;

// Overload: 9 input selectors
export function createMemoizedStateSelector<
  TState,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  TResult,
>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  s5: (state: TState) => S5,
  s6: (state: TState) => S6,
  s7: (state: TState) => S7,
  s8: (state: TState) => S8,
  s9: (state: TState) => S9,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8,
    s9: S9
  ) => TResult
): StateSelector<TState, TResult>;

// Overload: 10 input selectors
export function createMemoizedStateSelector<
  TState,
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  TResult,
>(
  s1: (state: TState) => S1,
  s2: (state: TState) => S2,
  s3: (state: TState) => S3,
  s4: (state: TState) => S4,
  s5: (state: TState) => S5,
  s6: (state: TState) => S6,
  s7: (state: TState) => S7,
  s8: (state: TState) => S8,
  s9: (state: TState) => S9,
  s10: (state: TState) => S10,
  projector: (
    s1: S1,
    s2: S2,
    s3: S3,
    s4: S4,
    s5: S5,
    s6: S6,
    s7: S7,
    s8: S8,
    s9: S9,
    s10: S10
  ) => TResult
): StateSelector<TState, TResult>;

// Implementation
export function createMemoizedStateSelector(
  ...args: Array<(...args: any[]) => any>
): (state: any) => any {
  const selectors = args.slice(0, -1) as Array<(state: any) => any>;
  const projector = args[args.length - 1] as (...deps: any[]) => any;

  let hasCachedResult = false;
  let previousDeps: unknown[] = [];
  let previousResult: unknown;

  return (state: any): any => {
    const currentDeps = selectors.map((selector) => selector(state));

    if (hasCachedResult && areDepsEqual(previousDeps, currentDeps)) {
      return previousResult;
    }

    previousDeps = currentDeps;
    previousResult = projector(...currentDeps);
    hasCachedResult = true;

    return previousResult;
  };
}

function areDepsEqual(
  previousDeps: readonly unknown[],
  currentDeps: readonly unknown[]
): boolean {
  if (previousDeps.length !== currentDeps.length) {
    return false;
  }

  for (let i = 0; i < previousDeps.length; i++) {
    if (!Object.is(previousDeps[i], currentDeps[i])) {
      return false;
    }
  }

  return true;
}
