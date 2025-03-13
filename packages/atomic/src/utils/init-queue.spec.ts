import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  markParentAsReady,
  isParentReady,
  queueEventForParent,
} from './init-queue';
import {InitializeEvent} from './init-queue';

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

  it('should dispatch queued events when parent is marked as ready', () => {
    const spy = vi.spyOn(child, 'dispatchEvent');
    queueEventForParent(parent, event, child);
    markParentAsReady(parent);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should not dispatch event if parent is already ready', () => {
    markParentAsReady(parent);
    const spy = vi.spyOn(child, 'dispatchEvent');
    queueEventForParent(parent, event, child);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should dispatch atomic/parentReady event when parent is marked as ready', () => {
    const spy = vi.spyOn(parent, 'dispatchEvent');
    markParentAsReady(parent);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({type: 'atomic/parentReady'})
    );
  });

  it('should dispatch atomic/initializeComponent event when parent is marked as ready', () => {
    const spy = vi.spyOn(child, 'dispatchEvent');
    queueEventForParent(parent, event, child);
    markParentAsReady(parent);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({type: 'initialize'})
    );
  });
});
