import {useSearchBox} from '@/lib/commerce-engine';
import {useState} from 'react';

export default function SimpleSearchBox() {
  const {state, methods} = useSearchBox();
  const [inputValue, setInputValue] = useState(state.value);

  const handleSearchBoxInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInputValue(event.target.value);
    methods?.updateText(event.target.value);
  };

  const handleSearchBoxKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleSearchBoxSubmit();
    }
  };

  const handleSearchBoxSubmit = () => {
    methods?.submit();
  };

  return (
    <div className="SearchBox">
      <div className="SearchBoxInputWrapper" style={{whiteSpace: 'nowrap'}}>
        <input
          className="SearchBoxInput"
          disabled={!methods}
          onChange={handleSearchBoxInputChange}
          onKeyDown={handleSearchBoxKeyDown}
          placeholder="Search"
          type="search"
          value={inputValue}
        />

        <button
          aria-label="Search"
          className="SearchBoxSubmit"
          disabled={!methods}
          onClick={handleSearchBoxSubmit}
        >
          <span>⌕</span>
        </button>
      </div>
    </div>
  );
}
