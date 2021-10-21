import type { ModuleHostElement } from './ModuleHostElement'

export function noop() {}

export function identity(value: any) {
  return value
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}

export function isNull(value: any): value is null {
  return value === null
}

export function isModuleHostElement(
  element: Element,
): element is ModuleHostElement {
  return element && Object.prototype.hasOwnProperty.call(element, 'moduleId')
}

export function getAttribute(
  element: Element,
  attribute: string,
): string | null {
  return element.attributes.getNamedItem(attribute)?.nodeValue ?? null
}
