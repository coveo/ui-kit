import {multiClassMap} from '@/src/directives/multi-class-map';
import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

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
