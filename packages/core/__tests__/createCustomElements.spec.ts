import { createCustomElements } from '../src/createCustomElements'
import { ModuleHostElement } from '../src/ModuleHostElement'

describe('[createCustomElements]', () => {
  test('should define a customElement for each module', () => {
    const modules = ['custom-module-1-1', 'custom-module-1-2']

    createCustomElements(modules)

    modules.forEach((module) =>
      expect(customElements.get(module)).not.toBeUndefined(),
    )
  })

  test('should define module as ModuleHostElement', () => {
    const moduleTag = 'custom-module-2-1'

    createCustomElements([moduleTag])
    document.body.innerHTML = `<${moduleTag}></${moduleTag}>`
    const element = document.getElementsByTagName(moduleTag).item(0)

    expect(element).toBeInstanceOf(ModuleHostElement)
  })
})
