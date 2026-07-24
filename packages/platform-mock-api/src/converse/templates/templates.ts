import type {ConverseEvent} from '../events.js';
import {response1Events} from './response1.js';
import {response2Events} from './response2.js';
import {response3Events} from './response3.js';
import {response4Events} from './response4.js';
import {response5Events} from './response5.js';
import {response6Events} from './response6.js';
import {response7Events} from './response7.js';
import {response8Events} from './response8.js';

type TemplateId =
  | 'response1'
  | 'response2'
  | 'response3'
  | 'response4'
  | 'response5'
  | 'response6'
  | 'response7'
  | 'response8';

const templateEvents = {
  response1: response1Events,
  response2: response2Events,
  response3: response3Events,
  response4: response4Events,
  response5: response5Events,
  response6: response6Events,
  response7: response7Events,
  response8: response8Events,
} satisfies Record<TemplateId, ConverseEvent[]>;

const getTemplateEvents = (templateId: TemplateId): ConverseEvent[] => templateEvents[templateId];

export {getTemplateEvents, templateEvents};
export type {TemplateId};
