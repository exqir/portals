import type { ComponentType, LazyExoticComponent } from 'react'
import React, { lazy } from 'react'

import type { ILazy, IOnInitHook } from '../types/definitions'
import { ModuleManager } from './ModuleManager'
import { isFunction } from './utils'

export interface ILoadableWithoutData<Props> {
  component: ILazy<{ default: ComponentType<Props> }>
}

export interface ILoadableWithData<Props, Payload> {
  component: ILazy<{ default: ComponentType<{ data: Payload } & Props> }>
  useInit: ILazy<IOnInitHook<Payload>>
}

const noopHook: IOnInitHook<any> = () => {
  return { data: null, loading: false, error: undefined }
}

export function createLoadableComponent<Props, Payload>(
  args: ILoadableWithData<Props, Payload>,
): LazyExoticComponent<ComponentType<Omit<Props, 'data'>>>
export function createLoadableComponent<Props>(
  args: ILoadableWithoutData<Props>,
): LazyExoticComponent<ComponentType<Props>>
export function createLoadableComponent<Props>({
  component,
  useInit,
}: any): LazyExoticComponent<ComponentType<Props>> {
  return lazy(() =>
    Promise.all([component(), isFunction(useInit) ? useInit() : noopHook]).then(
      ([{ default: Component }, useInit]) => ({
        default: function LazyModule(props: Props) {
          return (
            <ModuleManager {...props} useInit={useInit} module={Component} />
          )
        },
      }),
    ),
  )
}
