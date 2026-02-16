import {Decorator} from '@storybook/web-components-vite';
import {html, TemplateResult, render} from 'lit';

export const wrapInProductTemplateForSections = (): {
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
     const sectionMatch = storyContent.match(/<(atomic-product-section-[\w-]+)/);
     const storySectionTag = sectionMatch ? sectionMatch[1] : null;
     
     const slotMatch = storyContent.match(/default-slot="([^"]*)"/s);
     const encodedSlotContent = slotMatch ? slotMatch[1] : '';
     
     const tempDiv = document.createElement('div');
     tempDiv.innerHTML = encodedSlotContent;
     const storySectionInnerContent = tempDiv.textContent || '';

    // Define all available sections with their placeholder content.
    const allSections = [
      {tag: 'atomic-product-section-name', content: `<h3 class="text-lg font-semibold text-gray-900">Sony WH-1000XM4 Wireless Headphones</h3>`},
      {tag: 'atomic-product-section-children', content: `
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 mt-2 ml-4">
        <div class="text-sm font-medium text-gray-700 mb-2">Related Products:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• Wireless Charging Case - $79.99</div>
          <div class="text-sm text-gray-600">• Premium Foam Tips - $29.99</div>
        </div>
      </div>
    `},
      {tag: 'atomic-product-section-visual', content: `<img src="https://images.barca.group/Sports/mj/Clothing/Pants/67_Men_Gray_Elastane/cb1a7d3c9ac3_bottom_left.webp" alt="Product Image" class="w-full h-auto rounded-lg">`},
      {tag: 'atomic-product-section-metadata', content: `<span class="text-sm text-gray-500">SKU: WH-1000XM4</span>`},
      {tag: 'atomic-product-section-emphasized', content: `<span class="text-2xl font-bold text-green-600">$299.99</span>`},
      {tag: 'atomic-product-section-description', content: `<p class="text-sm text-gray-600">Premium wireless headphones with industry-leading noise cancellation and superior sound quality.</p>`},
      {tag: 'atomic-product-section-actions', content: `<button class="p-1 btn btn-primary">Add to Cart</button>`},
      {tag: 'atomic-product-section-badges', content: `
      <div>
        <span class="badge badge-primary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">SALE</span>
        <span class="badge badge-success" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">BESTSELLER</span>
      </div>
    `},
      {tag: 'atomic-product-section-bottom-metadata', content: `<div class="text-xs text-gray-500">
        <span>Free shipping • 2-day delivery</span>
      </div>
    `},
    ];

    // Build the template content.
    let templateContent = '';
    
    allSections.forEach(section => {
      if (section.tag === storySectionTag) {
        // Use the story content for the matching section with dashed border.
         templateContent += `<${section.tag} style="border: 2px dashed mediumpurple; border-radius: 8px; padding: 8px; box-sizing: content-box;">${storySectionInnerContent}</${section.tag}>`;
      } else {
        // Use placeholder content for other sections.
        templateContent += `<${section.tag}>${section.content}</${section.tag}>`;
      }
    });

    templateTag.innerHTML = templateContent;
    
    return html`
      <atomic-product-template>${templateTag}</atomic-product-template>
    `;
  };

  return {
    decorator,
  };
};
