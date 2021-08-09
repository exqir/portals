import { ModuleHostElement } from '../src/ModuleHostElement'

import { createCustomElements } from '../src/createCustomElements'

beforeAll(() => {
  createCustomElements(['module-element'])
})

afterEach(() => {
  document.body.innerHTML = ''
})

function render(dom: string) {
  document.body.innerHTML = dom
}

describe('[createCustomElements]', () => {
  test('should define a customElement for each module', () => {
    const modules = ['custom-module-1-1', 'custom-module-1-2']

    createCustomElements(modules)

    modules.forEach((module) =>
      expect(customElements.get(module)).not.toBeUndefined(),
    )
  })
})
