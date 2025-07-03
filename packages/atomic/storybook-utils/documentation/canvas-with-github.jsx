import React from 'react';
import {Canvas} from '@storybook/blocks';

export const CanvasWithGithub = ({of, githubPath}) => {
  const githubUrl = `https://github.com/coveo/ui-kit/blob/master/packages/atomic/src/components/${githubPath}`;

  return (
    <Canvas
      of={of}
      additionalActions={[
        {
          title: 'Open in GitHub',
          onClick: () => window.open(githubUrl, '_blank'),
        },
      ]}
    />
  );
};
