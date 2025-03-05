import {nothing, TemplateResult} from 'lit';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult | typeof nothing;
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
      | (TemplateResult | typeof nothing)[];
  }): TemplateResult;
}
