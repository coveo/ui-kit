import {nothing, TemplateResult} from 'lit';
import {DirectiveResult} from 'lit/directive.js';

export interface FunctionalComponent<T> {
  ({props}: {props: T}): TemplateResult | TemplateResult[] | typeof nothing;
}

export type FunctionalComponentWithChildren<T = null> = T extends null
  ? FunctionalComponentWithChildrenNoProps
  : FunctionalComponentWithChildrenWithProps<T>;

interface FunctionalComponentWithChildrenWithProps<T> {
  ({
    props,
  }: {
    props: T;
  }): (children: FunctionalComponentChildren) => TemplateResult;
}

interface FunctionalComponentWithChildrenNoProps {
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
