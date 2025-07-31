import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildController,
  type Controller,
} from '../../../../controllers/controller/headless-controller.js';

// Props type for the controller
export interface FakeControllerProps {
  foo: string;
  bar?: number;
}

// Controller state type
export interface FakeControllerState {
  value: string;
}

// Controller instance type
export interface FakeController {
  state: FakeControllerState;
  initialState: FakeControllerProps;
}

// ControllerDefinitionWithProps implementation
export const buildMockControllerWithProps = (
  engine: SearchEngine,
  _props: FakeControllerProps // TODO: make the type generic
) => {
  // TODO: do something with the props
  return buildController(engine);
};

// TODO: add type check here
export function defineMockControllerWithProps(implementation?: {
  buildWithProps: (
    engine: SearchEngine,
    _props: FakeControllerProps
  ) => Controller;
}) {
  const defaultImplementation = {
    buildWithProps: buildMockControllerWithProps,
  };
  return {
    ...defaultImplementation,
    ...implementation,
  };
}
