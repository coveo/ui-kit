import {VERSION} from '@coveo/headless';

export interface AtomicEnvironment {
  version: string;
  headlessVersion: string;
}

declare global {
  interface Window {
    [anyGlobalVariable: string]: AtomicEnvironment;
  }
}

function getWindow() {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window;
}

function getAtomicVersion() {
  const win = getWindow();
  if (!win) {
    return 'unknown';
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (win as any).__ATOMIC_VERSION__ || 'unknown';
}

export function getAtomicEnvironment(): AtomicEnvironment {
  return {
    version: getAtomicVersion(),
    headlessVersion: VERSION,
  };
}

export function setCoveoGlobal(globalVariableName: string) {
  const win = getWindow();
  if (!win || win[globalVariableName]) {
    return;
  }
  win[globalVariableName] = getAtomicEnvironment();
}
