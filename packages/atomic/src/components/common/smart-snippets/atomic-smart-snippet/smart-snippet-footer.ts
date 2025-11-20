import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface SmartSnippetFooterProps {
  i18n: i18n;
}

export const renderSmartSnippetFooter: FunctionalComponentWithChildren<
  SmartSnippetFooterProps
> =
  ({props}) =>
  (children) => {
    return html`<footer
      part="footer"
      aria-label=${props.i18n.t('smart-snippet-source')}
    >
      ${children}
    </footer>`;
  };
