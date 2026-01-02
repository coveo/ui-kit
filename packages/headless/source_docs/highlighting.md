---
title: Implement highlighting
group: Usage
slug: usage/implement-highlighting
---
# Implement highlighting
Coveo Headless offers highlighting for the following search elements:

* [query suggestions](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchBox.html#state)
* [result list elements](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.Result.html):
  * title
  * excerpt
  * printable URI
  * first sentences
  * summary

This article explains how to implement highlighting in your Headless search interface.

## Highlight Query Suggestions

Let’s assume that you have a [`SearchBox`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SearchBox.html) component which offers clickable suggestions.

Each time you add or delete a character in the search field, Headless performs a [`querySuggest`](https://docs.coveo.com/en/13#operation/querySuggestPost) request to the Search API.

The response includes highlights and may look like this:

```json
{
  "completions" :
  [
    {
      "expression" : "pdf",
      "score" : 1019.0259590148926,
      "highlighted" : "{pdf}",
      "executableConfidence" : 1.0,
      "objectId" : "20c05008-3afc-5f4e-9695-3ec326a5f745"
    }, {
      "expression" : "filetype pdf",
      "score" : 19.025959014892578,
      "highlighted" : "[filetype] {pdf}",
      "executableConfidence" : 1.0,
      "objectId" : "39089349-6e45-5c18-991c-7158143ec468"
    }
  ],
  "responseId" : "9373a3c0-2c5c-4c9d-8adf-8bffd253ae3d"
}
```

To highlight query suggestions, update the target `SearchBox` controller instance as shown in the following code:

```typescript
import {SearchBox as HeadlessSearchBox, buildSearchBox} from '@coveo/headless';
import {headlessEngine} from '../engine';
import {FunctionComponent, useEffect, useState} from 'react';

export const searchBox = buildSearchBox(headlessEngine, { ①
  options: {
    highlightOptions: {
      notMatchDelimiters: {
        open: '<strong>',
        close: '</strong>',
      },
      correctionDelimiters: {
        open: '<i>',
        close: '</i>',
      },
    },
  },
});
interface SearchBoxProps {
  controller: HeadlessSearchBox;
}

const suggestionStyle = {
  cursor: 'pointer',
};

export const SearchBox: FunctionComponent<SearchBoxProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), [
    controller,
  ]);

  return (
    <div className="search-box">
      <input
        value={state.value}
        onChange={(e) => controller.updateText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && controller.submit()}
      />
      {state.suggestions.length > 0 && ( ②
        <ul>
          {state.suggestions.map((suggestion) => {
            return (
              <li
                style={suggestionStyle}
                key={suggestion.rawValue}
                onClick={() => controller.selectSuggestion(suggestion.rawValue)}
                dangerouslySetInnerHTML={{__html: suggestion.highlightedValue}} ③
              ></li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
```
1. Adds the highlighting delimiters during initialization of a `SearchBox` controller instance (see [`SuggestionHighlightingOptions`](https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.SuggestionHighlightingOptions.html)).
If you use valid HTML tags as shown in this example, Headless interprets them as tags rather than as regular text.
2. Adds a condition on showing a bulleted list of suggestions (if any).
3. Applies highlighting to the suggestions.
The highlighting depends on responses from the Search API.

## Highlight Result Elements

Highlighting result elements operates a bit differently, but it employs the same approach as with the `SearchBox` component.
You can specify what and how you want to highlight using the `highlightString` method.

For example, you can highlight the excerpts in your result list as shown below.

```typescript
import {
  Result,
  ResultList as HeadlessResultList,
  buildResultList,
  HighlightUtils, ①
} from '@coveo/headless';
import {headlessEngine} from '../engine';
import {FunctionComponent, useEffect, useState} from 'react';

export const resultList = buildResultList(headlessEngine);
interface ResultListProps {
  controller: HeadlessResultList;
}

export const ResultList: FunctionComponent<ResultListProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), [
    controller,
  ]);

  if (!state.results.length) {
    return <div>No results</div>;
  }

  const highlightExcerpt = (result: Result) => { ②
    return HighlightUtils.highlightString({
      content: result.excerpt,
      highlights: result.excerptHighlights,
      openingDelimiter: '<strong>',
      closingDelimiter: '</strong>',
    });
  };

  return (
    <div className="result-list">
      <ul>
        {state.results.map((result) => (
          <li key={result.uniqueId}>
            <article>
              <h2>{result.title}</h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: highlightExcerpt(result), ③
                }}
              ></p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};
```
1. Imports the `HighlightUtils` module so you can use the `highlightString` method in your component.
2. Creates a custom function that returns the value of the `highlightString` method, which requires the following arguments:
   * `content`, the element to highlight
   * `highlights`, an object with highlights
   * `openingDelimiter`, a string representing the opening delimiter
   * `closingDelimiter`, a string representing the closing delimiter
3. Inserts an excerpt with highlighted strings right after the title.