import { isModuleHostElement, isUndefined } from './utils'

export enum MODULE_STATUS {
  REGISTERED = 'registered',
  LOADING = 'loading',
  ERROR = 'error',
  RENDERED = 'rendered',
  HIDDEN = 'hidden',
}

export const ID_ATTRIBUTE = 'data-module-id'
export const STATUS_ATTRIBUTE = 'data-module-status'

export class ModuleHostElement extends HTMLElement {
  public moduleId: string

  constructor() {
    super()

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
    this.setStatus(MODULE_STATUS.REGISTERED)
  }

  disconnectedCallback(): void {}

  setStatus(status: MODULE_STATUS) {
    this.setAttribute(STATUS_ATTRIBUTE, status)
  }

  getStatus(): MODULE_STATUS {
    const status = this.getAttributeNode(STATUS_ATTRIBUTE)?.value as
      | MODULE_STATUS
      | undefined

    if (isUndefined(status)) {
      throw new Error('Invalid module: Module has no status.')
    }

    return status
  }

  hide() {
    this.style.display = 'none'
    this.style.visibility = 'hidden'
    this.setStatus(MODULE_STATUS.HIDDEN)
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
