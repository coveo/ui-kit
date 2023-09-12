import {
  FoldedResultListSelectors,
  foldedResultListComponent,
} from './folded-result-list-selectors';
import {addResultList} from './result-list-actions';
import tests from './result-list.commons';

tests(
  FoldedResultListSelectors,
  foldedResultListComponent,
  addResultList,
  'Folded Result List Component'
);
