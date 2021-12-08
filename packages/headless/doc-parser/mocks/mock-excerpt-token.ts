import {ExcerptTokenKind, IExcerptToken} from '@microsoft/api-extractor-model';

export function buildContentExcerptToken(text: string): IExcerptToken {
  return {kind: 'Content' as ExcerptTokenKind, text};
}

export function buildReferenceExcerptToken(
  text: string,
  canonicalReference: string
): IExcerptToken {
  return {kind: 'Reference' as ExcerptTokenKind, text, canonicalReference};
}
