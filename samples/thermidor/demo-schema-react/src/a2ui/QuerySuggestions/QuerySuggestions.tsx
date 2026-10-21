import {useCallback, useMemo, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchSuggestionsPayload} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {PromptInput} from '../../components/PromptInput/PromptInput.js';
import {useSearchBoxOptions} from '../../components/SearchBox/search-box-options.js';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';

const NO_QUERIES: ReadonlySet<string> = new Set();

/**
 * A2-UI component for `QuerySuggestions`, drawn as the whole search box: the input and its
 * completions popover. Each keystroke but an empty input dispatches the `fetchSuggestions`
 * lookup, which the session sends at once and supersedes with the next one.
 *
 * Completions show only while the input holds a query that has not been submitted, and only when
 * they answer a query looked up since the last submit, so a lookup that answers after a submit
 * never shows.
 */
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props, context}) => {
    const {onSubmit, isStreaming, placeholder, clearOnSubmit, suggestionsPlacement} =
      useSearchBoxOptions();
    const [pendingQuery, setPendingQuery] = useState('');
    const [lookedUp, setLookedUp] = useState(NO_QUERIES);

    const showCompletions = pendingQuery.trim() !== '' && lookedUp.has(props.query);
    const sections = useMemo<SuggestionSection[]>(
      () =>
        showCompletions && props.completions.length > 0
          ? [
              {
                id: 'search',
                title: 'Search',
                icon: 'search',
                items: props.completions.map(({expression}) => ({
                  id: expression,
                  label: expression,
                })),
              },
            ]
          : [],
      [showCompletions, props.completions]
    );

    const handleValueChange = useCallback(
      (query: string) => {
        setPendingQuery(query);
        if (!query.trim()) {
          return;
        }
        setLookedUp((current) => new Set(current).add(query));
        const payload: FetchSuggestionsPayload = {query};
        context.dispatchAction({event: {name: 'fetchSuggestions', context: payload}});
      },
      [context]
    );

    const submit = useCallback(
      (prompt: string) => {
        setPendingQuery('');
        setLookedUp(NO_QUERIES);
        onSubmit(prompt);
      },
      [onSubmit]
    );

    return (
      <PromptInput
        onSubmit={submit}
        busy={isStreaming}
        placeholder={placeholder}
        clearOnSubmit={clearOnSubmit}
        suggestions={sections}
        suggestionsPlacement={suggestionsPlacement}
        onValueChange={handleValueChange}
      />
    );
  }
);
