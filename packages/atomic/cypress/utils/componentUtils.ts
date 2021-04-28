export interface IAlias {
  [key: string]: string;
}

export function doSortAlphanumeric(originalValues: string[]) {
  return originalValues
    .concat()
    .sort((first, second) => first.localeCompare(second));
}

export const aliasNoAtSignBuilder = (aliasWithAtSign: IAlias) => {
  const aliasNoAtSign = Object.assign({}, aliasWithAtSign);
  Object.keys(aliasNoAtSign).forEach((key: string) => {
    aliasNoAtSign[key] = aliasNoAtSign[key].split('@')[1];
  });
  return aliasNoAtSign;
};
