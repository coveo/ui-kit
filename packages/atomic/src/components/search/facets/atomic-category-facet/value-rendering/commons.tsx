import type {CategoryFacet} from '@coveo/headless';
import type {FocusTargetController} from '../../../../../utils/accessibility-utils';

export const getOnClickForUnselectedValue =
  (facet: CategoryFacet, activeValueFocusTarget: FocusTargetController) =>
  (): void => {
    activeValueFocusTarget.focusAfterSearch();
    facet.deselectAll();
  };
