import React, { ForwardRefRenderFunction, PropsWithoutRef } from 'react';

import type { StyleReactProps } from '../interfaces.js';

export type StencilReactExternalProps<PropType, ElementType> = PropType &
  Omit<React.HTMLAttributes<ElementType>, 'style'> &
  StyleReactProps;

export const setRef = (ref: React.ForwardedRef<any> | React.Ref<any> | undefined, value: any) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    // Cast as a MutableRef so we can assign current
    (ref as React.MutableRefObject<any>).current = value;
  }
};

export const mergeRefs = (
  ...refs: (React.ForwardedRef<any> | React.Ref<any> | undefined)[]
): React.RefCallback<any> => {
  return (value: any) => {
    refs.forEach((ref) => {
      setRef(ref, value);
    });
  };
};

export const createForwardRef = <PropType, ElementType>(ReactComponent: any, displayName: string) => {
  const forwardRef: ForwardRefRenderFunction<ElementType, PropsWithoutRef<StencilReactExternalProps<PropType, ElementType>>> = (
    props,
    ref
  ) => {
    return <ReactComponent {...props} forwardedRef={ref} />;
  };
  forwardRef.displayName = displayName;

  return React.forwardRef(forwardRef);
};

export const defineCustomElement = (tagName: string, customElement: any) => {
  if (customElement !== undefined && typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, customElement);
  }
};

export * from './attachProps.js';
export * from './case.js';
