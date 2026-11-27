import {commands} from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    serveCdnAsIs: (delayAtomicChunksMs: number) => Promise<void>;
    stopServingCdnAsIs: () => Promise<void>;
  }
}

export const serveCdnAsIs = ({delayAtomicChunksMs = 0} = {}) =>
  commands.serveCdnAsIs(delayAtomicChunksMs);

export const stopServingCdnAsIs = () => commands.stopServingCdnAsIs();
