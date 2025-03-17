import {useSearchBox} from '@/lib/commerce-engine';
import {useState} from 'react';

export default function BasicSearchBox() {
  const {state, methods} = useSearchBox();
  const [inputValue, setInputValue] = useState(state.value);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    methods?.updateText(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchBoxSubmit();
    }
  };

  const handleSearchBoxSubmit = () => {
    methods?.submit();
  };

  return (
    <div className="SearchBoxInputWrapper" style={{whiteSpace: 'nowrap'}}>
      <input
        autoFocus
        className="SearchBoxInput"
        disabled={!methods}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search"
        type="search"
        value={inputValue}
      />

      <button
        aria-label="Search"
        className="SearchBoxSubmitButton"
        disabled={!methods}
        onClick={handleSearchBoxSubmit}
      >
        <span>⌕</span>
      </button>
    </div>
  );
}
