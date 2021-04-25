import type { IModuleDefinition } from "@portals/core";

import { createModule } from "@portals/core";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'season-selection',
    // @ts-ignore
    component: () => import("./modules/SeasonSelection"),
  }),
  createModule({
    moduleTag: 'episode-selection',
    // @ts-ignore
    component: () => import("./modules/EpisodeSelection"),
    useInit: () => import("./modules/EpisodeSelection").then(({ useInit }) => useInit)
  }),
  createModule({
    moduleTag: 'character-list',
    // @ts-ignore
    component: () => import("./modules/CharacterList"),
    useInit: () => import("./modules/CharacterList").then(({ useInit }) => useInit)

  })
]);
