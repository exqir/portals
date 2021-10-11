import type {
  IBootstrapOptions,
  IProvider,
  createUseCase,
} from '@portals/react'
import { FunctionComponent, ReactElement, Suspense } from 'react'
import { render as tlrRender } from '@testing-library/react'
import { createCustomElements, getModulesTree, isFunction } from '@portals/core'
import { createModule } from '@portals/react'
import {
  App,
  BootstrapOptionsProvider,
  NoopComponent,
  NoopProvider,
} from '@portals/react/testing'

interface ICreateUseCaseRenderOptions {
  useCase: ReturnType<typeof createUseCase>
  defaultMarkup: string
  defaultBootstrapOptions: IBootstrapOptions
}

export function createUseCaseRender({
  useCase,
  defaultMarkup,
  defaultBootstrapOptions,
}: ICreateUseCaseRenderOptions) {
  const { modules, AppProvider, ModuleProvider, useCaseOptions } = useCase

  // @ts-ignore Block is guarded by `typeof` check
  if (isFunction(beforeAll)) {
    // @ts-ignore Block is guarded by `typeof` check
    beforeAll(() => {
      createCustomElements(Array.from(modules.keys()))
    })
  }

  // @ts-ignore Block is guarded by `typeof` check
  if (isFunction(afterEach)) {
    // @ts-ignore Block is guarded by `typeof` check
    afterEach(() => {
      document.body.innerHTML = ''
    })
  }

  return (options?: Partial<IBootstrapOptions & { markup: string }>) => {
    const { markup, ...bootstrapOptions } = options ?? {}
    const combinedOptions = {
      ...defaultBootstrapOptions,
      ...bootstrapOptions,
      ...useCaseOptions,
    }

    if (AppProvider && isFunction(AppProvider.preload)) {
      AppProvider.preload(combinedOptions)
    }
    if (ModuleProvider && isFunction(ModuleProvider.preload)) {
      ModuleProvider.preload(combinedOptions)
    }

    const container = document.createElement('div')
    container.innerHTML = markup ?? defaultMarkup
    document.body.appendChild(container)

    const modulesTree = getModulesTree()

    return tlrRender(
      <App
        modules={modules}
        modulesTree={modulesTree}
        AppProvider={AppProvider}
        ModuleProvider={ModuleProvider}
        options={combinedOptions}
      />,
      { container },
    )
  }
}

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

interface ICreateComponentRenderOptions {
  defaultAppProvider: IProvider
  defaultModuleProvider: IProvider
  defaultBootstrapOptions: IBootstrapOptions
}

export function createComponentRender({
  defaultAppProvider,
  defaultModuleProvider,
  defaultBootstrapOptions,
}: ICreateComponentRenderOptions) {
  return (
    ui: ReactElement,
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

    const Wrapper: FunctionComponent = ({ children }) => (
      <BootstrapOptionsProvider options={combinedOptions}>
        <Suspense fallback={null}>
          <AppProvider>
            <ModuleProvider>{children}</ModuleProvider>
          </AppProvider>
        </Suspense>
      </BootstrapOptionsProvider>
    )

    return tlrRender(ui, { wrapper: Wrapper })
  }
}
