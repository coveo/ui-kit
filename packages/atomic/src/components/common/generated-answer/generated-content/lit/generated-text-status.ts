import {html} from 'lit';

interface GeneratedTextStatusProps {
  isLoading?: boolean;
  isOptimizing?: boolean;
  isStreaming?: boolean;
}

export const renderGeneratedTextStatus = ({
  isLoading,
  isOptimizing,
  isStreaming,
}: GeneratedTextStatusProps) => {
  let label = '';

  if (isLoading) {
    label = 'Thinking...';
  } else if (isOptimizing) {
    label = 'Optimizing...';
  } else if (isStreaming) {
    label = 'Generating...';
  } else {
    return null;
  }

  return html`
    <div
      part="status"
      class="status flex items-center gap-2 text-sm text-primary"
    >
      <span class="icon text-primary">✨</span>
      <span>${label}</span>
    </div>
  `;
};
