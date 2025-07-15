import type {PropertyValues} from 'lit';

type AdoptedNode = ChildNode & {contentFor?: string};

export interface LightDOMWithSlots {
  slots: {[name: string]: AdoptedNode[] | undefined};
  _slotsInitialized: boolean;
  adoptChildren(): void;
  getSlotNameForChild(child: AdoptedNode): string;
  isTextNodeEmpty(node: Text): boolean;
  isSlotEmpty(slot: string): boolean;
  yield(slot: string, defaultContent?: unknown): unknown[];
}

/**
 * Mixin that adds light DOM slot functionality to LitElement components.
 *
 * This mixin enables components to render in the light DOM while still supporting
 * slot-based content distribution. It provides methods to adopt child nodes into slots,
 * check if slots are empty, and yield slot content with optional default fallbacks.
 *
 * Usage:
 *   class MyComponent extends SlotsForNoShadowDOMMixin(LitElement) {
 *     render() {
 *       return html`
 *         <div class="header">${this.yield('header')}</div>
 *         <div class="content">${this.yield('content', html`Default content`)}</div>
 *       `;
 *     }
 *   }
 */
// biome-ignore lint/suspicious/noExplicitAny: mixin needs to work with any class constructor
export function SlotsForNoShadowDOMMixin<T extends new (...args: any[]) => any>(
  Base: T
  // biome-ignore lint/suspicious/noExplicitAny: mixin return type needs any for flexibility
): T & (new (...args: any[]) => LightDOMWithSlots) {
  class SlotsForNoShadowDOMClass extends Base implements LightDOMWithSlots {
    slots: {[name: string]: AdoptedNode[] | undefined} = {};
    _slotsInitialized = false;

    createRenderRoot() {
      return this;
    }

    connectedCallback() {
      this.slots = {};
      this._slotsInitialized = false;
      super.connectedCallback?.();
    }

    adoptChildren(): void {
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
    }

    getSlotNameForChild(child: AdoptedNode): string {
      if (child instanceof Comment && child.nextSibling instanceof Element) {
        return this.getSlotNameForChild(child.nextSibling);
      }

      if (child instanceof Element && child.hasAttribute('slot')) {
        return child.getAttribute('slot') || '';
      }

      return '';
    }

    isTextNodeEmpty(node: Text): boolean {
      return !node.textContent || !node.textContent.trim();
    }

    isSlotEmpty(slot: string): boolean {
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
    }

    yield(slot: string, defaultContent?: unknown): unknown[] {
      if (!this._slotsInitialized) {
        this.adoptChildren();
      }

      const slotContent = this.slots[slot];

      return [
        ...(slotContent || []),
        ...(this.isSlotEmpty(slot) && defaultContent ? [defaultContent] : []),
      ];
    }

    willUpdate(changedProperties: PropertyValues): void {
      super.willUpdate?.(changedProperties);

      if (!this.hasUpdated && !this._slotsInitialized) {
        this.adoptChildren();
      }
    }
  }

  return SlotsForNoShadowDOMClass as T &
    (new (
      // biome-ignore lint/suspicious/noExplicitAny: <>
      ...args: any[]
    ) => LightDOMWithSlots);
}
