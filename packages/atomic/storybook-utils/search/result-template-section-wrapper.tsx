import {Decorator} from '@storybook/web-components-vite';
import {html, TemplateResult, render} from 'lit';

export const wrapInResultTemplateForSections = (): {
  decorator: Decorator;
} => {
  const decorator: Decorator = (story) => {
    const templateTag = document.createElement('template');
    const tempContainer = document.createElement('div');

    const storyResult = story();

    // Render the story to extract its content.
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

    // Extract the section tag name from the story content.
    const sectionMatch = storyContent.match(/<(atomic-result-section-[\w-]+)/);
    const storySectionTag = sectionMatch ? sectionMatch[1] : null;

    // Define all available sections with their placeholder content.
    const allSections = [
      {tag: 'atomic-result-section-title', content: 'title', area: 'title'},
      {tag: 'atomic-result-section-children', content: 'children', area: 'children'},
      {tag: 'atomic-result-section-visual', content: '<div style="display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;">visual</div>', area: 'visual'},
      {tag: 'atomic-result-section-title-metadata', content: 'title metadata', area: 'title-metadata'},
      {tag: 'atomic-result-section-emphasized', content: 'emphasized', area: 'emphasized'},
      {tag: 'atomic-result-section-excerpt', content: 'excerpt', area: 'excerpt'},
      {tag: 'atomic-result-section-actions', content: 'actions', area: 'actions'},
      {tag: 'atomic-result-section-badges', content: 'badges', area: 'badges'},
      {tag: 'atomic-result-section-bottom-metadata', content: 'bottom metadata', area: 'bottom-metadata'},
    ];

    // Build the template content.
    let templateContent = '';
    
    allSections.forEach(section => {
      if (section.tag === storySectionTag) {
        // Use the story content for the matching section with purple border.
        // TODO KIT-5056 use ${storyContent} instead of ${section.content} and remove section.area once atomic-result-list is migrated
        templateContent += `<${section.tag} style="padding: 0 5px; border-radius: 4px; border: 3px solid mediumpurple; grid-area: ${section.area}" id="code-root">${section.content}</${section.tag}>`;
      } else {
        // Use placeholder content for other sections.
        templateContent += `<${section.tag}>${section.content}</${section.tag}>`;
      }
    });

    templateTag.innerHTML = templateContent;
    
    return html`
      <atomic-result-template>${templateTag}</atomic-result-template>
    `;
  };

  return {
    decorator,
  };
};
