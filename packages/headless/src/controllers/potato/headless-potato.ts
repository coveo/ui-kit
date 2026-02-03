import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {potato} from './potato-slice.js';

export function buildPotato(engine: SearchEngine) {
  engine.addReducers({potato});
}
