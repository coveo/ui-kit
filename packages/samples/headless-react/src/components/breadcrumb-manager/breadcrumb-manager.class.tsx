import {Component, ContextType} from 'react';
import {
  buildBreadcrumbManager,
  BreadcrumbManager as HeadlessBreadcrumbManager,
  BreadcrumbManagerState,
  Unsubscribe,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';

export class BreadcrumbManager extends Component<{}, BreadcrumbManagerState> {
  static contextType = AppContext;
  context!: ContextType<typeof AppContext>;

  private controller!: HeadlessBreadcrumbManager;
  private unsubscribe: Unsubscribe = () => {};

  componentDidMount() {
    this.controller = buildBreadcrumbManager(this.context.engine!);
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
    if (!this.state?.hasBreadcrumbs) {
      return null;
    }

    return (
      <ul>
        {this.state.facetBreadcrumbs.map((facet) => (
          <li key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={breadcrumb.value.value}
                onClick={() => breadcrumb.deselect()}
              >
                {breadcrumb.value.value}
              </button>
            ))}
          </li>
        ))}
      </ul>
    );
  }
}
