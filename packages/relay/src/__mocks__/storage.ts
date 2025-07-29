import { Storage } from "../environment/storage.js";

export function createMockStorage(storage: Partial<Storage> = {}): Storage {
  return {
    getItem: () => null,
    removeItem: () => {},
    setItem: () => {},
    ...storage,
  };
}
