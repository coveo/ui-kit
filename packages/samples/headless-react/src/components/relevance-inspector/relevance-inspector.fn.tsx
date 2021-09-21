import {useEffect, useState, FunctionComponent} from 'react';
import {RelevanceInspector as HeadlessRelevanceInspector} from '@coveo/headless';

interface RelevanceInspectorProps {
  controller: HeadlessRelevanceInspector;
}

export const RelevanceInspector: FunctionComponent<RelevanceInspectorProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(
    () =>
      controller.subscribe(() => {
        console.info('Debug information [fn]', controller.state);
        setState(controller.state);
      }),
    []
  );

  return (
    <div>
      <label>
        Enable debug mode:{' '}
        <input
          type="checkbox"
          checked={state.isEnabled}
          onChange={() =>
            state.isEnabled ? controller.disable() : controller.enable()
          }
        />
      </label>
      <label>
        Enable fields debugging:{' '}
        <input
          type="checkbox"
          checked={state.debugFields}
          onChange={() => controller.debugFields(!state.debugFields)}
        />
      </label>
      <button onClick={() => controller.fetchFieldsDescription()}>
        {' '}
        Retrieve fields description
      </button>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildRelevanceInspector(engine);
 *
 * <RelevanceInspector controller={controller} />;
 * ```
 */
