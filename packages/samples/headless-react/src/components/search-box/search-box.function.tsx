import {buildSearchBox, SearchBoxOptions} from '@coveo/headless';
import {useEffect, useState} from 'react';
import {engine} from '../../engine';

const options: SearchBoxOptions = {numberOfSuggestions: 8};
const searchBox = buildSearchBox(engine, {options});

export function SearchBox() {
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
        {state.suggestions.map((suggestion, index) => {
          const value = suggestion.rawValue;
          return (
            <li key={index} onClick={() => searchBox.selectSuggestion(value)}>
              {value}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
