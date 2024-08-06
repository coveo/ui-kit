import {
  RecentQueriesState,
  RecentQueriesList as RecentQueriesController,
} from '@coveo/headless/ssr-commerce';
import {FunctionComponent, useEffect, useState} from 'react';

interface RecentQueriesProps {
  staticState: RecentQueriesState;
  controller?: RecentQueriesController;
}

export const RecentQueries: FunctionComponent<RecentQueriesProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return (
    <div>
      <ul>
        {state.queries.map((query, index) => (
          <li key={index}>
            {query}
            <button
              onClick={() => controller?.executeRecentQuery(index)}
              dangerouslySetInnerHTML={{__html: query}}
            ></button>
          </li>
        ))}
      </ul>
    </div>
  );
};
