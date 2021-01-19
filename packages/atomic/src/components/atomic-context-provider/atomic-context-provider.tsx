import {Component, Prop} from '@stencil/core';
import {buildContext} from '@coveo/headless';
import {
  Initialization,
  InterfaceContext,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-context-provider',
  shadow: true,
})
export class AtomicContextProvider {
  @Prop() contextValue = '{}';
  public context!: InterfaceContext;

  @Initialization()
  public initialize() {
    const context = buildContext(this.context.engine);
    const contextObject = JSON.parse(this.contextValue);
    context.set(contextObject);
  }
}
