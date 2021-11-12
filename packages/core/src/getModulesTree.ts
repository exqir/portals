import type { ModuleHostElement } from './ModuleHostElement'
import { ID_ATTRIBUTE } from './ModuleHostElement'

export interface IModulesRoot {
  element: null
  children: IModulesNode[]
}

export interface IModulesNode {
  element: ModuleHostElement
  children: IModulesNode[]
}

export function getModulesTree(): IModulesRoot {
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
