// Extend the Window interface to include applyFocusVisiblePolyfill
interface Window {
  applyFocusVisiblePolyfill?: boolean;
}

// Necessary for Safari under version 15.4.
export function loadFocusVisiblePolyfill() {
  if ((window as Window).applyFocusVisiblePolyfill) {
    return;
  }

  try {
    document.body.querySelector(':focus-visible');
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('focus-visible/dist/focus-visible.min.js');
  }
}
