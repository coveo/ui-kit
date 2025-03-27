// @ts-ignore
import {createElement} from 'lwc';

export function createTestComponent(TComponent, tag, options = {}) {
  const element = createElement(tag, {
    is: TComponent,
  });

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      element[key] = value;
    }
  }

  document.body.appendChild(element);
  return element;
}

export function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM.
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
}
