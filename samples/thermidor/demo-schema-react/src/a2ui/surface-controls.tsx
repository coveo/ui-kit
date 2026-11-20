import {createContext, useContext, useLayoutEffect, type ReactNode} from 'react';
import {useA2uiSurface, type ReactComponentImplementation} from '@a2ui/react';
import {useComponentActionError} from './session-request.js';
import styles from './surfaces.module.css';

/** Whether the surfaces drawn below belong to an earlier turn, whose actions the session ignores. */
export const EarlierTurnContext = createContext(false);

/**
 * Whether the surfaces drawn below send nothing: restored `readOnly`, or from an expired
 * conversation, whose session is gone.
 */
export const RestoredSurfacesContext = createContext(false);

/**
 * The nodes of one block that show the failure of their own actions, so the block shows only the
 * failures of the others.
 */
export interface ActionErrorNotes {
  has(componentId: string): boolean;
  /** Returns the function that removes the node again. */
  add(componentId: string): () => void;
  subscribe(listener: () => void): () => void;
}

export function createActionErrorNotes(): ActionErrorNotes {
  // A node drawn twice, as a list template may do, keeps its note until both copies are gone.
  const counts = new Map<string, number>();
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };
  return {
    has: (componentId) => counts.has(componentId),
    add(componentId) {
      counts.set(componentId, (counts.get(componentId) ?? 0) + 1);
      notify();
      return () => {
        const remaining = (counts.get(componentId) ?? 1) - 1;
        if (remaining > 0) {
          counts.set(componentId, remaining);
        } else {
          counts.delete(componentId);
        }
        notify();
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** The notes of the block drawn below; absent outside a turn's surfaces. */
export const ActionErrorNotesContext = createContext<ActionErrorNotes | undefined>(undefined);

/** Says that an action failed, with the reason the session reports. */
export function ActionErrorMessage({message}: {message: string}) {
  return (
    <p role="alert" className={styles.actionError}>
      This action could not be completed: {message}
    </p>
  );
}

/** Says, next to a node, that the last action it dispatched failed. */
function ComponentActionErrorNote({
  surfaceId,
  componentId,
}: {
  surfaceId: string;
  componentId: string;
}) {
  const notes = useContext(ActionErrorNotesContext);
  // Layout, so the block never draws the same failure for a paint.
  useLayoutEffect(() => notes?.add(componentId), [notes, componentId]);
  const message = useComponentActionError(surfaceId, componentId);
  return message === undefined ? null : <ActionErrorMessage message={message} />;
}

/** {@link ComponentActionErrorNote} for a node drawn through its `view`, on the surface it is in. */
function ViewActionErrorNote({componentId}: {componentId: string}) {
  const surfaceId = useA2uiSurface()?.id ?? '';
  return <ComponentActionErrorNote surfaceId={surfaceId} componentId={componentId} />;
}

function SurfaceControls({children}: {children: ReactNode}) {
  const earlier = useContext(EarlierTurnContext);
  return (
    <fieldset
      className={styles.surfaceControls}
      data-surface-controls
      disabled={earlier}
      role="none"
    >
      {children}
    </fieldset>
  );
}

/**
 * Marks a component whose controls send actions to its surface, such as a facet or a follow-up
 * chip, so an earlier turn disables them and the failure of its last action shows right after it.
 * Other controls, such as opening a product or adding it to the cart, never act on the surface and
 * stay enabled.
 *
 * A surface draws a component through its `view`, and falls back to its `render` without one, so
 * both are wrapped.
 */
export function actsOnSurface(
  component: ReactComponentImplementation
): ReactComponentImplementation {
  const {render: Render, view: View} = component;
  return {
    ...component,
    render: (props) => (
      <SurfaceControls>
        <Render {...props} />
        <ComponentActionErrorNote
          surfaceId={props.context.dataContext.surface?.id ?? ''}
          componentId={props.context.componentModel.id}
        />
      </SurfaceControls>
    ),
    ...(View && {
      view: (props) => (
        <SurfaceControls>
          <View {...props} />
          <ViewActionErrorNote componentId={props.node.componentId} />
        </SurfaceControls>
      ),
    }),
  };
}
