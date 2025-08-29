import type {
  AutomaticFacetState,
  AutomaticFacet as HeadlessAutomaticFacet,
  Unsubscribe,
} from '@coveo/headless';
import {Component} from 'react';

interface AutomaticFacetProps {
  controller: HeadlessAutomaticFacet;
}
export class AutomaticFacet extends Component<
  AutomaticFacetProps,
  AutomaticFacetState
> {
  private controller!: HeadlessAutomaticFacet;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = this.props.controller;
    this.updateState();

    this.unsubscribe = this.controller.subscribe(() => this.updateState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  private updateState() {
    this.setState(this.controller.state);
  }

  render() {
    if (!this.state) {
      return null;
    }
    return (
      <ul>
        {this.state.values.map((value) => (
          <li key={value.value}>
            <input
              type="checkbox"
              checked={value.state === 'selected'}
              onChange={() => this.controller.toggleSelect(value)}
            />
            {value.value} ({value.numberOfResults} results)
          </li>
        ))}
      </ul>
    );
  }
}
