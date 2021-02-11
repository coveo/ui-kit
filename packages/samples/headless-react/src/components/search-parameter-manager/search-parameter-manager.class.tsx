import {Component} from 'react';
import {
  buildSearchParameterManager,
  SearchParameterManager as HeadlessSearchParameterManager,
  SearchParameterManagerState,
  Unsubscribe,
} from '@coveo/headless';
import {engine} from '../../engine';
import {
  readSearchParametersFromURI,
  writeSearchParametersToURI,
} from './search-parameter-serializer';

export class SearchParameterManager extends Component {
  private controller: HeadlessSearchParameterManager;
  public state: SearchParameterManagerState;
  private unsubscribe: Unsubscribe = () => {};

  constructor(props: {}) {
    super(props);

    this.controller = buildSearchParameterManager(engine, {
      initialState: {parameters: readSearchParametersFromURI()},
    });
    this.state = this.controller.state;
  }

  componentDidMount() {
    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  componentDidUpdate() {
    writeSearchParametersToURI(this.state.parameters);
  }

  render() {
    return null;
  }
}
