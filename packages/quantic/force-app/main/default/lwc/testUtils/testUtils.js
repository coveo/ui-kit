// @ts-ignore
import {createElement} from 'lwc';

export function buildCreateTestComponent(TComponent, tag, defaultOptions = {}) {
  return (options = {}) => {
    const element = createElement(tag, {
      is: TComponent,
    });

    const optionsToApply = Object.assign({}, defaultOptions, options);
    for (const [key, value] of Object.entries(optionsToApply)) {
      element[key] = value;
    }

    document.body.appendChild(element);
    return element;
  };
}

export function cleanup() {
  // The jsdom instance is shared across test cases in a single file so reset the DOM.
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
}

// Helper function to wait until the microtask queue is empty.
export function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}
