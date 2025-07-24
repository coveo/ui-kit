import {nothing, TemplateResult} from 'lit';
import {DirectiveResult} from 'lit/directive.js';

export interface FunctionalComponent<T = {}> {
  ({props}: {props: T}): TemplateResult | typeof nothing;
}

export interface FunctionalComponentWithOptionalChildren<T> {
  ({
    props,
  }: {
    props: T;
  }): (
    children?: FunctionalComponentChildren
  ) => TemplateResult | typeof nothing;
}

export interface FunctionalComponentWithChildren<T> {
  ({
    props,
  }: {
    props: T;
  }): (
    children: FunctionalComponentChildren
  ) => TemplateResult | typeof nothing;
}

export interface FunctionalComponentWithChildrenNoProps {
  (): (children: FunctionalComponentChildren) => TemplateResult;
}

export interface FunctionalComponentGuard<T> {
  ({
    props,
  }: {
    props: T;
  }): (children: FunctionalComponentChildren) => DirectiveResult;
}

type FunctionalComponentChildren = TemplateResult | typeof nothing;
