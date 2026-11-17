import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type InitializeEvent,
  isParentReady,
  markParentAsReady,
  queueEventForParent,
} from './init-queue';

describe('init-queue', () => {
  let parent: HTMLElement;
  let child: HTMLElement;
  let event: InitializeEvent;

  beforeEach(() => {
    parent = document.createElement('div');
    child = document.createElement('div');
    event = new CustomEvent('initialize', {
      detail: () => {},
    }) as InitializeEvent;
    document.body.appendChild(parent);
    document.body.appendChild(child);
  });

  afterEach(() => {
    document.body.removeChild(parent);
    document.body.removeChild(child);
  });

  it('should mark parent as ready', () => {
    markParentAsReady(parent);
    expect(isParentReady(parent)).toBe(true);
  });

  it('should queue event for parent', () => {
    queueEventForParent(parent, event, child);
    expect(isParentReady(parent)).toBe(false);
  });

  it('should not dispatch event if parent is already ready', () => {
    const spy = vi.spyOn(child, 'dispatchEvent');
    markParentAsReady(parent);
    queueEventForParent(parent, event, child);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle multiple calls to markParentAsReady gracefully', () => {
    markParentAsReady(parent);
    expect(isParentReady(parent)).toBe(true);
    markParentAsReady(parent); // Call again
    expect(isParentReady(parent)).toBe(true); // Should still be true
  });

  it('should remove parent from eventQueueMap after marking as ready', () => {
    queueEventForParent(parent, event, child);
    markParentAsReady(parent);
    const {eventQueueMap} = window.initQueueNamespace;
    expect(eventQueueMap.has(parent)).toBe(false);
  });

  it('should dispatch atomic/parentReady event when parent is marked as ready', () => {
    const spy = vi.spyOn(parent, 'dispatchEvent');
    markParentAsReady(parent);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({type: 'atomic/parentReady'}));
  });

  it('should dispatch atomic/initializeComponent event when parent is marked as ready', () => {
    const spy = vi.spyOn(child, 'dispatchEvent');
    queueEventForParent(parent, event, child);
    markParentAsReady(parent);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({type: 'initialize'}));
  });

  describe('when an older Atomic version created the namespace with Maps', () => {
    let namespace: Window['initQueueNamespace'];

    beforeEach(() => {
      namespace = window.initQueueNamespace;
    });

    afterEach(() => {
      window.initQueueNamespace = namespace;
    });

    it('should convert the maps to WeakMaps and keep their entries', () => {
      const readyParent = document.createElement('div');
      window.initQueueNamespace = {
        eventQueueMap: new Map<Element, {event: InitializeEvent; element: Element}[]>([
          [parent, [{event, element: child}]],
        ]),
        parentReadyMap: new Map<Element, boolean>([[readyParent, true]]),
      };

      expect(isParentReady(readyParent)).toBe(true);
      expect(window.initQueueNamespace.eventQueueMap).toBeInstanceOf(WeakMap);
      expect(window.initQueueNamespace.parentReadyMap).toBeInstanceOf(WeakMap);
      expect(window.initQueueNamespace.eventQueueMap.has(parent)).toBe(true);
    });

    it('should dispatch the events that the older version queued', () => {
      const spy = vi.spyOn(child, 'dispatchEvent');
      window.initQueueNamespace = {
        eventQueueMap: new Map<Element, {event: InitializeEvent; element: Element}[]>([
          [parent, [{event, element: child}]],
        ]),
        parentReadyMap: new Map<Element, boolean>(),
      };

      markParentAsReady(parent);

      expect(spy).toHaveBeenCalledWith(event);
    });
  });
});
