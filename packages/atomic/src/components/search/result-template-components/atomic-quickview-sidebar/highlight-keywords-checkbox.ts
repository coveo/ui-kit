import type {i18n} from 'i18next';
import {html} from 'lit';
import {when} from 'lit/directives/when.js';
import {renderCheckbox} from '@/src/components/common/checkbox';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import type {HighlightKeywords} from '../atomic-quickview-modal/atomic-quickview-modal';

const highlightKeywordsCheckboxId =
  'atomic-quickview-sidebar-highlight-keywords';

export interface HighlightKeywordsCheckboxProps {
  i18n: i18n;
  highlightKeywords: HighlightKeywords;
  onHighlightKeywords: (highlight: HighlightKeywords) => void;
  minimized: boolean;
}

export const renderHighlightKeywordsCheckbox: FunctionalComponent<
  HighlightKeywordsCheckboxProps
> = ({props}) => {
  const label = props.i18n.t('keywords-highlight');

  return html`
    ${renderCheckbox({
      props: {
        text: label,
        class: 'mr-2',
        id: highlightKeywordsCheckboxId,
        checked: !props.highlightKeywords.highlightNone,
        onToggle: (checked) =>
          props.onHighlightKeywords({
            ...props.highlightKeywords,
            highlightNone: !checked,
          }),
      },
    })}
    ${when(
      !props.minimized,
      () => html`
        <label
          class="cursor-pointer font-bold whitespace-nowrap"
          for=${highlightKeywordsCheckboxId}
        >${label}</label>
      `
    )}
  `;
};
