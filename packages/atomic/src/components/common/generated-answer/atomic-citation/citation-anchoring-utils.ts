export function extractTextToHighlight(text: string) {
  text = text.trim();
  const sentenceRegex =
    /(?<=^|\p{P}\s)\p{P}?\p{Lu}.*?[.!?]+(?=\s+(?:\p{Lu}|\d)|$)/gu;
  const fallbackWordCount = 5;
  const sentences = text.match(sentenceRegex);
  if (sentences?.length) {
    return sentences[0].trim();
  }
  return text.split(/\s+/).slice(0, fallbackWordCount).join(' ');
}

export function generateTextFragmentUrl(
  uri: string,
  text?: string,
  filetype?: string
) {
  if (filetype !== 'html' || !text) {
    return uri;
  }
  const highlight = extractTextToHighlight(text);
  const encodedTextFragment = encodeURIComponent(highlight).replace(
    /-/g,
    '%2D'
  );
  return `${uri}#:~:text=${encodedTextFragment}`;
}

export function generatePdfPageUrl(uri: string, pageNumber?: number) {
  if (!pageNumber || pageNumber <= 0) {
    return uri;
  }
  return `${uri}#page=${pageNumber}`;
}
