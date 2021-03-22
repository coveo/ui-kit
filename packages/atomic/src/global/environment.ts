import {VERSION} from '@coveo/headless';

export interface AtomicEnvironment {
  version: string;
  headlessVersion: string;
}

function getWindow() {
  return (window as unknown) as {CoveoAtomic: AtomicEnvironment};
}

function getAtomicEnvironment(): AtomicEnvironment {
  return {
    version: process.env.VERSION!,
    headlessVersion: VERSION,
  };
}

export default function () {
  if (getWindow().CoveoAtomic) {
    return;
  }
  getWindow().CoveoAtomic = getAtomicEnvironment();
}
