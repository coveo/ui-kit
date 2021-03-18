export interface IAlias {
  [key: string]: string;
}

export function doSortAlphanumeric(originalValues: string[]) {
  return originalValues
    .concat()
    .sort((first, second) => first.localeCompare(second));
}

export const aliasNoAtSignBuilder = (alaisWithAtSign: IAlias) => {
  const alaisNoAtSign = Object.assign({}, alaisWithAtSign);
  Object.keys(alaisNoAtSign).forEach((key: string) => {
    alaisNoAtSign[key] = alaisNoAtSign[key].split('@')[1];
  });
  return alaisNoAtSign;
};
