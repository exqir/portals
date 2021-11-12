import type { IModulesRoot } from '@portals/core'
import type { ReactElement, ReactNode } from 'react'
import React, { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { isRouteElement } from '@portals/core'

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
import { Route, PendingNavigation } from '../provider/RoutingProvider'
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
        {/* TODO: Use route basepath from runtimeOptions as basename */}
        <BrowserRouter>
          <PendingNavigation>
            <LoadingStatusProvider modulesTree={modulesTree}>
              <Suspense fallback={null}>
                <AppProvider
                  children={buildModulesTree({
                    children: modulesTree.children,
                    ModuleProvider,
                    modules,
                    renderToHost: true,
                  })}
                />
              </Suspense>
            </LoadingStatusProvider>
          </PendingNavigation>
        </BrowserRouter>
      </RuntimeOptionsProvider>
    </UsecaseOptionsProvider>
  )
}

interface BuildModuleTreeOptions {
  children: IModulesRoot['children']
  ModuleProvider: IProvider
  modules: IModulesMap
  renderToHost?: boolean
}

function buildModulesTree({
  children: moduleChildren,
  ModuleProvider,
  modules,
  renderToHost = false,
}: BuildModuleTreeOptions): ReactElement[] | undefined {
  return moduleChildren.map(({ element, children }) => {
    if (isRouteElement(element)) {
      return (
        <HostProvider host={element} key={element.moduleId}>
          <ModuleProvider>
            <Route element={element}>
              {buildModulesTree({
                children,
                ModuleProvider,
                modules,
                // TODO: Only the first level of route-elements should render their children
                // directly to their hosts. On following levels they should be rendered via
                // the Children component to allow the parent modules to controll their placement.
                renderToHost: true,
              })}
            </Route>
          </ModuleProvider>
        </HostProvider>
      )
    }

    return (
      <HostProvider host={element} key={element.moduleId}>
        <ModuleProvider>
          <Module
            renderToHost={renderToHost}
            modules={modules}
            children={buildModulesTree({
              children,
              ModuleProvider,
              modules,
            })}
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
