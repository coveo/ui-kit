import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildHistoryManager,
  HistoryManager as HeadlessHistoryManager,
} from '@coveo/headless';
import {engine} from '../../engine';

interface HistoryProps {
  controller: HeadlessHistoryManager;
}

export const History: FunctionComponent<HistoryProps> = (props) => {
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

const controller = buildHistoryManager(engine);

<History controller={controller} />;
