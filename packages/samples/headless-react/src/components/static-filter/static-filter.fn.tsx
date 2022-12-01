import {StaticFilterOptions, buildStaticFilter} from '@coveo/headless';
import {useEffect, useState, FunctionComponent, useContext} from 'react';
import {AppContext} from '../../context/engine';

export const StaticFilter: FunctionComponent<StaticFilterOptions> = (props) => {
  const {engine} = useContext(AppContext);
  const controller = buildStaticFilter(engine!, {options: props});
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <ul>
      {state.values.map((value) => {
        return (
          <li key={value.caption}>
            <input
              type="checkbox"
              checked={controller.isValueSelected(value)}
              onChange={() => controller.toggleSelect(value)}
            />
            <span>{value.caption}</span>
          </li>
        );
      })}
    </ul>
  );
};

/* Usage

const youtubeExpression = buildQueryExpression()
  .addStringField({
    field: 'filetype',
    operator: 'isExactly',
    values: ['youtubevideo'],
  })
  .toQuerySyntax();

const dropboxExpression = buildQueryExpression()
  .addStringField({
    field: 'connectortype',
    operator: 'isExactly',
    values: ['DropboxCrawler'],
  })
  .addStringField({
    field: 'objecttype',
    operator: 'isExactly',
    values: ['File'],
  })
  .toQuerySyntax();

const youtube = buildStaticFilterValue({
  caption: 'Youtube',
  expression: youtubeExpression,
})
const dropbox = buildStaticFilterValue({
  caption: 'Dropbox',
  expression: dropboxExpression,
})

<StaticFilter id="fileType" values={[youtube, dropbox]}/>;
*/
