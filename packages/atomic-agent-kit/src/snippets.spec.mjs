import {readFileSync} from 'node:fs';
import path from 'node:path';
import {beforeAll, describe, expect, it} from 'vitest';
import {
  createCatalog,
  extractSnippets,
  findSourceTags,
  ITEM_TEMPLATES,
  validateHtml,
  validateMarkdown,
} from './snippets.mjs';
import {analyzeManifest, atomicRoot} from './testing/analyze.mjs';

const component = (area, tagName, declaration = {}) => ({
  path: `src/components/${area}/${tagName}/${tagName}.ts`,
  declarations: [{kind: 'class', customElement: true, tagName, ...declaration}],
});

const manifest = {
  modules: [
    component('search', 'atomic-facet', {
      attributes: [
        {name: 'field', type: {text: 'string'}},
        {name: 'display-values-as', type: {text: "'checkbox' | 'link' | 'box'"}},
        {name: 'is-collapsed', type: {text: 'boolean'}},
        {name: 'should-highlight', type: {text: 'boolean'}, deprecated: 'use no-highlight'},
        {name: 'must-match', type: {text: 'Record<string, string[]>'}},
        {name: 'depends-on'},
        {name: 'closeIcon'},
      ],
      slots: [{name: ''}, {name: 'header'}],
    }),
    component('common', 'atomic-layout-section', {
      attributes: [{name: 'section', type: {text: 'Section'}}],
    }),
    component('search', 'atomic-result-list'),
    component('search', 'atomic-result-template'),
    component('search', 'atomic-result-children'),
    component('search', 'atomic-result-children-template'),
  ],
};

const sourceTags = new Set([
  'atomic-facet',
  'atomic-layout-section',
  'atomic-result-list',
  'atomic-result-template',
  'atomic-result-children',
  'atomic-result-children-template',
  'atomic-internal-thing',
]);

const catalog = createCatalog(manifest, sourceTags);

const messages = (html) => validateHtml(html, catalog).map((problem) => problem.message);

describe('snippets', () => {
  describe('#createCatalog', () => {
    it('should separate the public elements from the internal tags', () => {
      expect([...catalog.byTag.keys()]).toContain('atomic-facet');
      expect([...catalog.internalTags]).toEqual(['atomic-internal-thing']);
    });
  });

  describe('#validateHtml', () => {
    it('should accept markup the manifest describes', () => {
      expect(
        messages(
          `<atomic-facet field="author" display-values-as="link" is-collapsed must-match-filetype="pdf" depends-on-author="x" closeicon="x">
             <div slot="header">Authors</div>
           </atomic-facet>`
        )
      ).toEqual([]);
    });

    it('should accept internal components without checking them', () => {
      expect(messages('<atomic-internal-thing nope="1"></atomic-internal-thing>')).toEqual([]);
    });

    it('should report an unknown element', () => {
      expect(messages('<atomic-nope></atomic-nope>')).toEqual([
        '<atomic-nope> is not an Atomic component',
      ]);
    });

    it('should report a self-closed element, which HTML leaves open', () => {
      expect(messages('<atomic-facet field="a" />')).toEqual([
        '<atomic-facet /> does not close the element: write <atomic-facet></atomic-facet>',
      ]);
    });

    it('should report an unknown attribute', () => {
      expect(messages('<atomic-facet fiel="author"></atomic-facet>')).toEqual([
        '<atomic-facet> has no "fiel" attribute',
      ]);
    });

    it('should require a field in the name of a prefix attribute', () => {
      expect(messages('<atomic-facet must-match="pdf"></atomic-facet>')).toEqual([
        '"must-match" takes a field in its name: must-match-<field>="…"',
      ]);
    });

    it('should report a deprecated attribute', () => {
      expect(messages('<atomic-facet should-highlight></atomic-facet>')).toEqual([
        'the "should-highlight" attribute of <atomic-facet> is deprecated',
      ]);
    });

    it('should report a value outside a union of literals, aliases included', () => {
      expect(messages('<atomic-facet display-values-as="grid"></atomic-facet>')).toEqual([
        `"grid" is not a value of the "display-values-as" attribute of <atomic-facet> ('checkbox' | 'link' | 'box')`,
      ]);
      expect(
        messages('<atomic-layout-section section="sidebar"></atomic-layout-section>')
      ).toHaveLength(1);
      expect(messages('<atomic-layout-section section="main"></atomic-layout-section>')).toEqual(
        []
      );
    });

    it('should only accept true and false as boolean values', () => {
      expect(messages('<atomic-facet is-collapsed="yes"></atomic-facet>')).toEqual([
        'the "is-collapsed" attribute of <atomic-facet> is a boolean, not "yes"',
      ]);
      expect(messages('<atomic-facet is-collapsed="false"></atomic-facet>')).toEqual([]);
    });

    it('should skip the values that are placeholders', () => {
      expect(
        messages('<atomic-facet display-values-as="..." is-collapsed="${x}"></atomic-facet>')
      ).toEqual([]);
    });

    it('should report a slot the parent does not declare, whatever the child', () => {
      expect(messages('<atomic-facet><div slot="heder"></div></atomic-facet>')).toEqual([
        '<atomic-facet> has no "heder" slot',
      ]);
      expect(messages('<div><span slot="anything"></span></div>')).toEqual([]);
    });

    it('should require a template element in an item template', () => {
      expect(
        messages(
          '<atomic-result-list><atomic-result-template></atomic-result-template></atomic-result-list>'
        )
      ).toEqual(['<atomic-result-template> must contain a <template> element']);
    });

    it('should require the list that accepts the item template', () => {
      expect(
        messages(
          '<div><atomic-result-template><template><p></p></template></atomic-result-template></div>'
        )
      ).toEqual([
        '<atomic-result-template> must be a direct child of <atomic-result-list>, <atomic-folded-result-list>, <atomic-search-box-instant-results>',
      ]);
      expect(
        messages('<atomic-result-template><template><p></p></template></atomic-result-template>')
      ).toEqual([]);
    });

    it('should reject an empty template where the component does, a comment counting as content', () => {
      const children = (template) =>
        `<atomic-result-children><atomic-result-children-template>${template}</atomic-result-children-template></atomic-result-children>`;
      expect(messages(children('<template> </template>'))).toEqual([
        'the <template> of <atomic-result-children-template> must not be empty',
      ]);
      expect(messages(children('<template><!-- ... --></template>'))).toEqual([]);
      expect(
        messages(
          '<atomic-result-list><atomic-result-template><template></template></atomic-result-template></atomic-result-list>'
        )
      ).toEqual([]);
    });

    it('should reject a script inside a template', () => {
      expect(
        messages(
          '<atomic-result-list><atomic-result-template><template><script>x()</script></template></atomic-result-template></atomic-result-list>'
        )
      ).toEqual([
        'the <template> of <atomic-result-template> must not contain a <script>: Atomic ignores it',
      ]);
    });
  });

  describe('#extractSnippets', () => {
    it('should list the fenced blocks with their language and line', () => {
      const markdown = 'Intro\n\n```html\n<p></p>\n```\n\nText\n\n```javascript\nx();\n```\n';
      expect(extractSnippets(markdown)).toEqual([
        {lang: 'html', code: '<p></p>\n', line: 3},
        {lang: 'javascript', code: 'x();\n', line: 9},
      ]);
    });
  });

  describe('#validateMarkdown', () => {
    it('should report lines of the document, for the html snippets only', () => {
      const markdown =
        'Intro\n\n```html\n<atomic-facet>\n  <atomic-nope></atomic-nope>\n</atomic-facet>\n```\n\n```js\n<atomic-nope>\n```\n';
      expect(validateMarkdown(markdown, catalog)).toEqual([
        {line: 5, message: '<atomic-nope> is not an Atomic component'},
      ]);
    });
  });

  describe('ITEM_TEMPLATES', () => {
    let byTag;

    beforeAll(async () => {
      byTag = createCatalog(await analyzeManifest(), findSourceTags(atomicRoot)).byTag;
    });

    it('should list every item template of the manifest and only existing hosts', () => {
      const templates = [...byTag.keys()].filter((tag) => tag.endsWith('-template'));
      expect(Object.keys(ITEM_TEMPLATES).toSorted()).toEqual(templates.toSorted());
      for (const {hosts} of Object.values(ITEM_TEMPLATES)) {
        for (const host of hosts) {
          expect(byTag.has(host), `${host} is in the manifest`).toBe(true);
        }
      }
    });

    it('should accept an empty template exactly where the component does', () => {
      for (const [tag, {allowEmpty}] of Object.entries(ITEM_TEMPLATES)) {
        const source = readFileSync(path.join(atomicRoot, byTag.get(tag).modulePath), 'utf8');
        expect(source.includes('allowEmpty = true'), `${tag} allows an empty template`).toBe(
          allowEmpty
        );
      }
    });
  });
});
