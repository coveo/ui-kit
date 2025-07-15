import * as lit from 'lit';
import {describe, expect, test, vi} from 'vitest';
import {displayIf} from '@/src/directives/display-if';
import {renderPagerGuard} from './pager-guard';

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
    renderPagerGuard({
      props: {hasError: true, isAppLoaded: true, hasItems: true},
    })(children);

    expect(displayIf).toHaveBeenCalledWith(false, expect.any(Function));
  });

  test('should not render children when isAppLoaded is false', async () => {
    renderPagerGuard({
      props: {hasError: false, isAppLoaded: false, hasItems: true},
    })(children);

    expect(displayIf).toHaveBeenCalledWith(false, expect.any(Function));
  });

  test('should not render children when hasItems is false', async () => {
    renderPagerGuard({
      props: {hasError: false, isAppLoaded: true, hasItems: false},
    })(children);

    expect(displayIf).toHaveBeenCalledWith(false, expect.any(Function));
  });

  test('should render children when the condition is true', async () => {
    renderPagerGuard({
      props: {hasError: false, isAppLoaded: true, hasItems: true},
    })(children);

    expect(displayIf).toHaveBeenCalledWith(true, expect.any(Function));
  });
});
