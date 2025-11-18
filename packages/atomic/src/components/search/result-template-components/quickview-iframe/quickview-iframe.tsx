import {SearchEngine} from '@coveo/headless';
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
  uniqueIdentifier: string
) => {
  const currentDocIdentifier = documentWriter.getElementById(
    documentIdentifierInIframe
  );

  return (
    currentDocIdentifier &&
    currentDocIdentifier.textContent === uniqueIdentifier
  );
};

const ensureSameResultIsNotOverwritten = (
  documentWriter: Document,
  uniqueIdentifier: string
) => {
  const docIdentifier = documentWriter.createElement('div');
  docIdentifier.style.display = 'none';
  docIdentifier.setAttribute('aria-hidden', 'true');
  docIdentifier.id = documentIdentifierInIframe;
  docIdentifier.textContent = uniqueIdentifier;
  documentWriter.body.appendChild(docIdentifier);
};

const warnAboutLimitedUsageQuickview = (logger?: SearchEngine['logger']) => {
  logger?.warn(
    'Quickview initialized in restricted mode due to incompatible sandboxing environment. Keywords hit navigation will be disabled.'
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const QuickviewIframe: FunctionalComponent<{
  title: string;
  content?: string;
  onSetIframeRef: (ref: HTMLIFrameElement) => void;
  uniqueIdentifier?: string;
  sandbox?: string;
  src?: string;
  logger?: SearchEngine['logger'];
}> = ({title, onSetIframeRef, uniqueIdentifier, content, sandbox, src, logger}) => {
  // When a document is written with document.open/document.write/document.close
  // it is not synchronous and the content of the iframe is only available to be queried at the end of the current call stack.
  // This add a "wait" (setTimeout 0) before calling the `onSetIframeRef` from the parent modal quickview
  const flushMicrotasks = () => {
    return new Promise((resolve) => setTimeout(resolve));
  };

  return (
    <iframe
      title={title}
      src="about:blank"
      class="h-full w-full"
      sandbox={sandbox}
      ref={async (el) => {
        const iframeRef = el as HTMLIFrameElement;

        if (!uniqueIdentifier || !content) {
          return;
        }

        if(iframeRef.isConnected === false) {
          await flushMicrotasks();
        }

        const documentWriter = iframeRef.contentDocument;
        if (!documentWriter) {
          if (src) {
            warnAboutLimitedUsageQuickview(logger);
            iframeRef.src = src;
          }

          return;
        }
        if (
          currentResultAlreadyWrittenToDocument(
            documentWriter,
            uniqueIdentifier
          )
        ) {
          return;
        }

        writeDocument(documentWriter, content);
        ensureSameResultIsNotOverwritten(documentWriter, uniqueIdentifier);

        await flushMicrotasks();
        onSetIframeRef(iframeRef);
      }}
    ></iframe>
  );
};
