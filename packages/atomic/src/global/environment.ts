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
  return window;
}

export function getAtomicEnvironment(): AtomicEnvironment {
  return {
    version: process.env.VERSION!,
    headlessVersion: VERSION,
  };
}

export function setCoveoGlobal(globalVariableName: string) {
  if (getWindow()[globalVariableName]) {
    return;
  }
  getWindow()[globalVariableName] = getAtomicEnvironment();
}
