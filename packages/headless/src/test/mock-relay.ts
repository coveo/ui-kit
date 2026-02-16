import type {Relay} from '@coveo/relay';
import {buildMockMeta} from './mock-meta.js';

export function buildMockRelay(config: Partial<Relay> = {}): Relay {
  return {
    emit: vi.fn(),
    getMeta: vi.fn((_: string) => buildMockMeta({})),
    on: vi.fn(),
    off: vi.fn(),
    updateConfig: vi.fn(),
    version: 'foo',
    ...config,
  };
}
