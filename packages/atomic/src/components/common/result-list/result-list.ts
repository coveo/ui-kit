import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';

// TODO: figure out what to do with this

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
