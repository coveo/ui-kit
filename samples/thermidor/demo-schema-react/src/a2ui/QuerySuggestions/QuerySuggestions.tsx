import {useEffect, useMemo, useState} from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import type {FetchSuggestionsPayload} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';
import {useDebouncedValue} from '../../hooks/use-debounced-value.js';
import {useSearchBoxQuery} from '../SearchBox/search-box-context.js';
import {
  useConcurrentInFlight,
  useDispatchOutcome,
  useLatestWhenFree,
  useSessionBusy,
  useSurfaceLocked,
  type NodeAction,
} from '../session-request.js';
import {useRecentQueryEdits} from './use-recent-query-edits.js';
import styles from './QuerySuggestions.module.css';

/** How long typing must pause before the query is sent with `fetchSuggestions`. */
export const SUGGESTIONS_DEBOUNCE_MS = 150;

/**
 * A2-UI component for `QuerySuggestions`: the session's recent queries, under "Recent searches",
 * above the completions of its `SearchBox`'s query. The query is sent with `fetchSuggestions` once
 * typing pauses, and an empty one while the input has the focus. It waits for the session to be
 * free unless the producer announces `fetchSuggestions` as concurrent (ADR-020).
 */
export const QuerySuggestions = createComponentImplementation(
  {name: 'QuerySuggestions', schema: QuerySuggestionsPropsSchema},
  // TODO(a2ui-react context): `context` is deprecated in @a2ui/react 0.16. Build this through
  // `view({node, buildChild})` (or a shared helper): props from `useNodeView`, and dispatch with
  // `useA2uiSurface()?.dispatchAction(action, node.componentId)`.
  ({props, context}) => {
    const {query, submitted, focused, showSuggestions} = useSearchBoxQuery();
    const locked = useSurfaceLocked();
    const busy = useSessionBusy();
    const typed = query.trim() ? query : '';
    const debouncedQuery = useDebouncedValue(typed, SUGGESTIONS_DEBOUNCE_MS);

    const {answered, hide, remove, clear, refreshed, announcement} = useRecentQueryEdits(
      ({name, payload}) => context.dispatchAction({event: {name, context: payload}})
    );

    // The answer for the empty input goes stale once the shopper leaves it, as a search may follow:
    // it shows again only once an answer fetched since then settles.
    const emptyShown = focused && !submitted;
    const [wasEmptyShown, setWasEmptyShown] = useState(emptyShown);
    const [emptyEpoch, setEmptyEpoch] = useState(0);
    const [freshEmptyEpoch, setFreshEmptyEpoch] = useState<number>();
    if (emptyShown !== wasEmptyShown) {
      setWasEmptyShown(emptyShown);
      if (!emptyShown) {
        setEmptyEpoch(emptyEpoch + 1);
      }
    }

    // Sent once typing pauses, so the text typed before a submit is not sent after it. A request
    // that locks the surface, such as a prompt's turn, holds it back even when the producer answers
    // suggestions beside it: the turn may change the recent queries, so the query goes out when
    // it ends, and again if it was sent before it.
    const wanted = !submitted && !locked && debouncedQuery === typed && (typed !== '' || focused);
    const epoch = debouncedQuery === '' ? emptyEpoch : undefined;
    const request = useMemo(
      () => (wanted ? {query: debouncedQuery, answered, epoch} : undefined),
      [wanted, debouncedQuery, answered, epoch]
    );
    const surfaceId = context.dataContext.surface?.id;
    const nodeId = context.componentModel.id;
    const suggestions = useMemo<NodeAction | undefined>(
      () =>
        surfaceId === undefined
          ? undefined
          : {surfaceId, sourceComponentId: nodeId, name: 'fetchSuggestions'},
      [surfaceId, nodeId]
    );
    // A concurrent suggestion is not the session's request: the session lists it apart.
    const suggestionsInFlight = useConcurrentInFlight(suggestions);
    const dispatchOutcome = useDispatchOutcome();
    useLatestWhenFree(
      request,
      (latest) => {
        const payload: FetchSuggestionsPayload = {query: latest.query};
        const send = () =>
          context.dispatchAction({event: {name: 'fetchSuggestions', context: payload}});
        // Only an applied suggestion refreshes the lists: a superseded one leaves that to the
        // dispatch that took over.
        void (
          suggestions === undefined
            ? Promise.resolve(send()).then(() => 'applied')
            : dispatchOutcome(suggestions, send)
        ).then((outcome) => {
          if (outcome !== 'applied') {
            return;
          }
          if (latest.epoch !== undefined) {
            setFreshEmptyEpoch(latest.epoch);
          }
          refreshed(latest.answered);
        });
      },
      suggestions
    );

    const discarding = submitted || (typed === '' && props.query !== '');
    const [discardedQuery, setDiscardedQuery] = useState<string>();
    if (discarding && discardedQuery !== props.query) {
      setDiscardedQuery(props.query);
    }

    const awaitingNewer = busy || suggestionsInFlight || debouncedQuery !== typed;
    // The answer for the empty input never stands in for typed text, which it does not filter.
    const current =
      typed === ''
        ? props.query === '' && freshEmptyEpoch === emptyEpoch
        : props.query !== '' &&
          (props.query === typed || (awaitingNewer && props.query !== discardedQuery));
    const visible = !submitted && (typed !== '' || focused) && !locked && current;
    // Every replay of the stream rebuilds the lists, so the dropdown follows their entries.
    const recentQueries = visible ? hide(props.recentQueries) : [];
    const expressions = visible ? props.completions.map(({expression}) => expression) : [];
    const entriesKey = JSON.stringify([recentQueries, expressions]);
    const sections = useMemo<SuggestionSection[]>(() => {
      const [recent, completions] = JSON.parse(entriesKey) as [string[], string[]];
      const all: SuggestionSection[] = [
        {
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
        },
        {
          id: 'search',
          title: 'Query suggestions',
          icon: 'search',
          items: completions.map((expression, index) => ({
            id: `completion-${index}`,
            label: expression,
            highlight: props.query,
          })),
        },
      ];
      return all.filter(({items}) => items.length > 0);
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
