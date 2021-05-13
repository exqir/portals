import type { IModuleDefinition } from "@portals/core";

import { createModule } from "@portals/core";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'view-module',
    component: () =>
      // @ts-ignore
      import("@portals/provider").then(({ View }) => ({
        default: View
      }))
  }),
  createModule({
    moduleTag: 'navigation-bar',
    component: () => import("./modules/Navigation"),
  }),
  createModule({
    moduleTag: 'data-fetching',
    // @ts-ignore
    component: () => import("./modules/DataFetching"),
    useInit: () => import("./modules/DataFetching").then(({ useInit }) => useInit)
  }),
  createModule({
    moduleTag: 'static-content',
    // @ts-ignore
    component: () => import("./modules/Static"),
  })
]);
