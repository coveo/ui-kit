import {
  getItemDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from './display-options';

import {
  containsSections,
  type ItemSectionTagName,
} from './item-layout-sections';

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

  private getImageSizeFromSections() {
    const imageSize = this.getSection(
      'atomic-result-section-visual'
    )?.getAttribute('image-size');
    if (!imageSize) {
      return undefined;
    }
    return imageSize as ItemDisplayImageSize;
  }

  private getSection(section: ItemSectionTagName) {
    return Array.from(this.children).find(
      (element) => element.tagName.toLowerCase() === section
    );
  }

  public getClasses(HTMLContent?: string) {
    const classes = getItemDisplayClasses(
      this.display,
      this.density,
      this.getImageSizeFromSections() ?? this.imageSize
    );
    if (
      HTMLContent
        ? containsSections(HTMLContent)
        : containsSections(this.children)
    ) {
      classes.push('with-sections');
    }
    return classes;
  }
}
