import {FunctionalComponent, h} from '@stencil/core';

export const QuerySuggestionContainer: FunctionalComponent = (_, children) => {
  return (
    <div part="query-suggestion-content" class="flex items-center">
      {children}
    </div>
  );
};

interface QuerySuggestionIconProps {
  icon: string;
  hasSuggestion: boolean;
}

export const QuerySuggestionIcon: FunctionalComponent<
  QuerySuggestionIconProps
> = ({icon, hasSuggestion}) => {
  if (!hasSuggestion) {
    return;
  }

  return (
    <atomic-icon
      part="query-suggestion-icon"
      icon={icon}
      class="w-4 h-4 mr-2 shrink-0"
    ></atomic-icon>
  );
};

interface QuerySuggestionTextProps {
  suggestion: {highlightedValue: string; rawValue: string};
  hasQuery: boolean;
}

export const QuerySuggestionText: FunctionalComponent<
  QuerySuggestionTextProps
> = ({suggestion, hasQuery}) => {
  if (hasQuery) {
    return (
      <span
        part="query-suggestion-text"
        class="break-all line-clamp-2"
        innerHTML={suggestion.highlightedValue}
      ></span>
    );
  }

  return (
    <span part="query-suggestion-text" class="break-all line-clamp-2">
      {suggestion.rawValue}
    </span>
  );
};
