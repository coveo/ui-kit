import {Result, SearchEngine} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';

const documentIdentifierInIframe = 'CoveoDocIdentifier';

const writeDocument = (documentWriter: Document, content: string) => {
  documentWriter.open();
  documentWriter.write(content);
  documentWriter.close();
  if (documentWriter.scrollingElement) {
    documentWriter.scrollingElement.scrollTop = 0;
  }
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

const warnAboutLimitedUsageQuickview = (logger?: SearchEngine['logger']) => {
  logger?.warn(
    'Quickview initialized in restricted mode due to incompatible sandboxing environment. Keywords hit navigation will be disabled.'
  );
};

export const QuickviewIframe: FunctionalComponent<{
  content?: string;
  onSetIframeRef: (ref: HTMLIFrameElement) => void;
  result?: Result;
  sandbox?: string;
  src?: string;
  logger?: SearchEngine['logger'];
}> = ({onSetIframeRef, result, content, sandbox, src, logger}) => {
  // When a document is written with document.open/document.write/document.close
  // it is not synchronous and the content of the iframe is only available to be queried at the end of the current call stack.
  // This add a "wait" (setTimeout 0) before calling the `onSetIframeRef` from the parent modal quickview
  const waitForIframeContentToBeWritten = () => {
    return new Promise((resolve) => setTimeout(resolve));
  };

  return (
    <iframe
      src="about:blank"
      class="w-full h-full"
      sandbox={sandbox}
      ref={async (el) => {
        const iframeRef = el as HTMLIFrameElement;

        if (!result || !content) {
          return;
        }

        const documentWriter = iframeRef.contentDocument;
        if (!documentWriter) {
          if (src) {
            warnAboutLimitedUsageQuickview(logger);
            iframeRef.src = src;
          }

          return;
        }
        if (currentResultAlreadyWrittenToDocument(documentWriter, result)) {
          return;
        }

        writeDocument(documentWriter, content);
        ensureSameResultIsNotOverwritten(documentWriter, result);

        await waitForIframeContentToBeWritten();
        onSetIframeRef(iframeRef);
      }}
    ></iframe>
  );
};
