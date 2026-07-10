import {
  buildInteractiveInstantResult,
  type InstantResults,
  type Result,
  type SearchBox as SearchBoxController,
  type SearchEngine,
} from '@coveo/headless';
import {type KeyboardEvent, useState} from 'react';
import {useController} from '../use-controller';

interface SearchBoxProps {
  engine: SearchEngine;
  controller: SearchBoxController;
  instantResults: InstantResults;
}

export function SearchBox({
  engine,
  controller,
  instantResults,
}: SearchBoxProps) {
  const {value, suggestions} = useController(controller);
  const {results} = useController(instantResults);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);

  const onInput = (text: string) => {
    setActive(-1);
    controller.updateText(text);
    instantResults.updateQuery(text);
  };

  const selectSuggestion = (rawValue: string) => {
    controller.selectSuggestion(rawValue);
    setFocused(false);
    setActive(-1);
  };

  const selectInstant = (result: Result) => {
    buildInteractiveInstantResult(engine, {options: {result}}).select();
    setFocused(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (suggestions.length) {
          e.preventDefault();
          setActive((a) => (a + 1) % suggestions.length);
        }
        break;
      case 'ArrowUp':
        if (suggestions.length) {
          e.preventDefault();
          setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
        }
        break;
      case 'Enter':
        if (active >= 0 && suggestions[active]) {
          selectSuggestion(suggestions[active].rawValue);
        } else {
          controller.submit();
          setFocused(false);
        }
        break;
      case 'Escape':
        setFocused(false);
        setActive(-1);
        break;
      default:
        break;
    }
  };

  const showDropdown =
    focused && value !== '' && (suggestions.length > 0 || results.length > 0);

  return (
    <div className="search-box">
      <input
        type="search"
        value={value}
        placeholder="Search..."
        aria-label="Search"
        onChange={(e) => onInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
      {showDropdown && (
        // Prevent mousedown from blurring the input (which would close the dropdown
        // before the click registers).
        <div
          className="search-box__dropdown"
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.length > 0 && (
            <div className="search-box__column">
              <p className="search-box__column-title">Suggestions</p>
              <ul role="listbox">
                {suggestions.map((suggestion, i) => (
                  <li key={suggestion.rawValue} role="presentation">
                    <button
                      type="button"
                      role="option"
                      className={`search-box__suggestion${i === active ? ' active' : ''}`}
                      aria-selected={i === active}
                      onClick={() => selectSuggestion(suggestion.rawValue)}
                    >
                      {suggestion.rawValue}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.length > 0 && (
            <div className="search-box__column">
              <p className="search-box__column-title">Instant results</p>
              <ul>
                {results.map((result) => (
                  <li key={result.uniqueId}>
                    <a
                      className="search-box__instant"
                      href={result.clickUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => selectInstant(result)}
                      onAuxClick={() => selectInstant(result)}
                      onContextMenu={() => selectInstant(result)}
                    >
                      <span className="search-box__instant-title">
                        {result.title}
                      </span>
                      {result.excerpt && (
                        <span className="search-box__instant-excerpt">
                          {result.excerpt}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
