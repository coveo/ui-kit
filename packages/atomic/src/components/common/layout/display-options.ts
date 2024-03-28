import {containsSections, ResultSectionTagName} from './sections';

export type ResultDisplayBasicLayout = 'list' | 'grid';
export type ResultDisplayLayout = ResultDisplayBasicLayout | 'table';
export type ResultDisplayDensity = 'comfortable' | 'normal' | 'compact';
export type ResultDisplayImageSize = 'large' | 'small' | 'icon' | 'none';
export type ResultTarget = '_self' | '_blank' | '_parent' | '_top';

function getDisplayClass(display: ResultDisplayLayout) {
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

function getDensityClass(density: ResultDisplayDensity) {
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

function getImageClass(image: ResultDisplayImageSize) {
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

export function getResultListDisplayClasses(
  display: ResultDisplayLayout,
  density: ResultDisplayDensity,
  image: ResultDisplayImageSize,
  isLoading: boolean,
  isAppLoading: boolean
) {
  const classes = getResultDisplayClasses(display, density, image);

  if (isLoading) {
    classes.push('loading');
  }

  if (isAppLoading) {
    classes.push('placeholder');
  }
  return classes.join(' ');
}

export function getResultDisplayClasses(
  display: ResultDisplayLayout,
  density: ResultDisplayDensity,
  image: ResultDisplayImageSize
) {
  const classes = [
    getDisplayClass(display),
    getDensityClass(density),
    getImageClass(image),
  ];
  return classes;
}

export class ResultLayout {
  private children: HTMLCollection;
  private density: ResultDisplayDensity;
  private imageSize: ResultDisplayImageSize;
  private display: ResultDisplayLayout;

  constructor(
    children: HTMLCollection,
    display: ResultDisplayLayout,
    density: ResultDisplayDensity,
    imageSize: ResultDisplayImageSize
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
    return imageSize as ResultDisplayImageSize;
  }

  private getSection(section: ResultSectionTagName) {
    return Array.from(this.children).find(
      (element) => element.tagName.toLowerCase() === section
    );
  }

  public getClasses(HTMLContent?: string) {
    const classes = getResultDisplayClasses(
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
