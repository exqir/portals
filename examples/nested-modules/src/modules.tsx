import type { IModuleDefinition } from "@portals/react";

import { createModule } from "@portals/react";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'grand-parent-module',
    component: () => import("./modules/GrandParent"),
  }),
  createModule({
    moduleTag: 'parent-module',
    component: () => import("./modules/Parent"),
  }),
  createModule({
    moduleTag: 'child-module',
    component: () => import("./modules/Child"),
  })
]);
