import { vi } from "vitest";
import type { Storage } from "../environment/storage.js";

export function createMockStorage(storage: Partial<Storage> = {}): Storage {
  return {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    ...storage,
  };
}
