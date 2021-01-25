import {Component, State} from '@stencil/core';
import {
  buildSearchParameterManager,
  buildSearchParameterSerializer,
  Unsubscribe,
} from '@coveo/headless';
import {
  Initialization,
  InterfaceContext,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-search-parameter-serializer',
  shadow: false,
})
export class AtomicSearchParameterSerializer {
  private unsubscribe: Unsubscribe = () => {};
  private context!: InterfaceContext;
  @State() initialized = false;

  @Initialization()
  public initialize() {
    const stateWithoutHash = window.location.hash.slice(1);
    const decodedState = decodeURIComponent(stateWithoutHash);
    const {serialize, deserialize} = buildSearchParameterSerializer();
    const params = deserialize(decodedState);

    const manager = buildSearchParameterManager(this.context.engine!, {
      initialState: {parameters: params},
    });

    this.unsubscribe = manager.subscribe(() => {
      window.location.hash = serialize(manager.state.parameters);
    });
    this.initialized = true;
  }

  public disconnectedCallback() {
    this.unsubscribe();
  }
  render() {
    return null;
  }
}
