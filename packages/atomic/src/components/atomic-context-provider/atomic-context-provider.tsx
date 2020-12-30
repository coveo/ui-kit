import {Component, Prop} from '@stencil/core';
import {buildContext, Engine} from '@coveo/headless';
import {Initialization} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-context-provider',
  shadow: true,
})
export class AtomicContextProvider {
  @Prop({mutable: true}) engine?: Engine;
  @Prop() context = '{}';

  @Initialization()
  public initialize() {
    const context = buildContext(this.engine!);
    const contextObject = JSON.parse(this.context);
    context.set(contextObject);
  }
}
