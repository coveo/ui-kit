import {useEffect, useState, FunctionComponent} from 'react';
import {ResultsPerPage as HeadlessResultsPerPage} from '@coveo/headless';

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

  return (
    <ul>
      {options.map((numberOfResults) => (
        <li key={numberOfResults}>
          <button
            disabled={controller.isSetTo(numberOfResults)}
            onClick={() => controller.set(numberOfResults)}
          >
            {numberOfResults}
          </button>
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const options = [10, 25, 50, 100];
 * const controller = buildResultsPerPage(engine, {
 *   initialState: {numberOfResults: options[0]},
 * });
 *
 * <ResultsPerPage controller={controller} options={options} />;
 * ```
 */
