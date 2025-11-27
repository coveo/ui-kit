import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {renderHeading} from '../../heading';

export interface SnippetWrapperProps {
  headingLevel?: number;
  i18n: i18n;
}

export const renderSnippetWrapper: FunctionalComponentWithChildren<
  SnippetWrapperProps
> =
  ({props}) =>
  (children) => {
    return html`<aside aria-label=${props.i18n.t('smart-snippet')}>
      ${renderHeading({
        props: {level: props.headingLevel ?? 0, class: 'sr-only'},
      })(html`${props.i18n.t('smart-snippet')}`)}
      <article
        class="bg-background border-neutral text-on-background rounded-lg border p-6 pb-4"
        part="smart-snippet"
      >
        ${children}
      </article>
    </aside>`;
  };
