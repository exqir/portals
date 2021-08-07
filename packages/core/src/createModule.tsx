import type { ComponentType, LazyExoticComponent } from 'react'

import {
  createLoadableComponent,
  ILoadableWithData,
  ILoadableWithoutData,
} from './internal/createLoadableComponent'

interface ICreateModuleWithData<Props, Payload>
  extends ILoadableWithData<Props, Payload> {
  moduleTag: string
}
interface ICreateModuleWithoutData<Props> extends ILoadableWithoutData<Props> {
  moduleTag: string
}

export function createModule<Props, Payload>(
  args: ICreateModuleWithData<Props, Payload>,
): [string, ComponentType<Omit<Props, 'data'>>]
export function createModule<Props>(
  args: ICreateModuleWithoutData<Props>,
): [string, ComponentType<Props>]
export function createModule<Props, Payload>({
  moduleTag,
  component,
  useInit,
}: any): typeof useInit extends undefined
  ? [string, LazyExoticComponent<ComponentType<Props>>]
  : [string, LazyExoticComponent<ComponentType<Omit<Props, 'data'>>>] {
  return [
    moduleTag,
    createLoadableComponent<Props, Payload>({ component, useInit }),
  ]
}
