import {containsSections, ItemSectionTagName} from './sections';

export type ItemDisplayBasicLayout = 'list' | 'grid';
export type ItemDisplayLayout = ItemDisplayBasicLayout | 'table';
export type ItemDisplayDensity = 'comfortable' | 'normal' | 'compact';
export type ItemDisplayImageSize = 'large' | 'small' | 'icon' | 'none';
export type ItemTarget = '_self' | '_blank' | '_parent' | '_top';

function getDisplayClass(display: ItemDisplayLayout) {
  switch (display) {
    case 'grid':
      return 'display-grid';
    case 'list':
    default:
      return 'display-list';
    case 'table':
      return 'display-table';
  }
}

function getDensityClass(density: ItemDisplayDensity) {
  switch (density) {
    case 'comfortable':
      return 'density-comfortable';
    case 'normal':
    default:
      return 'density-normal';
    case 'compact':
      return 'density-compact';
  }
}

function getImageClass(image: ItemDisplayImageSize) {
  switch (image) {
    case 'large':
      return 'image-large';
    case 'small':
      return 'image-small';
    case 'icon':
    default:
      return 'image-icon';
    case 'none':
      return 'image-none';
  }
}

export function getItemListDisplayClasses(
  display: ItemDisplayLayout,
  density: ItemDisplayDensity,
  image: ItemDisplayImageSize,
  isLoading: boolean,
  isAppLoading: boolean
) {
  const classes = getItemDisplayClasses(display, density, image);

  if (isLoading) {
    classes.push('loading');
  }

  if (isAppLoading) {
    classes.push('placeholder');
  }
  return classes.join(' ');
}

export function getItemDisplayClasses(
  display: ItemDisplayLayout,
  density: ItemDisplayDensity,
  image: ItemDisplayImageSize
) {
  const classes = [
    getDisplayClass(display),
    getDensityClass(density),
    getImageClass(image),
  ];
  return classes;
}

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
