export function doSortAlphanumeric(originalValues: string[]) {
  return originalValues
    .concat()
    .sort((first, second) => first.localeCompare(second));
}
