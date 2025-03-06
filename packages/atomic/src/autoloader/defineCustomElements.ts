//@ts-expect-error TODO: Simplify path to target some kind of index file?
import elementsMap from '../../components/components/lazy-index.js';

export function defineCustomElements(
  root?: Element | ShadowRoot | DocumentFragment | Document
) {
  if (typeof window === 'undefined') {
    return;
  }
  if (!root) {
    root = document;
  }

  /**
   * Checks a node for undefined elements and attempts to register them.
   */
  const discover = async (root: Element | ShadowRoot | DocumentFragment) => {
    const rootTagName =
      root instanceof Element ? root.tagName.toLowerCase() : '';
    const rootIsAtomicElement = rootTagName?.startsWith('atomic-');
    const atomicElements = [...root.querySelectorAll(':not(:defined)')].filter(
      (el) => el.tagName.toLowerCase().startsWith('atomic-')
    );
    for (const element of atomicElements) {
      const childTemplates = element.querySelectorAll('template');
      //This is necessary to load the components that are inside the templates
      for (const template of childTemplates) {
        discover(template.content);
        observer.observe(template.content, {subtree: true, childList: true});
      }
    }
    const tags = atomicElements.map((el) => el.tagName.toLowerCase());
    // If the root element is an undefined Atomic component, add it to the list
    if (rootIsAtomicElement && !customElements.get(rootTagName)) {
      tags.push(rootTagName);
    }
    if (rootIsAtomicElement) {
      const childTemplates = root.querySelectorAll('template');
      //This is necessary to load the components that are inside the templates
      for (const template of childTemplates) {
        discover(template.content);
        observer.observe(template.content, {subtree: true, childList: true});
      }
      //TODO: This part should not be necessary: instead, if component-a uses component-b, component-a should be responsible for loading component-b
      if ('shadowRoot' in root && root.shadowRoot) {
        discover(root.shadowRoot);
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
    if (elementsMap[tagName]) {
      return elementsMap[tagName]();
    } else {
      import('../../components/' + tagName + '.js')
        .then((module) => {
          module.defineCustomElement();
        })
        .catch((error) => {
          console.error('Error loading module:', error);
        });
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const {addedNodes} of mutations) {
      for (const node of addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          discover(node as Element);
        }
      }
    }
  });
  if (root instanceof Document) {
    discover(root.body);
    observer.observe(root.documentElement, {subtree: true, childList: true});
  } else {
    discover(root);
    observer.observe(root, {subtree: true, childList: true});
  }
}
