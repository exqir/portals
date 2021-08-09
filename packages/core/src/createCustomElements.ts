import { ModuleHostElement } from './ModuleHostElement'

export function createCustomElements(tags: string[]): void {
  tags.forEach((tag) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, class extends ModuleHostElement {})
    }
  })
}
