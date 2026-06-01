import Handlebars from 'handlebars';
import type {OpenAcrReport} from './types.js';

interface CatalogCriterion {
  id: string;
  handle: string;
  alt_id: string;
  components: string[];
}

interface CatalogChapter {
  id: string;
  label: string;
  criteria: CatalogCriterion[];
}

interface CatalogTerm {
  id: string;
  label: string;
}

interface CatalogStandard {
  chapters: string[];
}

export interface VpatCatalog {
  title: string;
  standards: CatalogStandard[];
  chapters: CatalogChapter[];
  terms: CatalogTerm[];
}

export function renderVpat(
  report: OpenAcrReport,
  catalog: VpatCatalog,
  templateSource: string
): string {
  const instance = Handlebars.create();

  instance.registerHelper('catalogChapter', (chapterId: string) => {
    return catalog.chapters.find((ch) => ch.id === chapterId);
  });

  instance.registerHelper(
    'catalogCriteriaLabel',
    (chapterId: string, num: string) => {
      const chapter = catalog.chapters.find((ch) => ch.id === chapterId);
      if (!chapter) return '';
      const criterion = chapter.criteria.find((c) => c.id === num);
      return criterion?.handle ?? '';
    }
  );

  instance.registerHelper('levelLabel', (level: string) => {
    const term = catalog.terms.find((t) => t.id === level);
    return term?.label ?? 'Not Applicable';
  });

  const data = {...report, catalog};
  const template = instance.compile(templateSource, {noEscape: true});
  return template(data);
}
