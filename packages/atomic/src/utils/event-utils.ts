export function buildCustomEvent<T>(name: string, detail: T) {
  return new CustomEvent(name, {
    detail,
    // Event will bubble up the DOM until it is caught
    bubbles: true,
    // Allows to verify if event is caught (cancelled). If it's not caught, it won't be initialized.
    cancelable: true,
    // Allows to compose Atomic components inside one another, event will go across DOM/Shadow DOM
    composed: true,
  });
}
