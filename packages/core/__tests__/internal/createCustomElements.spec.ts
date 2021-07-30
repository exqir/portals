import { ModuleHostElement } from '../../src/internal/ModuleHostElement'

import { createCustomElements } from '../../src/internal/createCustomElements'

function render(dom: string) {
  document.body.innerHTML = dom
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('[createCustomElements]', () => {
  test('should define a customeElement for each module', () => {
    const modules = ['custom-module-1-1', 'custom-module-1-2']

    createCustomElements(modules)

    modules.forEach(module =>
      expect(customElements.get(module)).not.toBeUndefined(),
    )
  })

  test('should return a registry representing the structure of the modules used in the DOM', () => {
    const modules = ['custom-module-2-1', 'custom-module-2-2']
    render(
      '<custom-module-2-1></custom-module-2-1><custom-module-2-2></custom-module-2-2>',
    )

    const registry = createCustomElements(modules)

    expect(registry.getElements()).toHaveLength(2)
    expect(registry.getElements()[0]).toBeInstanceOf(ModuleHostElement)
    expect(registry.getElements()[0].tagName.toLowerCase()).toBe(modules[0])
    expect(registry.getElements()[1]).toBeInstanceOf(ModuleHostElement)
    expect(registry.getElements()[1].tagName.toLowerCase()).toBe(modules[1])
  })

  test('should return a registry representing the nested structure of the modules used in the DOM', () => {
    const modules = [
      'custom-module-3-1',
      'custom-module-3-2',
      'custom-module-3-3',
    ]
    render(`
      <custom-module-3-1>
        <custom-module-3-2></custom-module-3-2>
        <custom-module-3-3></custom-module-3-3>
      </custom-module-3-1>
    `)

    const registry = createCustomElements(modules)

    const parent = registry.getElements()[0]
    const firstChild = registry.getRegistry(parent)?.getElements()[0]
    const secondChild = registry.getRegistry(parent)?.getElements()[1]

    expect(registry.getElements()).toHaveLength(1)
    expect(parent.tagName.toLowerCase()).toBe(modules[0])
    expect(firstChild?.tagName.toLowerCase()).toBe(modules[1])
    expect(secondChild?.tagName.toLowerCase()).toBe(modules[2])
  })

  // TODO: This functionality is not yet implemented
  test.skip('should return a registry representing the structure of the modules used in the DOM independant of the order of definition', () => {
    const modules = [
      'custom-module-4-1',
      'custom-module-4-3',
      'custom-module-4-2',
    ]
    render(`
      <custom-module-4-1>
        <custom-module-4-2></custom-module-4-2>
        <custom-module-4-3></custom-module-4-3>
      </custom-module-4-1>
    `)

    const registry = createCustomElements(modules)

    const parent = registry.getElements()[0]
    const firstChild = registry.getRegistry(parent)?.getElements()[0]
    const secondChild = registry.getRegistry(parent)?.getElements()[1]

    expect(registry.getElements()).toHaveLength(1)
    expect(parent.tagName.toLowerCase()).toBe(modules[0])
    expect(firstChild?.tagName.toLocaleLowerCase()).toBe(modules[2])
    expect(secondChild?.tagName.toLocaleLowerCase()).toBe(modules[1])
  })
})
