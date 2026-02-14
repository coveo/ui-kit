import type {CriterionLevel} from '../shared/types.js';

type ChapterId = 'success_criteria_level_a' | 'success_criteria_level_aa';

export interface WcagCriterionDefinition {
  id: string;
  handle: string;
  level: CriterionLevel;
  chapterId: ChapterId;
}

export const wcagCriteriaDefinitions: WcagCriterionDefinition[] = [
  {
    id: '1.1.1',
    handle: 'Non-text Content',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.1',
    handle: 'Audio-only and Video-only (Prerecorded)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.2',
    handle: 'Captions (Prerecorded)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.3',
    handle: 'Audio Description or Media Alternative (Prerecorded)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.3.1',
    handle: 'Info and Relationships',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.3.2',
    handle: 'Meaningful Sequence',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.3.3',
    handle: 'Sensory Characteristics',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.4.1',
    handle: 'Use of Color',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.4.2',
    handle: 'Audio Control',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.1.1',
    handle: 'Keyboard',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.1.2',
    handle: 'No Keyboard Trap',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.1.4',
    handle: 'Character Key Shortcuts',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.2.1',
    handle: 'Timing Adjustable',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.2.2',
    handle: 'Pause, Stop, Hide',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.3.1',
    handle: 'Three Flashes or Below Threshold',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.1',
    handle: 'Bypass Blocks',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.2',
    handle: 'Page Titled',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.3',
    handle: 'Focus Order',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.4.4',
    handle: 'Link Purpose (In Context)',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.1',
    handle: 'Pointer Gestures',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.2',
    handle: 'Pointer Cancellation',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.3',
    handle: 'Label in Name',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '2.5.4',
    handle: 'Motion Actuation',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.1.1',
    handle: 'Language of Page',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.2.1',
    handle: 'On Focus',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.2.2',
    handle: 'On Input',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.2.6',
    handle: 'Consistent Help',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.3.1',
    handle: 'Error Identification',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.3.2',
    handle: 'Labels or Instructions',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '3.3.7',
    handle: 'Redundant Entry',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '4.1.1',
    handle: 'Parsing',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '4.1.2',
    handle: 'Name, Role, Value',
    level: 'A',
    chapterId: 'success_criteria_level_a',
  },
  {
    id: '1.2.4',
    handle: 'Captions (Live)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.2.5',
    handle: 'Audio Description (Prerecorded)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.3.4',
    handle: 'Orientation',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.3.5',
    handle: 'Identify Input Purpose',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.3',
    handle: 'Contrast (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.4',
    handle: 'Resize Text',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.5',
    handle: 'Images of Text',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.10',
    handle: 'Reflow',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.11',
    handle: 'Non-text Contrast',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.12',
    handle: 'Text Spacing',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '1.4.13',
    handle: 'Content on Hover or Focus',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.5',
    handle: 'Multiple Ways',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.6',
    handle: 'Headings and Labels',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.7',
    handle: 'Focus Visible',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.4.11',
    handle: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.5.7',
    handle: 'Dragging Movements',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '2.5.8',
    handle: 'Target Size (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.1.2',
    handle: 'Language of Parts',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.2.3',
    handle: 'Consistent Navigation',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.2.4',
    handle: 'Consistent Identification',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.3.3',
    handle: 'Error Suggestion',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.3.4',
    handle: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '3.3.8',
    handle: 'Accessible Authentication (Minimum)',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
  {
    id: '4.1.3',
    handle: 'Status Messages',
    level: 'AA',
    chapterId: 'success_criteria_level_aa',
  },
];
