import {html} from 'lit';
import {multiClassMap} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface Props {
  additionalClasses?: string;
}

export const renderQuerySummaryContainer: FunctionalComponentWithChildren<
  Props
> =
  ({props}) =>
  (children) => {
    const classNames = {
      'text-on-background': true,
      [props.additionalClasses ?? '']: Boolean(props.additionalClasses),
    };

    return html`
      <div class=${multiClassMap(classNames)} part="container">${children}</div>
    `;
  };
