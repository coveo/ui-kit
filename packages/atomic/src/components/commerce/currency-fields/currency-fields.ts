const defaultCurrencyFields = ['ec_price', 'ec_promo_price'];

export function isCurrencyField(field: string, currencyFields: string[] = []): boolean {
  return defaultCurrencyFields.includes(field) || currencyFields.includes(field);
}
