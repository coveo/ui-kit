export function getInnerHTMLWithoutComments(element: Element): string {
  return element.innerHTML.replaceAll(/<!--.*?-->/gs, '');
}
