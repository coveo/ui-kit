/**
 * Extracts a text to highlight from a given text.
 * It tries to extract the first sentence, and if it fails, it returns the first few words.
 * @param {string} text The text from which to extract the text to highlight.
 * @returns {string} The extracted text to highlight.
 */
export function extractTextToHighlight(text) {
  const fallbackWordCount = 5;

  const trimmedText = text.trim();
  if (!trimmedText || typeof trimmedText !== 'string') {
    return '';
  }

  const sentenceRegex =
    /(?<=^|\p{P}\s)\p{P}?\p{Lu}.*?[.!?]+(?=\s+(?:\p{Lu}|\d)|$)/gu;
  const sentences = trimmedText.match(sentenceRegex);

  if (Array.isArray(sentences) && sentences?.length > 0) {
    return sentences[0].trim();
  }

  return trimmedText.split(/\s+/).slice(0, fallbackWordCount).join(' ');
}

/**
 * Generates an encoded text fragment URL for the citation.
 * This URL will highlight the text in the citation if it is an HTML file.
 * @param {string} uri
 * @param {string} text
 * @returns {string}
 * @example
 * generateTextFragmentUrl('https://example.com', 'This is a sample text.');
 * // Returns: 'https://example.com#:~:text=This%20is%20a%20sample%20text.'
 */
export function generateTextFragmentUrl(uri, text) {
  const highlight = extractTextToHighlight(text);
  const encodedTextFragment = encodeURIComponent(highlight).replace(
    /-/g,
    '%2D'
  );
  return `${uri}#:~:text=${encodedTextFragment}`;
}
