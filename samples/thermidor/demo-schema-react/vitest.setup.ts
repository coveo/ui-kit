global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom does not implement scrolling; the conversation page scrolls to each new turn.
Element.prototype.scrollTo ??= () => {};
