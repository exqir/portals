import type { IRegistry } from '../types/definitions'

import { isModuleHostElement } from './utils'

export class ModuleHostElement extends HTMLElement {
  public moduleId: string
  private _registry: IRegistry

  constructor(registry: IRegistry) {
    super()

    this._registry = registry

    this.moduleId = [
      this.tagName.toLowerCase(),
      Math.random().toString(36).substr(2, 9),
    ].join('-')

    this.setAttribute('data-module-id', this.moduleId)
    this.setAttribute('data-module-status', 'loading')
    // Render all HostElements as block for consistent layout.
    this.style.display = 'block'

    this.renderChildren()
  }

  connectedCallback(): void {
    // This seems to relay on the order in which elements are registed at the customElement
    // registry. When the element is registered the instances are created and connected, if
    // the parent element is not yet registered it will not have the data-module-id attribute
    // yet and the element is therefore not considered as nested.
    if (isNestedModule(this)) {
      // .closest needs polyfill for IE.
      // Use closest on parentElement to make sure not to select the
      // Host element itself because closest can return the element
      // it was called on when it matches the selector.
      const parent = this.parentElement?.closest('[data-module-id]')
      if (parent && isModuleHostElement(parent)) {
        // Set Registry to childRegistry, so that it can unregister itself
        // from the parents registry on disconnect.
        this._registry = parent.registerChild(this)
        return
      }
    }

    this._registry.register(this)
  }
  disconnectedCallback(): void {
    return this._registry.unregister(this)
  }

  registerChild(element: ModuleHostElement): IRegistry {
    const childrenRegistry = this._registry.getRegistry(this) as IRegistry
    childrenRegistry.register(element)
    return childrenRegistry
  }

  moduleMounted() {
    this.setAttribute('data-module-status', 'connected')
  }

  renderChildren() {
    // Check IE support for template tag.
    // Polyfills or hiding the template tags will still cause
    // the content to be created which is not the case for a
    // real template element.
    // For ModuleHostElements this would mean they will be created
    // and even connected, making them part of the registry,
    // which prevents this from being the source of truth of what
    // to render in the React App.
    // Potentially it could be possible to check in the constructor
    // if the element is a child of a template and try to check
    // the normal creation process, but then it might be easier to
    // just make sure the content of an element is hidden earlier
    // e.g. by requiring to set some CSS rules if needed.
    const template = this.querySelector('template')

    if (template) {
      this.appendChild(template.content.cloneNode(true))
    }
  }
}

function isNestedModule(element: ModuleHostElement): boolean {
  return (
    element ===
    document.querySelector(
      `[data-module-id] [data-module-id=${element.moduleId}]`,
    )
  )
}

// Could be used for IE to determine if ModuleHostElement is in a template
// tag and should therefore skip initialisation.
// Templates would also need to be hiden early in IE.
// function isTemplate(element: ModuleHostElement): boolean {
//   return element.closest('template') !== null
// }
