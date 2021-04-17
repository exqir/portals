import type { IRegistry } from '../types/definitions'

import { ModuleHostElement } from './ModuleHostElement'

export function createCustomElements(modules: string[], registry: IRegistry) {
  modules.forEach((tag) => {
    const { [tag]: ctor } = {
      [tag]: class extends ModuleHostElement {
        constructor() {
          super(registry)
        }
      },
    }

    if (!customElements.get(tag)) {
      customElements.define(tag, ctor)
    }
  })
}
