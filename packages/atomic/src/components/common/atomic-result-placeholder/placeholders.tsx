import {Fragment, FunctionalComponent, h} from '@stencil/core';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';

export interface ResultPlaceholderProps {
  density: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  display?: ResultDisplayLayout;
  numberOfPlaceholders: number;
}

export const ResultsPlaceholder: FunctionalComponent<ResultPlaceholderProps> = (
  props
) => {
  return Array.from({length: props.numberOfPlaceholders}, (_, i) => (
    <atomic-result-placeholder
      key={`placeholder-${i}`}
      density={props.density}
      display={props.display || 'list'}
      imageSize={props.imageSize!}
    ></atomic-result-placeholder>
  ));
};

export const TableDisplayResultsPlaceholder: FunctionalComponent<
  ResultPlaceholderProps
> = (props) => {
  return (
    <atomic-result-table-placeholder
      density={props.density}
      imageSize={props.imageSize!}
      rows={props.numberOfPlaceholders}
    ></atomic-result-table-placeholder>
  );
};

export const GeneratedAnswerPlaceholder: FunctionalComponent = () => {
  return (
    <Fragment>
      <GeneratedAnswerHeaderPlaceholder />
      <GeneratedAnswerParagraphPlaceholder />
      <GeneratedAnswerCitationsPlaceholder />
    </Fragment>
  );
};

const GeneratedAnswerHeaderPlaceholder: FunctionalComponent = () => {
  return (
    <div class="flex items-center mb-8">
      <div class="block bg-neutral rounded h-4 w-48 animate-pulse"></div>
      <div class="flex gap-2 h-9 items-center ml-auto">
        <div class="block bg-neutral rounded h-4 w-12 animate-pulse"></div>
        <div class="block bg-neutral rounded h-4 w-12 animate-pulse"></div>
      </div>
    </div>
  );
};

const GeneratedAnswerParagraphPlaceholder: FunctionalComponent = () => {
  return (
    <div>
      <div class="block bg-neutral rounded h-4 w-full animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-3/4 animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-3/4 animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-full animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-1/3 animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-full animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-1/3 animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-full animate-pulse mb-4"></div>
      <div class="block bg-neutral rounded h-4 w-3/4 animate-pulse mb-4"></div>
    </div>
  );
};

const GeneratedAnswerCitationsPlaceholder: FunctionalComponent = () => {
  return (
    <div class="gap-2 mt-6 flex">
      <div class="block bg-neutral rounded h-4 w-24 animate-pulse"></div>
      <div class="block bg-neutral rounded h-4 w-24 animate-pulse"></div>
      <div class="block bg-neutral rounded h-4 w-24 animate-pulse"></div>
      <div class="flex gap-2 h-9 items-center ml-auto">
        <div class="block bg-neutral rounded h-4 w-12 animate-pulse"></div>
        <div class="block bg-neutral rounded h-4 w-12 animate-pulse"></div>
      </div>
    </div>
  );
};
