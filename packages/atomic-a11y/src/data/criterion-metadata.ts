import type {CriterionMetadata} from '../shared/types.js';

export const criterionMetadataMap: Record<string, CriterionMetadata> = {
  '1.1.1': {
    name: 'Non-text Content',
    level: 'A',
    wcagVersion: '2.0',
  },
  '1.2.2': {
    name: 'Captions (Prerecorded)',
    level: 'A',
    wcagVersion: '2.0',
  },
  '1.3.1': {
    name: 'Info and Relationships',
    level: 'A',
    wcagVersion: '2.0',
  },
  '1.3.5': {
    name: 'Identify Input Purpose',
    level: 'AA',
    wcagVersion: '2.1',
  },
  '1.4.1': {
    name: 'Use of Color',
    level: 'A',
    wcagVersion: '2.0',
  },
  '1.4.3': {
    name: 'Contrast (Minimum)',
    level: 'AA',
    wcagVersion: '2.0',
  },
  '1.4.4': {
    name: 'Resize Text',
    level: 'AA',
    wcagVersion: '2.0',
  },
  '2.1.1': {
    name: 'Keyboard',
    level: 'A',
    wcagVersion: '2.0',
  },
  '2.2.1': {
    name: 'Timing Adjustable',
    level: 'A',
    wcagVersion: '2.0',
  },
  '2.4.1': {
    name: 'Bypass Blocks',
    level: 'A',
    wcagVersion: '2.0',
  },
  '2.4.2': {
    name: 'Page Titled',
    level: 'A',
    wcagVersion: '2.0',
  },
  '2.4.3': {
    name: 'Focus Order',
    level: 'A',
    wcagVersion: '2.0',
  },
  '2.4.4': {
    name: 'Link Purpose (In Context)',
    level: 'A',
    wcagVersion: '2.0',
  },
  '2.5.8': {
    name: 'Target Size (Minimum)',
    level: 'AA',
    wcagVersion: '2.2',
  },
  '3.1.1': {
    name: 'Language of Page',
    level: 'A',
    wcagVersion: '2.0',
  },
  '4.1.1': {
    name: 'Parsing',
    level: 'A',
    wcagVersion: '2.0',
  },
  '4.1.2': {
    name: 'Name, Role, Value',
    level: 'A',
    wcagVersion: '2.0',
  },
};

export function getCriterionMetadata(
  criterionId: string
): CriterionMetadata | undefined {
  return criterionMetadataMap[criterionId];
}
