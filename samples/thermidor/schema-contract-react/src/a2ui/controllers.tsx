import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type ControllerAdvertisement = {
  controllerId: string;
  controllerSchema: string;
};

type A2UIMessage = Record<string, unknown>;
type ControllerState = Record<string, unknown>;

class AdvertisedController {
  private listeners = new Set<() => void>();
  private serializedState: string;

  public constructor(
    public readonly advertisement: ControllerAdvertisement,
    private state: ControllerState
  ) {
    this.serializedState = JSON.stringify(state);
  }

  public get snapshot(): ControllerState {
    return this.state;
  }

  public hydrate(state: ControllerState): void {
    const serializedState = JSON.stringify(state);
    if (serializedState === this.serializedState) {
      return;
    }

    this.state = state;
    this.serializedState = serializedState;
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export class ThermidorControllerRegistry {
  private controllers = new Map<string, AdvertisedController>();
  private controllerStates = new Map<string, ControllerState>();

  public synchronize(messages: A2UIMessage[]): void {
    const dataModels = new Map<string, unknown>();

    for (const message of messages) {
      const updateDataModel = message['updateDataModel'];
      if (!isRecord(updateDataModel) || typeof updateDataModel['surfaceId'] !== 'string') {
        continue;
      }

      const surfaceId = updateDataModel['surfaceId'];
      dataModels.set(
        surfaceId,
        applyDataModelUpdate(
          dataModels.get(surfaceId),
          typeof updateDataModel['path'] === 'string' ? updateDataModel['path'] : '/',
          updateDataModel['value']
        )
      );
    }

    const controllerStates = new Map<string, ControllerState>();
    for (const dataModel of dataModels.values()) {
      const advertisedStates =
        isRecord(dataModel) && isRecord(dataModel['controllers']) ? dataModel['controllers'] : {};
      for (const [controllerId, state] of Object.entries(advertisedStates)) {
        if (isRecord(state)) {
          controllerStates.set(controllerId, state);
        }
      }
    }

    this.controllerStates = controllerStates;
    for (const controller of this.controllers.values()) {
      controller.hydrate(controllerStates.get(controller.advertisement.controllerId) ?? {});
    }
  }

  public getOrCreate(advertisement: ControllerAdvertisement): AdvertisedController {
    const existing = this.controllers.get(advertisement.controllerId);
    if (existing && existing.advertisement.controllerSchema === advertisement.controllerSchema) {
      return existing;
    }

    const controller = new AdvertisedController(
      advertisement,
      this.controllerStates.get(advertisement.controllerId) ?? {}
    );
    this.controllers.set(advertisement.controllerId, controller);
    return controller;
  }
}

const ControllerRegistryContext = createContext<ThermidorControllerRegistry | null>(null);

export function ThermidorControllerProvider({
  children,
  messages,
}: {
  children: ReactNode;
  messages: A2UIMessage[];
}) {
  const registryRef = useRef<ThermidorControllerRegistry | null>(null);
  registryRef.current ??= new ThermidorControllerRegistry();
  const serializedMessages = useMemo(() => JSON.stringify(messages), [messages]);

  useEffect(() => {
    registryRef.current!.synchronize(JSON.parse(serializedMessages) as A2UIMessage[]);
  }, [serializedMessages]);

  return (
    <ControllerRegistryContext.Provider value={registryRef.current}>
      {children}
    </ControllerRegistryContext.Provider>
  );
}

export function useAdvertisedController<T extends ControllerState>(
  advertisement: ControllerAdvertisement
): T {
  const registry = useContext(ControllerRegistryContext);
  if (!registry) {
    throw new Error('Advertised controllers require ThermidorControllerProvider.');
  }

  const controller = useMemo(
    () => registry.getOrCreate(advertisement),
    [advertisement.controllerId, advertisement.controllerSchema, registry]
  );
  const subscribe = useCallback(
    (listener: () => void) => controller.subscribe(listener),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.snapshot as T, [controller]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function applyDataModelUpdate(dataModel: unknown, path: string, value: unknown): unknown {
  const segments = path
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));
  if (segments.length === 0) {
    return value;
  }

  const root = isRecord(dataModel) ? {...dataModel} : {};
  let target: Record<string, unknown> = root;
  for (const segment of segments.slice(0, -1)) {
    const current = target[segment];
    const next = isRecord(current) ? {...current} : {};
    target[segment] = next;
    target = next;
  }
  target[segments.at(-1)!] = value;
  return root;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
