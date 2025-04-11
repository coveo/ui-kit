import {nothing, TemplateResult} from 'lit';
import {DirectiveResult} from 'lit/directive.js';
import {Keyed} from 'lit/directives/keyed.js';

export type FunctionalComponentOutput =
  | TemplateResult
  | typeof nothing
  | DirectiveResult<typeof Keyed>;

export interface FunctionalComponent<T> {
  ({props}: {props: T}): FunctionalComponentOutput;
}

export interface FunctionalComponentWithChildren<T> {
  ({
    props,
  }: {
    props: T;
  }): (children: FunctionalComponentChildren) => TemplateResult;
}

type FunctionalComponentChildren = TemplateResult | typeof nothing;
