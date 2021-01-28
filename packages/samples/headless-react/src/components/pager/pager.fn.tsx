import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildPager,
  Pager as HeadlessPager,
  PagerOptions,
} from '@coveo/headless';
import {engine} from '../../engine';

interface PagerProps {
  controller: HeadlessPager;
}

export const Pager: FunctionComponent<PagerProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const previousPage = () => {
    controller.previousPage();
  };

  const nextPage = () => {
    controller.nextPage();
  };

  const selectPage = (page: number) => {
    controller.selectPage(page);
  };

  const isCurrentPage = (page: number) => {
    return controller.isCurrentPage(page);
  };

  return (
    <nav>
      <button disabled={!state.hasPreviousPage} onClick={() => previousPage()}>
        {'<'}
      </button>
      {state.currentPages.map((page) => (
        <button
          key={page}
          disabled={isCurrentPage(page)}
          onClick={() => selectPage(page)}
        >
          {page}
        </button>
      ))}
      <button disabled={!state.hasNextPage} onClick={() => nextPage()}>
        {'>'}
      </button>
    </nav>
  );
};

// usage

const options: PagerOptions = {numberOfPages: 6};
const controller = buildPager(engine, {options});

<Pager controller={controller} />;
