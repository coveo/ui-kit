import type {i18n} from '@coveo/atomic';
import React, {useEffect, useRef} from 'react';
import {AtomicCommerceRecommendationInterface} from './components.js';

export type AtomicCommerceRecommendationInterface = React.ComponentProps<
  typeof AtomicCommerceRecommendationInterface
>;

/**
 * The properties of the AtomicCommerceRecommendationInterface component
 */
interface WrapperProps
  extends Omit<
    AtomicCommerceRecommendationInterface,
    'i18n' | 'pipeline' | 'searchHub'
  > {
  /**
   * An optional callback that lets you control the interface localization.
   *
   * The function receives the search interface 18n instance, which you can then modify (see [Localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/)).
   *
   */
  localization?: (i18n: i18n) => void;
}

const DefaultProps: Required<Pick<WrapperProps, 'localization'>> = {
  localization: () => {},
};

/**
 * This component serves as a wrapper for the core AtomicCommerceRecommendationInterface.
 * @param props
 * @returns
 */
export const InterfaceWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const mergedProps = {...DefaultProps, ...props};
  if (!mergedProps.engine) {
    throw new Error('The "engine" prop is required.');
  }
  const {engine, localization, ...allOtherProps} = mergedProps;
  const interfaceRef =
    useRef<React.ElementRef<typeof AtomicCommerceRecommendationInterface>>(
      null
    );
  let initialization: Promise<void> | null = null;

  useEffect(() => {
    const CommerceRecommendationInterfaceAtomic = interfaceRef.current!;
    if (!initialization) {
      initialization =
        CommerceRecommendationInterfaceAtomic.initializeWithEngine(engine);
      initialization.then(() => {
        localization(CommerceRecommendationInterfaceAtomic.i18n);
      });
    }
  }, [interfaceRef]);

  return (
    <AtomicCommerceRecommendationInterface
      engine={engine}
      ref={interfaceRef}
      {...allOtherProps}
    >
      {props.children}
    </AtomicCommerceRecommendationInterface>
  );
};
