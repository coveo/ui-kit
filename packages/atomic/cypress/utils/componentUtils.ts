export function doSortAlphanumeric(originalValues: string[]) {
  return originalValues
    .concat()
    .sort((first, second) => first.localeCompare(second));
}

export function revertFormatNumericFacet(num: string) {
  return Number(num.replace(/,/g, ''));
}

export function revertFormatedDateFacet(date: string) {
  const splitDate = date.split('/');
  const year = splitDate[2];
  const month = splitDate[1];
  const day = splitDate[0];
  return `${year}/${month}/${day}`;
}
