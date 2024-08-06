import {Pagination, PaginationState} from '@coveo/headless/ssr-commerce';
import {FunctionComponent, useEffect, useState} from 'react';
import {
  ListingHydratedState,
  SearchHydratedState,
} from '../_lib/commerce-engine';

interface ShowMoreProps {
  hydratedState?: ListingHydratedState | SearchHydratedState;
  staticState: PaginationState;
  controller?: Pagination;
}

export const ShowMore: FunctionComponent<ShowMoreProps> = ({
  staticState,
  controller,
}: ShowMoreProps) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () =>
      controller?.subscribe?.(() => {
        setState(controller.state);
      }),
    [controller]
  );

  return (
    <>
      <div>
        Page {state.page + 1} of {state.totalPages} (showing {state.pageSize}{' '}
        products per page)
      </div>
      <button disabled={!controller} onClick={controller?.fetchMoreProducts}>
        Show more
      </button>
    </>
  );
};
