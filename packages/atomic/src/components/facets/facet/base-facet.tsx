import {Component, h, Event, EventEmitter, State, Prop} from '@stencil/core';

import CloseIcon from 'coveo-styleguide/resources/icons/svg/close.svg';

@Component({
  tag: 'base-facet',
  styleUrl: 'base-facet.pcss',
  shadow: false,
})
export class BaseFacet {
  @State() public isExpanded: Boolean = false;
  @Event() public deselectAll!: EventEmitter<void>;
  @Prop() public label!: string;
  @Prop() public hasActiveValues!: boolean;

  private openModal() {
    this.isExpanded = true;
    document.body.classList.add('overflow-hidden');
  }

  private closeModal() {
    this.isExpanded = false;
    document.body.classList.remove('overflow-hidden');
  }

  private get closeButton() {
    return this.isExpanded ? (
      <button onClick={() => this.closeModal()} class="ml-2">
        <div
          class="h-4 w-4 text-on-background fill-current"
          innerHTML={CloseIcon}
        />
      </button>
    ) : null;
  }

  private get resetButton() {
    return this.hasActiveValues ? (
      <button
        onClick={() => this.deselectAll.emit()}
        class="block text-primary mr-2 text-sm"
      >
        Clear
      </button>
    ) : null;
  }

  public render() {
    return (
      <div class="facet" part="facet">
        <button
          class={
            'facet-button border-solid bg-transparent  px-4 h-9 outline-none focus:outline-none lg:hidden cursor-pointer ' +
            (this.hasActiveValues
              ? 'border-2 border-primary text-primary'
              : 'border border-divider text-on-background-variant')
          }
          onClick={() => this.openModal()}
        >
          {this.label}
        </button>
        <div
          class={
            'content box-border  lg:block h-screen w-screen lg:h-auto lg:w-auto fixed object-left-top bg-white top-0 left-0 lg:static p-3 ' +
            (this.isExpanded ? 'block' : 'hidden')
          }
        >
          <div class="flex flex-row items-center pb-2 mb-2 border-b border-solid border-on-background">
            <span class="font-semibold text-on-background text-sm">
              {this.label}
            </span>
            <span class="flex flex-row block ml-auto">
              {this.resetButton}
              {this.closeButton}
            </span>
          </div>
          <slot />
        </div>
      </div>
    );
  }
}
