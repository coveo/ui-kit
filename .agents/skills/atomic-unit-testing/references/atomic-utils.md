# Atomic Utilities

Testing patterns for utility functions, helpers, and class-based utilities in `packages/atomic`.

## Test Structure

Top-level describe matches module name or `#functionName`. Each exported function gets its own nested describe:

```typescript
describe('device-utils', () => {
  describe('#isIOS', () => { ... });
  describe('#isMacOS', () => { ... });
});
```

## Pure Functions

No setup needed — just input → output:

```typescript
import {describe, expect, it} from 'vitest';
import {filterProtocol} from './xss-utils';

describe('filterProtocol', () => {
  it('when passing a problematic protocol, it returns empty string', () => {
    expect(filterProtocol('javascript:alert(1)')).toBe('');
  });

  it('allows good protocols', () => {
    expect(filterProtocol('https://github.com/')).toBe('https://github.com/');
    expect(filterProtocol('mailto:user@example.com')).toBe(
      'mailto:user@example.com'
    );
  });
});
```

## Fake Timers

`vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`. Advance with `vi.advanceTimersByTime()` or `vi.runAllTimers()`:

```typescript
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {promiseTimeout} from './promise-utils';

describe('promise-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#promiseTimeout', () => {
    it('should resolve when promise completes before timeout', async () => {
      await expect(promiseTimeout(Promise.resolve('ok'), 1000)).resolves.toBe(
        'ok'
      );
    });

    it('should reject when promise exceeds timeout', async () => {
      const slow = new Promise((resolve) =>
        setTimeout(() => resolve('late'), 2000)
      );
      const result = promiseTimeout(slow, 1000);
      vi.advanceTimersByTime(1000);
      await expect(result).rejects.toThrow('Promise timed out.');
    });
  });
});
```

## Browser/Global API Mocking

Use `vi.stubGlobal` + `vi.restoreAllMocks()` — not `Object.defineProperty` with manual save/restore:

```typescript
import {afterEach, describe, expect, it, vi} from 'vitest';
import {isIOS} from './device-utils';

describe('#isIOS', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true for iPad user agent', () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
    });
    expect(isIOS()).toBe(true);
  });

  it('should return false for Windows user agent', () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    expect(isIOS()).toBe(false);
  });
});
```

Also works for `localStorage`, `getComputedStyle`, `Audio`, etc.

## DOM Creation and Cleanup

Create elements in `beforeEach`, append to `document.body`, clean up in `afterEach`:

```typescript
describe('dom-utils', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('#rectEquals', () => {
    it('should return true for identical rectangles', () => {
      const rect1 = new DOMRect(10, 20, 100, 200);
      const rect2 = new DOMRect(10, 20, 100, 200);
      expect(rectEquals(rect1, rect2)).toBe(true);
    });
  });
});
```

For heavier DOM setup (mock properties, computed styles), use `Object.defineProperties`:

```typescript
beforeEach(() => {
  mockButton = document.createElement('button');
  Object.defineProperties(mockButton, {
    clientWidth: {value: 100, writable: true, configurable: true},
    getBoundingClientRect: {
      value: vi
        .fn()
        .mockReturnValue({top: 50, left: 100, width: 100, height: 80}),
      writable: true,
      configurable: true,
    },
  });
  document.body.appendChild(mockButton);
});

afterEach(() => {
  document.body.innerHTML = '';
});
```

## Spy Mocking Sibling Modules

When a util delegates to another util, spy-mock the sibling:

```typescript
import {createRipple} from './ripple-utils';

vi.mock('./event-utils', {spy: true});

describe('#createRipple', () => {
  it('should listen for animation end', async () => {
    createRipple(mockEvent, {color: 'primary'});
    expect(vi.mocked(eventUtils.listenOnce)).toHaveBeenCalled();
  });
});
```

## Data-Driven Tests

Use `test.each` / `it.each` with descriptive labels for combinatorial logic:

```typescript
describe('Given no tab is active', () => {
  test.each([
    ['not included or excluded', [], []],
    ['included', ['tab1', 'tab2'], []],
    ['excluded', [], ['tab1', 'tab2']],
  ])('returns true when tabs are %s', (_, includeTabs, excludeTabs) => {
    expect(shouldDisplayOnCurrentTab(includeTabs, excludeTabs, '')).toBe(true);
  });
});
```

## Mock Custom Element Classes

For testing utils that depend on custom element interfaces, define a mock class at file top:

```typescript
class MockLightDOMElement extends HTMLElement implements LightDOMWithSlots {
  slotContent: {[name: string]: ChildNode[] | undefined} = {};
  renderDefaultSlotContent(defaultContent?: unknown) {
    return defaultContent ? [defaultContent] : [];
  }
}
customElements.define('mock-light-dom-element', MockLightDOMElement);

describe('#getNamedSlotContent', () => {
  let host: MockLightDOMElement;
  beforeEach(() => {
    host = new MockLightDOMElement();
  });

  it('should return Elements from slotContent', () => {
    host.slotContent = {'test-slot': [document.createElement('div')]};
    expect(getNamedSlotContent(host, 'test-slot')).toHaveLength(1);
  });
});
```
