import {beforeEach, describe, expect, it, vi} from 'vitest';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  type BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from './headless-core-breadcrumb-manager.js';

vi.mock('../../../features/breadcrumb/breadcrumb-actions');

describe('headless breadcrumb manager', () => {
  let engine: MockedSearchEngine;
  let breadcrumbManager: BreadcrumbManager;

  function initController() {
    engine = buildMockSearchEngine(createMockState());
    breadcrumbManager = buildCoreBreadcrumbManager(engine);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    initController();
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(deselectAllBreadcrumbs).toHaveBeenCalledTimes(1);
    });
  });
});
