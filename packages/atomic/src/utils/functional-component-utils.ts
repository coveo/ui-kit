import {TemplateResult} from 'lit';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult | undefined;
}

export interface FunctionalComponentWithChildren<T> {
  ({
    props,
    children,
  }: {
    props: T;
    children:
      | TemplateResult
      | TemplateResult[]
      | (TemplateResult | undefined)[];
  }): TemplateResult;
}
