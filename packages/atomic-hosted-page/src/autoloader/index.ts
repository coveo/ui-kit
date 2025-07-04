const componentMap = {
  'atomic-hosted-ui': async () =>
    await import('../components/atomic-hosted-ui/atomic-hosted-ui.js'),
} as Record<string, () => Promise<unknown>>;

if (typeof window !== 'undefined') {
  /**
   * Checks a node for undefined elements and attempts to register them.
   */
  const discover = async (root: Element | ShadowRoot | DocumentFragment) => {
    const rootTagName =
      root instanceof Element ? root.tagName.toLowerCase() : '';
    const rootIsAtomicElement = rootTagName?.startsWith('atomic-');
    const tags = [...root.querySelectorAll(':not(:defined)')]
      .map((el) => el.tagName.toLowerCase())
      .filter((tag) => tag.startsWith('atomic-'));

    // If the root element is an undefined Atomic component, add it to the list
    if (rootIsAtomicElement && !customElements.get(rootTagName)) {
      tags.push(rootTagName);
    }

    if (rootIsAtomicElement) {
      const childTemplates = root.querySelectorAll('template');
      //This is necessary to load the components that are inside the templates
      for (const template of childTemplates) {
        await discover(template.content);
        observer.observe(template.content, {subtree: true, childList: true});
      }
      //TODO: This part should not be necessary: instead, if component-a uses component-b, component-a should be responsible for loading component-b
      if ('shadowRoot' in root && root.shadowRoot) {
        void discover(root.shadowRoot);
        observer.observe(root.shadowRoot, {subtree: true, childList: true});
      }
    }
    // Make the list unique
    const tagsToRegister = [...new Set(tags)];
    await Promise.allSettled(
      tagsToRegister.map((tagName) => register(tagName))
    );
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

    return componentMap[tagName]?.();
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
    // Initial discovery
    void discover(document.body);
    // Listen for new undefined elements
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
    });
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event#checking_whether_loading_is_already_complete
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDiscovery);
  } else {
    initializeDiscovery();
  }
}
//# sourceMappingURL=index.js.map
