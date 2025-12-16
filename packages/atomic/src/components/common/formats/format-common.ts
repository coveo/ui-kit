import type {HTMLStencilElement} from '@stencil/core/internal';
import {buildCustomEvent} from '@/src/utils/event-utils';

export type NumberFormatter = (value: number, languages: string[]) => string;

export const dispatchNumberFormatEvent = async (
  formatter: NumberFormatter,
  element: Element
) => {
  const event = buildCustomEvent('atomic/numberFormat', formatter);

  if (element.parentElement && 'updateComplete' in element.parentElement) {
    await (element.parentElement as {updateComplete: Promise<boolean>})
      .updateComplete;
  } else if ('componentOnReady' in element.parentElement!) {
    await (element.parentElement as HTMLStencilElement).componentOnReady();
  }
  const handled = !element.dispatchEvent(event);
  if (!handled) {
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
