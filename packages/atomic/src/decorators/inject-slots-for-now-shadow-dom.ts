import type {PropertyValues} from 'lit';

type AdoptedNode = ChildNode & {contentFor?: string};

/**
 * Decorator that adds light DOM slot functionality to LitElement components.
 *
 * This decorator enables components to render in the light DOM while still supporting
 * slot-based content distribution. It provides methods to adopt child nodes into slots,
 * check if slots are empty, and yield slot content with optional default fallbacks.
 *
 * Usage:
 *   @injectSlotsForNoShadowDOM()
 *   class MyComponent extends LitElement {
 *     render() {
 *       return html`
 *         <div class="header">${this.yield('header')}</div>
 *         <div class="content">${this.yield('content', html`Default content`)}</div>
 *       `;
 *     }
 *   }
 */
export function injectSlotsForNoShadowDOM() {
  return (target: {
    // biome-ignore lint/suspicious/noExplicitAny: decorator target type
    prototype: any;
  }) => {
    target.prototype.createRenderRoot = function () {
      return this;
    };

    const originalConnectedCallback = target.prototype.connectedCallback;
    target.prototype.connectedCallback = function () {
      this.slots = {};
      this._slotsInitialized = false;

      if (originalConnectedCallback) {
        originalConnectedCallback.call(this);
      }
    };

    // Add adoptChildren method
    target.prototype.adoptChildren = function () {
      // Clear existing slots to prevent duplication
      this.slots = {};

      Array.from(this.childNodes as NodeListOf<ChildNode>).forEach(
        (child: AdoptedNode) => {
          const slotName = this.getSlotNameForChild(child);
          const {[slotName]: content = []} = this.slots;

          Object.assign(this.slots, {
            [slotName]: [...content, child],
          });
        }
      );

      this._slotsInitialized = true;
    };

    target.prototype.getSlotNameForChild = function (
      child: AdoptedNode
    ): string {
      if (child instanceof Comment && child.nextSibling instanceof Element) {
        return this.getSlotNameForChild(child.nextSibling);
      }

      if (child instanceof Element && child.hasAttribute('slot')) {
        return child.getAttribute('slot') || '';
      }

      return '';
    };

    target.prototype.isTextNodeEmpty = (node: Text): boolean => {
      return !node.textContent || !node.textContent.trim();
    };

    target.prototype.isSlotEmpty = function (slot: string): boolean {
      const content = this.slots[slot];

      return (
        !content ||
        content.every((child: AdoptedNode) => {
          return (
            child instanceof Comment ||
            (child instanceof Text && this.isTextNodeEmpty(child))
          );
        })
      );
    };

    target.prototype.yield = function (slot: string, defaultContent?: unknown) {
      if (!this._slotsInitialized) {
        this.adoptChildren();
      }

      const slotContent = this.slots[slot];

      return [
        ...(slotContent || []),
        ...(this.isSlotEmpty(slot) && defaultContent ? [defaultContent] : []),
      ];
    };

    const originalWillUpdate = target.prototype.willUpdate;
    target.prototype.willUpdate = function (changedProperties: PropertyValues) {
      if (originalWillUpdate) {
        originalWillUpdate.call(this, changedProperties);
      }

      if (!this.hasUpdated && !this._slotsInitialized) {
        this.adoptChildren();
      }
    };
  };
}
