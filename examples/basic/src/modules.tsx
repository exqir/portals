import type { IModuleDefinition } from "@portals/core";

import { createModule } from "@portals/core";

import { tag as tagModuleOne } from "./module-one/ModuleOne";
import { tag as tagModuleTwo } from "./module-two/ModuleTwo";

const View = () => import("@portals/provider").then(({ View }) => ({
  default: View
}))

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: "module-view",
    component: View
  }),
  createModule({
    moduleTag: tagModuleOne,
    component: () => import("./module-one/ModuleOne"),
    useInit: () => import("./module-one/ModuleOne").then(({ useInit }) => useInit)
  }),
  createModule({
    moduleTag: tagModuleTwo,
    component: () => import("./module-two/ModuleTwo"),
    useInit: () => import("./module-two/ModuleTwo").then(({ useInit }) => useInit)
  })
]);
