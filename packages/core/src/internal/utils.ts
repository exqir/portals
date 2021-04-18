import type { ReactElement, ReactNode } from 'react'

import type { ModuleHostElement } from './ModuleHostElement'

export function noop() {}

export function identity(value: any) {
  return value
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

export function isModuleHostElement(
  element: Element,
): element is ModuleHostElement {
  return Object.prototype.hasOwnProperty.call(element, 'moduleId')
}

export function NoopProvider({
  children,
}: {
  children: ReactNode
}): ReactElement | null {
  return (children as ReactElement) ?? null
}
