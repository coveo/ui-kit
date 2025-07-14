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
