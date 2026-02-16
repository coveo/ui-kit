import type {nothing, TemplateResult} from 'lit';
import type {DirectiveResult} from 'lit/directive.js';

export type FunctionalComponentNoProps = () => TemplateResult | typeof nothing;

export type FunctionalComponent<T = {}> = ({
  props,
}: {
  props: T;
}) => TemplateResult | typeof nothing;

export type FunctionalComponentWithChildren<T> = ({
  props,
}: {
  props: T;
}) => (
  children: FunctionalComponentChildren
) => TemplateResult | typeof nothing;

export type FunctionalComponentWithChildrenNoProps = () => (
  children: FunctionalComponentChildren
) => TemplateResult;

export type FunctionalComponentWithOptionalChildren<T> = ({
  props,
}: {
  props: T;
}) => (
  children?: FunctionalComponentChildren
) => TemplateResult | typeof nothing;

export type FunctionalComponentGuard<T> = ({
  props,
}: {
  props: T;
}) => (children: FunctionalComponentChildren) => DirectiveResult;

type FunctionalComponentChildren = TemplateResult | typeof nothing;
