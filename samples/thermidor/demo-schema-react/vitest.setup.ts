global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom does not implement scrolling; the conversation page scrolls to each new turn, and the
// search box to the option the arrow keys highlight.
Element.prototype.scrollTo ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

// jsdom does not implement media queries; every query answers as on a small screen.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
