import {useInstantProducts, useRecentQueriesList} from '@/lib/commerce-engine';

export default function RecentQueries() {
  const {state, methods} = useRecentQueriesList();
  const {methods: instantProductsController} = useInstantProducts();

  return (
    <div>
      <ul>
        Recent queries:
        {state.queries.map((query, index) => (
          <li key={query}>
            <button
              type="button"
              onMouseEnter={() => instantProductsController?.updateQuery(query)}
              onClick={() => methods?.executeRecentQuery(index)}
            >
              {query}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
