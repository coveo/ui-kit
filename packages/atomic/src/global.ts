import {setCoveoGlobal} from './global/environment';

// Necessary for Safari under version 15.4.
function loadFocusVisiblePolyfill() {
  if (window.applyFocusVisiblePolyfill) {
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

export default function () {
  setCoveoGlobal();
  loadFocusVisiblePolyfill();
}
