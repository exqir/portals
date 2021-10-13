import type { IBootstrapOptions, IProvider } from '@portals/react'
import { FunctionComponent, ReactElement, Suspense } from 'react'
import { render as tlrRender } from '@testing-library/react'
import { isFunction } from '@portals/core'
import {
  BootstrapOptionsProvider,
  NoopComponent,
  NoopProvider,
} from '@portals/react/testing'

interface ICreateComponentRenderOptions {
  defaultAppProvider: IProvider
  defaultModuleProvider: IProvider
  defaultBootstrapOptions: IBootstrapOptions
}

export function createComponentRender({
  defaultAppProvider = NoopProvider,
  defaultModuleProvider = NoopProvider,
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
