/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Adapted from Lit's `keyed` directive (`lit-html/directives/keyed.js`).
 */
import {type ChildPart, nothing} from 'lit';
import {clearPart, setCommittedValue} from 'lit/directive-helpers.js';
import {Directive, type DirectiveParameters, directive} from 'lit/directive.js';

class KeyedDirective extends Directive {
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
 * Renders `value` and re-creates its DOM whenever `key` changes, like Lit's `keyed()` directive.
 *
 * Use it instead of Lit's `keyed()`, which leaks what it replaces: it resets the part's committed
 * value without clearing the part, so Lit never disconnects the previous template instance. When
 * that instance contains a `ref()` or another async directive, the part keeps it, and the DOM it
 * rendered, for as long as the part exists. This directive clears the part first, which
 * disconnects and releases the previous instance.
 */
export const keyed = directive(KeyedDirective);
