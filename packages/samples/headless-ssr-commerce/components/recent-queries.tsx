import {useInitializeRecentQueries} from '@/hooks/use-recent-queries';
import {useInstantProducts, useRecentQueriesList} from '@/lib/commerce-engine';

export default function RecentQueries() {
  const {state, methods} = useRecentQueriesList();
  const {methods: instantProductsController} = useInstantProducts();

  // Sync recent queries from localStorage when the component loads
  useInitializeRecentQueries(methods?.updateRecentQueries);

  return (
    <div>
      <ul>
        Recent Queries :
        {state.queries.map((query, index) => (
          <li key={index}>
            {query}
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
