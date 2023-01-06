import {FunctionalComponent, h} from '@stencil/core';

const autoresize = (documentWriter: Document, iframeRef: HTMLIFrameElement) => {
  // This "reset" of the iframe height allows the recalculation of the proper height needed for new content being added to the iframe
  // when the end user navigates through the available quickview
  // Since setting a new height on the iframe will cause the resize observer to essentially "call itself", we also add a flag to stop double resizing
  iframeRef.style.height = '0';

  let shouldRecalculateResize = true;
  const arbitraryMarginToComfortablyReadLastLineOfText = 20;

  new ResizeObserver(([documentElementObserved]) => {
    if (iframeRef && shouldRecalculateResize) {
      iframeRef.style.height = `${
        documentElementObserved.contentRect.height +
        arbitraryMarginToComfortablyReadLastLineOfText
      }px`;
    }
    shouldRecalculateResize = !shouldRecalculateResize;
  }).observe(documentWriter.documentElement);
};

const writeDocument = (documentWriter: Document, content: string) => {
  documentWriter.open();
  documentWriter.write(content);
  documentWriter.close();
};

export const QuickviewIframe: FunctionalComponent<{
  content?: string;
  onSetIframeRef: (ref: HTMLIFrameElement) => void;
}> = ({content, onSetIframeRef}) => {
  return (
    <iframe
      class="w-full"
      ref={(el) => {
        const iframeRef = el as HTMLIFrameElement;

        if (!content) {
          return;
        }

        const documentWriter = iframeRef.contentDocument;
        if (!documentWriter) {
          return;
        }

        writeDocument(documentWriter, content);
        autoresize(documentWriter, iframeRef);
        onSetIframeRef(iframeRef);
      }}
    ></iframe>
  );
};
