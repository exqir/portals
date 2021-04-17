import type { FC, ComponentType } from 'react'
import React from 'react'
import Loadable from './loadable'

import type { ILazy, IOnInitHook } from '../types/definitions'
import { ModuleManager } from './ModuleManager'

export interface ILoadableComponent {
  component: ILazy<FC>
  useInit?: ILazy<IOnInitHook>
}

export function createLoadableComponent<Payload = unknown>({
  component,
  useInit,
}: ILoadableComponent): ComponentType<Payload> {
  return Loadable.Map({
    loader: {
      Component: component,
      useInit:
        typeof useInit === 'function'
          ? useInit
          : () => Promise.resolve(noopHook),
    },
    loading: () => <div>Loading</div>,
    render(
      loaded: { Component: { default: ComponentType }; useInit: IOnInitHook },
      props: any,
    ) {
      const Component = loaded.Component.default
      const useInit = loaded.useInit
      return <ModuleManager {...props} useInit={useInit} module={Component} />
    },
  })
}

const noopHook: IOnInitHook<null> = () => {
  return { data: null, loading: false, error: undefined }
}
