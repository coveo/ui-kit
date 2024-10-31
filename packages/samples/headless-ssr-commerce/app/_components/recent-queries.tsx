import {
  useInstantProducts,
  useRecentQueriesList,
} from '../_lib/commerce-engine';

export default function RecentQueries() {
  const {state, controller} = useRecentQueriesList();
  const {controller: instantProductsController} = useInstantProducts();

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
