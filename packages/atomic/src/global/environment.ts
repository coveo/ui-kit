interface AtomicEnvironment {
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

export function getAtomicEnvironment(
  headlessVersion: string
): AtomicEnvironment {
  return {
    version: process.env.VERSION!,
    headlessVersion,
  };
}

export function getAtomicVersion(): string {
  return getAtomicEnvironment('').version;
}

export function setCoveoGlobal(
  globalVariableName: string,
  headlessVersion: string
) {
  if (getWindow()[globalVariableName]) {
    return;
  }
  getWindow()[globalVariableName] = getAtomicEnvironment(headlessVersion);
}
