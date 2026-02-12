/**
 * Generates the sidebar navigation HTML from the tree structure.
 *
 * @param {Map<string, Map<string, Array<{id: string, name: string, type: string}>>>} tree
 * @returns {string}  HTML string for the sidebar content
 */
export function generateSidebar(tree) {
  let html = '';

  for (const [section, groups] of tree) {
    if (section === 'Introduction') {
      html += `<a class="docs-sidebar__item docs-sidebar__item--docs" href="#introduction--docs" data-id="introduction--docs">Introduction</a>\n`;
      continue;
    }

    html += `<div class="docs-sidebar__section open">\n`;
    html += `  <button class="docs-sidebar__section-title" onclick="this.parentElement.classList.toggle('open')">${escapeHtml(section)}</button>\n`;
    html += `  <div class="docs-sidebar__section-items">\n`;

    for (const [groupTitle, items] of groups) {
      if (groupTitle === 'Introduction') {
        const docsEntry = items.find((i) => i.type === 'docs');
        if (docsEntry) {
          html += `    <a class="docs-sidebar__item docs-sidebar__item--docs" href="#${docsEntry.id}" data-id="${docsEntry.id}">Introduction</a>\n`;
        }
        continue;
      }

      if (groupTitle === 'Example Pages') {
        html += `    <div class="docs-sidebar__group open">\n`;
        html += `      <button class="docs-sidebar__group-title">Example Pages</button>\n`;
        html += `      <div class="docs-sidebar__group-items">\n`;
        for (const item of items) {
          html += `        <a class="docs-sidebar__item docs-sidebar__item--story" href="#${item.id}" data-id="${item.id}">${escapeHtml(item.name)}</a>\n`;
        }
        html += `      </div>\n`;
        html += `    </div>\n`;
        continue;
      }

      const docsItems = items.filter((i) => i.type === 'docs');
      const storyItems = items.filter((i) => i.type === 'story');

      if (docsItems.length === 0 && storyItems.length === 0) continue;

      // Always render inside a group wrapper with expand/collapse
      html += `    <div class="docs-sidebar__group">\n`;
      html += `      <button class="docs-sidebar__group-title">${escapeHtml(groupTitle)}</button>\n`;
      html += `      <div class="docs-sidebar__group-items">\n`;

      for (const doc of docsItems) {
        html += `        <a class="docs-sidebar__item docs-sidebar__item--docs" href="#${doc.id}" data-id="${doc.id}">Docs</a>\n`;
      }
      for (const story of storyItems) {
        html += `        <a class="docs-sidebar__item docs-sidebar__item--story" href="#${story.id}" data-id="${story.id}">${escapeHtml(story.name)}</a>\n`;
      }

      html += `      </div>\n`;
      html += `    </div>\n`;
    }

    html += `  </div>\n`;
    html += `</div>\n`;
  }

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
