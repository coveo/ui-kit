import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildSearchBox,
  SearchBox as HeadlessSearchBox,
  SearchBoxOptions,
} from '@coveo/headless';
import {engine} from '../../engine';

interface SearchBoxProps {
  searchBox: HeadlessSearchBox;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = (props) => {
  const {searchBox} = props;
  const [state, setState] = useState(searchBox.state);
  const isEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key === 'Enter';

  useEffect(() => searchBox.subscribe(() => setState(searchBox.state)), []);

  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => searchBox.updateText(e.target.value)}
        onKeyDown={(e) => isEnterKey(e) && searchBox.submit()}
      />
      <ul>
        {state.suggestions.map((suggestion) => {
          const value = suggestion.rawValue;
          return (
            <li key={value} onClick={() => searchBox.selectSuggestion(value)}>
              {value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// usage

const options: SearchBoxOptions = {numberOfSuggestions: 8};
const searchBox = buildSearchBox(engine, {options});

<SearchBox searchBox={searchBox} />;
