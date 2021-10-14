import {useEffect, useState, FunctionComponent, useContext} from 'react';
import {StaticFilterOptions, buildStaticFilter} from '@coveo/headless';
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
              checked={value.state === 'selected'}
              onChange={() => controller.toggleSelect(value)}
            />
            <span>{value.caption}</span>
          </li>
        );
      })}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const values = [
 *  {
 *    caption: 'Youtube',
 *    expression: '@filetype==youtubevideo',
 *    state: 'idle'
 *  },
 *  {
 *     caption: 'Dropbox',
 *     expression: '@connectortype==DropboxCrawler AND @objecttype==File',
 *     state: 'idle'
 *  }
 * ]
 *
 * <StaticFilter id="fileType" values={values}>File Types</Tab>;
 * ```
 */
