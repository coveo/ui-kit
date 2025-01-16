import {LitElement, noChange} from 'lit';
import {directive, Directive, Part, PartType} from 'lit-html/directive.js';

// TODO: KIT-3822: Add unit tests for this directive.
class DisplayIfDirective extends Directive {
  render<T>(_condition: boolean, _children: T) {
    return noChange;
  }

  update<T>(part: Part, [displayCondition, children]: [boolean, T]) {
    if (part.type !== PartType.CHILD) {
      throw new Error(
        `"displayIf" can only be used in child bindings. Expected PartType "${PartType.CHILD}", but received PartType "${part.type}".`
      );
    }

    if (!(part.options?.host instanceof LitElement)) {
      throw new Error('The directive must be applied to a host element.');
    }

    part.options.host.classList.toggle('atomic-hidden', displayCondition);
    if (displayCondition) {
      return;
    }
    return children;
  }
}

/**
 * A directive to render children only if a condition is met.
 *
 * ### Usage:
 * ```typescript
 * class MyElement extends LitElement {
 *   render() {
 *     return displayIf(shouldDisplay, html`<children-element></children-element>`);
 *   }
 * }
 * ```
 *
 * In the example above, `<children-element>` is added to the host element
 * when `shouldDisplay` is true, and removed when it is false.
 *
 * ### Notes:
 * This directive also modifies the host element's class list by toggling the `atomic-hidden` CSS class based on the given condition.
 *
 * @param condition A boolean value that determines whether to display the children or not.
 * @param children Children to render if the condition is met.
 */
export const displayIf = directive(DisplayIfDirective);
