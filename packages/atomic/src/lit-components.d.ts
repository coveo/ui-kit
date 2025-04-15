import * as ComponentsIndex from './components/index.js';

export namespace Components {
  type ComponentKeys = keyof typeof ComponentsIndex;
  type ComponentInterfaces = {
    [Key in ComponentKeys]: typeof ComponentsIndex[Key];
  };

  export type AllComponents = ComponentInterfaces;
}
