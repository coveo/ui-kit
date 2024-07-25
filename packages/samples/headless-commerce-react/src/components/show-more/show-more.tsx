import {Pagination} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IShowMoreProps {
  controller: Pagination;
}

export default function ShowMore(props: IShowMoreProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const handleFetchMore = () => {
    controller.fetchMoreProducts();
  };

  const isDisabled = () => {
    return state.page + 1 >= state.totalPages;
  };

  return (
    <button
      className="ShowMore"
      disabled={isDisabled()}
      onClick={() => handleFetchMore()}
    >
      Show more
    </button>
  );
}
