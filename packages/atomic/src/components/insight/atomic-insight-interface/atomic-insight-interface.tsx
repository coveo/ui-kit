import {Component, h} from '@stencil/core';

/**
 * The `atomic-recs-interface` component is the parent to all other atomic components in a recommendation interface. It handles the headless recommendation engine and localization configurations.
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
