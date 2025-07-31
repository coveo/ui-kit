import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {buildController} from '../../../../controllers/controller/headless-controller.js';

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
export const buildMockControllerWithoutProps = (engine: SearchEngine) => {
  // TODO: do something with the props
  return buildController(engine);
};

// TODO: add type check here
export const defineMockControllerWithoutProps = () => ({
  build(engine: SearchEngine) {
    return buildMockControllerWithoutProps(engine);
  },
});
