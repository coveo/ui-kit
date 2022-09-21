import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';

export interface DisplayOptions {
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  image?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
}

export interface ResultPlaceholderProps extends Omit<DisplayOptions, 'image'> {
  numberOfPlaceholders: number;
  isChild?: boolean;
}
