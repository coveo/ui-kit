import type {i18n} from 'i18next';
import {html} from 'lit';
import {renderHeading} from '@/src/components/common/heading';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface SuggestionsWrapperProps {
  /**
   * The heading level.
   */
  headingLevel: number;
  /**
   * The i18n instance for translations.
   */
  i18n: i18n;
}

export const renderSuggestionsWrapper: FunctionalComponentWithChildren<
  SuggestionsWrapperProps
> =
  ({props}) =>
  (children) => {
    const containerClasses = tw({
      'bg-background border-neutral text-on-background overflow-hidden rounded-lg border': true,
    });

    const questionsClasses = tw({
      'divide-neutral divide-y': true,
    });

    return html`<aside
      part="container"
      class=${multiClassMap(containerClasses)}
      aria-label=${props.i18n.t('smart-snippet-people-also-ask')}
    >
      ${renderHeading({
        props: {
          level: props.headingLevel,
          class: 'border-neutral border-b px-6 py-4 text-xl leading-8',
          part: 'heading',
        },
      })(html`${props.i18n.t('smart-snippet-people-also-ask')}`)}
      <ul part="questions" class=${multiClassMap(questionsClasses)}>
        ${children}
      </ul>
    </aside>`;
  };
