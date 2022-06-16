import {VERSION} from '@coveo/headless';

interface AtomicEnvironment {
  version: string;
  headlessVersion: string;
}

function getWindow() {
  return window as unknown as {
    CoveoAtomic: AtomicEnvironment;
    applyFocusVisiblePolyfill?: () => {};
  };
}

export function getAtomicEnvironment(): AtomicEnvironment {
  return {
    version: process.env.VERSION!,
    headlessVersion: VERSION,
  };
}

function setCoveoGlobal() {
  if (getWindow().CoveoAtomic) {
    return;
  }
  getWindow().CoveoAtomic = getAtomicEnvironment();
}

// Necessary for Safari under version 15.4.
function loadFocusVisiblePolyfill() {
  if (getWindow().applyFocusVisiblePolyfill) {
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
  if (!window) {
    return;
  }

  setCoveoGlobal();
  loadFocusVisiblePolyfill();
}
