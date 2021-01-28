import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildResultsPerPage,
  ResultsPerPage as HeadlessResultsPerPage,
} from '@coveo/headless';
import {engine} from '../../engine';

interface ResultsPerPageProps {
  controller: HeadlessResultsPerPage;
  options: number[];
}

export const ResultsPerPage: FunctionComponent<ResultsPerPageProps> = (
  props
) => {
  const {controller, options} = props;
  const [, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const isSetTo = (numberOfResults: number) => {
    return controller.isSetTo(numberOfResults);
  };

  const set = (numberOfResults: number) => {
    controller.set(numberOfResults);
  };

  return (
    <ul>
      {options.map((numberOfResults) => (
        <li key={numberOfResults}>
          <button
            disabled={isSetTo(numberOfResults)}
            onClick={() => set(numberOfResults)}
          >
            {numberOfResults}
          </button>
        </li>
      ))}
    </ul>
  );
};

// usage

const options = [10, 25, 50, 100];
const controller = buildResultsPerPage(engine, {
  initialState: {numberOfResults: options[0]},
});

<ResultsPerPage controller={controller} options={options} />;
