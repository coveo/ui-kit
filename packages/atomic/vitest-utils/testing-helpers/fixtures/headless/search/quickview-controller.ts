import type {Quickview} from '@coveo/headless';
import {vi} from 'vitest';

export function buildFakeQuickview(config: Partial<Quickview> = {}): Quickview {
  return {
    fetchResultContent: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    state: {
      isLoading: false,
      content: '',
      currentResult: 1,
      totalResults: 1,
      resultHasPreview: false,
      currentResultUniqueId: 'fake-unique-id',
      ...config.state,
    },
    subscribe: vi.fn(() => vi.fn()),
    ...config,
  } as unknown as Quickview;
}
