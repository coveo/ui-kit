import {
  getItemDisplayClasses as getItemDisplayClassesImport,
  getItemLayoutClasses,
  getItemListDisplayClasses as getItemListDisplayClassesImport,
  type ItemDisplayBasicLayout as ItemDisplayBasicLayoutImport,
  type ItemDisplayDensity as ItemDisplayDensityImport,
  type ItemDisplayImageSize as ItemDisplayImageSizeImport,
  type ItemDisplayLayout as ItemDisplayLayoutImport,
  type ItemTarget as ItemTargetImport,
} from './item-layout-utils';

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export type ItemDisplayBasicLayout = ItemDisplayBasicLayoutImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export type ItemDisplayDensity = ItemDisplayDensityImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export type ItemDisplayImageSize = ItemDisplayImageSizeImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export type ItemDisplayLayout = ItemDisplayLayoutImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export type ItemTarget = ItemTargetImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export const getItemDisplayClasses: typeof getItemDisplayClassesImport =
  getItemDisplayClassesImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, import from `item-layout-utils.ts` instead.
 */
export const getItemListDisplayClasses: typeof getItemListDisplayClassesImport =
  getItemListDisplayClassesImport;

/**
 * @deprecated Use only for Stencil components. For Lit components, use `getItemLayoutClasses` with `ItemLayoutConfig` from `packages/atomic/src/components/common/layout/item-layout-utils.ts` instead.
 */
export class ItemLayout {
  private children: HTMLCollection;
  private density: ItemDisplayDensity;
  private imageSize: ItemDisplayImageSize;
  private display: ItemDisplayLayout;

  constructor(
    children: HTMLCollection,
    display: ItemDisplayLayout,
    density: ItemDisplayDensity,
    imageSize: ItemDisplayImageSize
  ) {
    this.children = children;
    this.display = display;
    this.density = density;
    this.imageSize = imageSize;
  }

  public getClasses(HTMLContent?: string) {
    return getItemLayoutClasses(
      {
        children: this.children,
        display: this.display,
        density: this.density,
        imageSize: this.imageSize,
      },
      HTMLContent
    );
  }
}
