import {TemplateResult} from 'lit';
import {DirectiveResult} from 'lit/directive.js';

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

export interface FunctionalComponentGuard<T> {
  ({props, children}: {props: T; children: TemplateResult}): DirectiveResult;
}
