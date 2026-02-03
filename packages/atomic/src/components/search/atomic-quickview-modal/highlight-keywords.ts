export interface HighlightKeywords {
  highlightNone: boolean;
  keywords: {
    [text: string]: {
      indexIdentifier: string;
      enabled: boolean;
    };
  };
}
