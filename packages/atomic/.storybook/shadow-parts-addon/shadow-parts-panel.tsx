import React, {useState} from 'react';
import {Placeholder} from '@storybook/components';
import {useParameter, useArgs} from '@storybook/api';
import {getDocumentationFromTag} from '../map-props-to-args';

const ADDON_PARAMETER_KEY = 'shadowParts';
import './shadow-parts-panel.css';

export const ShadowPartPanel: React.FunctionComponent<{}> = () => {
  const componentTag = useParameter(ADDON_PARAMETER_KEY, null);
  const [_, updateArgs] = useArgs();
  const componentDocumentation = getDocumentationFromTag(componentTag);
  const [open, setOpen] = useState({});

  if (!componentDocumentation || componentDocumentation.parts.length === 0) {
    return (
      <Placeholder>
        This component does not expose any shadow parts.
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
