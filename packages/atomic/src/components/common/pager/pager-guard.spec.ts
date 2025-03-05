import {displayIf} from '@/src/directives/display-if';
import * as lit from 'lit';
import {describe, test, expect, vi} from 'vitest';
import {pagerGuard} from './pager-guard';

vi.mock('@/src/directives/display-if', () => ({
  displayIf: vi.fn(),
}));

vi.mock('lit', () => ({
  html: vi.fn(),
}));

describe('pagerGuard', () => {
  const mockedLit = vi.mocked(lit);
  const children = mockedLit.html`children`;

  test('should not render children when hasError is true', async () => {
    pagerGuard({
      props: {hasError: true, isAppLoaded: true, hasItems: true},
      children,
    });

    expect(displayIf).toHaveBeenCalledWith(false, children);
  });

  test('should not render children when isAppLoaded is false', async () => {
    pagerGuard({
      props: {hasError: false, isAppLoaded: false, hasItems: true},
      children,
    });

    expect(displayIf).toHaveBeenCalledWith(false, children);
  });

  test('should not render children when hasItems is false', async () => {
    pagerGuard({
      props: {hasError: false, isAppLoaded: true, hasItems: false},
      children,
    });

    expect(displayIf).toHaveBeenCalledWith(false, children);
  });

  test('should render children when the condition is true', async () => {
    pagerGuard({
      props: {hasError: false, isAppLoaded: true, hasItems: true},
      children,
    });

    expect(displayIf).toHaveBeenCalledWith(true, children);
  });
});
