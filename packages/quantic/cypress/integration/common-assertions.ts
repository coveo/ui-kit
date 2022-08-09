function isFocusable(element: Element) {
  // Source: https://stackoverflow.com/a/30753870
  if (element.getAttribute('tabindex') === '-1') {
    return false;
  }
  if (element.hasAttribute('tabindex')) {
    return true;
  }
  if (element.getAttribute('contentEditable') === 'true') {
    return true;
  }
  switch (element.tagName) {
    case 'A':
    case 'AREA':
      return element.hasAttribute('href');
    case 'INPUT':
    case 'SELECT':
    case 'TEXTAREA':
    case 'BUTTON':
      return !element.hasAttribute('disabled');
    case 'IFRAME':
      return true;
    default:
      return false;
  }
}

function* getFocusableDescendants(element: Element): Generator<HTMLElement> {
  if (isFocusable(element)) {
    yield element as HTMLElement;
  }
  let children = Array.from(element.children);
  if (element instanceof HTMLSlotElement) {
    children = element.assignedElements();
  } else if (element.shadowRoot) {
    children.push(...Array.from(element.shadowRoot.children));
  }
  for (const child of children) {
    yield* getFocusableDescendants(child);
  }
}

export function assertAccessibility(
  component: string | (() => Cypress.Chainable<JQuery<HTMLElement>>)
) {
  const rulesToIgnore = ['landmark-one-main', 'page-has-heading-one', 'region'];
  const rules = rulesToIgnore.reduce(
    (obj, rule) => ({...obj, [rule]: {enabled: false}}),
    {}
  );

  it('should pass accessibility tests', () => {
    cy.checkA11y();
  });

  it('every interactive element with innerText and an aria label passes WCAG success criterion 2.5.3', () => {
    function splitIntoWords(text: string) {
      return text.split(/\b/g).filter((word) => !word.match(/[^a-z]/i));
    }

    cy.window()
      .then((win) =>
        Array.from(getFocusableDescendants(win.document.body)).filter(
          (element) => element.hasAttribute('aria-label') && element.innerText
        )
      )
      .should((elements) =>
        Array.from(elements).forEach((element) =>
          expect(
            splitIntoWords(element.getAttribute('aria-label')!)
          ).to.include.all.members(
            splitIntoWords(element.innerText),
            'The aria-label should include the innerText. https://www.w3.org/WAI/WCAG22/Techniques/failures/F96.html'
          )
        )
      );
  });
}
