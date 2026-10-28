import {useEffect, useMemo, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchSuggestionsPayload} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';
import {useDebouncedValue} from '../../hooks/use-debounced-value.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import {useLatestWhenFree, useSessionBusy, useSurfaceLocked} from '../session-request.js';

/** How long typing must pause before the query is sent with `fetchSuggestions`. */
export const SUGGESTIONS_DEBOUNCE_MS = 150;

/**
 * A2-UI component for `QuerySuggestions`: the completions of its `SearchBox`'s query, shown in the
 * search box's dropdown. Once typing pauses, the query is sent with `fetchSuggestions` as soon as
 * the session is free, unless it is empty. The last completions stay shown while newer ones are
 * on their way, and hide if those fail. They are hidden while the input is empty, after a submit until the next
 * keystroke, and while a request locks the page, such as an answer streaming. Completions hidden by
 * a submit or an empty input never show again.
 */
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props, context}) => {
    const {query, submitted, showSuggestions} = useSearchBoxQuery();
    const locked = useSurfaceLocked();
    const busy = useSessionBusy();
    const debouncedQuery = useDebouncedValue(query.trim() ? query : '', SUGGESTIONS_DEBOUNCE_MS);

    useLatestWhenFree(submitted ? '' : debouncedQuery, (latest) => {
      const payload: FetchSuggestionsPayload = {query: latest};
      context.dispatchAction({event: {name: 'fetchSuggestions', context: payload}});
    });

    const cleared = submitted || query.trim() === '';
    const [discardedQuery, setDiscardedQuery] = useState<string>();
    if (cleared && discardedQuery !== props.query) {
      setDiscardedQuery(props.query);
    }

    const awaitingNewer = busy || debouncedQuery !== query;
    const current = props.query === query || (awaitingNewer && props.query !== discardedQuery);
    const visible = !cleared && !locked && current;
    // Every replay of the stream rebuilds `completions`, so the dropdown follows their expressions.
    const expressions = visible ? props.completions.map(({expression}) => expression) : [];
    const expressionsKey = JSON.stringify(expressions);
    const sections = useMemo<SuggestionSection[]>(() => {
      const items = JSON.parse(expressionsKey) as string[];
      return items.length > 0
        ? [
            {
              id: 'search',
              title: 'Search',
              icon: 'search',
              items: items.map((expression, index) => ({
                id: `completion-${index}`,
                label: expression,
                highlight: props.query,
              })),
            },
          ]
        : [];
    }, [expressionsKey, props.query]);

    useEffect(() => showSuggestions(sections), [showSuggestions, sections]);
    useEffect(() => () => showSuggestions([]), [showSuggestions]);

    return null;
  }
);
