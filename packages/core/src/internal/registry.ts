import type { IRegistry, IRegistryTree } from '../types/definitions'
import type { ModuleHostElement } from './ModuleHostElement'

export function createRegistry(): IRegistry {
  const registry: IRegistryTree = new Map()

  return {
    getRegistry(element: ModuleHostElement) {
      return registry.get(element)
    },
    getElements() {
      return [...registry.keys()]
    },
    register(element: ModuleHostElement) {
      registry.set(element, createRegistry())
    },
    unregister(element: ModuleHostElement) {
      registry.delete(element)
    },
  }
}
