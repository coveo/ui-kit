import {useCallback, useMemo} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {QueryCompletion} from '@coveo/thermidor-schema';
import {
  DataBindingSchema,
  FunctionCallSchema,
  QuerySuggestionsStateSchema,
} from '@coveo/thermidor-schema/zod3';
import {z} from 'zod';
import {PromptInput} from '../../components/PromptInput/PromptInput.js';
import {useSearchBoxOptions} from '../../components/SearchBox/search-box-options.js';
import type {SuggestionSection} from '../../components/SuggestionsDropdown/index.js';

// The schema generates no props schema for `QuerySuggestions`, which no catalog places yet. This
// one follows the generated ones, for the fields this renderer reads.
const QuerySuggestionsPropsSchema = z.object({
  query: z.union([QuerySuggestionsStateSchema.shape.query, DataBindingSchema, FunctionCallSchema]),
  completions: z.union([
    QuerySuggestionsStateSchema.shape.completions,
    DataBindingSchema,
    FunctionCallSchema,
  ]),
});

/**
 * PROTOTYPE (KIT-6367): A2-UI component for `QuerySuggestions`, drawn as the whole search box: the
 * input and its suggestions popover. It lives on the well-known search box surface, so it is there
 * on first paint. Each keystroke dispatches the `fetchSuggestions` lookup; the session sends it at
 * once and a newer one aborts the previous one.
 */
export const QuerySuggestions = createReactComponent(
  {
    name: 'QuerySuggestions',
    schema: QuerySuggestionsPropsSchema,
  },
  ({props, context}) => {
    const {onSubmit, isStreaming, placeholder, clearOnSubmit, extraSections} =
      useSearchBoxOptions();
    const completions: QueryCompletion[] | undefined = props.completions;

    const sections = useMemo<SuggestionSection[]>(
      () => [
        ...(completions?.length
          ? [
              {
                id: 'search',
                title: 'Search',
                icon: 'search' as const,
                items: completions.map(({expression}) => ({id: expression, label: expression})),
              },
            ]
          : []),
        ...(extraSections ?? []),
      ],
      [completions, extraSections]
    );

    const fetchSuggestions = useCallback(
      (query: string) => {
        context.dispatchAction({event: {name: 'fetchSuggestions', context: {query}}});
      },
      [context]
    );

    return (
      <PromptInput
        onSubmit={onSubmit}
        busy={isStreaming}
        placeholder={placeholder}
        clearOnSubmit={clearOnSubmit}
        suggestions={sections}
        onSuggestionSelect={(item) => onSubmit(item.label)}
        onValueChange={fetchSuggestions}
      />
    );
  }
);
