import type { ModuleHostElement } from '@portals/core'

import type { IRegistry, IRegistryTree } from '../types/definitions'

export function createRegistry(): IRegistry {
  const registry: IRegistryTree = new Map()

  return {
    getRegistry(element: ModuleHostElement) {
      return registry.get(element)
    },
    getElements() {
      return Array.from(registry.keys())
    },
    register(element: ModuleHostElement, children: IRegistry) {
      registry.set(element, children)
    },
    unregister(element: ModuleHostElement) {
      registry.delete(element)
    },
    __r: registry,
  }
}
