import type { IModulesRoot } from '@portals/core'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { isFunction, createCustomElements, getModulesTree } from '@portals/core'

import type {
  IRuntimeOptions,
  IUseCaseOptions,
  IModuleDefinition,
  IProvider,
} from './types/definitions'

import { App } from './internal/App'
import { NoopComponent } from './internal/utils'

type IModules = Map<string, IModuleDefinition>

interface IUseCase {
  modules: IModules
  AppProvider?: IProvider
  ModuleProvider?: IProvider
  options?: Partial<IUseCaseOptions>
}

export function createUseCase({
  modules,
  AppProvider,
  ModuleProvider,
  options: usecaseOptions,
}: IUseCase) {
  const usecaseOptionsWithDefaults: IUseCaseOptions = {
    Loading: NoopComponent,
    Error: NoopComponent,
    ...usecaseOptions,
  }

  return {
    bootstrap: (options: IRuntimeOptions) =>
      bootstrap({
        modules,
        runtimeOptions: options,
        usecaseOptions: usecaseOptionsWithDefaults,
        AppProvider,
        ModuleProvider,
      }),
    modules,
    AppProvider,
    ModuleProvider,
    usecaseOptions: usecaseOptionsWithDefaults,
  }
}

interface IRenderOptions {
  modules: IModules
  modulesTree: IModulesRoot
  runtimeOptions: IRuntimeOptions
  usecaseOptions: IUseCaseOptions
  AppProvider?: IProvider
  ModuleProvider?: IProvider
}

function render({
  modules,
  modulesTree,
  runtimeOptions,
  usecaseOptions,
  AppProvider,
  ModuleProvider,
}: IRenderOptions) {
  // We don't need to add the rootElement to the DOM
  // because all top-level elements will be rendered
  // to the host custom-elements that are already in
  // the DOM via portals.
  const rootElement = document.createElement('div')
  ReactDOM.render(
    <StrictMode>
      <App
        modulesTree={modulesTree}
        modules={modules}
        AppProvider={AppProvider}
        ModuleProvider={ModuleProvider}
        runtimeOptions={runtimeOptions}
        usecaseOptions={usecaseOptions}
      />
    </StrictMode>,
    rootElement,
  )
}

interface IBootstrap {
  modules: IModules
  runtimeOptions: IRuntimeOptions
  usecaseOptions: IUseCaseOptions
  AppProvider?: IProvider
  ModuleProvider?: IProvider
}

function bootstrap({
  modules,
  runtimeOptions,
  usecaseOptions,
  AppProvider,
  ModuleProvider,
}: IBootstrap) {
  createCustomElements(Array.from(modules.keys()))
  const modulesTree = getModulesTree()

  if (AppProvider && isFunction(AppProvider.preload)) {
    AppProvider.preload(runtimeOptions)
  }
  if (ModuleProvider && isFunction(ModuleProvider.preload)) {
    ModuleProvider.preload(runtimeOptions)
  }

  render({
    modules,
    modulesTree,
    runtimeOptions,
    usecaseOptions,
    AppProvider,
    ModuleProvider,
  })
}
