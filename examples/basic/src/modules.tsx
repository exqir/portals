import type { IModuleDefinition } from "@portals/core";

import { createModule } from "@portals/core";

import { tag as tagModuleOne } from "./module-one/ModuleOne";
import { tag as tagModuleTwo } from "./module-two/ModuleTwo";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: "module-view",
    component: () =>
      // @ts-ignore
      import("@portals/provider").then(({ View }) => ({
        default: View
      }))
  }),
  createModule({
    moduleTag: tagModuleOne,
    // @ts-ignore
    component: () => import("./module-one/ModuleOne"),
    useInit: () => import("./module-one/ModuleOne").then(({ useInit }) => useInit)
  }),
  createModule({
    moduleTag: tagModuleTwo,
    // @ts-ignore
    component: () => import("./module-two/ModuleTwo"),
    useInit: () => import("./module-two/ModuleTwo").then(({ useInit }) => useInit)
  })
]);
