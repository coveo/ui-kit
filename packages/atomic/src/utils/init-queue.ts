import type {InitializeEventHandler} from './initialization-common-utils';

export type InitializeEvent = CustomEvent<InitializeEventHandler>;

type ElementMap<V> = Map<Element, V> | WeakMap<Element, V>;

declare global {
  interface Window {
    initQueueNamespace: {
      eventQueueMap: ElementMap<QueuedEvent[]>;
      parentReadyMap: ElementMap<boolean>;
    };
  }
}

type QueuedEvent = {
  event: InitializeEvent;
  element: Element;
};

function getWindow() {
  return window;
}

/**
 * Every Atomic copy on the page shares this namespace, and older versions create it with `Map`s,
 * which keep removed interfaces in memory. All versions read the maps from `window` on each call
 * and only use `get`, `set`, `has` and `delete`, so converting them to `WeakMap`s is safe.
 */
function getInitQueueNamespace() {
  const namespace = (getWindow().initQueueNamespace ??= {
    eventQueueMap: new WeakMap(),
    parentReadyMap: new WeakMap(),
  });
  if (namespace.eventQueueMap instanceof Map) {
    namespace.eventQueueMap = new WeakMap(namespace.eventQueueMap);
  }
  if (namespace.parentReadyMap instanceof Map) {
    namespace.parentReadyMap = new WeakMap(namespace.parentReadyMap);
  }
  return namespace;
}

function getEventQueueMap(): ElementMap<QueuedEvent[]> {
  return getInitQueueNamespace().eventQueueMap;
}

function getParentReadyMap(): ElementMap<boolean> {
  return getInitQueueNamespace().parentReadyMap;
}

export function markParentAsReady(parent: Element) {
  const parentReadyMap = getParentReadyMap();
  parentReadyMap.set(parent, true);
  const eventQueueMap = getEventQueueMap();
  const eventQueue = eventQueueMap.get(parent) || [];
  eventQueue.reverse();
  while (eventQueue.length > 0) {
    const {event, element} = eventQueue.pop()!;
    element.dispatchEvent(event);
  }
  parent.dispatchEvent(new CustomEvent('atomic/parentReady', {bubbles: true}));
  eventQueueMap.delete(parent);
}

export function isParentReady(parent: Element): boolean {
  const parentReadyMap = getParentReadyMap();
  return parentReadyMap.get(parent) || false;
}

export function queueEventForParent(parent: Element, event: InitializeEvent, element: Element) {
  const eventQueueMap = getEventQueueMap();
  if (!eventQueueMap.has(parent)) {
    eventQueueMap.set(parent, []);
  }
  eventQueueMap.get(parent)!.push({event, element});
}

export function enqueueOrDispatchInitializationEvent(
  parent: Element,
  event: InitializeEvent,
  element: Element
) {
  if (isParentReady(parent)) {
    element.dispatchEvent(event);
  } else {
    queueEventForParent(parent, event, element);
  }
}
