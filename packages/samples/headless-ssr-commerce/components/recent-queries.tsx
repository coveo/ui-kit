import * as externalQueriesAPI from '@/actions/external-recent-queries-api';
import {useInstantProducts, useRecentQueriesList} from '@/lib/commerce-engine';
import {useEffect} from 'react';

export default function RecentQueries() {
  const {state, methods} = useRecentQueriesList();
  const {methods: instantProductsController} = useInstantProducts();

  useEffect(() => {
    externalQueriesAPI.updateRecentQueries(state.queries);
  }, [state.queries]);

  return (
    <div>
      <ul>
        Recent Queries :{' '}
        <button
          onClick={async () => {
            await externalQueriesAPI.clearRecentQueries();
            methods?.clear();
          }}
        >
          Clear
        </button>
        {state.queries.map((query, index) => (
          <li key={index}>
            <button
              onMouseEnter={() => instantProductsController?.updateQuery(query)}
              onClick={() => methods?.executeRecentQuery(index)}
              dangerouslySetInnerHTML={{__html: query}}
            ></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
