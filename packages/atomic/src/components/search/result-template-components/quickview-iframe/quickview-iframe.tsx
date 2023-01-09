import {Result} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';

const documentIdentifierInIframe = 'CoveoDocIdentifier';

const writeDocument = (documentWriter: Document, content: string) => {
  documentWriter.open();
  documentWriter.write(content);
  documentWriter.close();
};

const currentResultAlreadyWrittenToDocument = (
  documentWriter: Document,
  result: Result
) => {
  const currentDocIdentifier = documentWriter.getElementById(
    documentIdentifierInIframe
  );

  return (
    currentDocIdentifier && currentDocIdentifier.textContent === result.uniqueId
  );
};

const ensureSameResultIsNotOverwritten = (
  documentWriter: Document,
  result: Result
) => {
  const docIdentifier = documentWriter.createElement('div');
  docIdentifier.style.display = 'none';
  docIdentifier.setAttribute('aria-hidden', 'true');
  docIdentifier.id = documentIdentifierInIframe;
  docIdentifier.textContent = result.uniqueId;
  documentWriter.body.appendChild(docIdentifier);
};

export const QuickviewIframe: FunctionalComponent<{
  content?: string;
  onSetIframeRef: (ref: HTMLIFrameElement) => void;
  result?: Result;
}> = ({onSetIframeRef, result, content}) => {
  return (
    <iframe
      class="w-full h-full"
      ref={(el) => {
        const iframeRef = el as HTMLIFrameElement;

        if (!result || !content) {
          return;
        }

        const documentWriter = iframeRef.contentDocument;
        if (!documentWriter) {
          return;
        }
        if (currentResultAlreadyWrittenToDocument(documentWriter, result)) {
          return;
        }

        writeDocument(documentWriter, content);
        ensureSameResultIsNotOverwritten(documentWriter, result);

        onSetIframeRef(iframeRef);
      }}
    ></iframe>
  );
};
