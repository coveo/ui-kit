import {nothing, TemplateResult} from 'lit';
import {DirectiveResult} from 'lit/directive.js';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult | TemplateResult[] | typeof nothing;
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

export interface FunctionalComponentGuard<T> {
  ({props, children}: {props: T; children: TemplateResult}): DirectiveResult;
}
