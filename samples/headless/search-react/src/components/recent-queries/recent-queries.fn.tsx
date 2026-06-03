import type {RecentQueriesList as HeadlessRecentQueriesList} from '@coveo/headless';
import {useEffect, useState} from 'react';

interface RecentQueriesProps {
  controller: HeadlessRecentQueriesList;
}

export const RecentQueriesList: React.FunctionComponent<RecentQueriesProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => {
    const storedQueries = retrieveLocalStorage();
    if (storedQueries.length) {
      controller.state.queries = storedQueries;
    }

    const unsubscribe = controller.subscribe(() => {
      setState(controller.state);
      updateLocalStorage();
    });

    return () => unsubscribe();
  }, [controller]);

  const retrieveLocalStorage = () => {
    const storedQueries = localStorage.getItem('recentQueries');
    return storedQueries ? JSON.parse(storedQueries) : [];
  };

  const updateLocalStorage = () => {
    localStorage.setItem(
      'recentQueries',
      JSON.stringify(controller.state.queries)
    );
  };

  return (
    <div>
      Recent queries:
      <ul>
        {state.queries.map((query) => (
          <li key={query}>{query}</li>
        ))}
      </ul>
    </div>
  );
};
