import { ModuleHostElement } from './ModuleHostElement'

export function createCustomElements(tags: string[]): void {
  tags.forEach((tag) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, class extends ModuleHostElement {})
    }
  })
}

// export function createCustomElements(tags: string[]): ModuleHostElement[] {
//   return tags.map((tag) => {
//     const ctor = customElements.get(tag) as ModuleHostElement | undefined
//     if (ctor) return ctor

//     const _ctor = class extends ModuleHostElement {}
//     // const { [tag]: _ctor } = {
//     //   [tag]: class extends ModuleHostElement {},
//     // }
//     customElements.define(tag, _ctor)
//     return _ctor as ModuleHostElement
//   })
// }
