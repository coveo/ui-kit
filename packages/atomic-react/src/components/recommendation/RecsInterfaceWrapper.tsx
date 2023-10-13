import type {JSX, i18n} from '@coveo/atomic';
import {
  getSampleRecommendationEngineConfiguration,
  buildRecommendationEngine,
} from '@coveo/headless/recommendation';
import React, {useEffect, useRef} from 'react';
import {AtomicRecsInterface} from '../stencil-generated/index';

type GetRecommendations = HTMLAtomicRecsInterfaceElement['getRecommendations'];
/**
 * The properties of the AtomicSearchInterface component
 */
interface WrapperProps
  extends Omit<JSX.AtomicRecsInterface, 'i18n' | 'pipeline' | 'searchHub'> {
  /**
   * An optional callback function that can be used to control the execution of the first query.
   *
   * If not provided, a default function will be used, which execute the first query immediately after initialization.
   */
  onReady?: (getRecommendations: GetRecommendations) => Promise<void>;
  /**
   * An optional callback that lets you control the interface localization.
   *
   * The function receives the search interface 18n instance, which you can then modify (see [Localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/)).
   *
   */
  localization?: (i18n: i18n) => void;
  /**
   * @deprecated This option has no effect. Rather, set the pipeline through the `engine` `search` configuration.
   */
  pipeline?: string;
  /**
   * @deprecated This option has no effect. Rather, set the search hub through the `engine` `search` configuration.
   */
  searchHub?: string;
}

const DefaultProps: Required<Pick<WrapperProps, 'onReady' | 'localization'>> = {
  onReady: (getRecommendations) => {
    return getRecommendations();
  },
  localization: () => {},
};

/**
 * This component serves as a wrapper for the core AtomicRecsInterface.
 * @param props
 * @returns
 */
export const RecsInterfaceWrapper = (
  props: React.PropsWithChildren<WrapperProps>
) => {
  const mergedProps = {...DefaultProps, ...props};
  if (!mergedProps.engine) {
    mergedProps.engine = buildRecommendationEngine({
      configuration: getSampleRecommendationEngineConfiguration(),
    });
  }
  const {engine, localization, onReady, ...allOtherProps} = mergedProps;
  const recsInterfaceRef = useRef<HTMLAtomicRecsInterfaceElement>(null);
  let initialization: Promise<void> | null = null;

  useEffect(() => {
    const recsInterfaceAtomic = recsInterfaceRef.current!;
    if (!initialization) {
      initialization =
        recsInterfaceAtomic.initializeWithRecommendationEngine(engine);
      initialization.then(() => {
        localization(recsInterfaceAtomic.i18n);
        onReady(
          recsInterfaceAtomic.getRecommendations.bind(recsInterfaceAtomic)
        );
      });
    }
  }, [recsInterfaceRef]);

  return (
    <AtomicRecsInterface ref={recsInterfaceRef} {...allOtherProps}>
      {props.children}
    </AtomicRecsInterface>
  );
};
