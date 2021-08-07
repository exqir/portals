import type { IModuleDefinition } from "@portals/react";

import { createModule } from "@portals/react";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'ui-components',
    component: () => import("./modules/UIComponents"),
  }),
]);
