import { screen } from '@testing-library/dom'

import { createCustomElements } from '../src/createCustomElements'

import {
  getModulesTree,
  getModulesTreeWithoutNotSelector,
} from '../src/getModulesTree'

beforeAll(() => {
  createCustomElements(['module-element'])
})

afterEach(() => {
  document.body.innerHTML = ''
})

function render(dom: string) {
  document.body.innerHTML = dom
}

// This variant can not work in JSDOM at the moment because
// :not() can only accept simple selectors in css selectors
// level 3, complex selector are only support since level 4.
// This could also mean that browser support is also lower
// then expected, therefore the alternative approach will
// be used for now.
describe.skip('[getModulesTree]', () => {
  test('should find all top-level elements', () => {
    render(`
      <module-element data-testid="1"></module-element>
      <module-element data-testid="2"></module-element>
    `)

    const tree = getModulesTree(document.body)

    expect(tree.element).toBeNull()
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0]?.element).toBe(screen.getByTestId('1'))
    expect(tree.children[1]?.element).toBe(screen.getByTestId('2'))
  })

  test('should find nested elements', () => {
    render(`
      <module-element data-testid="1">
        <module-element data-testid="2"></module-element>
        <module-element data-testid="3">
          <module-element data-testid="4"></module-element>
        </module-element>
      </module-element>
    `)

    const tree = getModulesTree(document.body)
    const level1 = tree.children
    const level2 = level1[0].children
    const level3 = level2[1].children

    expect(level1[0].element).toBe(screen.getByTestId('1'))
    expect(level2[0].element).toBe(screen.getByTestId('2'))
    expect(level2[1].element).toBe(screen.getByTestId('3'))
    expect(level3[0].element).toBe(screen.getByTestId('4'))
  })
})

describe('[getModulesTreeWithoutNotSelector]', () => {
  test('should find all top-level elements', () => {
    render(`
      <module-element data-testid="1"></module-element>
      <module-element data-testid="2"></module-element>
    `)

    const tree = getModulesTreeWithoutNotSelector()

    expect(tree.element).toBeNull()
    expect(tree.children).toHaveLength(2)
    expect(tree.children[0].element).toBe(screen.getByTestId('1'))
    expect(tree.children[1].element).toBe(screen.getByTestId('2'))
  })

  test('should find nested elements', () => {
    render(`
      <module-element data-testid="1">
        <module-element data-testid="2"></module-element>
        <module-element data-testid="3">
          <module-element data-testid="4"></module-element>
        </module-element>
      </module-element>
    `)

    const tree = getModulesTreeWithoutNotSelector()
    const level1 = tree.children
    const level2 = level1[0].children
    const level3 = level2[1].children

    expect(level1[0].element).toBe(screen.getByTestId('1'))
    expect(level2[0].element).toBe(screen.getByTestId('2'))
    expect(level2[1].element).toBe(screen.getByTestId('3'))
    expect(level3[0].element).toBe(screen.getByTestId('4'))
  })
})
