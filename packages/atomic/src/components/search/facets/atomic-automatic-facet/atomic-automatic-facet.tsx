import {isNullOrUndefined} from '@coveo/bueno';
import {AutomaticFacet, SearchStatus, FacetValue} from '@coveo/headless';
import {Component, Prop, State, h, VNode} from '@stencil/core';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../../utils/accessibility-utils';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {FacetContainer} from '../../../common/facets/facet-container/facet-container';
import {FacetHeader} from '../../../common/facets/facet-header/facet-header';
import {FacetValueCheckbox} from '../../../common/facets/facet-value-checkbox/facet-value-checkbox';
import {FacetValueLabelHighlight} from '../../../common/facets/facet-value-label-highlight/facet-value-label-highlight';
import {FacetValuesGroup} from '../../../common/facets/facet-values-group/facet-values-group';
import {Hidden} from '../../../common/hidden';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

/**
 * An automatic facet is a facet generated by the automatic facets feature. This component should
 * not be used directly. It is internally used by the facet manager to automatically render updated
 * automatic facets based on the search results.
 *
 * @part facet - The wrapper for the entire facet.
 *
 * @part label-button - The button that displays the label and allows to expand/collapse the facet.
 * @part label-button-icon - The label button icon.
 * @part clear-button - The button that resets the actively selected facet values.
 * @part clear-button-icon - The clear button icon.
 *
 * @part values - The facet values container.
 * @part value-label - The facet value label, common for all displays.
 * @part value-count - The facet value count, common for all displays.
 *
 * @part value-checkbox - The facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-checked - The checked facet value checkbox, available when display is 'checkbox'.
 * @part value-checkbox-label - The facet value checkbox clickable label, available when display is 'checkbox'.
 * @part value-checkbox-icon - The facet value checkbox icon, available when display is 'checkbox'.
 */
@Component({
  tag: 'atomic-automatic-facet',
  styleUrl: 'atomic-automatic-facet.pcss',
  shadow: true,
})
export class AtomicAutomaticFacet implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  @Prop({reflect: true}) public field!: string;
  @Prop({reflect: true}) public facetId!: string;
  @Prop({reflect: true}) public facet!: AutomaticFacet;
  @Prop({reflect: true}) public searchStatus!: SearchStatus;
  @Prop({reflect: true, mutable: true}) public isCollapsed = false;

  @FocusTarget()
  private headerFocus!: FocusTargetController;

  private get numberOfSelectedValues() {
    return this.facet.state.values.filter(({state}) => state === 'selected')
      .length;
  }

  private renderValue(facetValue: FacetValue, onClick: () => void) {
    const displayValue = getFieldValueCaption(
      this.facet.state.field,
      facetValue.value,
      this.bindings.i18n
    );
    const isSelected = facetValue.state === 'selected';

    return (
      <FacetValueCheckbox
        displayValue={displayValue}
        numberOfResults={facetValue.numberOfResults}
        isSelected={isSelected}
        i18n={this.bindings.i18n}
        onClick={onClick}
      >
        <FacetValueLabelHighlight
          displayValue={displayValue}
          isSelected={isSelected}
        ></FacetValueLabelHighlight>
      </FacetValueCheckbox>
    );
  }

  private renderValuesContainer(children: VNode[], query?: string) {
    return (
      <FacetValuesGroup
        i18n={this.bindings.i18n}
        label={this.facet.state.label}
        query={query}
      >
        <ul class={'mt-3'} part="values">
          {children}
        </ul>
      </FacetValuesGroup>
    );
  }

  private renderValues() {
    return this.renderValuesContainer(
      this.facet.state.values.map((value) =>
        this.renderValue(value, () => this.facet.toggleSelect(value))
      )
    );
  }

  private get label() {
    return isNullOrUndefined(this.facet.state.label)
      ? 'No Label'
      : this.facet.state.label;
  }

  public renderHeader() {
    return (
      <FacetHeader
        i18n={this.bindings.i18n}
        label={this.label}
        onClearFilters={() => {
          this.headerFocus.focusAfterSearch();
          this.facet.deselectAll();
        }}
        numberOfSelectedValues={this.numberOfSelectedValues}
        isCollapsed={this.isCollapsed}
        headingLevel={0}
        onToggleCollapse={() => (this.isCollapsed = !this.isCollapsed)}
        headerRef={this.headerFocus.setTarget}
      ></FacetHeader>
    );
  }

  public render() {
    if (this.searchStatus.state.hasError) {
      return <Hidden></Hidden>;
    }

    return (
      <FacetContainer>
        {this.renderHeader()}
        {!this.isCollapsed && this.renderValues()}
      </FacetContainer>
    );
  }
}
