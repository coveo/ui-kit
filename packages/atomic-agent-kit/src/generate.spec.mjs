import {beforeAll, describe, expect, it} from 'vitest';
import {AREAS, convertUsageDoc, generateKit, readInputs} from './generate.mjs';
import {attributesOf, listElements} from './manifest.mjs';
import {createCatalog, extractSnippets, findSourceTags, validateMarkdown} from './snippets.mjs';
import {analyzeManifest, atomicRoot} from './testing/analyze.mjs';

describe('generate', () => {
  describe('#generateKit', () => {
    let manifest;
    let elements;
    let inputs;
    let files;

    beforeAll(async () => {
      manifest = await analyzeManifest();
      elements = listElements(manifest);
      inputs = readInputs({root: atomicRoot, manifest});
      files = generateKit(inputs);
    });

    it('should write one page per component, one per area, and the skill', () => {
      const paths = [...files.keys()];
      const componentPages = paths.filter((file) => file.startsWith('references/components/'));
      expect(componentPages).toHaveLength(elements.length);
      for (const area of Object.keys(AREAS)) {
        expect(paths).toContain(`references/${area}.md`);
      }
      expect(paths).toContain('SKILL.md');
    });

    it('should name and describe the skill in its frontmatter', () => {
      const [, frontmatter] = /^---\n([\s\S]*?)\n---\n/.exec(files.get('SKILL.md'));
      expect(frontmatter).toMatch(/^name: coveo-atomic$/m);
      const [, description] = /^description: (.+)$/m.exec(frontmatter);
      expect(description.length).toBeLessThanOrEqual(1024);
      expect(frontmatter).toContain(`version: '${inputs.version}'`);
    });

    it('should fill every placeholder of the skill and keep it short', () => {
      const skill = files.get('SKILL.md');
      expect(skill).not.toContain('{{');
      expect(skill.length).toBeLessThan(12_000);
    });

    it('should list every component on its area page', () => {
      for (const element of elements) {
        expect(files.get(`references/${element.area}.md`)).toContain(
          `[\`<${element.tagName}>\`](components/${element.tagName}.md)`
        );
      }
    });

    it('should carry the usage snippets of every public component verbatim', () => {
      const publicTags = new Set(elements.map((element) => element.tagName));
      const documented = [...inputs.usageDocs].filter(([tag]) => publicTags.has(tag));
      expect(documented).not.toHaveLength(0);
      for (const [tag, doc] of documented) {
        const page = files.get(`references/components/${tag}.md`);
        for (const snippet of extractSnippets(doc)) {
          expect(page).toContain(snippet.code);
        }
      }
    });

    it('should document every attribute of every component', () => {
      for (const element of elements) {
        const page = files.get(`references/components/${element.tagName}.md`);
        for (const attribute of attributesOf(element)) {
          expect(page, `${element.tagName} documents ${attribute.name}`).toContain(
            `| \`${attribute.name}\` |`
          );
        }
      }
    });

    it('should only show markup that Atomic accepts, in every page', () => {
      const catalog = createCatalog(manifest, findSourceTags(atomicRoot));
      const problems = [...files].flatMap(([file, text]) =>
        validateMarkdown(text, catalog).map(({line, message}) => `${file}:${line} ${message}`)
      );
      expect(problems).toEqual([]);
    });
  });

  describe('#convertUsageDoc', () => {
    it('should drop the imports, inline the shared notes and nest the headings', () => {
      const markdown = [
        "import Note from '@/storybook-utils/documentation/note.mdx';",
        '',
        'Intro.',
        '',
        '## Options',
        '',
        '<Note />',
        '',
        '### Details',
      ].join('\n');
      expect(convertUsageDoc(markdown, {Note: 'The note.\n'})).toBe(
        ['Intro.', '', '### Options', '', 'The note.', '', '#### Details'].join('\n')
      );
    });

    it('should leave headings that already start at the third level', () => {
      expect(convertUsageDoc('### Options\n\nText.\n\n#### Details', {})).toBe(
        '### Options\n\nText.\n\n#### Details'
      );
    });
  });
});
