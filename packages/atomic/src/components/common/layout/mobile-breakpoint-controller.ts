import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {BaseStore} from '@/src/components/common/interface/store';

/**
 * A reactive controller that manages mobile breakpoint changes through event communication.
 * This controller listens for 'atomic-layout-breakpoint-change' events and updates a store
 * with the new breakpoint value.
 */
export class MobileBreakpointController implements ReactiveController {
  private host: ReactiveControllerHost;
  private store: BaseStore<{mobileBreakpoint: string}>;
  private eventListener: (e: Event) => void;

  constructor(
    host: ReactiveControllerHost,
    store: BaseStore<{mobileBreakpoint: string}>
  ) {
    this.host = host;
    this.store = store;
    this.eventListener = this.handleBreakpointChange.bind(this);

    this.host.addController(this);
  }

  hostConnected() {
    (this.host as unknown as HTMLElement).addEventListener(
      'atomic-layout-breakpoint-change',
      this.eventListener
    );
  }

  hostDisconnected() {
    (this.host as unknown as HTMLElement).removeEventListener(
      'atomic-layout-breakpoint-change',
      this.eventListener
    );
  }

  private handleBreakpointChange(e: Event) {
    const customEvent = e as CustomEvent;
    const newBreakpoint = customEvent.detail?.breakpoint;

    if (newBreakpoint && this.store.state.mobileBreakpoint !== newBreakpoint) {
      this.store.state.mobileBreakpoint = newBreakpoint;
    }
  }
}
