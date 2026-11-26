import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {useA2uiSurface, type ReactComponentImplementation} from '@a2ui/react';
import {
  ComponentContext,
  type ComponentApi,
  type ComponentModel,
  type SurfaceModel,
} from '@a2ui/web_core';

/**
 * The model of the component `id` on the surface, kept current as components arrive and leave. A
 * component whose type changes is replaced by a new model, so the snapshot is the model itself.
 */
function useComponentModel(
  surface: SurfaceModel<ComponentApi> | undefined,
  id: string
): ComponentModel | undefined {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!surface) {
        return () => {};
      }
      const created = surface.componentsModel.onCreated.subscribe(onChange);
      const deleted = surface.componentsModel.onDeleted.subscribe(onChange);
      return () => {
        created.unsubscribe();
        deleted.unsubscribe();
      };
    },
    [surface]
  );
  const getSnapshot = useCallback(() => surface?.componentsModel.get(id), [surface, id]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const NO_CHILDREN = () => null;

/**
 * Draws the component `id` of the enclosing surface when its id arrives in bound data rather than
 * in a prop its schema marks as a component id, such as `BundleDisplay`'s tier slots.
 *
 * `@a2ui/react` builds child nodes only for the component ids it reads in a component's own props,
 * so `buildChild` cannot draw such a child. This draws it through its implementation's binder
 * instead, with its bindings resolved against the surface's data model. The child draws no
 * children of its own.
 */
export function DataChild({id}: {id: string}) {
  const surface = useA2uiSurface() as SurfaceModel<ComponentApi> | undefined;
  const model = useComponentModel(surface, id);
  const context = useMemo(
    () => (surface && model ? new ComponentContext(surface, id) : undefined),
    [surface, id, model]
  );
  const implementation = model && surface?.catalog.components.get(model.type);
  if (!context || !implementation || !('render' in implementation)) {
    return null;
  }
  // TODO(a2ui-react context): `render` and `context` are deprecated in @a2ui/react 0.16. Draw the
  // child through its implementation's `view({node, buildChild})` once the slots are child
  // references the renderer resolves into nodes.
  const Render = (implementation as ReactComponentImplementation).render;
  return <Render context={context} buildChild={NO_CHILDREN} />;
}
