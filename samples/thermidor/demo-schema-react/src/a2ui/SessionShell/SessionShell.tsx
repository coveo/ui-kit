import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {SessionShellPropsSchema} from '@coveo/thermidor-schema/zod3';

/**
 * A2-UI component for the `SessionShell`, the root of the surface that lives for the whole
 * session. It mounts its `children`, such as the search box, in order.
 */
export const SessionShell = createReactComponent(
  {name: 'SessionShell', schema: SessionShellPropsSchema},
  ({props, buildChild}) => (
    <>
      {(props.children ?? []).map((childId: string) => (
        <div key={childId}>{buildChild(childId)}</div>
      ))}
    </>
  )
);
