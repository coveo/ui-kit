import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions';
import {SearchAppState} from '../../../state/search-app-state';
import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';
import {createMockState} from '../../../test/mock-state';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from './headless-core-breadcrumb-manager';

describe('headless breadcrumb manager', () => {
  let engine: MockSearchEngine;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  function initController() {
    engine = buildMockSearchAppEngine();
    engine.state = state;
    breadcrumbManager = buildCoreBreadcrumbManager(engine);
  }

  beforeEach(() => {
    state = createMockState();
    initController();
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllBreadcrumbs());
    });
  });
});
