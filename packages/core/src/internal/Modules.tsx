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

interface IModulesProps {
  registry: IRegistry
  modules: IModulesMap
  AppProvider?: IProvider
  ModuleProvider?: IProvider
  options: IBootstrapOptions & IUseCaseOptions
}

export default function Modules({
  registry,
  modules,
  AppProvider = NoopProvider,
  ModuleProvider = NoopProvider,
  options,
}: IModulesProps) {
  const modulesTree = buildModulesTree(registry, ModuleProvider, Module, modules)

  return (
    <BootstrapOptionsProvider options={options}>
      <RegistryProvider registry={registry}>
        <AppProvider>{modulesTree}</AppProvider>
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
  const tree = registry.getElements()
  if (tree.length === 0) return undefined
  const components: ReactElement[] = []
  for (const leaf of tree) {
    // We are sure it is an IRegistry because we are iterating over the
    // keys of the map therefore the key has to be in the map.
    const leafRegistry = registry.getRegistry(leaf) as IRegistry
    const component = (
      // HostProvider needs to be the outermost provider so that the host
      // can be accessed in the OutletProvider
      <HostProvider host={leaf} key={leaf.moduleId}>
        <RegistryProvider registry={leafRegistry}>
        {/* 
        Could the slot check be done here as we have access to the host already and then 
        communicate it to the parent by a setState passed down through an OutletContext?
          - Need to check if in an OutletContext
          - addSlot(slotName, component)
        Does this cause to many rerenders?
        */}
          <ModuleProvider>
            <Module modules={modules}>
              {buildModulesTree(leafRegistry, ModuleProvider, Module, modules)}
            </Module>
          </ModuleProvider>
        </RegistryProvider>
      </HostProvider>
    )
    components.push(component)
  }
  return components
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