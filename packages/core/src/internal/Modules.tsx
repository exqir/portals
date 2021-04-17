import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import { createPortal } from 'react-dom'

import type {
  IModulesMap,
  IRegistry,
  IProvider,
  IBootstrapOptions,
  IModuleDefinition,
} from '../types/definitions'
import type { ModuleHostElement } from './ModuleHostElement'
import { RegistryProvider } from '../provider/RegistryProvider'
import { BootstrapOptionsProvider } from '../provider/BootstrapOptionsProvider'
import { HostProvider } from '../provider/HostProvider'
import { NoopProvider } from './utils'

interface IModulesProps {
  registry: IRegistry
  modules: IModulesMap
  AppProvider?: IProvider
  ModuleProvider?: IProvider
  options: IBootstrapOptions
}

export default function Modules({
  registry,
  modules,
  AppProvider = NoopProvider,
  ModuleProvider = NoopProvider,
  options,
}: IModulesProps) {
  function renderModule(host: ModuleHostElement, children?: ReactNode) {
    const moduleTag = host.tagName.toLowerCase()
    if (modules.has(moduleTag)) {
      // We can be sure that ModuleComponent is not undefined because we
      // checked that it is in the modules before.
      const ModuleComponent = modules.get(moduleTag) as IModuleDefinition

      return createPortal(
        <HostProvider host={host} key={host.moduleId}>
          <ModuleProvider>
            <ModuleComponent>{children}</ModuleComponent>
          </ModuleProvider>
        </HostProvider>,
        host,
      )
    }
    return null
  }

  const modulesTree = buildModulesTree(registry, renderModule)

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
  renderModule: (
    element: ModuleHostElement,
    children?: ReactNode,
  ) => ReactElement | null,
): ReactElement[] | undefined {
  const tree = registry.getElements()
  if (tree.length === 0) return undefined
  const components: ReactElement[] = []
  for (const leaf of tree) {
    // We are sure it is an IRegistry because we are iterating over the
    // keys of the map therefore the key has to be in the map.
    const leafRegistry = registry.getRegistry(leaf) as IRegistry
    components.push(
      <RegistryProvider registry={leafRegistry} key={leaf.moduleId}>
        {renderModule(leaf, buildModulesTree(leafRegistry, renderModule))}
      </RegistryProvider>,
    )
  }
  return components
}
