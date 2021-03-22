import {useEffect, useState, FunctionComponent} from 'react';
import {QueryError as HeadlessQueryError} from '@coveo/headless';

interface QueryErrorProps {
  controller: HeadlessQueryError;
}

export const QueryError: FunctionComponent<QueryErrorProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.hasError) {
    return null;
  }

  return (
    <div>
      <div>Oops {state.error!.message}</div>
      <code>{JSON.stringify(state.error)}</code>
    </div>
  );
};

// usage

/**
 * ```ts
 * const controller = buildQueryError(engine);
 *
 * <QueryError controller={controller} />;
 * ```
 */
