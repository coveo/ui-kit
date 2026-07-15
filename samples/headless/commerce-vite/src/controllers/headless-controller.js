/**
 * A Lit reactive controller that bridges any Coveo Headless controller to a Lit
 * host component.
 *
 * It is the single seam between Headless state management and Lit rendering:
 * when the host connects, it subscribes to the Headless controller and requests
 * a re-render on every state change; when the host disconnects, it unsubscribes
 * so detached components stop receiving updates. Any component that renders
 * Headless state creates one of these, which keeps the components themselves
 * free of subscription bookkeeping.
 *
 * @see https://lit.dev/docs/composition/controllers/
 * @implements {import('lit').ReactiveController}
 */
export class HeadlessController {
  /**
   * @param {import('lit').ReactiveControllerHost} host - The Lit component to update.
   * @param {{subscribe: (listener: () => void) => () => void}} controller - Any Headless controller.
   */
  constructor(host, controller) {
    this.host = host;
    this.controller = controller;
    host.addController(this);
  }

  hostConnected() {
    // `subscribe` returns an unsubscribe function and immediately invokes the
    // listener once, so the host renders the current state right away.
    this.unsubscribe = this.controller.subscribe(() =>
      this.host.requestUpdate()
    );
  }

  hostDisconnected() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}
