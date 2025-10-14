import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';
import type {QuickviewWordHighlight} from '../quickview-word-highlight/quickview-word-highlight';

export const buildQuickviewPreviewBar = (
  words: Record<string, QuickviewWordHighlight>,
  highlightKeywords: HighlightKeywords,
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
  if (highlightKeywords.highlightNone) {
    bar.remove();
    return;
  }

  const docHeight = documentWriter.body.scrollHeight;
  Object.values(words).forEach((word) => {
    word.elements.forEach((wordElement) => {
      const previewUnit = buildPreviewUnit(
        documentWriter,
        word,
        wordElement,
        docHeight,
        highlightKeywords
      );

      bar.appendChild(previewUnit);
    });
  });

  documentWriter.body.appendChild(bar);
};

const buildPreviewBar = (documentWriter: Document) => {
  const previewBarId = 'CoveoPreviewBar';
  const bar =
    documentWriter.getElementById(previewBarId) ||
    documentWriter.createElement('div');

  bar.id = previewBarId;
  bar.innerHTML = '';
  bar.style.position = 'fixed';
  bar.style.top = '0';
  bar.style.right = '0';
  bar.style.width = '15px';
  bar.style.height = '100%';
  bar.setAttribute('aria-hidden', 'true');
  return bar;
};

const buildPreviewUnit = (
  documentWriter: Document,
  word: QuickviewWordHighlight,
  wordElement: HTMLElement,
  docHeight: number,
  highlightKeywords: HighlightKeywords
) => {
  const previewUnit = documentWriter.createElement('div');
  if (highlightKeywords.keywords[word.text]?.enabled === false) {
    previewUnit.style.display = 'none';
    return previewUnit;
  }

  const elementPosition = wordElement.getBoundingClientRect().top;

  previewUnit.style.position = 'absolute';
  previewUnit.style.top = `${(elementPosition / docHeight) * 100}%`;
  previewUnit.style.width = '100%';
  previewUnit.style.height = '1px';
  previewUnit.style.border = `1px solid ${word.previewBorderColor}`;
  previewUnit.style.backgroundColor = word.color;
  return previewUnit;
};
