import {useEffect, useMemo, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {FetchSuggestionsPayload} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';
import {useDebouncedValue} from '../../hooks/use-debounced-value.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import {useLatestWhenFree, useSessionBusy, useSurfaceLocked} from '../session-request.js';
import {useRecentQueryEdits} from './use-recent-query-edits.js';
import styles from './QuerySuggestions.module.css';

/** How long typing must pause before the query is sent with `fetchSuggestions`. */
export const SUGGESTIONS_DEBOUNCE_MS = 150;

/**
 * A2-UI component for `QuerySuggestions`: the session's recent queries matching its `SearchBox`'s
 * query, under "Recent searches", above the query's completions, in the search box's dropdown.
 * Once typing pauses, the query is sent with `fetchSuggestions` as soon as the session is free; an
 * empty query is sent when the input has the focus. The last suggestions stay shown while newer ones
 * are on their way, and hide if those fail. They are hidden after a submit until the next keystroke,
 * while the empty input does not have the focus, and while a request locks the page, such as an
 * answer streaming. Suggestions hidden by a submit, or by emptying the input, never show again.
 *
 * Removing a recent query, or clearing them, hides them at once, and sends `fetchSuggestions` for
 * the query again once the session has answered.
 */
export const QuerySuggestions = createReactComponent(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  ({props, context}) => {
    const {query, submitted, focused, showSuggestions} = useSearchBoxQuery();
    const locked = useSurfaceLocked();
    const busy = useSessionBusy();
    const typed = query.trim() ? query : '';
    const debouncedQuery = useDebouncedValue(typed, SUGGESTIONS_DEBOUNCE_MS);

    const {answered, hide, remove, clear, refreshed, announcement} = useRecentQueryEdits(
      ({name, payload}) => context.dispatchAction({event: {name, context: payload}})
    );

    // Sent once typing pauses, so the text typed before a submit is not sent after it.
    const wanted = !submitted && debouncedQuery === typed && (typed !== '' || focused);
    const request = useMemo(
      () => (wanted ? {query: debouncedQuery, answered} : undefined),
      [wanted, debouncedQuery, answered]
    );
    useLatestWhenFree(request, (latest) => {
      const payload: FetchSuggestionsPayload = {query: latest.query};
      void Promise.resolve(
        context.dispatchAction({event: {name: 'fetchSuggestions', context: payload}})
      ).then(() => refreshed(latest.answered));
    });

    const discarding = submitted || (typed === '' && props.query !== '');
    const [discardedQuery, setDiscardedQuery] = useState<string>();
    if (discarding && discardedQuery !== props.query) {
      setDiscardedQuery(props.query);
    }

    const awaitingNewer = busy || debouncedQuery !== typed;
    const current = props.query === typed || (awaitingNewer && props.query !== discardedQuery);
    const visible = !submitted && (typed !== '' || focused) && !locked && current;
    // Every replay of the stream rebuilds the lists, so the dropdown follows their entries.
    const recentQueries = visible ? hide(props.recentQueries) : [];
    const expressions = visible ? props.completions.map(({expression}) => expression) : [];
    const entriesKey = JSON.stringify([recentQueries, expressions]);
    const sections = useMemo<SuggestionSection[]>(() => {
      const [recent, completions] = JSON.parse(entriesKey) as [string[], string[]];
      const result: SuggestionSection[] = [];
      if (recent.length > 0) {
        result.push({
          id: 'recent',
          title: 'Recent searches',
          icon: 'history',
          items: recent.map((recentQuery, index) => ({
            id: `recent-${index}`,
            label: recentQuery,
            completes: props.query,
          })),
          action: {label: 'Clear', ariaLabel: 'Clear recent searches', onClick: clear},
          removal: {
            ariaLabel: ({label}) => `Remove ${label} from recent searches`,
            onRemove: ({label}) => remove(label),
          },
        });
      }
      if (completions.length > 0) {
        result.push({
          id: 'search',
          title: 'Query suggestions',
          icon: 'search',
          items: completions.map((expression, index) => ({
            id: `completion-${index}`,
            label: expression,
            highlight: props.query,
          })),
        });
      }
      return result;
    }, [entriesKey, props.query, clear, remove]);

    useEffect(() => showSuggestions(sections), [showSuggestions, sections]);
    useEffect(() => () => showSuggestions([]), [showSuggestions]);

    return (
      <div role="status" className={styles.announcement}>
        {announcement}
      </div>
    );
  }
);
