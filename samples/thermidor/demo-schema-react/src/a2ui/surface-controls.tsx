import {createContext, useContext, type ReactNode} from 'react';
import type {ReactComponentImplementation} from '@copilotkit/a2ui-renderer';
import styles from './surfaces.module.css';

/** Whether the surfaces drawn below belong to an earlier turn, whose actions the session ignores. */
export const EarlierTurnContext = createContext(false);

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
 * chip, so an earlier turn disables them. Other controls, such as opening a product or adding it
 * to the cart, never act on the surface and stay enabled.
 */
export function actsOnSurface(
  component: ReactComponentImplementation
): ReactComponentImplementation {
  const Render = component.render;
  return {
    ...component,
    render: (props) => (
      <SurfaceControls>
        <Render {...props} />
      </SurfaceControls>
    ),
  };
}
