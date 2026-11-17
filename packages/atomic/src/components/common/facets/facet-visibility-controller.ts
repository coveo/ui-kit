import type {ReactiveController, ReactiveControllerHost} from 'lit';

export class FacetVisibilityController implements ReactiveController {
  private readonly internals: ElementInternals;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    private readonly isHidden: () => boolean
  ) {
    this.internals = host.attachInternals();
    host.addController(this);
  }

  public hostUpdate() {
    if (this.isHidden()) {
      this.internals.states.add('hidden');
    } else {
      this.internals.states.delete('hidden');
    }
  }
}
