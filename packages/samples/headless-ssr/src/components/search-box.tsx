import {
  SearchBoxState,
  SearchBox as SearchBoxController,
} from '@coveo/headless';
import {SearchBoxMethods} from '@coveo/headless/ssr';
import {useEffect, useState, FunctionComponent} from 'react';

interface SearchBoxProps {
  initialState: SearchBoxState;
  controller?: SearchBoxController;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = (props) => {
  const {initialState, controller} = props;
  const [state, setState] = useState(initialState);
  const isEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key === 'Enter';

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );

  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => controller?.updateText(e.target.value)}
        onKeyDown={(e) => isEnterKey(e) && controller?.submit()}
      />
      <ul>
        {state.suggestions.map((suggestion) => {
          const value = suggestion.rawValue;
          return (
            <li key={value} onClick={() => controller?.selectSuggestion(value)}>
              {value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const options: SearchBoxOptions = {numberOfSuggestions: 8};
 * const controller = buildSearchBox(engine, {options});
 *
 * <SearchBox controller={controller} />;
 * ```
 */
