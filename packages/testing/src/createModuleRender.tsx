import type { IRuntimeOptions, IProvider } from '@portals/react'
import { render as tlrRender } from '@testing-library/react'
import { createCustomElements, getModulesTree, isFunction } from '@portals/core'
import { createModule } from '@portals/react'
import { App, NoopComponent, NoopProvider } from '@portals/react/testing'

const usecaseOptions = {
  Loading: NoopComponent,
  Error: NoopComponent,
}
interface ICreateModuleRenderOptions {
  module: ReturnType<typeof createModule>
  defaultRuntimeOptions: IRuntimeOptions
  defaultAppProvider?: IProvider
  defaultModuleProvider?: IProvider
}

export function createModuleRender({
  module,
  defaultRuntimeOptions,
  defaultAppProvider = NoopProvider,
  defaultModuleProvider = NoopProvider,
}: ICreateModuleRenderOptions) {
  const [moduleTag] = module
  let host: Element | null = null

  // @ts-ignore Block is guarded by `typeof` check
  if (isFunction(beforeAll)) {
    // @ts-ignore Block is guarded by `typeof` check
    beforeAll(() => {
      createCustomElements([moduleTag])
    })
  }

  // @ts-ignore Block is guarded by `typeof` check
  if (isFunction(afterEach)) {
    // @ts-ignore Block is guarded by `typeof` check
    afterEach(() => {
      if (host?.parentNode === document.body) {
        document.body.removeChild(host)
        host = null
      }
    })
  }

  return (
    options?: Partial<
      IRuntimeOptions & { AppProvider: IProvider; ModuleProvider: IProvider }
    >,
  ) => {
    const {
      AppProvider = defaultAppProvider,
      ModuleProvider = defaultModuleProvider,
      ...runtimeOptions
    } = options ?? {}

    const combinedOptions = {
      Loading: NoopComponent,
      Error: NoopComponent,
      ...defaultRuntimeOptions,
      ...runtimeOptions,
    }

    if (AppProvider && isFunction(AppProvider.preload)) {
      AppProvider.preload({ runtimeOptions: combinedOptions, usecaseOptions })
    }
    if (ModuleProvider && isFunction(ModuleProvider.preload)) {
      ModuleProvider.preload({
        runtimeOptions: combinedOptions,
        usecaseOptions,
      })
    }

    document.body.innerHTML = `<div id="root"></div><${moduleTag}></${moduleTag}>`
    const container = document.body.children[0]
    host = document.body.children[1]

    const modulesTree = getModulesTree()

    return tlrRender(
      <App
        modules={new Map([module])}
        modulesTree={modulesTree}
        AppProvider={AppProvider}
        ModuleProvider={ModuleProvider}
        runtimeOptions={combinedOptions}
        usecaseOptions={usecaseOptions}
      />,
      { container },
    )
  }
}
