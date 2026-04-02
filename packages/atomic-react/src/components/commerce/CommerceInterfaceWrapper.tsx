import type {i18n} from '@coveo/atomic';
// oxlint-disable-next-line @typescript-eslint/consistent-type-imports -- <React is needed>
import React, {useEffect, useRef} from 'react';
import {AtomicCommerceInterface} from './components.js';

type AtomicCommerceInterfaceProps = React.ComponentProps<
  typeof AtomicCommerceInterface
>;

type ExecuteRequest = AtomicCommerceInterfaceProps['executeFirstRequest'];

interface WrapperProps extends Omit<
  AtomicCommerceInterfaceProps,
  'i18n' | 'pipeline' | 'searchHub'
> {
  /**
   * An optional callback function that can be used to control the execution of the first request.
   *
   * If not provided, a default function will be used, which executes the first request immediately after initialization.
   */
  onReady?: (executeFirstRequest: ExecuteRequest) => Promise<void>;
  /**
   * An optional callback that lets you control the interface localization.
   *
   * The function receives the search interface 18n instance, which you can then modify (see [Localization](https://static.cloud.coveo.com/atomic/v3/storybook/index.html?path=/docs/usage-additional-topics-localization--docs)).
   *
   */
  localization?: (i18n: i18n) => void;
}

const DefaultProps: Required<Pick<WrapperProps, 'onReady' | 'localization'>> = {
  onReady: (executeFirstRequest) => {
    return executeFirstRequest ? executeFirstRequest() : Promise.resolve();
  },
  localization: () => {},
};

/**
 * This component serves as a wrapper for the core AtomicCommerceInterface.
 * @param props
 * @returns
 */
export const InterfaceWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const mergedProps = {...DefaultProps, ...props};
  if (!mergedProps.engine) {
    throw new Error('The "engine" prop is required.');
    //TODO, maybe: provide a default engine
  }
  const {engine, localization, onReady, ...allOtherProps} = mergedProps;
  const interfaceRef =
    useRef<React.ElementRef<typeof AtomicCommerceInterface>>(null);
  let initialization: Promise<void> | null = null;

  useEffect(() => {
    const commerceInterfaceAtomic = interfaceRef.current!;
    if (!initialization) {
      initialization = commerceInterfaceAtomic.initializeWithEngine(engine);
      initialization.then(() => {
        localization(commerceInterfaceAtomic.i18n);
        onReady(
          commerceInterfaceAtomic.executeFirstRequest.bind(
            commerceInterfaceAtomic
          )
        );
      });
    }
  }, [engine, initialization, localization, onReady]);

  return (
    <AtomicCommerceInterface ref={interfaceRef} {...allOtherProps}>
      {props.children}
    </AtomicCommerceInterface>
  );
};
