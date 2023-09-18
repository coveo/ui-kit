import {
  FoldedResultListSelectors,
  foldedResultListComponent,
} from './folded-result-list-selectors';
import {addFoldedResultList} from './result-list-actions';
import tests from './result-list.commons';

tests(
  FoldedResultListSelectors,
  foldedResultListComponent,
  addFoldedResultList,
  'Folded Result List Component'
);
