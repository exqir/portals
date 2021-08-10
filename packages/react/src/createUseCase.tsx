import type { IModulesRoot } from '@portals/core'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { isFunction, createCustomElements, getModulesTree } from '@portals/core'

import type {
  IBootstrapOptions,
  IUseCaseOptions,
  IModuleDefinition,
  IProvider,
  IRegistry,
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
  options: useCaseOptions = {
    Loading: NoopComponent,
    Error: NoopComponent,
  },
}: IUseCase) {
  return {
    bootstrap: (options: IBootstrapOptions) =>
      // Can the type cast be avoided?
      bootstrap(
        modules,
        { ...(useCaseOptions as IUseCaseOptions), ...options },
        AppProvider,
        ModuleProvider,
      ),
  }
}

function render(
  modules: IModules,
  modulesTree: IModulesRoot,
  options: IBootstrapOptions & IUseCaseOptions,
  AppProvider?: IProvider,
  ModuleProvider?: IProvider,
) {
  const rootElement = document.getElementById('root')
  ReactDOM.render(
    <StrictMode>
      <App
        modulesTree={modulesTree}
        modules={modules}
        AppProvider={AppProvider}
        ModuleProvider={ModuleProvider}
        options={options}
      />
    </StrictMode>,
    rootElement,
  )
}

function bootstrap(
  modules: IModules,
  options: IBootstrapOptions & IUseCaseOptions,
  AppProvider?: IProvider,
  ModuleProvider?: IProvider,
) {
  createCustomElements(Array.from(modules.keys()))
  const modulesTree = getModulesTree()

  if (AppProvider && isFunction(AppProvider.preload)) {
    AppProvider.preload(options)
  }
  if (ModuleProvider && isFunction(ModuleProvider.preload)) {
    ModuleProvider.preload(options)
  }

  render(modules, modulesTree, options, AppProvider, ModuleProvider)
}
