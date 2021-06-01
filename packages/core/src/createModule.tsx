import type { ComponentType } from 'react'

import {
  createLoadableComponent,
  ILoadableWithData,
  ILoadableWithoutData
} from './internal/createLoadableComponent'

interface ICreateModuleWithData<Payload> extends ILoadableWithData<Payload> {
  moduleTag: string
}
interface ICreateModuleWithoutData extends ILoadableWithoutData {
  moduleTag: string
}

export function createModule<Payload>(args: ICreateModuleWithData<Payload>): [string, ComponentType<{ data: Payload }>]
export function createModule(args: ICreateModuleWithoutData): [string, ComponentType<{}>]
export function createModule<Payload>({
  moduleTag,
  component,
  useInit,
}: any): typeof useInit extends undefined
  ? [string, ComponentType<{}>]
  : [string, ComponentType<{ data: Payload }>] {
  return [moduleTag, createLoadableComponent({ component, useInit })]
}
