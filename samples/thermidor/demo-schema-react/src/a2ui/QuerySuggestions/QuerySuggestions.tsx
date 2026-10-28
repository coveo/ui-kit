import {useEffect, useMemo} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchSuggestionsPayload} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';
import {useDebouncedValue} from '../../hooks/use-debounced-value.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import {useLatestWhenFree} from '../session-request.js';

/** How long typing must pause before the query is sent with `fetchSuggestions`. */
export const SUGGESTIONS_DEBOUNCE_MS = 150;

/**
 * A2-UI component for `QuerySuggestions`: the completions of its `SearchBox`'s query, shown in the
 * search box's dropdown. Once typing pauses, the query is sent with `fetchSuggestions` as soon as
 * the session is free, unless it is empty. The completions show only while they answer the query
 * in the input, and not after a submit until the next keystroke.
 */
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props, context}) => {
    const {query, submitted, showSuggestions} = useSearchBoxQuery();
    const debouncedQuery = useDebouncedValue(query.trim() ? query : '', SUGGESTIONS_DEBOUNCE_MS);

    useLatestWhenFree(submitted ? '' : debouncedQuery, (latest) => {
      const payload: FetchSuggestionsPayload = {query: latest};
      context.dispatchAction({event: {name: 'fetchSuggestions', context: payload}});
    });

    const visible = !submitted && query.trim() !== '' && props.query === query;
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
              })),
            },
          ]
        : [];
    }, [expressionsKey]);

    useEffect(() => showSuggestions(sections), [showSuggestions, sections]);
    useEffect(() => () => showSuggestions([]), [showSuggestions]);

    return null;
  }
);
