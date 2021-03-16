import {VERSION} from '@coveo/headless';

export interface AtomicEnvironment {
  version: string;
  headlessVersion: string;
}

export default function () {
  ((window as unknown) as {atomic: AtomicEnvironment}).atomic = {
    version: process.env.VERSION!,
    headlessVersion: VERSION,
  };
}
