import {useParameter, useArgs, useStorybookApi} from '@storybook/manager-api';
import {Placeholder} from '@storybook/components';
import React, {useState} from 'react';
import {getDocumentationFromTag} from '../map-props-to-args';
import './shadow-parts-panel.css';

const ADDON_PARAMETER_KEY = 'shadowParts';

export const ShadowPartPanel: React.FunctionComponent<{}> = () => {
  const api = useStorybookApi();
  console.log('storydata',api.getCurrentStoryData());
  const componentTag = useParameter(ADDON_PARAMETER_KEY, null)?.componentTag;
  const [_, updateArgs] = useArgs();
  const componentDocumentation = getDocumentationFromTag(componentTag);
  const [open, setOpen] = useState({});

  if (!componentDocumentation || componentDocumentation.parts.length === 0) {
    return (
      <Placeholder>
        {JSON.stringify(api.getCurrentStoryData())}
      </Placeholder>
    );
  }

  return (
    <table className="shadow-parts-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Edit CSS Statements</th>
        </tr>
      </thead>
      <tbody>
        {componentDocumentation.parts.map((part) => {
          const isOpened = open[part.name];
          return (
            <tr key={part.name}>
              <td>{part.name}</td>
              <td>{part.docs}</td>
              <td>
                <button
                  style={{display: isOpened ? 'none' : 'block'}}
                  onClick={() => setOpen({[part.name]: true})}
                >
                  Edit
                </button>
                <textarea
                  style={{display: isOpened ? 'block' : 'none'}}
                  placeholder="Examples: &#10;background-color: inherit;&#10;color: blue;&#10;font-weight: bold;"
                  onChange={(v) => {
                    updateArgs({
                      [`${ADDON_PARAMETER_KEY}:${part.name}`]: v.target.value,
                    });
                  }}
                ></textarea>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
