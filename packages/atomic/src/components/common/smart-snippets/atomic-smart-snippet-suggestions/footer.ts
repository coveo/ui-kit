import {html} from 'lit';
import type {i18n} from 'i18next';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface SmartSnippetSuggestionsFooterProps {
  /**
   * The i18n instance for translations.
   */
  i18n: i18n;
}

export const renderSmartSnippetSuggestionsFooter: FunctionalComponentWithChildren<SmartSnippetSuggestionsFooterProps> =
  ({props}) =>
  (children) => {
    return html`<footer
      part="footer"
      aria-label=${props.i18n.t('smart-snippet-source')}
    >
      ${children}
    </footer>`;
  };
