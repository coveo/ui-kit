import {buildCustomEvent} from '@/src/utils/event-utils';

export type NumberFormatter = (value: number, languages: string[]) => string;

export const dispatchNumberFormatEvent = (
  formatter: NumberFormatter,
  element: Element
) => {
  const event = buildCustomEvent('atomic/numberFormat', formatter);

  const canceled = element.dispatchEvent(event);
  if (canceled) {
    throw new Error(
      'The Atomic number format component was not handled, as it is not a child of a compatible component'
    );
  }
};

export const defaultNumberFormatter: NumberFormatter = (value, languages) =>
  value.toLocaleString(languages);

export const defaultCurrencyFormatter: (currency: string) => NumberFormatter =
  (currency) => (value, languages) => {
    return value.toLocaleString(languages, {
      style: 'currency',
      currency,
    });
  };
