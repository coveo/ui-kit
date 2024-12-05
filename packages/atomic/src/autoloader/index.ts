const observer = new MutationObserver((mutations) => {
  for (const {addedNodes} of mutations) {
    for (const node of addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        discover(node as Element);
      }
    }
  }
});
/**
 * Checks a node for undefined elements and attempts to register them.
 */
export async function discover(root: Element | ShadowRoot) {
  const rootTagName = root instanceof Element ? root.tagName.toLowerCase() : '';
  const rootIsShoelaceElement = rootTagName?.startsWith('atomic-');
  const tags = [...root.querySelectorAll(':not(:defined)')]
    .map((el) => el.tagName.toLowerCase())
    .filter((tag) => tag.startsWith('atomic-'));
  // If the root element is an undefined Shoelace component, add it to the list
  if (rootIsShoelaceElement && !customElements.get(rootTagName)) {
    tags.push(rootTagName);
  }
  // Make the list unique
  const tagsToRegister = [...new Set(tags)];
  await Promise.allSettled(tagsToRegister.map((tagName) => register(tagName)));
  customElements.upgrade(root);
}
/**
 * Registers an element by tag name.
 */
function register(tagName: string) {
  // If the element is already defined, there's nothing more to do
  if (customElements.get(tagName)) {
    return Promise.resolve();
  }
  const pathPromise = Promise.resolve().then(() =>
    // TODO: Define relativeness of path
    import.meta.resolve!(`../../components/${tagName}.js`)
  );
  // Register it
  return new Promise<void>((resolve, reject) =>
    pathPromise
      .then((path) =>
        import(path)
          .then((module) => {
            module.defineCustomElement();
            resolve();
          })
          .catch(() =>
            reject(new Error(`Unable to autoload <${tagName}> from ${path}`))
          )
      )
      .catch((error) => {
        console.log('Error while resolving path', error);
        reject(error);
      })
  );
}
// Initial discovery
discover(document.body);
// Listen for new undefined elements
observer.observe(document.documentElement, {subtree: true, childList: true});
//# sourceMappingURL=index.js.map
