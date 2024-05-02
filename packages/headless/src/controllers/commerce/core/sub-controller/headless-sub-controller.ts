import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {FetchResultsActionCreator} from '../common';
import {
  buildCorePagination,
  Pagination,
  PaginationProps,
} from '../pagination/headless-core-commerce-pagination';
import {
  buildCoreInteractiveResult,
  InteractiveResult,
  InteractiveResultProps,
} from '../result-list/headless-core-interactive-result';
import {
  buildCoreSort,
  Sort,
  SortProps,
} from '../sort/headless-core-commerce-sort';

export interface BaseSolutionTypeSubControllers {
  interactiveResult: (props: InteractiveResultProps) => InteractiveResult;
  pagination: (props?: PaginationProps) => Pagination;
}

export type SearchAndListingSubControllers = BaseSolutionTypeSubControllers & {
  sort: (props?: SortProps) => Sort;
};

interface SubControllerProps {
  responseIdSelector: (state: CommerceEngineState) => string;
  fetchResultsActionCreator: FetchResultsActionCreator;
  slotId?: string;
}

export function buildSolutionTypeSubControllers(
  engine: CommerceEngine,
  subControllerProps: SubControllerProps
): SearchAndListingSubControllers {
  const {fetchResultsActionCreator} = subControllerProps;
  return {
    ...buildBaseSolutionTypeControllers(engine, subControllerProps),
    sort(props?: SortProps) {
      return buildCoreSort(engine, {
        ...props,
        fetchResultsActionCreator,
      });
    },
  };
}

export function buildBaseSolutionTypeControllers(
  engine: CommerceEngine,
  subControllerProps: SubControllerProps
): BaseSolutionTypeSubControllers {
  const {responseIdSelector, fetchResultsActionCreator, slotId} =
    subControllerProps;
  return {
    interactiveResult(props: InteractiveResultProps) {
      return buildCoreInteractiveResult(engine, {
        ...props,
        responseIdSelector,
      });
    },
    pagination(props?: PaginationProps) {
      return buildCorePagination(engine, {
        ...props,
        options: {
          ...props?.options,
          slotId,
        },
        fetchResultsActionCreator,
      });
    },
  };
}
