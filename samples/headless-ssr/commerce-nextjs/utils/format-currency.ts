export function formatCurrency(
  price: number,
  language: string,
  currency: string
) {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency,
  }).format(price);
}
