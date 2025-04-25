import {nothing, TemplateResult} from 'lit';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult | typeof nothing;
}

export interface FunctionalComponentWithChildren<T> {
  ({
    props,
  }: {
    props: T;
  }): (children: FunctionalComponentChildren) => TemplateResult;
}

type FunctionalComponentChildren = TemplateResult | typeof nothing;
