import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {HTMLStencilElement} from '@stencil/core/internal';

interface InterfaceErrorGuardProps {
  host: HTMLStencilElement;
  error?: Error;
}

export const InterfaceErrorGuard: FunctionalComponent<
  InterfaceErrorGuardProps
> = ({host, error}, children) => {
  if (error) {
    return (
      <atomic-component-error
        element={host}
        error={error}
      ></atomic-component-error>
    );
  }

  return <Fragment>{children}</Fragment>;
};
