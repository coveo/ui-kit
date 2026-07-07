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

  // Counts every Level A/AA criterion by its resolved conformance, for the
  // Executive Summary. Computed from the rendered rows so it can never drift
  // from the tables below.
  instance.registerHelper(
    'conformanceSummary',
    (chapters: OpenAcrReport['chapters']) => {
      const counts = {
        supports: 0,
        partiallySupports: 0,
        doesNotSupport: 0,
        notApplicable: 0,
        total: 0,
      };
      const byLevel: Record<string, keyof typeof counts> = {
        supports: 'supports',
        'partially-supports': 'partiallySupports',
        'does-not-support': 'doesNotSupport',
        'not-applicable': 'notApplicable',
      };
      for (const chapter of Object.values(chapters ?? {})) {
        if (!chapter || !('criteria' in chapter)) continue;
        for (const criterion of chapter.criteria) {
          const level = criterion.components?.[0]?.adherence?.level;
          const key = level ? byLevel[level] : undefined;
          if (key) {
            counts[key] += 1;
            counts.total += 1;
          }
        }
      }
      return counts;
    }
  );

  instance.registerHelper('dateFormat', (dateStr: string, format: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    if (format === 'Month YYYY') {
      const month = date.toLocaleString('en-US', {month: 'long'});
      return `${month} ${date.getFullYear()}`;
    }
    return dateStr;
  });

  const data = {...report, catalog};
  const template = instance.compile(templateSource, {noEscape: true});
  return template(data);
}
