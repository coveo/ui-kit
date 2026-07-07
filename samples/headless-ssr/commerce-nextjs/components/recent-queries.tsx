import {useInstantProducts, useRecentQueriesList} from '@/lib/commerce-engine';

export default function RecentQueries() {
  const {state, methods} = useRecentQueriesList();
  const {methods: instantProductsController} = useInstantProducts();

  if (state.queries.length === 0) {
    return null;
  }

  return (
    <>
      <h4>Recent queries</h4>
      <ul className="RecentQueries">
        {state.queries.map((query, index) => (
          <li key={query}>
            <button
              type="button"
              onMouseEnter={() => instantProductsController?.updateQuery(query)}
              onClick={() => methods?.executeRecentQuery(index)}
              dangerouslySetInnerHTML={{__html: query}}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
