export function includesAtLeast<T>(items: T[], searchElement: T, amount = 1) {
  let amountFound = 0;
  for (const item of items) {
    if (item === searchElement) {
      amountFound++;
      if (amountFound === amount) {
        return true;
      }
    }
  }
  return false;
}
