import type { IBootstrapOptions, IProvider } from '@portals/react'
import { render as tlrRender } from '@testing-library/react'
import { createCustomElements, getModulesTree, isFunction } from '@portals/core'
import { createModule } from '@portals/react'
import { App, NoopComponent, NoopProvider } from '@portals/react/testing'

interface ICreateModuleRenderOptions {
  module: ReturnType<typeof createModule>
  defaultBootstrapOptions: IBootstrapOptions
  defaultAppProvider?: IProvider
  defaultModuleProvider?: IProvider
}

export function createModuleRender({
  module,
  defaultBootstrapOptions,
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
      IBootstrapOptions & { AppProvider: IProvider; ModuleProvider: IProvider }
    >,
  ) => {
    const {
      AppProvider = defaultAppProvider,
      ModuleProvider = defaultModuleProvider,
      ...bootstrapOptions
    } = options ?? {}

    const combinedOptions = {
      Loading: NoopComponent,
      Error: NoopComponent,
      ...defaultBootstrapOptions,
      ...bootstrapOptions,
    }

    if (AppProvider && isFunction(AppProvider.preload)) {
      AppProvider.preload(combinedOptions)
    }
    if (ModuleProvider && isFunction(ModuleProvider.preload)) {
      ModuleProvider.preload(combinedOptions)
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
        options={combinedOptions}
      />,
      { container },
    )
  }
}
