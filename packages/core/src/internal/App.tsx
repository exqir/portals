import type { ComponentType, ReactElement, ReactNode } from 'react'
import React from 'react'
import { createPortal } from 'react-dom'

import type {
  IModulesMap,
  IRegistry,
  IProvider,
  IBootstrapOptions,
  IUseCaseOptions,
  IModuleDefinition,
} from '../types/definitions'
import { RegistryProvider } from '../provider/RegistryProvider'
import { BootstrapOptionsProvider } from '../provider/BootstrapOptionsProvider'
import { HostProvider, useHost } from '../provider/HostProvider'
import { useOutlet, OutletProvider } from './Outlet'
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
        <AppProvider children={buildModulesTree(registry, ModuleProvider, Module, modules)} />
      </RegistryProvider>
    </BootstrapOptionsProvider>
  )
}

function buildModulesTree(
  registry: IRegistry,
  ModuleProvider: IProvider,
  Module: ComponentType<IModuleProps>,
  modules: IModulesMap
): ReactElement[] | undefined {
  return registry.getElements().map(element => {
    const elementRegistry = registry.getRegistry(element) as IRegistry
    return (
      <HostProvider host={element} key={element.moduleId}>
        <RegistryProvider registry={elementRegistry}>
          <ModuleProvider>
            <Module modules={modules} children={buildModulesTree(elementRegistry, ModuleProvider, Module, modules)} />
          </ModuleProvider>
        </RegistryProvider>
      </HostProvider>
    )
  })
}

interface IModuleProps {
  modules: IModulesMap,
  children: ReactNode,
}

function Module({ modules, children }: IModuleProps) {
  const { host, moduleTag } = useHost()
  const { outlet } = useOutlet()

  if (modules.has(moduleTag)) {
    // We can be sure that ModuleComponent is not undefined because we
    // checked that it is in the modules before.
    const ModuleComponent = modules.get(moduleTag) as IModuleDefinition

    return createPortal(
      <OutletProvider content={children}>
        <ModuleComponent>{children}</ModuleComponent>
      </OutletProvider>,
      outlet ?? host,
    )
  }
  return null
}