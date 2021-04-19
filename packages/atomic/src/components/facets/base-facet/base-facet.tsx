import {FunctionalComponent, h} from '@stencil/core';

import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';
import {I18nState} from '../../../utils/initialization-utils';

export interface BaseFacetState {
  isExpanded: boolean;
  strings: I18nState;
}

export class BaseFacetController {
  constructor(public state: BaseFacetState) {}

  public openModal() {
    this.state.isExpanded = true;
    document.body.classList.add('overflow-hidden');
  }

  public closeModal() {
    this.state.isExpanded = false;
    document.body.classList.remove('overflow-hidden');
  }
}

type BaseFacetProps = {
  controller: BaseFacetController;
  deselectAll: VoidFunction;
  label: string;
  hasActiveValues: boolean;
};

/**
 * @part facet - The wrapper for the entire facet
 * @part close-button - The button to close the facet when displayed modally (mobile only)
 * @part clear-button - The button that resets the actively selected facet values
 */
export const BaseFacet: FunctionalComponent<BaseFacetProps> = (
  props: BaseFacetProps,
  children
) => {
  const closeButton = props.controller.state.isExpanded ? (
    <button
      part="close-button"
      onClick={() => props.controller.closeModal()}
      class="ml-2 lg:hidden"
    >
      <div
        class="h-5 w-5 text-on-background fill-current"
        innerHTML={CloseIcon}
      />
    </button>
  ) : null;

  const clearButton = props.hasActiveValues ? (
    <button
      part="clear-button"
      onClick={() => props.deselectAll()}
      class="block text-primary mr-2 lg:mr-0 text-sm"
    >
      {props.controller.state.strings.clear()}
    </button>
  ) : null;

  return (
    <div class="facet mb-4" part="facet">
      <button
        title={props.label}
        class={`text-left border-solid bg-background px-4 h-9 outline-none focus:outline-none lg:hidden cursor-pointer ellipsed w-full ${
          props.hasActiveValues
            ? 'border-2 border-primary text-primary'
            : 'border border-divider text-on-background-variant'
        }`}
        onClick={() => props.controller.openModal()}
      >
        {props.label}
      </button>
      <div
        class={`content box-border p-3 lg:p-0 lg:block h-screen w-screen lg:h-auto lg:w-auto fixed object-left-top bg-background top-0 left-0 lg:static z-10 ${
          props.controller.state.isExpanded ? 'block' : 'hidden'
        }`}
      >
        <div class="flex flex-row items-center pb-2 mb-2 border-b border-solid border-divider">
          <span
            title={props.label}
            class="font-semibold text-on-background-variant text-base lg:text-sm ellipsed w-full"
          >
            {props.label}
          </span>
          <span class="flex flex-row ml-auto">
            {clearButton}
            {closeButton}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};
