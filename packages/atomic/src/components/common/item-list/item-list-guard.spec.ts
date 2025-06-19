import {displayIf} from '@/src/directives/display-if';
import * as lit from 'lit';
import {describe, it, expect, vi} from 'vitest';
import {renderItemListGuard} from './item-list-guard';

vi.mock('@/src/directives/display-if', () => ({
  displayIf: vi.fn(),
}));

vi.mock('lit', () => ({
  html: vi.fn(),
  nothing: vi.fn(),
}));

describe('item-list-guard', () => {
  const mockedLit = vi.mocked(lit);
  const children = mockedLit.html`children`;

  it('should not render children when hasError is true', () => {
    renderItemListGuard({
      props: {
        hasError: true,
        hasItems: true,
        hasTemplate: true,
        firstRequestExecuted: true,
        templateHasError: false,
      },
    })(children);

    expect(displayIf).toHaveBeenCalledWith(false, expect.any(Function));
  });

  it('should not render children when firstRequestExecuted is true and hasItems is false', () => {
    renderItemListGuard({
      props: {
        hasError: false,
        hasItems: false,
        hasTemplate: true,
        firstRequestExecuted: true,
        templateHasError: false,
      },
    })(children);

    expect(displayIf).toHaveBeenCalledWith(false, expect.any(Function));
  });

  it('should not render children when hasTemplate is false', () => {
    renderItemListGuard({
      props: {
        hasError: false,
        hasItems: true,
        hasTemplate: false,
        firstRequestExecuted: true,
        templateHasError: false,
      },
    })(children);

    expect(displayIf).toHaveBeenCalledWith(false, expect.any(Function));
  });

  it('should render children when firstRequestExecuted is false and hasItems is false', () => {
    renderItemListGuard({
      props: {
        hasError: false,
        hasItems: false,
        hasTemplate: true,
        firstRequestExecuted: false,
        templateHasError: false,
      },
    })(children);

    expect(displayIf).toHaveBeenCalledWith(true, expect.any(Function));
  });

  it('should render children when all conditions are met', () => {
    renderItemListGuard({
      props: {
        hasError: false,
        hasItems: true,
        hasTemplate: true,
        firstRequestExecuted: true,
        templateHasError: false,
      },
    })(children);

    expect(displayIf).toHaveBeenCalledWith(true, expect.any(Function));
  });

  it('should render children when all conditions are met with templateHasError true', () => {
    renderItemListGuard({
      props: {
        hasError: false,
        hasItems: true,
        hasTemplate: true,
        firstRequestExecuted: true,
        templateHasError: true,
      },
    })(children);

    expect(displayIf).toHaveBeenCalledWith(true, expect.any(Function));
  });
});
