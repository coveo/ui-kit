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
    const slotMatch = storyContent.match(/default-slot="([^"]*)"/s);
    const encodedSlotContent = slotMatch ? slotMatch[1] : '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = encodedSlotContent;
    const storySectionInnerContent = tempDiv.textContent || '';


    // Define all available sections with their placeholder content.
    const allSections = [
      {tag: 'atomic-result-section-title', content: `<h3 class="text-lg font-semibold text-gray-900">Palm cockatoo: Why a unique ‘drumming’ bird is in peril - BBC News</h3>`},
      {tag: 'atomic-result-section-children', content: `<div class="p-3 mt-2 ml-4 border border-gray-200 rounded-lg bg-gray-50">
        <div class="mb-2 text-sm font-medium text-gray-700">Related Articles:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• How to train for a marathon</div>
          <div class="text-sm text-gray-600">• Running 101</div>
        </div>
      </div>`},
      {tag: 'atomic-result-section-visual', content: `<img src="https://picsum.photos/seed/picsum/200" alt="Result Image" class="w-full h-auto rounded-lg">`},
      {tag: 'atomic-result-section-title-metadata', content: `<span class="text-sm text-gray-500">fileType:
txt</span>`},
      {tag: 'atomic-result-section-emphasized', content: `<span class="text-2xl font-bold">Breaking News!</span>`},
      {tag: 'atomic-result-section-excerpt', content: `<p class="text-sm text-gray-600">The palm cockatoo is thought to be the only bird species to use tools musically – drumming wood to attract a mate.</p>`},
      {tag: 'atomic-result-section-actions', content: '<button class="p-1 btn btn-primary">Show Details</button>'},
      {tag: 'atomic-result-section-badges', content: `<div>
        <span class="badge badge-primary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">DOCUMENTATION</span>
        <span class="badge badge-success" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">ARTICLE</span>
      </div>`},
      {tag: 'atomic-result-section-bottom-metadata', content: `<div class="text-xs text-gray-500">
        <span>Author: Mark Twain</span>
      </div>`},
    ];

    // Build the template content.
    let templateContent = '';
    
    allSections.forEach(section => {
      if (section.tag === storySectionTag) {
        // Use the story's inner content for the matching section with purple border styles.
        templateContent += `<${section.tag} style="border: 2px dashed mediumpurple; border-radius: 8px; padding: 8px; box-sizing: content-box;">${storySectionInnerContent}</${section.tag}>`;
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
