import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useAutoScroll} from './use-auto-scroll.js';
import {makeTurn} from '../test/turn-fixtures.js';

let resizeCallbacks: Array<() => void>;

beforeEach(() => {
  resizeCallbacks = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
    cb();
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

/** An element whose box starts `top` pixels down the viewport. */
function createElement(top: number) {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => ({top}) as DOMRect;
  return element;
}

function createContainer(clientHeight: number) {
  const container = createElement(0);
  Object.defineProperty(container, 'clientHeight', {value: clientHeight, configurable: true});
  container.style.paddingBottom = '16px';
  container.scrollTo = vi.fn();
  return container;
}

/** The thread whose latest turn is `latestTurnId`, or an empty one. */
function thread(latestTurnId: string | null) {
  return latestTurnId === null ? [] : [makeTurn({id: latestTurnId})];
}

function setup({clientHeight = 800, turns = {'turn-1': 100} as Record<string, number>} = {}) {
  const container = createContainer(clientHeight);
  const turnRefs = {
    current: new Map(Object.entries(turns).map(([id, top]) => [id, createElement(top)])),
  };
  const containerRef = {current: container};
  const render = (latestTurnId: string | null) =>
    renderHook(({turns}) => useAutoScroll({containerRef, turnRefs, turns}), {
      initialProps: {turns: thread(latestTurnId)},
    });
  const turn = (id: string) => turnRefs.current.get(id)!;
  return {container, turn, render};
}

describe('useAutoScroll', () => {
  it('scrolls the start of the latest turn to the top', () => {
    const {container, render} = setup();

    render('turn-1');

    expect(container.scrollTo).toHaveBeenCalledWith({top: 80, behavior: 'smooth'});
  });

  it('makes the latest turn tall enough for its start to reach the top', () => {
    const {turn, render} = setup({clientHeight: 500});

    render('turn-1');

    expect(turn('turn-1').style.minHeight).toBe('464px');
  });

  it('clamps the height to 0 in a container shorter than the margins', () => {
    const {turn, render} = setup({clientHeight: 20});

    render('turn-1');

    expect(turn('turn-1').style.minHeight).toBe('0px');
  });

  it('does not scroll before the first turn', () => {
    const {container, render} = setup();

    render(null);

    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to a follow-up turn once it starts, and releases the previous one', () => {
    const {container, turn, render} = setup({turns: {'turn-1': 100, 'turn-2': 600}});
    const {rerender} = render('turn-1');

    rerender({turns: thread('turn-2')});

    expect(container.scrollTo).toHaveBeenLastCalledWith({top: 580, behavior: 'smooth'});
    expect(turn('turn-1').style.minHeight).toBe('');
    expect(turn('turn-2').style.minHeight).toBe('764px');
  });

  it('does not follow the answer as it streams', () => {
    const {container, render} = setup();
    const {rerender} = render('turn-1');

    rerender({turns: thread('turn-1')});

    expect(container.scrollTo).toHaveBeenCalledOnce();
  });

  it('refits the latest turn when the container resizes', () => {
    const {container, turn, render} = setup();
    render('turn-1');
    Object.defineProperty(container, 'clientHeight', {value: 400});

    resizeCallbacks.forEach((callback) => callback());

    expect(turn('turn-1').style.minHeight).toBe('364px');
    expect(container.scrollTo).toHaveBeenCalledOnce();
  });
});
