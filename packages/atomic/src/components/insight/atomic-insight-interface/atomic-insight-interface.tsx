import {Component, h} from '@stencil/core';

/**
 * The `atomic-insight-interface` component is the parent to all other atomic components in a insight panel interface. It handles the headless insight panel engine and localization configurations.
 *
 * @internal
 */
@Component({
  tag: 'atomic-insight-interface',
  shadow: true,
})
export class AtomicInsightInterface {
  render() {
    return <div>Hello from Insight interface</div>;
  }
}
