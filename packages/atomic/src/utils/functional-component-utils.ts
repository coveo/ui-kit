import {TemplateResult} from 'lit';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult;
}

export interface FunctionalComponentWithChildren<T> {
  ({
    props,
    children,
  }: {
    props: T;
    children: TemplateResult | TemplateResult[];
  }): TemplateResult;
}
