export function getInnerHTMLWithoutComments(element: Element): string {
  let innerHTML = element.innerHTML;
  let previous;
  do {
    previous = innerHTML;
    innerHTML = innerHTML.replace(/<!--.*?-->/gs, '');
  } while (innerHTML !== previous);
  return innerHTML;
}
