import type {Pager as HeadlessPager} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface PagerProps {
  controller: HeadlessPager;
}

export const Pager: FunctionComponent<PagerProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <nav>
      <button
        disabled={!state.hasPreviousPage}
        onClick={() => controller.previousPage()}
      >
        {'<'}
      </button>
      {state.currentPages.map((page) => (
        <button
          key={page}
          disabled={controller.isCurrentPage(page)}
          onClick={() => controller.selectPage(page)}
        >
          {page}
        </button>
      ))}
      <button
        disabled={!state.hasNextPage}
        onClick={() => controller.nextPage()}
      >
        {'>'}
      </button>
    </nav>
  );
};

// usage

/**
 * ```tsx
 * const options: PagerOptions = {numberOfPages: 6};
 * const controller = buildPager(engine, {options});
 *
 * <Pager controller={controller} />;
 * ```
 */
