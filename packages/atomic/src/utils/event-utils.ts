import {promiseTimeout} from './promise-utils';

export function buildCustomEvent<T>(name: string, detail: T) {
  return new CustomEvent(name, {
    detail,
    // Event will bubble up the DOM until it is caught
    bubbles: true,
    // Allows to verify if event is caught (cancelled). If it's not caught, it won't be initialized.
    cancelable: true,
    // Allows to compose Atomic components inside one another, event will go across DOM/Shadow DOM
    composed: true,
  });
}

export function listenOnce<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export function listenOnce(
  element: HTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void;
export function listenOnce(
  element: HTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void {
  const _listener: EventListener = (evt: Event) => {
    element.removeEventListener(type, _listener, options);
    typeof listener === 'object'
      ? listener.handleEvent.call(element, evt)
      : listener.call(element, evt);
  };
  element.addEventListener(type, _listener, options);
}

export function eventPromise(
  element: HTMLElement,
  type: string,
  timeoutMs: number = 0
): Promise<Event> {
  let promise = new Promise<Event>((resolve) => {
    listenOnce(element, type, (e) => {
      resolve(e);
    });
  });

  if (timeoutMs > 0) {
    promise = promiseTimeout(promise, timeoutMs);
  }

  return promise;
}
