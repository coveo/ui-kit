export function formatCurrency(
  price: number,
  language: string,
  currency: string
) {
  console.log(language, currency);
  return new Intl.NumberFormat(`${language}-${language}`, {
    style: 'currency',
    currency: currency,
  }).format(price);
}
