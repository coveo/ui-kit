import {useCallback, useMemo, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {SearchBoxPropsSchema} from '@coveo/thermidor-schema/zod3';
import {PromptInput} from '../../components/PromptInput/PromptInput.js';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';
import {
  SearchBoxQueryContext,
  useSearchBoxOptions,
  type SearchBoxQuery,
} from './search-box-context.js';

const NO_SUGGESTIONS: SuggestionSection[] = [];

/**
 * A2-UI component for the `SearchBox`: the page's prompt input. What is typed stays here and is
 * given to the `suggestionsChild`, which decides which suggestions the input's dropdown shows.
 * Submitting is the page's.
 */
export const SearchBox = createReactComponent(
  {name: 'SearchBox', schema: SearchBoxPropsSchema},
  ({props, buildChild}) => {
    const {onSubmit, busy, placeholder, clearOnSubmit, suggestionsPlacement} =
      useSearchBoxOptions();
    const [query, setQuery] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [suggestions, setSuggestions] = useState(NO_SUGGESTIONS);

    const handleValueChange = useCallback((value: string) => {
      setQuery(value);
      setSubmitted(false);
    }, []);

    const submit = useCallback(
      (prompt: string) => {
        setSubmitted(true);
        onSubmit(prompt);
      },
      [onSubmit]
    );

    const searchBoxQuery = useMemo<SearchBoxQuery>(
      () => ({query, submitted, showSuggestions: setSuggestions}),
      [query, submitted]
    );

    return (
      <SearchBoxQueryContext.Provider value={searchBoxQuery}>
        <PromptInput
          onSubmit={submit}
          busy={busy}
          placeholder={placeholder}
          clearOnSubmit={clearOnSubmit}
          suggestions={suggestions}
          suggestionsPlacement={suggestionsPlacement}
          onValueChange={handleValueChange}
        />
        {props.suggestionsChild !== undefined && buildChild(props.suggestionsChild)}
      </SearchBoxQueryContext.Provider>
    );
  }
);
