import {PayloadAction} from '@reduxjs/toolkit';
import {sort} from '../../app/reducers';
import {SortCriterion} from './sort';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {registerSortCriterion, updateSortCriterion} from './sort-actions';

export interface SortActionCreators {
  registerSortCriterion(criterion: SortCriterion): PayloadAction<SortCriterion>;

  updateSortCriterion(criterion: SortCriterion): PayloadAction<SortCriterion>;
}

export function loadSortActions(engine: SearchEngine): SortActionCreators {
  engine.addReducers({sort});

  return {
    registerSortCriterion: registerSortCriterion,
    updateSortCriterion: updateSortCriterion,
  };
}
