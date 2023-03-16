import type {JsonDocs} from '@stencil/core/internal';

export const StencilDocumentation = process.env.STORYBOOK_STENCIL_DOCS
  ? (JSON.parse(process.env.STORYBOOK_STENCIL_DOCS) as JsonDocs)
  : null;
