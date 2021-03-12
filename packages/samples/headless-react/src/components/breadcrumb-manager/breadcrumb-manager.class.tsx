import {Component, ContextType} from 'react';
import {
  buildBreadcrumbManager,
  BreadcrumbManager as HeadlessBreadcrumbManager,
  BreadcrumbManagerState,
  Unsubscribe,
  NumericFacetValue,
  DateFacetValue,
} from '@coveo/headless';
import {AppContext} from '../../context/engine';
import {parseDate} from '../date-facet/date-utils';

export interface BreadcrumbManagerProps {
  numericFormat: (n: number) => string;
}

export class BreadcrumbManager extends Component<
  BreadcrumbManagerProps,
  BreadcrumbManagerState
> {
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

  private renderFacetBreadcrumbs() {
    return (
      <li>
        {this.state.facetBreadcrumbs.map((facet) => (
          <span key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={breadcrumb.value.value}
                onClick={() => breadcrumb.deselect()}
              >
                {breadcrumb.value.value}
              </button>
            ))}
          </span>
        ))}
      </li>
    );
  }

  private renderCategoryFacetBreadcrumbs() {
    return (
      <li>
        {this.state.categoryFacetBreadcrumbs.map((facet) => (
          <span key={facet.path.join('/')}>
            {facet.field}:{' '}
            <button onClick={() => facet.deselect()}>
              {facet.path.map(({value}) => value).join('/')}
            </button>
          </span>
        ))}
      </li>
    );
  }

  private getKeyForRange(value: NumericFacetValue | DateFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  private formatNumericRangeValue(value: number) {
    return this.props.numericFormat(value);
  }

  private renderNumericFacetBreadcrumbs() {
    return (
      <li>
        {this.state.numericFacetBreadcrumbs.map((facet) => (
          <span key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={this.getKeyForRange(breadcrumb.value)}
                onClick={() => breadcrumb.deselect()}
              >
                {this.formatNumericRangeValue(breadcrumb.value.start)} to{' '}
                {this.formatNumericRangeValue(breadcrumb.value.end)}
              </button>
            ))}
          </span>
        ))}
      </li>
    );
  }

  private formatDate(dateStr: string) {
    return parseDate(dateStr).format('MMMM D YYYY');
  }

  private renderDateFacetBreadcrumbs() {
    return (
      <li>
        {this.state.dateFacetBreadcrumbs.map((facet) => (
          <span key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={this.getKeyForRange(breadcrumb.value)}
                onClick={() => breadcrumb.deselect()}
              >
                {this.formatDate(breadcrumb.value.start)} to{' '}
                {this.formatDate(breadcrumb.value.end)}
              </button>
            ))}
          </span>
        ))}
      </li>
    );
  }

  render() {
    if (!this.state?.hasBreadcrumbs) {
      return null;
    }

    return (
      <ul>
        {this.renderFacetBreadcrumbs()}
        {this.renderCategoryFacetBreadcrumbs()}
        {this.renderNumericFacetBreadcrumbs()}
        {this.renderDateFacetBreadcrumbs()}
      </ul>
    );
  }
}
