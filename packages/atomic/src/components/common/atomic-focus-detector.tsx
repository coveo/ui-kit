import {
  h,
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Host,
} from '@stencil/core';
import {getFocusedElement, isAncestorOf} from '../../utils/utils';

/**
 * @internal
 */
@Component({
  tag: 'atomic-focus-detector',
  shadow: false,
})
export class AtomicFocusDetector {
  @Element() private host!: HTMLElement;

  @Event() focusEnter!: EventEmitter;
  @Event() focusExit!: EventEmitter;

  private focusWasContained = this.containsFocus;

  private get containsFocus() {
    const focusedElement = getFocusedElement();

    return !!focusedElement && isAncestorOf(this.host, focusedElement);
  }

  @Listen('focusin', {target: 'document'})
  onFocusIn() {
    this.onFocusChanged();
  }

  @Listen('focusout', {target: 'document'})
  onFocusOut() {
    this.onFocusChanged();
  }

  private onFocusChanged() {
    const containsFocus = this.containsFocus;
    if (containsFocus === this.focusWasContained) {
      return;
    }

    this.focusWasContained = containsFocus;
    containsFocus ? this.focusEnter.emit() : this.focusExit.emit();
  }

  render() {
    return <Host style={{display: 'contents'}}></Host>;
  }
}
