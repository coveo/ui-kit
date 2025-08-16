import {Canvas} from '@storybook/addon-docs/blocks';
// biome-ignore lint/correctness/noUnusedImports: Storybook needs this import
import React from 'react';

export const CanvasWithGithub = ({of, githubPath}) => {
  const githubUrl = `https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/${githubPath}`;

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
