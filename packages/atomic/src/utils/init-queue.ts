import type {InitializeEventHandler} from './initialization-common-utils';

export type InitializeEvent = CustomEvent<InitializeEventHandler>;

declare global {
  interface Window {
    initQueueNamespace: {
      eventQueueMap: WeakMap<Element, QueuedEvent[]>;
      parentReadyMap: WeakMap<Element, boolean>;
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

function getInitQueueNamespace() {
  if (!getWindow().initQueueNamespace) {
    getWindow().initQueueNamespace = {
      eventQueueMap: new WeakMap(),
      parentReadyMap: new WeakMap(),
    };
  }
  return getWindow().initQueueNamespace;
}

function getEventQueueMap(): WeakMap<Element, QueuedEvent[]> {
  return getInitQueueNamespace().eventQueueMap;
}

function getParentReadyMap(): WeakMap<Element, boolean> {
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
