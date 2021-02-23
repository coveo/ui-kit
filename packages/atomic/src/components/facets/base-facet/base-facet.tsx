import {FunctionalComponent, h} from '@stencil/core';

import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';

export interface BaseFacetState {
  isExpanded: boolean;
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

export const BaseFacet: FunctionalComponent<BaseFacetProps> = (
  props: BaseFacetProps,
  children
) => {
  const closeButton = props.controller.state.isExpanded ? (
    <button
      part="close-button"
      onClick={() => props.controller.closeModal()}
      class="ml-2"
    >
      <div
        class="h-5 w-5 text-on-background fill-current"
        innerHTML={CloseIcon}
      />
    </button>
  ) : null;

  const resetButton = props.hasActiveValues ? (
    <button
      part="reset-button"
      onClick={() => props.deselectAll()}
      class="block text-primary mr-2 lg:mr-0 text-sm"
    >
      Clear
    </button>
  ) : null;

  return (
    <div class="facet" part="facet">
      <button
        class={
          'facet-button border-solid bg-transparent px-4 h-9 outline-none focus:outline-none lg:hidden cursor-pointer ' +
          (props.hasActiveValues
            ? 'border-2 border-primary text-primary'
            : 'border border-divider text-on-background-variant')
        }
        onClick={() => props.controller.openModal()}
      >
        {props.label}
      </button>
      <div
        class={
          'content box-border lg:block h-screen w-screen lg:h-auto lg:w-auto fixed object-left-top bg-white top-0 left-0 lg:static p-3 z-10 ' +
          (props.controller.state.isExpanded ? 'block' : 'hidden')
        }
      >
        <div class="flex flex-row items-center pb-2 mb-2 border-b border-solid border-on-background">
          <span class="font-semibold text-on-background text-base lg:text-sm">
            {props.label}
          </span>
          <span class="flex flex-row block ml-auto">
            {resetButton}
            {closeButton}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};
