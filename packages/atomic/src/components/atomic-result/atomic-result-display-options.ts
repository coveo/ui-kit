export type ResultDisplayLayout = 'list' | 'grid' | 'table';
export type ResultDisplayDensity = 'comfortable' | 'normal' | 'compact';
export type ResultDisplayImageSize = 'large' | 'small' | 'icon' | 'none';

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
