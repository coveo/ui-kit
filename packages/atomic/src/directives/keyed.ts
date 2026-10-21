import {type ChildPart, nothing} from 'lit';
import {clearPart, setCommittedValue} from 'lit/directive-helpers.js';
import {Directive, type DirectiveParameters, directive} from 'lit/directive.js';

/**
 * Renders `value` and re-creates its DOM whenever `key` changes, like Lit's `keyed()` directive.
 *
 * Lit's `keyed()` resets the part's committed value before the previous template instance is
 * cleared, so Lit never disconnects that instance. When the keyed template contains an async
 * directive such as `ref()`, the part keeps every previous instance, and the DOM subtree it
 * rendered, alive for its whole lifetime. This directive is Lit's with one more step: it clears
 * the part first, which disconnects and releases the previous instance.
 */
class Keyed extends Directive {
  private key: unknown = nothing;

  render(key: unknown, value: unknown) {
    this.key = key;
    return value;
  }

  override update(part: ChildPart, [key, value]: DirectiveParameters<this>) {
    if (key !== this.key) {
      clearPart(part);
      setCommittedValue(part);
      this.key = key;
    }
    return value;
  }
}

/**
 * Associates a renderable value with a unique key. When the key changes, the previous DOM is
 * removed and disposed before rendering the next value, even if the value is otherwise identical.
 *
 * Use this instead of `lit/directives/keyed.js`, which leaks the previous DOM when the keyed
 * template contains a `ref()` or another async directive.
 */
export const keyed = directive(Keyed);
