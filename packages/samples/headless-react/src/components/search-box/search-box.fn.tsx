import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildSearchBox,
  SearchBox as HeadlessSearchBox,
  SearchBoxOptions,
} from '@coveo/headless';
import {engine} from '../../engine';

interface SearchBoxProps {
  controller: HeadlessSearchBox;
}

export const SearchBox: FunctionComponent<SearchBoxProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);
  const isEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key === 'Enter';

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <div>
      <input
        value={state.value}
        onChange={(e) => controller.updateText(e.target.value)}
        onKeyDown={(e) => isEnterKey(e) && controller.submit()}
      />
      <ul>
        {state.suggestions.map((suggestion) => {
          const value = suggestion.rawValue;
          return (
            <li key={value} onClick={() => controller.selectSuggestion(value)}>
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
const controller = buildSearchBox(engine, {options});

<SearchBox controller={controller} />;
