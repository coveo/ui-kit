# atomic-result



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Default     |
| --------------------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `engine` _(required)_ | --        |             | `Engine<SearchAppState>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `undefined` |
| `result` _(required)_ | --        |             | `{ title: string; uri: string; printableUri: string; clickUri: string; uniqueId: string; excerpt: string; firstSentences: string; summary: null; flags: string; hasHtmlVersion: boolean; hasMobileHtmlVersion: boolean; score: number; percentScore: number; rankingInfo: string \| null; rating: number; isTopResult: boolean; isRecommendation: boolean; isUserActionView: boolean; titleHighlights: HighlightKeyword[]; firstSentencesHighlights: HighlightKeyword[]; excerptHighlights: HighlightKeyword[]; printableUriHighlights: HighlightKeyword[]; summaryHighlights: HighlightKeyword[]; parentResult: null; childResults: Result[]; totalNumberOfChildResults: number; absentTerms: string[]; raw: Raw; Title: string; Uri: string; PrintableUri: string; ClickUri: string; UniqueId: string; Excerpt: string; FirstSentences: string; rankingModifier?: string \| undefined; }` | `undefined` |


## Dependencies

### Used by

 - [atomic-result-list](../atomic-result-list)

### Graph
```mermaid
graph TD;
  atomic-result-list --> atomic-result
  style atomic-result fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
