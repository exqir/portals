import type { IModuleDefinition } from "@portals/react";

import { createModule } from "@portals/react";

const View = () => import("@portals/provider").then(({ View }) => ({
  default: View
}))

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'view-module',
    component: View
  }),
  createModule({
    moduleTag: 'navigation-bar',
    component: () => import("./modules/Navigation"),
  }),
  createModule({
    moduleTag: 'data-fetching',
    component: () => import("./modules/DataFetching"),
    useInit: () => import("./modules/DataFetching").then(({ useInit }) => useInit)
  }),
  createModule({
    moduleTag: 'static-content',
    component: () => import("./modules/Static"),
  })
]);
