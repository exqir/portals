import type { IRegistry } from '../types/definitions'

import { ModuleHostElement } from './ModuleHostElement'
import { createRegistry } from './registry'

export function createCustomElements(modules: string[]): IRegistry {
  const elements = new Set<ModuleHostElement>()
  
  modules.forEach((tag) => {
    const { [tag]: ctor } = {
      [tag]: class extends ModuleHostElement {
        constructor() {
          super(elements)
        }
      },
    }

    if (!customElements.get(tag)) {
      customElements.define(tag, ctor)
    }
  })

  const root = createRegistry()
  // This still relys on order of the elements when an element has
  // multiple children, then those are not necessarly added as
  // children in the order they appear in the DOM but rather in
  // which order they are in the elements.
  // The order in the elemente is determined by the order in
  // which the elements are added to the customElements registry.
  elements.forEach(
    e => e.initialiseTree(root)
  )
  return root
}
