import type {SearchEngine} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref} from 'lit/directives/ref.js';
import {eventPromise} from '@/src/utils/event-utils';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

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

  return currentDocIdentifier?.textContent === uniqueIdentifier;
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

// We can't access iframe.contentDocument until the element is added to the parent doc
//
// There are only 2 safe ways to get a callback when the iframe is added:
//   - Adding a MutationObserver on the parent document. Works, but very verbose, needs to be de-registered, and could interfere with other frameworks
//   - Adding a load event listener on the iframe. This is technically after the iframe loads its src, but since src is about:blank, it boils down to what we want.
const iframeConnectedEvent = async (
  iframe: HTMLIFrameElement,
  logger?: SearchEngine['logger']
) => {
  if (iframe.isConnected) {
    // The iframe is already connected.
    // There would likely be no load event to catch anyway.
    return;
  }

  // There could be edge cases where the iframe never loads, so add a timeout to gracefully handle errors.
  const timeoutMs = 1000;

  await eventPromise(iframe, 'load', timeoutMs).catch(() => {
    logger?.warn('Quickview timed out waiting for the iframe to load.');
  });
};

export interface QuickviewIframeProps {
  title: string;
  content?: string;
  onSetIframeRef: (ref: HTMLIFrameElement) => void;
  uniqueIdentifier?: string;
  sandbox?: string;
  src?: string;
  logger?: SearchEngine['logger'];
}

export const renderQuickviewIframe: FunctionalComponent<
  QuickviewIframeProps
> = ({props}) => {
  const {
    title,
    onSetIframeRef,
    uniqueIdentifier,
    content,
    sandbox,
    src,
    logger,
  } = props;

  // When a document is written with document.open/document.write/document.close
  // it is not synchronous and the content of the iframe is only available to be queried at the end of the current call stack.
  // This adds a "wait" (setTimeout 0) before calling the `onSetIframeRef` from the parent modal quickview
  const waitForIframeContentToBeWritten = () => {
    return new Promise((resolve) => setTimeout(resolve));
  };

  const handleRef = (el: Element | undefined) => {
    if (!el) return;

    const iframeRef = el as HTMLIFrameElement;

    if (!uniqueIdentifier || !content) {
      return;
    }

    // Wait for iframe to be ready before accessing contentDocument
    const writeContentWhenReady = async () => {
      await iframeConnectedEvent(iframeRef, logger);

      const documentWriter = iframeRef.contentDocument;
      if (!documentWriter) {
        if (src) {
          warnAboutLimitedUsageQuickview(logger);
          iframeRef.src = src;
        }

        return;
      }
      if (
        currentResultAlreadyWrittenToDocument(documentWriter, uniqueIdentifier)
      ) {
        return;
      }

      writeDocument(documentWriter, content);
      ensureSameResultIsNotOverwritten(documentWriter, uniqueIdentifier);

      await waitForIframeContentToBeWritten();
      onSetIframeRef(iframeRef);
    };

    // Execute async operation without blocking
    writeContentWhenReady();
  };

  return html`<iframe
    title=${title}
    src="about:blank"
    class="h-full w-full"
    sandbox=${
      // biome-ignore lint/suspicious/noExplicitAny: ifDefined requires 'any' for optional HTML attributes
      ifDefined(sandbox) as any
    }
    ${ref(handleRef)}
  ></iframe>`;
};
