import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildSearchStatus,
  SearchStatus as HeadlessSearchStatus,
} from '@coveo/headless';
import {engine} from '../../engine';

interface SearchStatusProps {
  controller: HeadlessSearchStatus;
}

export const SearchStatus: FunctionComponent<SearchStatusProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const {hasResults, firstSearchExecuted, isLoading} = state;

  if (!hasResults) {
    if (!firstSearchExecuted) {
      if (isLoading) {
        return <p>The first search ever is currently loading.</p>;
      }
      return <p>No search was ever executed.</p>;
    }

    if (isLoading) {
      return (
        <p>The previous search gave no results, but new ones are pending.</p>
      );
    }
    return <p>A search was executed but gave no results.</p>;
  }

  if (isLoading) {
    return <p>The previous search gave results, but new ones are loading.</p>;
  }
  return <p>There are results and no pending search.</p>;
};

// usage

const controller = buildSearchStatus(engine);

<SearchStatus controller={controller} />;
