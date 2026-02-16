import {
  containsSections,
  type ItemSectionTagName,
} from './item-layout-sections';

export interface ItemLayoutConfig {
  children: HTMLCollection;
  display: ItemDisplayLayout;
  density: ItemDisplayDensity;
  imageSize: ItemDisplayImageSize;
}

export type ItemDisplayBasicLayout = 'list' | 'grid';
export type ItemDisplayLayout = ItemDisplayBasicLayout | 'table';
export type ItemDisplayDensity = 'comfortable' | 'normal' | 'compact';
export type ItemDisplayImageSize = 'large' | 'small' | 'icon' | 'none';
export type ItemTarget = '_self' | '_blank' | '_parent' | '_top';

function getDisplayClass(display: ItemDisplayLayout) {
  switch (display) {
    case 'grid':
      return 'display-grid';
    case 'table':
      return 'display-table';
    default:
      return 'display-list';
  }
}

function getDensityClass(density: ItemDisplayDensity) {
  switch (density) {
    case 'comfortable':
      return 'density-comfortable';
    case 'compact':
      return 'density-compact';
    default:
      return 'density-normal';
  }
}

function getImageClass(image: ItemDisplayImageSize) {
  switch (image) {
    case 'large':
      return 'image-large';
    case 'small':
      return 'image-small';
    case 'none':
      return 'image-none';
    default:
      return 'image-icon';
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

function getSection(
  children: HTMLCollection,
  section: ItemSectionTagName
): Element | undefined {
  return Array.from(children).find(
    (element) => element.tagName.toLowerCase() === section
  );
}

function getImageSizeFromSections(
  children: HTMLCollection
): ItemDisplayImageSize | undefined {
  const imageSize = getSection(
    children,
    'atomic-result-section-visual'
  )?.getAttribute('image-size');
  if (!imageSize) {
    return undefined;
  }
  return imageSize as ItemDisplayImageSize;
}

export function getItemLayoutClasses(
  config: ItemLayoutConfig,
  HTMLContent?: string
): string[] {
  const classes = getItemDisplayClasses(
    config.display,
    config.density,
    getImageSizeFromSections(config.children) ?? config.imageSize
  );
  if (
    HTMLContent
      ? containsSections(HTMLContent)
      : containsSections(config.children)
  ) {
    classes.push('with-sections');
  }
  return classes;
}
