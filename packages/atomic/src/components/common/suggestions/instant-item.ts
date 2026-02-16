import type {i18n} from 'i18next';
import {html, render} from 'lit';
import {encodeForDomAttribute} from '../../../utils/string-utils';
import {getClassNameForButtonStyle} from '../button-style';
import type {SearchBoxSuggestionElement} from './suggestions-types';

type InstantItemSuggestionLabelKey =
  | 'instant-results-suggestion-label'
  | 'instant-products-suggestion-label';

export const getPartialInstantItemElement = (
  i18n: i18n,
  i18nKey: InstantItemSuggestionLabelKey,
  itemTitle: string,
  itemUniqueId: string
): Pick<SearchBoxSuggestionElement, 'ariaLabel' | 'key' | 'part'> => {
  return {
    ariaLabel: i18n.t(i18nKey, {
      title: itemTitle,
      interpolation: {escapeValue: false},
    }),
    key: `instant-result-${encodeForDomAttribute(itemUniqueId)}`,
    part: 'instant-results-item',
  };
};

type InstantItemShowAllLabelKey = 'show-all-products' | 'show-all-results';

export const getPartialInstantItemShowAllElement = (
  i18n: i18n,
  i18nKey: InstantItemShowAllLabelKey
): Pick<SearchBoxSuggestionElement, 'key' | 'part' | 'ariaLabel'> => {
  return {
    key: 'instant-results-show-all-button',
    part: 'instant-results-show-all',
    ariaLabel: i18n.t(i18nKey),
  };
};

interface InstantItemShowAllButtonProps {
  i18n: i18n;
  i18nKey: InstantItemShowAllLabelKey;
}

export const renderInstantItemShowAllButton = ({
  i18n,
  i18nKey,
}: InstantItemShowAllButtonProps): HTMLElement => {
  const template = html`<div
    part="instant-results-show-all-button"
    class="pointer-events-none ${getClassNameForButtonStyle('text-primary')}"
  >
    ${i18n.t(i18nKey)}
  </div>`;

  const container = document.createElement('div');
  render(template, container);
  return container.firstElementChild as HTMLElement;
};
