import {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';

const buildPreviewBar = (documentWriter: Document) => {
  const bar = documentWriter.createElement('div');
  bar.style.position = 'fixed';
  bar.style.top = '0';
  bar.style.right = '0';
  bar.style.width = '15px';
  bar.style.height = '100%';
  return bar;
};

const buildPreviewUnit = (
  documentWriter: Document,
  word: QuickviewWordHighlight,
  wordElement: HTMLElement,
  docHeight: number
) => {
  const elementPosition = wordElement.getBoundingClientRect().top;
  const previewUnit = documentWriter.createElement('div');
  previewUnit.style.position = 'absolute';
  previewUnit.style.top = `${(elementPosition / docHeight) * 100}%`;
  previewUnit.style.width = '100%';
  previewUnit.style.height = '1px';
  previewUnit.style.border = `1px solid ${word.saturateColor}`;
  previewUnit.style.backgroundColor = word.color;
  return previewUnit;
};

export const buildQuickviewPreviewBar = (
  words: Record<string, QuickviewWordHighlight>,
  iframe?: HTMLIFrameElement
) => {
  if (!iframe) {
    return;
  }
  const documentWriter = iframe.contentDocument;
  if (!documentWriter) {
    return;
  }
  const bar = buildPreviewBar(documentWriter);
  const docHeight = documentWriter.body.scrollHeight;

  Object.values(words).forEach((word) => {
    word.elements.forEach((wordElement) => {
      const previewUnit = buildPreviewUnit(
        documentWriter,
        word,
        wordElement,
        docHeight
      );

      bar.appendChild(previewUnit);
    });
  });
  documentWriter.body.appendChild(bar);
};
