import type { IModulesRoot } from '@portals/core'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import React, { Suspense } from 'react'

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
import { ChildrenProvider } from './Children'
import { Host } from './Host'
import { NoopProvider } from './utils'

interface IAppProps {
  modulesTree: IModulesRoot
  modules: IModulesMap
  AppProvider?: IProvider
  ModuleProvider?: IProvider
  options: IBootstrapOptions & IUseCaseOptions
}

export function App({
  modulesTree,
  modules,
  AppProvider = NoopProvider,
  ModuleProvider = NoopProvider,
  options,
}: IAppProps) {
  return (
    <BootstrapOptionsProvider options={options}>
      <LoadingStatusProvider modulesTree={modulesTree}>
        <Suspense fallback={null}>
          <AppProvider
            children={buildModulesTree(
              modulesTree.children,
              ModuleProvider,
              Module,
              modules,
              true,
            )}
          />
        </Suspense>
      </LoadingStatusProvider>
    </BootstrapOptionsProvider>
  )
}

function buildModulesTree(
  moduleChildren: IModulesRoot['children'],
  ModuleProvider: IProvider,
  Module: ComponentType<IModuleProps>,
  modules: IModulesMap,
  renderToHost = false,
): ReactElement[] | undefined {
  return moduleChildren.map(({ element, children }) => {
    return (
      <HostProvider host={element} key={element.moduleId}>
        <ModuleProvider>
          <Module
            renderToHost={renderToHost}
            modules={modules}
            children={buildModulesTree(
              children,
              ModuleProvider,
              Module,
              modules,
            )}
          />
        </ModuleProvider>
      </HostProvider>
    )
  })
}

interface IModuleProps {
  renderToHost: boolean
  modules: IModulesMap
  children: ReactNode
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
    )

    return renderToHost ? <Host>{M}</Host> : M
  }
  return null
}
