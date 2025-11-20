import {
  ArgTypes,
  Description,
  Markdown,
  Stories,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks';
// biome-ignore lint/correctness/noUnusedImports: Storybook needs this import
import React from 'react';
import {CanvasWithGithub} from './canvas-with-github';

/**
 * Reusable documentation template for Atomic Commerce components
 * @param {Object} props - Component props
 * @param {Object} props.stories - The stories object to be used for Meta and Canvas
 * @param {string} props.githubPath - The GitHub path for the component (for example, "commerce/atomic-commerce-pager/atomic-commerce-pager.ts")
 * @param {string} props.tagName - The custom element tag name (for example, "atomic-commerce-pager")
 * @param {string} props.className - The class name (for example, "AtomicCommercePager")
 * @param {string} [props.defaultStory] - The name of the default story to use (defaults to "Default")
 */
export const AtomicDocTemplate = ({
  stories,
  githubPath,
  tagName,
  className,
  defaultStory = 'Default',
  children,
}) => {
  const quickCopyMarkdown = tagName
    ? `
\`\`\`html
<${tagName}></${tagName}>
\`\`\`
  `.trim()
    : '';

  return (
    <>
      <Title />
      {tagName && className && (
        <div
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px',
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          }}
        >
          &lt;{tagName}&gt; | {className}
        </div>
      )}
      <Subtitle>
        <Description />
      </Subtitle>

      {quickCopyMarkdown && <Markdown>{quickCopyMarkdown}</Markdown>}
      <CanvasWithGithub of={stories[defaultStory]} githubPath={githubPath} />

      <h2>Usage</h2>
      {children}

      <h2>Examples</h2>
      <Stories title={''} />

      <h2>Reference</h2>
      <ArgTypes />
    </>
  );
};
