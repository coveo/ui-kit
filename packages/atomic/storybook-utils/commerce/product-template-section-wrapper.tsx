import {Decorator} from '@storybook/web-components';
import {html, TemplateResult, render} from 'lit';

export const wrapInProductTemplateForSections = (): {
  decorator: Decorator;
} => {
  const decorator: Decorator = (story) => {
    const templateTag = document.createElement('template');
    const tempContainer = document.createElement('div');

    const storyResult = story();

    // Render the story to extract its content
    let storyContent = '';
    if (
      storyResult &&
      typeof storyResult === 'object' &&
      '_$litType$' in storyResult
    ) {
      render(storyResult as TemplateResult, tempContainer);
      storyContent = tempContainer.innerHTML;
    } else {
      storyContent = String(storyResult);
    }

    // Extract the section tag name from the story content
    const sectionMatch = storyContent.match(/<(atomic-product-section-[\w-]+)/);
    const storySectionTag = sectionMatch ? sectionMatch[1] : null;

    // Define all available sections with their placeholder content
    const allSections = [
      {tag: 'atomic-product-section-name', content: 'name'},
      {tag: 'atomic-product-section-children', content: 'children'},
      {tag: 'atomic-product-section-visual', content: '<div style="display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;">visual</div>'},
      {tag: 'atomic-product-section-metadata', content: 'metadata'},
      {tag: 'atomic-product-section-emphasized', content: 'emphasized'},
      {tag: 'atomic-product-section-description', content: 'description'},
      {tag: 'atomic-product-section-actions', content: 'actions'},
      {tag: 'atomic-product-section-badges', content: 'badges'},
      {tag: 'atomic-product-section-bottom-metadata', content: 'bottom metadata'},
    ];

    // Build the template content
    let templateContent = '';
    
    allSections.forEach(section => {
      if (section.tag === storySectionTag) {
        // Use the story content for the matching section with purple border
        templateContent += `<div style="border: 3px solid #8b5cf6; border-radius: 4px; padding: 8px; margin: 4px 0; background-color: rgba(139, 92, 246, 0.05);">${storyContent}</div>`;
      } else {
        // Use placeholder content for other sections
        templateContent += `<${section.tag}>${section.content}</${section.tag}>`;
      }
    });

    templateTag.innerHTML = templateContent;
    templateTag.id = 'code-root';
    
    return html`
      <atomic-product-template>${templateTag}</atomic-product-template>
    `;
  };

  return {
    decorator,
  };
};
