import type { IModuleDefinition } from '@portals/react'

import { createModule } from '@portals/react'

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'navigation-bar',
    component: () => import('./modules/Navigation'),
  }),
  createModule({
    moduleTag: 'data-fetching',
    component: () => import('./modules/DataFetching'),
    useInit: () =>
      import('./modules/DataFetching').then(({ useInit }) => useInit),
  }),
  createModule({
    moduleTag: 'static-content',
    component: () => import('./modules/Static'),
  }),
  createModule({
    moduleTag: 'static-child',
    component: () => import('./modules/StaticChild'),
  }),
])
