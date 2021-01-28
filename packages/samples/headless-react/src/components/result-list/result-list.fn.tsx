import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildResultList,
  ResultList as HeadlessResultList,
} from '@coveo/headless';
import {engine} from '../../engine';

interface ResultListProps<T extends {[field: string]: string}> {
  controller: HeadlessResultList;
  fieldsToInclude: T;
}

export const ResultList: FunctionComponent<ResultListProps<{
  [field: string]: string;
}>> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.results.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <ul style={{textAlign: 'left'}}>
        {state.results.map((result) => (
          <li key={result.uniqueId}>
            <article>
              <h2>
                <a href={result.clickUri}>{result.title}</a>
              </h2>
              <table>
                <tbody>
                  {Object.keys(props.fieldsToInclude).map(
                    (field) =>
                      result.raw[field] && (
                        <tr key={field}>
                          <th>{props.fieldsToInclude[field]}</th>
                          <td>{result.raw[field] as string}</td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
              <p>{result.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

const fieldsToInclude = {author: 'Author', filetype: 'File type'};

const controller = buildResultList(engine, {
  options: {fieldsToInclude: Object.keys(fieldsToInclude)},
});

<ResultList controller={controller} fieldsToInclude={fieldsToInclude} />;
