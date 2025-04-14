import {nothing, TemplateResult} from 'lit';
import {DirectiveResult} from 'lit/directive.js';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult | TemplateResult[] | typeof nothing;
}

export interface FunctionalComponentGuard<T> {
  ({props, children}: {props: T; children: TemplateResult}): DirectiveResult;
}

export interface FunctionalComponentWithChildren<T> {
  ({
    props,
  }: {
    props: T;
  }): (children: FunctionalComponentChildren) => TemplateResult;
}

type FunctionalComponentChildren = TemplateResult | typeof nothing;
