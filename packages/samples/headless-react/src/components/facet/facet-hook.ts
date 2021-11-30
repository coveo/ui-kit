import {
  buildFacet,
  Controller,
  Facet,
  FacetProps,
  FacetState,
  SearchEngine,
} from '@coveo/headless';
import React, {useEffect, useState} from 'react';

/**
 * Example of a specific hook for function component
 * We would need to create one of those for each Headless controller, and for each sub package of headless
 * For example, `useFacet` from '@coveo/headless/react', then `useFacet` from '@coveo/headless/productlisting/react' etc.
 *
 */
export const useFacet = (
  facet: Facet
): [FacetState, React.Dispatch<React.SetStateAction<FacetState>>] => {
  const [state, setState] = useState(facet.state);
  useEffect(() => {
    facet.subscribe(() => setState(facet.state));
  }, []);

  return [state, setState];
};

/**
 * Example of a generic hook for function component
 * We would need to create only one hook that would serve for any controller that extends the base Controller type (all of them)
 */
export function useController<T extends Controller, S = T['state']>(
  controller: T
): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = useState(controller.state as S);
  useEffect(() => {
    controller.subscribe(() => setState(controller.state as S));
  }, []);

  return [state, setState];
}

/**
 * Example of a specific decorator for class components.
 *  We would need to create one of those for each Headless controller, and for each sub package of headless
 * For example, `WithFacet` from '@coveo/headless/react', then `WithFacet` from '@coveo/headless/productlisting/react' etc.
 *
 */
interface ReactComponentWithFacet
  extends React.Component<FacetProps, FacetState> {
  controller: Facet;
  context: React.ContextType<React.Context<{engine: SearchEngine}>>;
}

export function WithFacet() {
  return function (target: ReactComponentWithFacet, _: string) {
    const {
      componentDidMount: originalComponentDidMount,
      componentWillUnmount: originalComponentWillUnmount,
    } = target;
    let unsubscribe: () => void = () => {};
    target.componentDidMount = function () {
      this.controller = buildFacet(this.context.engine, this.props);
      unsubscribe = this.controller.subscribe(() =>
        this.setState(this.controller.state)
      );
      originalComponentDidMount?.call(this);
    };

    target.componentWillUnmount = function () {
      unsubscribe();
      originalComponentWillUnmount?.call(this);
    };
  };
}

/**
 * Example of a generic decorator for class components.
 * Should work with any controller that extends the base Controller type (all of them)
 *
 * Requires more work for implementers, since they are in charge of building the controller themselves
 */
interface ReactComponentWithController<C extends Controller, P, S>
  extends React.Component<P, S> {
  controller: C;
}

export function WithController<C extends Controller, P, S>(
  buildController: (component: React.Component<P, S>) => C
) {
  return function (target: ReactComponentWithController<C, P, S>, _: string) {
    const {
      componentDidMount: originalComponentDidMount,
      componentWillUnmount: originalComponentWillUnmount,
    } = target;
    let unsubscribe: () => void = () => {};
    target.componentDidMount = function () {
      this.controller = buildController(this);
      unsubscribe = this.controller.subscribe(() =>
        this.setState(this.controller.state)
      );
      originalComponentDidMount?.call(this);
    };

    target.componentWillUnmount = function () {
      unsubscribe();
      originalComponentWillUnmount?.call(this);
    };
  };
}
