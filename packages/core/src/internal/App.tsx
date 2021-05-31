import { ComponentType, ReactElement, ReactNode, Suspense } from 'react'
import React from 'react'

import type {
  IModulesMap,
  IRegistry,
  IProvider,
  IBootstrapOptions,
  IUseCaseOptions,
  IModuleDefinition,
} from '../types/definitions'
import { RegistryProvider } from '../provider/RegistryProvider'
import { LoadingStatusProvider } from '../provider/LoadingStatusProvider'
import { BootstrapOptionsProvider } from '../provider/BootstrapOptionsProvider'
import { HostProvider, useHost } from '../provider/HostProvider'
import { useOutlet, ChildrenProvider } from './Outlet'
import { Host } from './Host'
import { NoopProvider } from './utils'

interface IAppProps {
  registry: IRegistry
  modules: IModulesMap
  AppProvider?: IProvider
  ModuleProvider?: IProvider
  options: IBootstrapOptions & IUseCaseOptions
}

export function App({
  registry,
  modules,
  AppProvider = NoopProvider,
  ModuleProvider = NoopProvider,
  options,
}: IAppProps) {
  return (
    <BootstrapOptionsProvider options={options}>
      <RegistryProvider registry={registry}>
        <LoadingStatusProvider registry={registry}>
          <Suspense fallback={null}>
            <AppProvider children={buildModulesTree(registry, ModuleProvider, Module, modules, true)} />
          </Suspense>
        </LoadingStatusProvider>
      </RegistryProvider>
    </BootstrapOptionsProvider>
  )
}

function buildModulesTree(
  registry: IRegistry,
  ModuleProvider: IProvider,
  Module: ComponentType<IModuleProps>,
  modules: IModulesMap,
  renderToHost = false
): ReactElement[] | undefined {
  return registry.getElements().map(element => {
    const elementRegistry = registry.getRegistry(element) as IRegistry
    return (
      <HostProvider host={element} key={element.moduleId}>
        <RegistryProvider registry={elementRegistry}>
          <ModuleProvider>
            <Module renderToHost={renderToHost} modules={modules} children={buildModulesTree(elementRegistry, ModuleProvider, Module, modules)} />
          </ModuleProvider>
        </RegistryProvider>
      </HostProvider>
    )
  })
}

interface IModuleProps {
  renderToHost: boolean,
  modules: IModulesMap,
  children: ReactNode,
}

function Module({ renderToHost, modules, children }: IModuleProps) {
  const { moduleTag } = useHost()

  if (modules.has(moduleTag)) {
    // We can be sure that ModuleComponent is not undefined because we
    // checked that it is in the modules before.
    const ModuleComponent = modules.get(moduleTag) as IModuleDefinition

    const M = (
      <ChildrenProvider content={children}>
        <ModuleComponent />
      </ChildrenProvider>
    );

    return renderToHost ? <Host>{M}</Host> : M
  }
  return null
}