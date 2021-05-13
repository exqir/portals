import type { FC, ComponentType } from 'react'
import React, { lazy } from 'react'

import type { ILazy, IOnInitHook } from '../types/definitions'
import { ModuleManager } from './ModuleManager'
import { isFunction } from './utils'

export interface ILoadableComponent {
  component: ILazy<{ default: FC}>
  useInit?: ILazy<IOnInitHook>
}

const noopHook: IOnInitHook<null> = () => {
  return { data: null, loading: false, error: undefined }
}

export function createLoadableComponent<Payload = unknown>({ component, useInit }: ILoadableComponent): ComponentType<Payload> {
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