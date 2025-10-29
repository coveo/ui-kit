import React from 'react';

import type { StyleReactProps } from '../interfaces.js';

export type StencilReactExternalProps<PropType, ElementType> = PropType &
  Omit<React.HTMLAttributes<ElementType>, 'style'> &
  StyleReactProps;

// This will be replaced with React.ForwardedRef when react-output-target is upgraded to React v17
export type StencilReactForwardedRef<T> = ((instance: T | null) => void) | React.MutableRefObject<T | null> | null;

export const setRef = (ref: StencilReactForwardedRef<any> | React.Ref<any> | undefined, value: any) => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref != null) {
    // Cast as a MutableRef so we can assign current
    (ref as React.MutableRefObject<any>).current = value;
  }
};

export const mergeRefs = (
  ...refs: (StencilReactForwardedRef<any> | React.Ref<any> | undefined)[]
): React.RefCallback<any> => {
  return (value: any) => {
    refs.forEach((ref) => {
      setRef(ref, value);
    });
  };
};

export const createForwardRef = <PropType, ElementType>(ReactComponent: any, displayName: string) => {
  type InternalProps = StencilReactExternalProps<PropType, ElementType> & { forwardedRef?: StencilReactForwardedRef<ElementType> };
  type ExternalProps = Omit<InternalProps, 'forwardedRef'>;

  const Forwarded = React.forwardRef<ElementType, ExternalProps>((props, ref) => {
    return <ReactComponent {...(props as InternalProps)} forwardedRef={ref} />;
  });
  (Forwarded as any).displayName = displayName;
  return Forwarded;
};

export const defineCustomElement = (tagName: string, customElement: any) => {
  if (customElement !== undefined && typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, customElement);
  }
};

export * from './attachProps.js';
export * from './case.js';
