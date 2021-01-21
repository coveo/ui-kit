import {Component, h, Prop, State} from '@stencil/core';
import {buildTab, Tab, TabProps, TabState} from '@coveo/headless';
import {
  Initialization,
  Bindings,
  AtomicComponentInterface,
} from '../../utils/initialization-utils';
/**
 * @part tab-button - The tab button
 * @part active-tab - The active tab
 */
@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.pcss',
  shadow: true,
})
export class AtomicTab implements AtomicComponentInterface {
  @Prop() expression = '';
  @Prop() isActive = false;
  @State() controllerState!: TabState;

  public bindings!: Bindings;
  public controller!: Tab;

  @Initialization()
  public initialize() {
    const options: TabProps = {
      options: {
        expression: this.expression,
      },
      initialState: {
        isActive: this.isActive,
      },
    };
    this.controller = buildTab(this.bindings.engine, options);
  }

  public handleClick() {
    this.controller.select();
  }

  render() {
    let activeClass = 'btn-outline-primary';
    let activePart = {};
    if (this.controllerState.isActive) {
      activeClass = 'active';
      activePart = {part: 'active-tab'};
    }
    return (
      <span {...activePart}>
        <button
          part="tab-button"
          class={'p-2 bg-primary border-none h-10 ' + activeClass}
          onClick={() => this.handleClick()}
        >
          <slot />
        </button>
      </span>
    );
  }
}
