import {Component, Event, EventEmitter, h, Prop} from '@stencil/core';
import {randomID} from '../../../utils/utils';

@Component({
  tag: 'facet-value',
  shadow: false,
})
export class FacetValue {
  @Event() public facetValueSelected!: EventEmitter<void>;
  @Prop()
  public label!: string;
  @Prop()
  public numberOfResults!: number;
  @Prop()
  public isSelected!: boolean;

  public render() {
    const id = randomID('');
    return (
      <li
        role="option"
        class="flex flex-row items-center mt-2 cursor-pointer text-base"
      >
        <input
          type="checkbox"
          checked={this.isSelected}
          class="facet-value-checkbox w-5 h-5"
          id={`${id}-input`}
          name={`${id}-input`}
          onClick={() => this.facetValueSelected.emit()}
        />
        <label
          htmlFor={`${id}-input`}
          class="ml-3 flex flex-row text-on-background flex-grow cursor-pointer"
        >
          {this.label}
          <span class="ml-auto self-end text-on-background-variant">
            {this.numberOfResults}
          </span>
        </label>
      </li>
    );
  }
}
