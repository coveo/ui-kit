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
  yield(slot: string, defaultContent?: unknown): TemplateResult | unknown[];
  _relocateSlottedContent(): void;
}

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

    private _initializeSlotState(): void {
      this.slots = {};
      this._slotsInitialized = false;
      this._slotPlaceholders = [];
      this._pendingSlotRelocation = false;
    }

    adoptChildren(): void {
      // Clear existing state
      this._clearSlotState();

      // Create a mapping of slot content without moving DOM nodes
      this._mapChildrenToSlots();

      this._slotsInitialized = true;
    }

    private _clearSlotState(): void {
      this.slots = {};
      this._slotPlaceholders = [];
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

    getSlotNameForChild(child: AdoptedNode): string {
      // Skip comment nodes and check their next sibling element
      if (child instanceof Comment && child.nextSibling instanceof Element) {
        return this.getSlotNameForChild(child.nextSibling);
      }

      // For elements, return the slot attribute value or empty string
      if (child instanceof Element) {
        return child.getAttribute('slot') || '';
      }

      // Default slot for non-element nodes
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

    yield(slot: string, defaultContent?: unknown): TemplateResult | unknown[] {
      this._ensureSlotsInitialized();

      if (this._hasSlotContent(slot)) {
        return this._createSlotPlaceholder(slot);
      }

      return defaultContent ? [defaultContent] : [];
    }

    private _ensureSlotsInitialized(): void {
      if (!this._slotsInitialized) {
        this.adoptChildren();
      }
    }

    private _hasSlotContent(slotName: string): boolean {
      return !this.isSlotEmpty(slotName);
    }

    private _createSlotPlaceholder(slotName: string): unknown[] {
      const slotContent = this.slots[slotName];
      if (!slotContent) {
        return [];
      }

      const placeholder = document.createComment(`slot:${slotName}`);

      this._slotPlaceholders.push({
        slotName,
        placeholder,
        originalNodes: slotContent,
      });

      this._pendingSlotRelocation = true;
      return [placeholder];
    }

    _relocateSlottedContent(): void {
      if (!this._pendingSlotRelocation) {
        return;
      }

      this._processSlotRelocations();
      this._resetRelocationState();
    }

    private _processSlotRelocations(): void {
      for (const placeholderInfo of this._slotPlaceholders) {
        this._relocateSingleSlot(placeholderInfo);
      }
    }

    private _relocateSingleSlot(placeholderInfo: SlotPlaceholder): void {
      const {placeholder, originalNodes} = placeholderInfo;
      const parent = placeholder.parentNode;

      if (!parent) {
        return;
      }

      // Insert each original node before the placeholder
      for (const node of originalNodes) {
        this._moveNodeIfNeeded(node, parent, placeholder);
      }

      // Remove the placeholder comment
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

    private _resetRelocationState(): void {
      this._slotPlaceholders = [];
      this._pendingSlotRelocation = false;
    }

    willUpdate(changedProperties: PropertyValues): void {
      super.willUpdate?.(changedProperties);

      if (!this.hasUpdated && !this._slotsInitialized) {
        this.adoptChildren();
      }
    }

    updated(changedProperties: PropertyValues): void {
      super.updated?.(changedProperties);

      // Relocate slot content after Lit has finished updating the DOM
      this._relocateSlottedContent();
    }
  }

  return SlotsForNoShadowDOMClass as T & Constructor<LightDOMWithSlots>;
};
