import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'

import type {
  IBootstrapOptions,
  IModuleDefinition,
  IProvider,
  IRegistry,
} from './types/definitions'

import Modules from './internal/Modules'
import { createRegistry } from './internal/registry'
import { createCustomElements } from './internal/createCustomElements'
import { isFunction } from './internal/utils'

type IModules = Map<string, IModuleDefinition>

interface IUseCase {
  modules: IModules
  AppProvider?: IProvider
  ModuleProvider?: IProvider
}

export function createUseCase({
  modules,
  AppProvider,
  ModuleProvider,
}: IUseCase) {
  return {
    bootstrap: (options: IBootstrapOptions) =>
      bootstrap(modules, options, AppProvider, ModuleProvider),
  }
}

function render(
  modules: IModules,
  registry: IRegistry,
  options: IBootstrapOptions,
  AppProvider?: IProvider,
  ModuleProvider?: IProvider,
) {
  const rootElement = document.getElementById('root')
  ReactDOM.render(
    <StrictMode>
      <Modules
        registry={registry}
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
  options: IBootstrapOptions,
  AppProvider?: IProvider,
  ModuleProvider?: IProvider,
) {
  const registry = createRegistry()

  createCustomElements([...modules.keys()], registry)

  if (AppProvider && isFunction(AppProvider.preload)) {
    AppProvider.preload(options)
  }
  if (ModuleProvider && isFunction(ModuleProvider.preload)) {
    ModuleProvider.preload(options)
  }

  render(modules, registry, options, AppProvider, ModuleProvider)
}
