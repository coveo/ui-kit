import type {RendererProps} from '@copilotkit/a2ui-renderer';

/**
 * The consumer-owned bridge between CopilotKit's renderer contract and Thermidor's types.
 *
 * `@copilotkit/a2ui-renderer` supplies the renderer shape — `props`, the `children` mount
 * function, and a loosely-typed `dispatch`. Thermidor supplies the framework-agnostic data
 * types (`XxxProps`, `XxxAction`). This facade combines them: it keeps CopilotKit's `props`
 * and `children` and narrows `dispatch` to the component's typed action union, so the sample
 * types its renderers against Thermidor types while `@coveo/thermidor-schema` stays free of
 * any renderer dependency.
 *
 * TProps is the resolved `XxxProps`; TAction is the typed `XxxAction` (or `never` for a
 * component that declares no actions).
 */
export type TypedRendererProps<TProps, TAction> = Omit<RendererProps<TProps>, 'dispatch'> & {
  dispatch?: (action: TAction) => void;
};
