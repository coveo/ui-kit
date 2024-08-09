import {
  RecentQueriesState,
  RecentQueriesList as RecentQueriesController,
  InstantProducts as InstantProductsController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';

interface RecentQueriesProps {
  staticState: RecentQueriesState;
  controller?: RecentQueriesController;
  instantProductsController?: InstantProductsController;
}

export default function RecentQueries({
  staticState,
  controller,
  instantProductsController,
}: RecentQueriesProps) {
  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState({...controller.state}));
  }, [controller]);

  return (
    <div>
      <ul>
        Recent Queries :
        {state.queries.map((query, index) => (
          <li key={index}>
            {query}
            <button
              onMouseEnter={() => instantProductsController?.updateQuery(query)}
              onClick={() => controller?.executeRecentQuery(index)}
              dangerouslySetInnerHTML={{__html: query}}
            ></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
