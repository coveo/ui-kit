import type {JSX, i18n} from '@coveo/atomic';
import React, {useEffect, useRef} from 'react';
import {AtomicCommerceInterface} from './components';

export type AtomicCommerceInterface = React.ComponentProps<
  typeof AtomicCommerceInterface
>;

type ExecuteRequest = AtomicCommerceInterface['executeFirstRequest'];

/**
 * The properties of the AtomicCommerceInterface component
 */
interface WrapperProps
  extends Omit<AtomicCommerceInterface, 'i18n' | 'pipeline' | 'searchHub'> {
  /**
   * An optional callback function that can be used to control the execution of the first request.
   *
   * If not provided, a default function will be used, which executes the first request immediately after initialization.
   */
  onReady?: (executeFirstRequest: ExecuteRequest) => Promise<void>;
  /**
   * An optional callback that lets you control the interface localization.
   *
   * The function receives the search interface 18n instance, which you can then modify (see [Localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/)).
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
      const waitForElement = async () => {
        await customElements.whenDefined('atomic-commerce-interface');
        initialization = commerceInterfaceAtomic.initializeWithEngine(engine);
        initialization.then(() => {
          localization(commerceInterfaceAtomic.i18n);
          onReady(
            commerceInterfaceAtomic.executeFirstRequest.bind(
              commerceInterfaceAtomic
            )
          );
        });
      };
      waitForElement();
    }
  }, [interfaceRef]);

  return (
    <AtomicCommerceInterface ref={interfaceRef} {...allOtherProps}>
      {props.children}
    </AtomicCommerceInterface>
  );
};
