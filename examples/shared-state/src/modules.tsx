import type { IModuleDefinition } from "@portals/react";

import { createModule } from "@portals/react";

export const modules = new Map<string, IModuleDefinition>([
  createModule({
    moduleTag: 'season-selection',
    component: () => import("./modules/SeasonSelection"),
  }),
  createModule({
    moduleTag: 'episode-selection',
    component: () => import("./modules/EpisodeSelection"),
    useInit: () => import("./modules/EpisodeSelection").then(({ useInit }) => useInit)
  }),
  createModule({
    moduleTag: 'character-list',
    component: () => import("./modules/CharacterList"),
    useInit: () => import("./modules/CharacterList").then(({ useInit }) => useInit)
  })
]);
