import {Pagination, PaginationState} from '@coveo/headless/ssr-commerce';
import {FunctionComponent, useEffect, useState} from 'react';

interface ShowMoreProps {
  staticState: PaginationState;
  controller?: Pagination;
}

export const ShowMore: FunctionComponent<ShowMoreProps> = ({
  staticState,
  controller,
}: ShowMoreProps) => {
  const [state, setState] = useState(staticState);

  useEffect(() => {
    console.log('in use effect!');
    controller?.subscribe?.(() => {
      console.log('in subscribe callback');
      setState(controller.state);
    });
  });

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
