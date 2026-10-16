import type {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'wrapper',
    loadComponent: () =>
      import('./wrapper-search-page.component').then((m) => m.WrapperSearchPageComponent),
  },
  {
    path: 'custom-elements',
    loadComponent: () =>
      import('./custom-elements-search-page.component').then(
        (m) => m.CustomElementsSearchPageComponent
      ),
  },
  {path: '', pathMatch: 'full', redirectTo: 'wrapper'},
];
