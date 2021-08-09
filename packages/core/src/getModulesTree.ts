import type { ModuleHostElement } from './ModuleHostElement'
import { ID_ATTRIBUTE } from './ModuleHostElement'
import { getAttribute, isModuleHostElement } from './utils'

interface IModulesRoot {
  element: null
  children: IModulesNode[]
}

interface IModulesNode {
  element: ModuleHostElement
  children: IModulesNode[]
}

type IModulesTree<T> = T extends ModuleHostElement ? IModulesNode : IModulesRoot

export function getModulesTree<T extends Element | ModuleHostElement>(
  parent: T,
): IModulesTree<T>
export function getModulesTree(
  parent: Element | ModuleHostElement,
): IModulesRoot | IModulesNode {
  const selectors = [`[${ID_ATTRIBUTE}]`, `[${ID_ATTRIBUTE}]`]
  const parentId = getAttribute(parent, ID_ATTRIBUTE)
  if (parentId) {
    selectors.unshift(`[${ID_ATTRIBUTE}="${parentId}"]`)
  }
  const notQuery = selectors.join(' ')
  const elements = parent.querySelectorAll(`[${ID_ATTRIBUTE}]:not(${notQuery})`)
  console.log({ notQuery })
  console.log({ elements: Array.from(elements) })

  return {
    element: isModuleHostElement(parent) ? parent : null,
    children: Array.from(elements)
      .filter(isModuleHostElement)
      .map((e) => {
        return getModulesTree(e)
      }),
  }
}

export function getModulesTreeWithoutNotSelector(): IModulesRoot {
  const modules = document.body.querySelectorAll(`[${ID_ATTRIBUTE}]`)
  const map = new Map<null | Element, Element[]>()

  Array.from(modules).forEach((m) => {
    const parent = m.parentElement?.closest(`[${ID_ATTRIBUTE}]`) ?? null
    const c = map.get(parent)

    if (c) {
      c.push(m)
    } else {
      map.set(parent, [m])
    }
  })

  function getChildren(element: ModuleHostElement): IModulesNode {
    const children = map.get(element)
    return children
      ? {
          element,
          children: children.map((c) => getChildren(c as ModuleHostElement)),
        }
      : { element, children: [] }
  }

  return {
    element: null,
    children:
      map.get(null)?.map((e) => getChildren(e as ModuleHostElement)) ?? [],
  }
}
