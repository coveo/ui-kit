function observeRecursively(
  element: Node,
  callback: (mutations: MutationRecord[]) => void,
  isAlreadyObserved = false
): () => void {
  const disconnectCallbacks: (() => void)[] = [];
  if (!isAlreadyObserved) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        Array.from(mutation.addedNodes).forEach((node) => {
          disconnectCallbacks.push(observeRecursively(node, callback, true));
        });
        callback(mutations);
      });
    });
    observer.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    disconnectCallbacks.push(() => observer.disconnect());
  }
  if ((element as HTMLElement).shadowRoot) {
    disconnectCallbacks.push(
      observeRecursively((element as HTMLElement).shadowRoot!, callback, false)
    );
  }
  Array.from(element.childNodes).forEach((child) =>
    disconnectCallbacks.push(observeRecursively(child, callback, true))
  );
  return () => disconnectCallbacks.forEach((disconnect) => disconnect());
}

export function waitUntilNextSearchRendered() {
  cy.wrap(
    new Promise<void>((resolve) => {
      cy.get('atomic-search-interface').then(([searchInterface]) => {
        const lastSearchResponseId =
          searchInterface.engine?.state.search.searchResponseId;
        const disconnect = observeRecursively(searchInterface, () => {
          if (
            searchInterface.engine?.state.search.searchResponseId !==
            lastSearchResponseId
          ) {
            disconnect();
            resolve();
          }
        });
      });
    })
  );
}
