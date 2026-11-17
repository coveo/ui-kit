/** A `Storage` in memory, which throws a quota error once its values hold more than `quota` characters. */
export function memoryStorage(quota = Infinity): Storage {
  const values = new Map<string, string>();
  const size = () => [...values.values()].reduce((sum, value) => sum + value.length, 0);
  return {
    get length() {
      return values.size;
    },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem(key, value) {
      const previous = values.get(key);
      values.set(key, value);
      if (size() > quota) {
        if (previous === undefined) values.delete(key);
        else values.set(key, previous);
        throw new DOMException('Full', 'QuotaExceededError');
      }
    },
    removeItem: (key) => void values.delete(key),
    clear: () => values.clear(),
  };
}
