import {useCallback, useMemo, useSyncExternalStore} from 'react';
// `@a2ui/react/v0_9` re-exports the root module without `useA2uiSurface`; both share one surface context.
import {useA2uiSurface} from '@a2ui/react';
import type {ReactComponentImplementation} from '@a2ui/react/v0_9';
import {ComponentContext, type ComponentApi, type SurfaceModel} from '@a2ui/web_core/v0_9';

/** Whether the surface holds the component `id`, kept current as components arrive and leave. */
function useHasComponent(surface: SurfaceModel<ComponentApi> | undefined, id: string): boolean {
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
  const getSnapshot = useCallback(() => surface?.componentsModel.has(id) ?? false, [surface, id]);
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
  const present = useHasComponent(surface, id);
  const type = present ? surface?.componentsModel.get(id)?.type : undefined;
  const context = useMemo(
    () => (surface && type !== undefined ? new ComponentContext(surface, id) : undefined),
    [surface, id, type]
  );
  const implementation = type === undefined ? undefined : surface?.catalog.components.get(type);
  if (!context || !implementation || !('render' in implementation)) {
    return null;
  }
  // TODO(a2ui-react context): `render` and `context` are deprecated in @a2ui/react 0.16, whose
  // `view` takes a resolved node. Drop this once the slots are child references the renderer
  // resolves.
  const Render = (implementation as ReactComponentImplementation).render;
  return <Render context={context} buildChild={NO_CHILDREN} />;
}
