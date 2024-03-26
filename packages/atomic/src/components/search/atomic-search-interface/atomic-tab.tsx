// atomic-tab.tsx
import {Component, Prop, h, Event, EventEmitter} from '@stencil/core';
import {Button} from '../../common/button';

@Component({
  tag: 'atomic-tab',
  styleUrl: 'atomic-tab.pcss',
  shadow: true,
})
export class AtomicTab {
  @Prop()
  label!: string;
  @Prop()
  name!: string;
  @Prop()
  pipeline!: string;
  @Prop() isActive: boolean = false;

  @Event()
  tabClick!: EventEmitter;

  handleClick = () => {
    this.tabClick.emit(this.name);
  };

  render() {
    return (
      <div>
        <Button
          style={this.isActive ? 'text-primary' : 'text-neutral'}
          class={`p-3 w-full text-xl ${this.isActive ? 'font-bold' : ''}`}
          text={this.label}
          part="button"
          onClick={this.handleClick}
        ></Button>
      </div>
    );
  }
}
