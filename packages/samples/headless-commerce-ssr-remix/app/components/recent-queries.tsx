import {useInstantProducts, useRecentQueriesList} from '@/lib/commerce-engine';

export default function RecentQueries() {
  const {state, methods} = useRecentQueriesList();
  const {methods: instantProductsController} = useInstantProducts();

  return (
    <div>
      <label htmlFor="recent-queries">
        <span>
          <b>Recent queries</b>
        </span>
      </label>
      <ul id="recent-queries">
        {state.queries.map((query, index) => (
          <li key={index}>
            <button
              onFocus={() => instantProductsController?.updateQuery(query)}
              onClick={() => methods?.executeRecentQuery(index)}
            >
              {query}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={methods?.clear} type="reset">
        Clear
      </button>
    </div>
  );
}
