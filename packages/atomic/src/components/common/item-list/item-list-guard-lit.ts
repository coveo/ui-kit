import {displayIf} from '@/src/directives/display-if';
import {FunctionalComponentGuard} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

export interface ItemListGuardProps {
  hasError: boolean;
  hasItems: boolean;
  hasTemplate: boolean;
  firstRequestExecuted: boolean;
  templateHasError: boolean;
}

export const itemListGuard: FunctionalComponentGuard<ItemListGuardProps> = ({
  props,
  children,
}) => {
  const {
    hasError,
    hasItems,
    hasTemplate,
    firstRequestExecuted,
    templateHasError,
  } = props;

  const condition = !(
    hasError ||
    (firstRequestExecuted && !hasItems) ||
    !hasTemplate
  );

  return displayIf(
    condition,
    html`${templateHasError ? html`<slot></slot>` : ''}${children}`
  );
};
