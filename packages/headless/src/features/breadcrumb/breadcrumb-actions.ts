import {createAction} from '@reduxjs/toolkit';

export const deselectAllBreadcrumbs = createAction('breadcrumb/deselectAll');
export const deselectAllNonBreadcrumbs = createAction(
  'breadcrumb/deselectAllNonBreadcrumbs'
);
