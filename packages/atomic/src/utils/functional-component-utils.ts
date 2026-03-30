import type {nothing, TemplateResult} from 'lit';

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

type FunctionalComponentChildren = TemplateResult | typeof nothing;
