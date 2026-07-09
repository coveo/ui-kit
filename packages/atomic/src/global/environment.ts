interface AtomicEnvironment {
  version: string;
  headlessVersion: string;
}

function getWindow() {
  return window as unknown as Record<string, AtomicEnvironment | undefined>;
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
