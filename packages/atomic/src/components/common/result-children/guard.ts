import {html, nothing} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

interface ResultChildrenGuardProps {
  inheritTemplates: boolean;
  resultTemplateRegistered: boolean;
  templateHasError: boolean;
}

export const renderResultChildrenGuard: FunctionalComponentWithChildren<
  ResultChildrenGuardProps
> =
  ({props}) =>
  (children) => {
    if (!props.inheritTemplates && !props.resultTemplateRegistered) {
      return nothing;
    }

    if (!props.inheritTemplates && props.templateHasError) {
      return html`<slot></slot>`;
    }

    return html`${children}`;
  };
