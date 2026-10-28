import {vi} from 'vitest';

/** Stands in for the conversation annotation layer's page module, loaded by URL like the real one. */
export const mount = vi.fn();
export const mountConversations = vi.fn();
