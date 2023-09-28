import { Storage } from "../environment/storage";

export function createMockStorage(storage: Partial<Storage> = {}): Storage {
  return {
    getItem: () => null,
    removeItem: () => {},
    setItem: () => {},
    ...storage,
  };
}
