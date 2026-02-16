import {Fragment, FunctionalComponent, h} from '@stencil/core';

interface ResultChildrenGuardProps {
  inheritTemplates: boolean;
  resultTemplateRegistered: boolean;
  templateHasError: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const ResultChildrenGuard: FunctionalComponent<
  ResultChildrenGuardProps
> = (
  {inheritTemplates, resultTemplateRegistered, templateHasError},
  children
) => {
  if (!inheritTemplates && !resultTemplateRegistered) {
    return;
  }

  if (!inheritTemplates && templateHasError) {
    return <slot></slot>;
  }

  return <Fragment>{children}</Fragment>;
};
