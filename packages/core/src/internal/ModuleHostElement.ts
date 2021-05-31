import type { IRegistry } from '../types/definitions'

import { isModuleHostElement, isUndefined } from './utils'
import { createRegistry } from './registry'

export enum MODULE_STATUS {
  REGISTERED = 'registered',
  LOADING = 'loading',
  ERROR = 'error',
  RENDERED = 'rendered',
  HIDDEN = 'hidden',
}

const ID_ATTRIBUTE = 'data-module-id'
const STATUS_ATTRIBUTE = 'data-module-status'

export class ModuleHostElement extends HTMLElement {
  public moduleId: string
  private _registry: Set<ModuleHostElement>
  private _children: IRegistry

  constructor(registry: Set<ModuleHostElement>) {
    super()

    this._registry = registry
    this._children = createRegistry()

    this.moduleId = [
      this.tagName.toLowerCase(),
      Math.random().toString(36).substr(2, 9),
    ].join('-')

    this.setAttribute(ID_ATTRIBUTE, this.moduleId)
    // Render all HostElements as block for consistent layout.
    this.style.display = 'block'

    this.renderChildren()
  }

  connectedCallback(): void {
    this._registry.add(this)
    this.setStatus(MODULE_STATUS.REGISTERED);
  }

  disconnectedCallback(): void {
    this._registry.delete(this)
  }

  registerChild(element: ModuleHostElement): void {
    this._children.register(element, element._children)
  }

  setStatus(status: MODULE_STATUS) {
    this.setAttribute(STATUS_ATTRIBUTE, status)
  }

  getStatus(): MODULE_STATUS {
    const status = (this.getAttributeNode(STATUS_ATTRIBUTE)?.value as MODULE_STATUS | undefined)

    if (isUndefined(status)) {
      throw new Error('Invalid module: Module has no status.')
    }

    return status;
  }

  hide() {
    this.style.display = 'none';
    this.style.visibility = 'hidden'
    this.setStatus(MODULE_STATUS.HIDDEN);
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

  initialiseTree(root: IRegistry) {
    if (isNestedModule(this)) {
      // .closest needs polyfill for IE.
      // Use closest on parentElement to make sure not to select the
      // Host element itself because closest can return the element
      // it was called on when it matches the selector.
      const parent = this.parentElement?.closest('[data-module-id]')
      if (parent && isModuleHostElement(parent)) {
        parent.registerChild(this)
        return
      }
    }

    root.register(this, this._children)
  }
} 

function isNestedModule(element: ModuleHostElement): boolean {
  return (
    element ===
    document.querySelector(
      `[${ID_ATTRIBUTE}] [${ID_ATTRIBUTE}=${element.moduleId}]`,
    )
  )
}

// Could be used for IE to determine if ModuleHostElement is in a template
// tag and should therefore skip initialisation.
// Templates would also need to be hiden early in IE.
// function isTemplate(element: ModuleHostElement): boolean {
//   return element.closest('template') !== null
// }
