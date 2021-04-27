import type { IModuleDefinition } from "@portals/core";

import { createModule } from "@portals/core";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'ui-components',
    // @ts-ignore
    component: () => import("./modules/UIComponents"),
  }),
]);
