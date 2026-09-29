import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {LayoutStackProps} from '@coveo/thermidor-schema';
import {LayoutStackPropsSchema} from '@coveo/thermidor-schema/zod3';
import {toInferableBinderSchema} from '../inferable-binder-schema.js';
import styles from './LayoutStack.module.css';

/**
 * A2-UI component for the generic `layout-stack` container.
 *
 * Stacks its children along one axis, mounting each child id once via `buildChild(id)`. The
 * generic binder resolves the ordered `children` id list and the `direction` presentation prop
 * from `LayoutStackPropsSchema` (the container holds no state). Unknown/missing `direction` falls
 * back to 'column'.
 */
export const LayoutStack = createReactComponent(
  {name: 'LayoutStack', schema: toInferableBinderSchema<LayoutStackProps>(LayoutStackPropsSchema)},
  ({props, buildChild}) => {
    const childIds = props.children ?? [];
    const direction = props.direction === 'row' ? 'row' : 'column';
    const className = direction === 'row' ? styles.row : styles.column;

    return (
      <div className={className} data-testid="layout-stack" data-direction={direction}>
        {childIds.map((childId: string) => (
          <div key={childId}>{buildChild(childId)}</div>
        ))}
      </div>
    );
  }
);
