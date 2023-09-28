export interface Storage {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, data: string) => void;
}

export function createNullStorage(): Storage {
  return {
    getItem(): string | null {
      return null;
    },
    removeItem(): void {
      return;
    },
    setItem(): void {
      return;
    },
  };
}
