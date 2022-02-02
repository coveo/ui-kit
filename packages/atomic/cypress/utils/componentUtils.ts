export interface IAlias {
  [key: string]: string;
}

export function doSortAlphanumeric(originalValues: string[]) {
  return originalValues
    .concat()
    .sort((first, second) => first.localeCompare(second));
}

export function doSortOccurrences(originalValues: string[]) {
  const getNumericalValue = (value: string) =>
    parseInt(value.replaceAll(/[,()]/g, ''));
  return originalValues
    .concat()
    .sort((a, b) => getNumericalValue(b) - getNumericalValue(a));
}

export const aliasNoAtSignBuilder = (aliasWithAtSign: IAlias) => {
  const aliasNoAtSign = Object.assign({}, aliasWithAtSign);
  Object.keys(aliasNoAtSign).forEach((key: string) => {
    aliasNoAtSign[key] = aliasNoAtSign[key].split('@')[1];
  });
  return aliasNoAtSign;
};
