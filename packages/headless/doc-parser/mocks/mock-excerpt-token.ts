import {ExcerptTokenKind, IExcerptToken} from '@microsoft/api-extractor-model';

export function buildContentExcerptToken(text: string): IExcerptToken {
  return {kind: ExcerptTokenKind.Content, text};
}

export function buildReferenceExcerptToken(
  text: string,
  canonicalReference: string
): IExcerptToken {
  return {kind: ExcerptTokenKind.Reference, text, canonicalReference};
}
