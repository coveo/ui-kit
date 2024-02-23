import {CommerceEngine} from '../app/commerce-engine/commerce-engine';
import {randomID} from '../utils/utils';
import {CommerceRoutableState} from '../state/commerce-app-state';

export interface RouteProps {
  id?: string;
  url?: string;
}

interface CoreRouteProps extends RouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshState?: any;
  id: string;
}

// This makes current controllers compatible with routes, since a route is a special kind of engine from the
// controller's perspective
export interface CommerceRoute extends CommerceEngine {
  id: string;
  navigate: () => void;
  deregister: () => void;
}

function buildCoreRoute(
  engine: CommerceEngine,
  props: CoreRouteProps): CommerceRoute {
  const deregister = engine.registerRoute(props.id)
  return {
    ...engine,
    id: props.id,
    navigate: props?.refreshState || (() => {}),
    deregister,
    // Overriding the engine state to reflect the route's state. This makes controllers automatically
    // compatible with routes!
    // We'll also need to override the engine's dispatch method to dispatch the action to the route's state
    get state() {
      return {
        commerceContext: engine.state.commerceContext,
        ...engine.state[props.id] as CommerceRoutableState
      }
    }
  }
}

export function buildProductListingRoute(engine: CommerceEngine, props?: RouteProps) {
  const id = props?.id || randomID('plp');
  return buildCoreRoute(engine, {
    ...props,
    id,
    refreshState: () => {}, // TODO(nico): Refresh state of routes through action
    // Should we offer controllers built by default?
  });
}

export function buildSearchRoute(engine: CommerceEngine, props?: RouteProps) {
  const id = props?.id || randomID('search');
  return buildCoreRoute(engine, {
    ...props,
    id,
    refreshState: () => {}
  });
}

export function buildProductRoute(engine: CommerceEngine, props?: RouteProps) {
  const id = props?.id || randomID('pdp');
  return buildCoreRoute(engine, {
    ...props,
    id
  });
}

export function buildCartRoute(engine: CommerceEngine, props?: RouteProps) {
  const id = props?.id || randomID('cart');
  return buildCoreRoute(engine, {
    ...props,
    id
  });
}

export function buildCustomRoute(engine: CommerceEngine, props?: RouteProps) {
  const id = props?.id || randomID('custom');
  return buildCoreRoute(engine, {
    ...props,
    id
  });
}
