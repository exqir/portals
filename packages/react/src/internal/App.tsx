import type { IModulesRoot } from '@portals/core'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import React, { Suspense } from 'react'

import type {
  IModulesMap,
  IProvider,
  IRuntimeOptions,
  IUseCaseOptions,
  IModuleDefinition,
} from '../types/definitions'
import { LoadingStatusProvider } from '../provider/LoadingStatusProvider'
import {
  RuntimeOptionsProvider,
  UsecaseOptionsProvider,
} from '../provider/OptionProviders'
import { HostProvider, useHost } from '../provider/HostProvider'
import { ChildrenProvider } from './Children'
import { Host } from './Host'
import { NoopProvider } from './utils'

interface IAppProps {
  modulesTree: IModulesRoot
  modules: IModulesMap
  runtimeOptions: IRuntimeOptions
  usecaseOptions: IUseCaseOptions
  AppProvider?: IProvider
  ModuleProvider?: IProvider
}

export function App({
  modulesTree,
  modules,
  runtimeOptions,
  usecaseOptions,
  AppProvider = NoopProvider,
  ModuleProvider = NoopProvider,
}: IAppProps) {
  return (
    <UsecaseOptionsProvider {...usecaseOptions}>
      <RuntimeOptionsProvider {...runtimeOptions}>
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
      </RuntimeOptionsProvider>
    </UsecaseOptionsProvider>
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
