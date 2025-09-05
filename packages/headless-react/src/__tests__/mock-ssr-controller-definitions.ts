import type {Controller} from '@coveo/headless';
import {vi} from 'vitest';

type SolutionTypeAvailabilities = {
  listing?: boolean;
  search?: boolean;
  standalone?: boolean;
  recommendation?: boolean;
};

export function buildMockController(): Controller {
  return {
    subscribe: vi.fn(() => vi.fn()),
    state: {},
  } as Controller;
}

export function defineMockCommerceController(
  options?: SolutionTypeAvailabilities
) {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
    listing: options?.listing ?? true,
    search: options?.search ?? true,
    standalone: options?.standalone ?? true,
    recommendation: options?.recommendation ?? true,
  };
}

export function defineMockSearchController() {
  return {
    build: vi.fn((_engine) => {
      return buildMockController();
    }),
  };
}
