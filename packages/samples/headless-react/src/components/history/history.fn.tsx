import {useEffect, useState, FunctionComponent} from 'react';
import {buildHistory, History as HeadlessHistory} from '@coveo/headless';
import {engine} from '../../engine';

interface HistoryProps {
  controller: HeadlessHistory;
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

const controller = buildHistory(engine);

<History controller={controller} />;
