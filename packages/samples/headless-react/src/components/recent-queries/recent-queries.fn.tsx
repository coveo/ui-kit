import {RecentQueriesList as HeadlessRecentQueriesList} from '@coveo/headless';
import {useEffect, useState} from 'react';

export interface RecentQueriesProps {
  controller: HeadlessRecentQueriesList;
}

export const RecentQueriesList: React.FunctionComponent<RecentQueriesProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

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
