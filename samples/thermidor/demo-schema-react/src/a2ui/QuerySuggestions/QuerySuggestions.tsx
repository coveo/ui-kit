import {useCallback, useMemo, useState} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {QueryCompletion} from '@coveo/thermidor-schema';
import {QuerySuggestionsPropsSchema} from '@coveo/thermidor-schema/zod3';
import {PromptInput} from '../../components/PromptInput/PromptInput.js';
import {useSearchBoxOptions} from '../../components/SearchBox/search-box-options.js';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';

/**
 * PROTOTYPE (KIT-6367): A2-UI component for `QuerySuggestions`, drawn as the whole search box: the
 * input and its suggestions popover. It lives on the well-known search box surface, so it is there
 * on first paint. Each keystroke dispatches the `fetchSuggestions` lookup; the session sends it at
 * once and a newer one aborts the previous one.
 *
 * Completions show only while the input holds a query that has not been submitted. An empty input
 * sends no lookup, and a submit hides the completions until the next keystroke, so a lookup that
 * answers after the submit cannot reopen them.
 */
export const QuerySuggestions = createReactComponent(
  {
    name: 'QuerySuggestions',
    schema: QuerySuggestionsPropsSchema,
  },
  ({props, context}) => {
    const {onSubmit, isStreaming, placeholder, clearOnSubmit} = useSearchBoxOptions();
    const completions: QueryCompletion[] | undefined = props.completions;
    const [pendingQuery, setPendingQuery] = useState('');

    const sections = useMemo<SuggestionSection[]>(
      () =>
        pendingQuery.trim() && completions?.length
          ? [
              {
                id: 'search',
                title: 'Search',
                icon: 'search',
                items: completions.map(({expression}) => ({id: expression, label: expression})),
              },
            ]
          : [],
      [pendingQuery, completions]
    );

    const handleValueChange = useCallback(
      (query: string) => {
        setPendingQuery(query);
        if (query.trim()) {
          context.dispatchAction({event: {name: 'fetchSuggestions', context: {query}}});
        }
      },
      [context]
    );

    const submit = useCallback(
      (prompt: string) => {
        setPendingQuery('');
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
        onSuggestionSelect={(item) => submit(item.label)}
        onValueChange={handleValueChange}
      />
    );
  }
);
