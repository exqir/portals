import { ModuleHostElement } from './ModuleHostElement'
import { RouteElement } from './RouteElement'

export function createCustomElements(
  tags: string[],
  routeElementTag?: string,
): void {
  if (routeElementTag && !customElements.get(routeElementTag)) {
    customElements.define(routeElementTag, RouteElement)
  }

  tags.forEach((tag) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, class extends ModuleHostElement {})
    }
  })
}
