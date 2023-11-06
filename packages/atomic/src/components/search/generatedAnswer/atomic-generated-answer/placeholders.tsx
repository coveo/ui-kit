import {h, Fragment, FunctionalComponent} from '@stencil/core';

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
  const classesAnim = 'block bg-neutral rounded h-4 animate-pulse';
  const classesAnimHeaderActions = `${classesAnim} w-12`;
  return (
    <div class="flex items-center mb-8">
      <div class={`${classesAnim} w-48`}></div>
      <div class="flex gap-2 h-9 items-center ml-auto">
        <div class={classesAnimHeaderActions}></div>
        <div class={classesAnimHeaderActions}></div>
        <div class={classesAnimHeaderActions}></div>
      </div>
    </div>
  );
};

const GeneratedAnswerParagraphPlaceholder: FunctionalComponent = () => {
  const classesAnim = 'block bg-neutral rounded h-4 animate-pulse mb-4';
  return (
    <div>
      <div class={`${classesAnim} w-full`}></div>
      <div class={`${classesAnim} w-3/4`}></div>
      <div class={`${classesAnim} w-3/4`}></div>
      <div class={`${classesAnim} w-full`}></div>
      <div class={`${classesAnim} w-1/3`}></div>
      <div class={`${classesAnim} w-full`}></div>
      <div class={`${classesAnim} w-1/3`}></div>
      <div class={`${classesAnim} w-full`}></div>
      <div class={`${classesAnim} w-3/4`}></div>
    </div>
  );
};

const GeneratedAnswerCitationsPlaceholder: FunctionalComponent = () => {
  const classesAnim = 'block bg-neutral rounded h-4 animate-pulse';
  const classesAnimCitations = `${classesAnim} w-24`;
  const classesAnimCitationsActions = `${classesAnim} w-12`;
  return (
    <div class="gap-2 mt-6 flex">
      <div class={classesAnimCitations}></div>
      <div class={classesAnimCitations}></div>
      <div class={classesAnimCitations}></div>
      <div class="flex gap-2 h-9 items-center ml-auto">
        <div class={classesAnimCitationsActions}></div>
        <div class={classesAnimCitationsActions}></div>
      </div>
    </div>
  );
};
