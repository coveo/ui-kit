import type {Controller, CoreEngine, Unsubscribe} from '@coveo/headless';
import {deepEqual} from 'fast-equals';
import {useEffect, useReducer, DependencyList, useRef} from 'react';

function useDeepCompareMemo<T>(
  factory: () => T,
  deepDeps: object,
  shallowDeps?: DependencyList
): T {
  const lastState = useRef<{
    value: T;
    shallowDeps: DependencyList | undefined;
    deepDeps: object;
  } | null>(null);
  const updateState = () => {
    lastState.current = {value: factory(), shallowDeps, deepDeps};
    return lastState.current.value;
  };

  if (!lastState.current) {
    return updateState();
  }
  if (
    shallowDeps?.length !== lastState.current.shallowDeps?.length ||
    shallowDeps?.some(
      (dep, i) => !Object.is(dep, lastState.current?.shallowDeps?.[i])
    )
  ) {
    return updateState();
  }
  if (!deepEqual(deepDeps, lastState.current.deepDeps)) {
    return updateState();
  }
  return lastState.current.value;
}

function useOnChange<T>(value: T, callback: () => void) {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = value;
    return;
  }
  if (Object.is(ref.current, value)) {
    return;
  }
  ref.current = value;
  callback();
}

export type ReactController<T extends Controller> = Omit<
  T,
  'subscribe' | 'state'
>;

export interface UseControllerReturnType<T extends Controller> {
  state: T['state'];
  controller: ReactController<T>;
}

function bindMethods<T extends object>(methods: T, obj: object): T {
  Object.entries(methods).forEach(([key, value]) => {
    if (typeof value === 'function') {
      (methods as Record<string, unknown>)[key] = value.bind(obj);
    } else if (typeof value === 'object') {
      bindMethods(value, (obj as Record<string, object>)[key]);
    }
  });
  return methods;
}

function getOnStateChanged(subscribe: (listener: () => void) => Unsubscribe) {
  return (listener: () => void) => {
    let firstCall = true;
    return subscribe(() => {
      if (firstCall) {
        firstCall = false;
        return;
      }
      listener();
    });
  };
}

function buildController(
  builder: (engine: CoreEngine, props?: object) => Controller,
  engine: CoreEngine,
  props?: object
) {
  const headlessController = builder(engine, props);
  const {subscribe: _, state: __, ...methods} = headlessController;
  return {
    controller: bindMethods(methods, headlessController),
    getStateSnapshot: () => structuredClone(headlessController.state),
    onStateChanged: getOnStateChanged((listener) =>
      headlessController.subscribe(listener)
    ),
  };
}

export function useController<
  TController extends Controller,
  TEngine extends CoreEngine
>(
  builder: (engine: TEngine) => TController,
  engine: TEngine
): UseControllerReturnType<TController>;
export function useController<
  TController extends Controller,
  TEngine extends CoreEngine,
  TProps extends object
>(
  builder: (engine: TEngine, props: TProps) => TController,
  engine: TEngine,
  props: TProps
): UseControllerReturnType<TController>;
export function useController(
  builder: (engine: CoreEngine, props?: object) => Controller,
  engine: CoreEngine,
  props?: object
): UseControllerReturnType<Controller> {
  useOnChange(builder, () =>
    console.error(
      'A Coveo Headless controller builder was changed in between renders. This can happen when a custom callback is passed as a builder instead of an build function imported directly from Headless.'
    )
  );
  const {controller, getStateSnapshot, onStateChanged} = useDeepCompareMemo(
    () => buildController(builder, engine, props),
    props ?? {},
    [builder, engine]
  );
  const [state, updateState] = useReducer(
    getStateSnapshot,
    undefined,
    getStateSnapshot
  );
  useOnChange(getStateSnapshot, updateState);
  useEffect(() => onStateChanged(updateState), [onStateChanged]);
  return {state, controller};
}
