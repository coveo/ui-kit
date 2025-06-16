import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html, TemplateResult, nothing} from 'lit';

type FunctionalComponentChildren = TemplateResult | typeof nothing;

export const renderQueryErrorContainer: FunctionalComponentWithChildren<{}> =
  () => (children: FunctionalComponentChildren) => {
    return html`<div class="p-8 text-center">${children}</div>`;
  };
