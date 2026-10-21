import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchSuggestionsPayload} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {PromptInput} from '../../components/PromptInput/PromptInput.js';
import {useSearchBoxOptions} from '../../components/SearchBox/search-box-options.js';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';

const NO_QUERIES: ReadonlySet<string> = new Set();

/** How long typing must pause before the query is looked up. */
export const LOOKUP_DEBOUNCE_MS = 150;

/**
 * A2-UI component for `QuerySuggestions`, drawn as the whole search box: the input and its
 * completions popover. Once typing pauses, the query is looked up with `fetchSuggestions`, unless
 * the input is empty. The session sends the lookup at once and supersedes it with the next one,
 * but a superseded lookup still costs the producer a request, hence the debounce.
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

    const lookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancelLookup = useCallback(() => {
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current);
        lookupTimeoutRef.current = null;
      }
    }, []);
    useEffect(() => cancelLookup, [cancelLookup]);

    const handleValueChange = useCallback(
      (query: string) => {
        setPendingQuery(query);
        cancelLookup();
        if (!query.trim()) {
          return;
        }
        lookupTimeoutRef.current = setTimeout(() => {
          lookupTimeoutRef.current = null;
          setLookedUp((current) => new Set(current).add(query));
          const payload: FetchSuggestionsPayload = {query};
          context.dispatchAction({event: {name: 'fetchSuggestions', context: payload}});
        }, LOOKUP_DEBOUNCE_MS);
      },
      [context, cancelLookup]
    );

    const submit = useCallback(
      (prompt: string) => {
        cancelLookup();
        setPendingQuery('');
        setLookedUp(NO_QUERIES);
        onSubmit(prompt);
      },
      [onSubmit, cancelLookup]
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
