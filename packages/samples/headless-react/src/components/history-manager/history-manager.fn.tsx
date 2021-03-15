import {useEffect, useState, FunctionComponent} from 'react';
import {HistoryManager as HeadlessHistoryManager} from '@coveo/headless';

interface HistoryManagerProps {
  controller: HeadlessHistoryManager;
}

export const HistoryManager: FunctionComponent<HistoryManagerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <div>
      <button
        disabled={state.past.length === 0}
        onClick={() => controller.back()}
      >
        Back
      </button>
      <button
        disabled={state.future.length === 0}
        onClick={() => controller.forward()}
      >
        Forward
      </button>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildHistoryManager(engine);
 *
 * <History controller={controller} />;
 * ```
 */
