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

export interface SolutionTypeSubControllers {
  interactiveResult: (props: InteractiveResultProps) => InteractiveResult;
  pagination: (props?: PaginationProps) => Pagination;
  sort: (props?: SortProps) => Sort;
}

interface SubControllerProps {
  responseIdSelector: (state: CommerceEngineState) => string;
  fetchResultsActionCreator: FetchResultsActionCreator;
}

export function buildSolutionTypeSubControllers(
  engine: CommerceEngine,
  subControllerProps: SubControllerProps
): SolutionTypeSubControllers {
  const {responseIdSelector, fetchResultsActionCreator} = subControllerProps;
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
        fetchResultsActionCreator,
      });
    },
    sort(props?: SortProps) {
      return buildCoreSort(engine, {
        ...props,
        fetchResultsActionCreator,
      });
    },
  };
}
