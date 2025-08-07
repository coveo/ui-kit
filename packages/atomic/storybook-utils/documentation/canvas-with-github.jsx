import {Canvas} from '@storybook/blocks';
// biome-ignore lint/correctness/noUnusedImports: <>
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
