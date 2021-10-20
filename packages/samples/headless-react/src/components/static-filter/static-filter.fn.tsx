import {useEffect, useState, FunctionComponent, useContext} from 'react';
import {
  StaticFilterOptions,
  buildStaticFilter,
  buildStaticFilterValue,
} from '@coveo/headless';
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

const youtube = buildStaticFilterValue({
  caption: 'Youtube',
  expression: '@filetype==youtubevideo',
})
const dropbox = buildStaticFilterValue({
  caption: 'Dropbox',
  expression: '(@connectortype==DropboxCrawler AND @objecttype==File)',
})

<StaticFilter id="fileType" values={[youtube, dropbox]}/>;
*/
