//@ts-expect-error TODO: Simplify path to target some kind of index file?
import elementMap from '../components/components/lazy-index.js';

export function registerAutoloader(
  roots?:
    | (Element | ShadowRoot | DocumentFragment)[]
    | Element
    | ShadowRoot
    | DocumentFragment
) {
  if (typeof window === 'undefined') {
    return;
  }

  roots ??= [document.documentElement];
  roots = Array.isArray(roots) ? roots : [roots];
  /**
   * Observes a stencil element for hydration and discovers its shadowRoot when hydrated.
   */
  const observeStencilElementHydration = (atomicElement: Element) => {
    const attributeObserver = new MutationObserver(() => {
      if (atomicElement.classList.contains('hydrated')) {
        attributeObserver.disconnect();
        if ('shadowRoot' in atomicElement && atomicElement.shadowRoot) {
          void discover(atomicElement);
        }
      }
    });

    attributeObserver.observe(atomicElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  };

  /**
   * Checks a node for undefined elements and attempts to register them.
   */
  const discover = async (root: Element | ShadowRoot | DocumentFragment) => {
    const rootTagName =
      root instanceof Element ? root.tagName.toLowerCase() : '';
    const rootIsAtomicElement = rootTagName?.startsWith('atomic-');
    const allAtomicElements = [...root.querySelectorAll('*')].filter((el) =>
      el.tagName.toLowerCase().startsWith('atomic-')
    );

    // If the root element is an undefined Atomic component, add it to the list
    if (
      rootIsAtomicElement &&
      root instanceof Element &&
      !customElements.get(rootTagName)
    ) {
      allAtomicElements.push(root);
    }
    if (rootIsAtomicElement) {
      const childTemplates = root.querySelectorAll('template');
      //This is necessary to load the components that are inside the templates
      for (const template of childTemplates) {
        void discover(template.content);
        observer.observe(template.content, {subtree: true, childList: true});
      }
      //TODO: This part should not be necessary: instead, if component-a uses component-b, component-a should be responsible for loading component-b
      if ('shadowRoot' in root && root.shadowRoot) {
        void discover(root.shadowRoot);
        observer.observe(root.shadowRoot, {subtree: true, childList: true});
      }
    }
    const litRegistrationPromises = [];
    for (const atomicElement of allAtomicElements) {
      const tagName = atomicElement.tagName.toLowerCase();
      if (tagName in elementMap && !customElements.get(tagName)) {
        // The element uses Lit already, we don't need to jam the lazy loader in the Shadow DOM.
        litRegistrationPromises.push(register(tagName));
        continue;
      }
      if ('shadowRoot' in atomicElement && atomicElement.shadowRoot) {
        void discover(atomicElement);
        continue;
      }
      if (atomicElement.classList.contains('hydrated')) {
        // The element is already hydrated, if there's no shadowRoot, it's a light DOM element, no need to jam the lazy loader in the Shadow DOM.
        continue;
      }
      observeStencilElementHydration(atomicElement);
    }
    await Promise.allSettled(litRegistrationPromises);
    customElements.upgrade(root);
  };

  /**
   * Registers an element by tag name.
   */
  const register = (tagName: string) => {
    // If the element is already defined, there's nothing more to do
    if (customElements.get(tagName)) {
      return Promise.resolve();
    }

    return elementMap[tagName]?.();
  };

  const observer = new MutationObserver((mutations) => {
    for (const {addedNodes} of mutations) {
      for (const node of addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          void discover(node as Element);
        }
      }
    }
  });

  const initializeDiscovery = () => {
    for (const root of roots) {
      // Initial discovery
      void discover(root);
      // Listen for new undefined elements
      observer.observe(root, {
        subtree: true,
        childList: true,
      });
    }
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event#checking_whether_loading_is_already_complete
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiscovery);
  } else {
    initializeDiscovery();
  }
}
//# sourceMappingURL=index.js.map
