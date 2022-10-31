import {
  SearchBox as HeadlessSearchBox,
  InstantResults as HeadlessInstantResults,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';

interface InstantResultsProps {
  controllerSearchbox: HeadlessSearchBox;
  controllerInstantResults: HeadlessInstantResults;
}

export const InstantResults: FunctionComponent<InstantResultsProps> = (
  props
) => {
  const {controllerSearchbox, controllerInstantResults} = props;
  const isEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key === 'Enter';
  const [searchboxState, setStateSearchbox] = useState(
    controllerSearchbox.state
  );
  const [instantResultsState, setStateInstantResults] = useState(
    controllerInstantResults.state
  );

  useEffect(
    () =>
      controllerSearchbox.subscribe(() =>
        setStateSearchbox(controllerSearchbox.state)
      ),
    []
  );
  useEffect(
    () =>
      controllerInstantResults.subscribe(() =>
        setStateInstantResults(controllerInstantResults.state)
      ),
    []
  );

  return (
    <div>
      <p>
        Type in the searchbox and hover a query suggestion to preview associated
        results
      </p>

      <input
        value={searchboxState.value}
        onChange={(e) => controllerSearchbox.updateText(e.target.value)}
        onKeyDown={(e) => isEnterKey(e) && controllerSearchbox.submit()}
      />

      <div style={{display: 'flex'}}>
        <ul>
          {searchboxState.suggestions.map((suggestion) => {
            const value = suggestion.rawValue;
            return (
              <li
                key={value}
                onMouseEnter={() => controllerInstantResults.updateQuery(value)}
                onClick={() => controllerSearchbox.selectSuggestion(value)}
              >
                {value}
              </li>
            );
          })}
        </ul>
        <ul>
          {instantResultsState.results.map((result) => {
            return (
              <li>
                <div>
                  {result.title}: {result.raw.source}
                </div>
                <pre>{result.excerpt}</pre>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controllerSearchbox = buildSearchBox(engine, {options: {id: 'foo'}});
 * const controllerInstantResults = buildInstantResults(engine, {options: {maxResultsPerQuery: 5, searchBoxId: 'foo'}});
 *
 * <InstantResults controllerSearchbox={controllerSearchbox} controllerInstantResults={controllerInstantResults}  />;
 * ```
 */
