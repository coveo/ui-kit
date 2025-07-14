import type {Search as HeadlessSearch} from '@coveo/headless/commerce';
import {type FunctionComponent, useEffect, useState} from 'react';

interface SearchProps {
  controller: HeadlessSearch;
}

export const Search: FunctionComponent<SearchProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.products.length) {
    return (
      <button onClick={() => controller.executeFirstSearch()}>Refresh</button>
    );
  }

  return (
    <ul>
      {state.products.map(({ec_name, clickUri, permanentid}) => (
        <li key={permanentid}>
          <a href={clickUri}>{ec_name}</a>
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildSearch(engine);
 *
 * <Search controller={controller} />;
 * ```
 */
