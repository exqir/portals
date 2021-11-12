import { screen } from '@testing-library/dom'

import { createCustomElements } from '../src/createCustomElements'

import { getModulesTree } from '../src/getModulesTree'

beforeAll(() => {
  createCustomElements(['module-element'])
})

afterEach(() => {
  document.body.innerHTML = ''
})

function render(dom: string) {
  document.body.innerHTML = dom
}

describe('[getModulesTree]', () => {
  test('should find all top-level elements', () => {
    render(`
      <module-element data-testid="1"></module-element>
      <module-element data-testid="2"></module-element>
    `)

    const tree = getModulesTree()

    expect(tree.element).toBeNull()
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0].element).toBe(screen.getByTestId('1'))
    expect(tree.children[1].element).toBe(screen.getByTestId('2'))
  })

  test('should find nested elements', () => {
    render(`
      <module-element data-testid="1">
        <div>
          <module-element data-testid="2"></module-element>
          <module-element data-testid="3">
            <module-element data-testid="4"></module-element>
          </module-element>
        </div>
      </module-element>
    `)

    const tree = getModulesTree()
    const level1 = tree.children
    const level2 = level1[0].children
    const level3 = level2[1].children

    expect(level1[0].element).toBe(screen.getByTestId('1'))
    expect(level2[0].element).toBe(screen.getByTestId('2'))
    expect(level2[1].element).toBe(screen.getByTestId('3'))
    expect(level3[0].element).toBe(screen.getByTestId('4'))
  })
})
