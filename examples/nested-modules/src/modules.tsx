import type { IModuleDefinition } from "@portals/core";

import { createModule } from "@portals/core";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'grand-parent-module',
    // @ts-ignore
    component: () => import("./modules/GrandParent"),
  }),
  createModule({
    moduleTag: 'parent-module',
    // @ts-ignore
    component: () => import("./modules/Parent"),
  }),
  createModule({
    moduleTag: 'child-module',
    // @ts-ignore
    component: () => import("./modules/Child"),
  })
]);
