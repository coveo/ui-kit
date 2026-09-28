import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {RegularFacetValuePropsSchema} from '@coveo/thermidor-schema';
import type {FacetValueState, RegularFacetValueAction} from '@coveo/thermidor-schema';
import {toInferableBinderSchema} from '../catalog-props-migration.js';
import styles from './RegularFacetValue.module.css';

/**
 * The optimistic per-value child of RegularFacet's ChildList.
 *
 * Mounted via `createReactComponent` (NOT `createCatalog`) so the generic binder resolves the
 * component's props through `ResolveA2uiProps` — which, for each DYNAMIC prop, synthesizes a
 * `set<Field>` setter. `createReactComponent` INFERS the render callback's `props` type from
 * `api.schema` (`ResolveA2uiProps<z.infer<schema>>`), so `props.setSelectionState`,
 * `props.selectionState`, `props.value`, `props.numberOfResults` are all typed WITHOUT any manual
 * annotation — the types flow from the generated `RegularFacetValuePropsSchema`.
 *
 * The `@coveo/thermidor-schema` types stay renderer-agnostic (no setters baked into the contract).
 * The setter typing is contributed by `ResolveA2uiProps` at THIS React mount point.
 *
 * RUNTIME vs TYPE seam. `createReactComponent` cannot infer from the raw generated schema, because
 * `ComponentApi.schema` is the binder's Zod 3 `z.ZodTypeAny` while our schema is Zod 4 (three Zod
 * instances, none unify — TS2740). `toInferableBinderSchema` bridges both concerns in one call:
 * its RUNTIME value is the Zod 3 shim the binder classifies, and its declared TYPE is a
 * binder-Zod-3 `ZodObject` mirroring our field shape — so inference yields typed props + setters.
 *
 * On toggle: write the selection OPTIMISTICALLY via `setSelectionState` (the binder resolves it to
 * `<basePath>/selectionState`, touching only this value's node), THEN dispatch `toggleSelect` so
 * the backend applies the real toggle and reconciles on the next updateDataModel.
 */
export const RegularFacetValueImpl = createReactComponent(
  {
    name: 'RegularFacetValue',
    schema: toInferableBinderSchema(RegularFacetValuePropsSchema),
  },
  ({props, context}) => {
    const value = props.value ?? '';
    const numberOfResults = props.numberOfResults ?? 0;
    const isSelected = props.selectionState === 'selected';

    const handleToggle = () => {
      // 1. Optimistic: write the selection to the data model before the round-trip.
      const next: FacetValueState = isSelected ? 'idle' : 'selected';
      props.setSelectionState(next);
      // 2. Dispatch so the backend applies the real toggle and reconciles on updateDataModel.
      const action: RegularFacetValueAction = {event: {name: 'toggleSelect', context: {value}}};
      context.dispatchAction(action);
    };

    return (
      <li className={styles.valueItem}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            data-testid={`facet-value-${value}`}
            checked={isSelected}
            onChange={handleToggle}
          />
          <span className={styles.valueLabel}>{value}</span>
          <span className={styles.valueCount}>({numberOfResults})</span>
        </label>
      </li>
    );
  }
);
