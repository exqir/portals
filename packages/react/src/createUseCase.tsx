import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'

import type {
  IBootstrapOptions,
  IUseCaseOptions,
  IModuleDefinition,
  IProvider,
  IRegistry,
} from './types/definitions'

import { App } from './internal/App'
import { createCustomElements } from './internal/createCustomElements'
import { isFunction, NoopComponent } from './internal/utils'

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
  }
}: IUseCase) {
  return {
    bootstrap: (options: IBootstrapOptions) =>
      // Can the type cast be avoided? 
      bootstrap(modules, { ...(useCaseOptions as IUseCaseOptions), ...options }, AppProvider, ModuleProvider),
  }
}

function render(
  modules: IModules,
  registry: IRegistry,
  options: IBootstrapOptions & IUseCaseOptions,
  AppProvider?: IProvider,
  ModuleProvider?: IProvider,
) {
  const rootElement = document.getElementById('root')
  ReactDOM.render(
    <StrictMode>
      <App
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
  options: IBootstrapOptions & IUseCaseOptions,
  AppProvider?: IProvider,
  ModuleProvider?: IProvider,
) {
  const registry = createCustomElements(Array.from(modules.keys()))

  if (AppProvider && isFunction(AppProvider.preload)) {
    AppProvider.preload(options)
  }
  if (ModuleProvider && isFunction(ModuleProvider.preload)) {
    ModuleProvider.preload(options)
  }

  render(modules, registry, options, AppProvider, ModuleProvider)
}
