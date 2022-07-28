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

export interface ResultPlaceholderProps<ResultsPerPageState>
  extends Omit<DisplayOptions, 'image'> {
  resultsPerPageState: ResultsPerPageState;
  isChild?: boolean;
}
