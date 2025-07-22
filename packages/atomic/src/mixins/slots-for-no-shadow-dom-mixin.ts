import type {LitElement, PropertyValues, TemplateResult} from 'lit';
import type {Constructor} from './mixin-common';

type AdoptedNode = ChildNode & {contentFor?: string};

interface SlotMapping {
  [name: string]: AdoptedNode[] | undefined;
}

interface SlotPlaceholder {
  slotName: string;
  placeholder: Comment;
  originalNodes: AdoptedNode[];
}

export interface LightDOMWithSlots {
  slots: SlotMapping;
  _slotsInitialized: boolean;
  _slotPlaceholders: SlotPlaceholder[];
  _pendingSlotRelocation: boolean;
  adoptChildren(): void;
  getSlotNameForChild(child: AdoptedNode): string;
  isTextNodeEmpty(node: Text): boolean;
  isSlotEmpty(slot: string): boolean;
  renderDefaultSlotContent(
    defaultContent?: unknown
  ): TemplateResult | unknown[];
}

/**
 * A mixin class that provides slot functionality for LitElement components
 * that render in the light DOM (no shadow DOM).
 *
 * This class manages child node mapping to named slots, similar to how
 * shadow DOM slots work, but operates in the light DOM. It provides
 * methods to adopt children, map them to slots based on their `slot`
 * attribute, and yield slot content during rendering.
 *
 * @example
 * ```typescript
 * class MyElement extends SlotsForNoShadowDOMMixin(LitElement) {
 *   render() {
 *     return html`
 *       <div class="header">${this.renderDefaultSlotContent()}</div>
 *     `;
 *   }
 * }
 * ```
 *
 * @implements {LightDOMWithSlots}
 */
export const SlotsForNoShadowDOMMixin = <T extends Constructor<LitElement>>(
  superClass: T
) => {
  class SlotsForNoShadowDOMClass
    extends superClass
    implements LightDOMWithSlots
  {
    slots: SlotMapping = {};
    _slotsInitialized = false;
    _slotPlaceholders: SlotPlaceholder[] = [];
    _pendingSlotRelocation = false;

    createRenderRoot() {
      return this;
    }

    connectedCallback() {
      this._initializeSlotState();
      super.connectedCallback?.();
    }

    willUpdate(changedProperties: PropertyValues): void {
      super.willUpdate?.(changedProperties);
      if (!this.hasUpdated && !this._slotsInitialized) {
        this.adoptChildren();
      }
    }

    public updated(changedProperties: PropertyValues): void {
      super.updated?.(changedProperties);
      // Relocate slot content after Lit has finished updating the DOM
      if (!this._pendingSlotRelocation) {
        return;
      }
      for (const placeholderInfo of this._slotPlaceholders) {
        this._relocateSingleSlot(placeholderInfo);
      }
      this._slotPlaceholders = [];
      this._pendingSlotRelocation = false;
    }

    private adoptChildren(): void {
      this.slots = {};
      this._slotPlaceholders = [];
      this._mapChildrenToSlots();
      this._slotsInitialized = true;
    }

    public renderDefaultSlotContent(
      defaultContent?: unknown
    ): TemplateResult | unknown[] {
      this._ensureSlotsInitialized();
      if (this._hasDefaultSlotContent()) {
        return this._createSlotPlaceholder('');
      }
      return defaultContent ? [defaultContent] : [];
    }

    public getSlotNameForChild(child: AdoptedNode): string {
      if (child instanceof Comment && child.nextSibling instanceof Element) {
        return this.getSlotNameForChild(child.nextSibling);
      }
      if (child instanceof Element) {
        return child.getAttribute('slot') || '';
      }
      return '';
    }

    public isTextNodeEmpty(node: Text): boolean {
      return !node.textContent || !node.textContent.trim();
    }

    public isSlotEmpty(slot: string): boolean {
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

    private _initializeSlotState(): void {
      this.slots = {};
      this._slotsInitialized = false;
      this._slotPlaceholders = [];
      this._pendingSlotRelocation = false;
    }

    private _ensureSlotsInitialized(): void {
      if (!this._slotsInitialized) {
        this.adoptChildren();
      }
    }

    private _hasDefaultSlotContent(): boolean {
      return !this.isSlotEmpty('');
    }

    private _mapChildrenToSlots(): void {
      const children = Array.from(this.childNodes as NodeListOf<ChildNode>);
      for (const child of children) {
        const slotName = this.getSlotNameForChild(child as AdoptedNode);
        this._addChildToSlot(child as AdoptedNode, slotName);
      }
    }

    private _addChildToSlot(child: AdoptedNode, slotName: string): void {
      if (!this.slots[slotName]) {
        this.slots[slotName] = [];
      }
      this.slots[slotName]!.push(child);
    }

    private _createSlotPlaceholder(slotName: string): unknown[] {
      const slotContent = this.slots[slotName];
      if (!slotContent) {
        return [];
      }
      const placeholder = document.createComment(
        `slot:${slotName || 'default'}`
      );
      this._slotPlaceholders.push({
        slotName,
        placeholder,
        originalNodes: slotContent,
      });
      this._pendingSlotRelocation = true;
      return [placeholder];
    }

    private _relocateSingleSlot(placeholderInfo: SlotPlaceholder): void {
      const {placeholder, originalNodes} = placeholderInfo;
      const parent = placeholder.parentNode;
      if (!parent) {
        return;
      }
      for (const node of originalNodes) {
        this._moveNodeIfNeeded(node, parent, placeholder);
      }
      placeholder.remove();
    }

    private _moveNodeIfNeeded(
      node: AdoptedNode,
      parent: Node,
      placeholder: Comment
    ): void {
      const needsMove =
        node.parentNode !== parent || node.nextSibling !== placeholder;
      if (needsMove) {
        parent.insertBefore(node, placeholder);
      }
    }
  }

  return SlotsForNoShadowDOMClass as T & Constructor<LightDOMWithSlots>;
};
