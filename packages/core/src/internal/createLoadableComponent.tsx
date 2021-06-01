import type { ComponentType } from 'react'
import React, { lazy } from 'react'

import type { ILazy, IOnInitHook } from '../types/definitions'
import { ModuleManager } from './ModuleManager'
import { isFunction } from './utils'

export interface ILoadableWithoutData {
  component: ILazy<{ default: ComponentType<{}> }>
}

export interface ILoadableWithData<Payload> {
  component: ILazy<{ default: ComponentType<{ data: Payload }> }>
  useInit: ILazy<IOnInitHook<Payload>>
}

const noopHook: IOnInitHook<any> = () => {
  return { data: null, loading: false, error: undefined }
}

export function createLoadableComponent<Payload>(args: ILoadableWithData<Payload>): ComponentType<any>
export function createLoadableComponent(args: ILoadableWithoutData): ComponentType<any>
export function createLoadableComponent({ component, useInit }: any): ComponentType<any> {
  return lazy(() =>
    Promise.all([
      component(),
      isFunction(useInit) ? useInit() : noopHook,
    ]).then(
      ([{ default: Component }, useInit]) => ({
        default: function LazyModule(props: any) {
          return (
            <ModuleManager {...props} useInit={useInit} module={Component} />
          )
        },
      }),
    ),
  )
}
