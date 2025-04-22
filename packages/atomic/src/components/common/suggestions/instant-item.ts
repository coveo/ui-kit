import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {encodeForDomAttribute} from '@/src/utils/string-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {getClassNameForButtonStyle} from '../button-style';
import {SearchBoxSuggestionElement} from './suggestions-common';

export const getPartialInstantItemElement = (
  i18n: i18n,
  itemTitle: string,
  itemUniqueId: string
): Pick<SearchBoxSuggestionElement, 'ariaLabel' | 'key' | 'part'> => {
  return {
    ariaLabel: i18n.t('instant-results-suggestion-label', {
      title: itemTitle,
      interpolation: {escapeValue: false},
    }),
    key: `instant-result-${encodeForDomAttribute(itemUniqueId)}`,
    part: 'instant-results-item',
  };
};

export const getPartialInstantItemShowAllElement = (
  i18n: i18n
): Pick<SearchBoxSuggestionElement, 'key' | 'part' | 'ariaLabel'> => {
  return {
    key: 'instant-results-show-all-button',
    part: 'instant-results-show-all',
    ariaLabel: i18n.t('show-all-results'),
  };
};

interface InstantItemShowAllButtonProps {
  i18n: i18n;
}

export const instantItemShowAllButton: FunctionalComponent<
  InstantItemShowAllButtonProps
> = ({props: {i18n}}) => {
  return html`<div
    part="instant-results-show-all-button"
    class=${getClassNameForButtonStyle('text-primary')}
  >
    ${i18n.t('show-all-results')}
  </div>`;
};
