/**
 * Interface that defines a minimal key-value storage mechanism used by Relay.
 */
export interface Storage {
  /**
   * Retrieves the stored string value associated with the specified key.
   * Returns `null` if the key does not exist or has no value.
   * @param {string} key - Key corresponding to the desired value.
   * @returns {string|null}
   */
  getItem: (key: string) => string | null;

  /**
   * Removes the value associated with the specified key from storage.
   * If the key does not exist, no action is taken.
   * @param {string} key - Key to remove.
   * @returns {void}
   */
  removeItem: (key: string) => void;

  /**
   * Stores a string value under the specified key. Overwrites any existing value.
   * @param {string} key - Key under which the value should be stored.
   * @param {string} data - String data to store.
   * @returns {void}
   */
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
