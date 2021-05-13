import type { ComponentType } from 'react'

import {
  createLoadableComponent,
  ILoadableComponent,
} from './internal/createLoadableComponent'

interface ICreateModule extends ILoadableComponent {
  moduleTag: string
}

export function createModule<Payload = unknown>({
  moduleTag,
  component,
  useInit,
}: ICreateModule): [string, ComponentType<{ data?: Payload }>] {
  return [moduleTag, createLoadableComponent({ component, useInit })]
}
