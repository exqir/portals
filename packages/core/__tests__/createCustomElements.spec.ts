import { createCustomElements } from '../src/createCustomElements'

describe('[createCustomElements]', () => {
  test('should define a customElement for each module', () => {
    const modules = ['custom-module-1-1', 'custom-module-1-2']

    createCustomElements(modules)

    modules.forEach((module) =>
      expect(customElements.get(module)).not.toBeUndefined(),
    )
  })
})
