import {useResultList} from '../common/engine';

export default function ResultList() {
  const {state} = useResultList();

  return (
    // TODO (refactor): Extract out common parts of components into common/ and reuse
    <ul>
      {state.results.map((result) => (
        <li key={result.uniqueId}>
          <h3>{result.title}</h3>
        </li>
      ))}
    </ul>
  );
}
