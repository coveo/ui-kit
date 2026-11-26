import {useCallback, useMemo, useState} from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {componentId} from '@a2ui/web_core/v0_9';
import {SearchBoxPropsSchema} from '@coveo/thermidor-schema/zod3';
import {PromptInput} from '../../components/PromptInput/PromptInput.js';
import type {
  SuggestionItem,
  SuggestionSection,
} from '../../components/SuggestionsDropdown/index.js';
import {
  SearchBoxQueryContext,
  useSearchBoxOptions,
  type SearchBoxQuery,
} from './search-box-context.js';

const NO_SUGGESTIONS: SuggestionSection[] = [];

/**
 * A2-UI component for the `SearchBox`: the page's prompt input. What is typed stays here and is
 * given to the `suggestionsChild`, which decides which suggestions the input's dropdown shows. The
 * suggestion the shopper highlights, else the first one, is given to the `instantProductsChild`,
 * drawn beside the suggestions. Submitting is the page's. The schema marks both children as
 * component ids, which is how `@a2ui/react` knows to build their child nodes.
 */
export const SearchBox = createComponentImplementation(
  {
    name: 'SearchBox',
    schema: SearchBoxPropsSchema.extend({
      suggestionsChild: componentId().optional(),
      instantProductsChild: componentId().optional(),
    }),
  },
  ({props, buildChild}) => {
    const {onSubmit, busy, placeholder, clearOnSubmit, suggestionsPlacement} =
      useSearchBoxOptions();
    const [query, setQuery] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [focused, setFocused] = useState(false);
    const [suggestions, setSuggestions] = useState(NO_SUGGESTIONS);
    const [activeItem, setActiveItem] = useState<SuggestionItem>();

    const handleValueChange = useCallback((value: string) => {
      setQuery(value);
      setSubmitted(false);
    }, []);

    const handleFocusChange = useCallback(
      (value: boolean) => {
        setFocused(value);
        if (value && !query.trim()) {
          setSubmitted(false);
        }
      },
      [query]
    );

    const submit = useCallback(
      (prompt: string) => {
        setSubmitted(true);
        if (clearOnSubmit) {
          setQuery('');
        }
        onSubmit(prompt);
      },
      [onSubmit, clearOnSubmit]
    );

    const items = suggestions.flatMap((section) => section.items);
    const highlighted = activeItem && items.includes(activeItem) ? activeItem : items[0];
    const highlightedQuery = highlighted?.label ?? '';

    const searchBoxQuery = useMemo<SearchBoxQuery>(
      () => ({query, submitted, focused, highlightedQuery, showSuggestions: setSuggestions}),
      [query, submitted, focused, highlightedQuery]
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
          onActiveItemChange={setActiveItem}
          onFocusChange={handleFocusChange}
          suggestionsAside={
            props.instantProductsChild !== undefined && buildChild(props.instantProductsChild)
          }
        />
        {props.suggestionsChild !== undefined && buildChild(props.suggestionsChild)}
      </SearchBoxQueryContext.Provider>
    );
  }
);
