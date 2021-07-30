import { createRegistry } from '../../src/internal/registry'
import {
  ModuleHostElement,
  MODULE_STATUS,
} from '../../src/internal/ModuleHostElement'

let elements: Set<ModuleHostElement>

beforeAll(() => {
  elements = new Set()

  customElements.define(
    'module-element',
    class ModuleElement extends ModuleHostElement {
      constructor() {
        super(elements)
      }
    },
  )
})

beforeEach(() => {
  elements.clear()
})

afterEach(() => {
  document.body.innerHTML = ''
})

function render(dom: string) {
  document.body.innerHTML = dom
}

describe('[internal/ModuleHostElement]', () => {
  test('should register element when added to the DOM', () => {
    expect(elements.size).toBe(0)

    render('<module-element></module-element>')

    expect(elements.size).toBe(1)
    elements.forEach((e) => expect(e).toBeInstanceOf(ModuleHostElement))
  })

  test('should unregister element when removed from the DOM', () => {
    render('<module-element></module-element>')
    expect(elements.size).toBe(1)

    render('')
    expect(elements.size).toBe(0)
  })

  test('should have a moduleId as property on the class', () => {
    render('<module-element></module-element>')
    const hostElement = elements.values().next().value as ModuleHostElement

    expect(hostElement.moduleId).toMatch(/module-element-[a-z0-9]{9}/)
  })

  test('should set the moduleId as attribute on the element', () => {
    render('<module-element></module-element>')
    const hostElement = elements.values().next().value as ModuleHostElement

    const element = document.querySelector(
      `[data-module-id=${hostElement.moduleId}]`,
    )

    expect(element).toBe(hostElement)
  })

  test('should set the display style of the element to `block`', () => {
    render('<module-element></module-element>')
    const hostElement = elements.values().next().value as ModuleHostElement

    expect(hostElement.style.display).toBe('block')
  })

  test('should set the module status as attribute on the element to `registered`', () => {
    render('<module-element></module-element>')
    const hostElement = elements.values().next().value as ModuleHostElement

    const element = document.querySelector(
      `[data-module-status='${MODULE_STATUS.REGISTERED}']`,
    )

    expect(element).toBe(hostElement)
    expect(hostElement.getStatus()).toBe(MODULE_STATUS.REGISTERED)
  })

  test('should update the module status as attribute on the element with `setStatus`', () => {
    render('<module-element></module-element>')
    const hostElement = elements.values().next().value as ModuleHostElement

    hostElement.setStatus(MODULE_STATUS.LOADING)

    const element1 = document.querySelector(
      `[data-module-status='${MODULE_STATUS.LOADING}']`,
    )
    expect(element1).toBe(hostElement)
    expect(hostElement.getStatus()).toBe(MODULE_STATUS.LOADING)

    hostElement.setStatus(MODULE_STATUS.ERROR)

    const element2 = document.querySelector(
      `[data-module-status='${MODULE_STATUS.ERROR}']`,
    )
    expect(element2).toBe(hostElement)
    expect(hostElement.getStatus()).toBe(MODULE_STATUS.ERROR)

    hostElement.setStatus(MODULE_STATUS.RENDERED)

    const element3 = document.querySelector(
      `[data-module-status='${MODULE_STATUS.RENDERED}']`,
    )
    expect(element3).toBe(hostElement)
    expect(hostElement.getStatus()).toBe(MODULE_STATUS.RENDERED)

    hostElement.setStatus(MODULE_STATUS.HIDDEN)

    const element4 = document.querySelector(
      `[data-module-status='${MODULE_STATUS.HIDDEN}']`,
    )
    expect(element4).toBe(hostElement)
    expect(hostElement.getStatus()).toBe(MODULE_STATUS.HIDDEN)
  })

  test('should add the content of a template child as children of the element', () => {
    render(
      `<module-element>
        <template><div data-test-id="template-child"></div></template>
      </module-element>`,
    )

    const element = document.querySelector(
      `module-element > [data-test-id='template-child']`,
    )

    expect(element).toBeInstanceOf(HTMLDivElement)
  })
})
