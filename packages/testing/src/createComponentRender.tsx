import type { IRuntimeOptions, IProvider } from '@portals/react'
import { FunctionComponent, ReactElement, Suspense } from 'react'
import { render as tlrRender } from '@testing-library/react'
import { isFunction } from '@portals/core'
import {
  RuntimeOptionsProvider,
  UsecaseOptionsProvider,
  NoopComponent,
  NoopProvider,
} from '@portals/react/testing'

const usecaseOptions = {
  Loading: NoopComponent,
  Error: NoopComponent,
}

interface ICreateComponentRenderOptions {
  defaultAppProvider?: IProvider
  defaultModuleProvider?: IProvider
  defaultRuntimeOptions: IRuntimeOptions
}

export function createComponentRender({
  defaultAppProvider = NoopProvider,
  defaultModuleProvider = NoopProvider,
  defaultRuntimeOptions,
}: ICreateComponentRenderOptions) {
  return (
    ui: ReactElement,
    options?: Partial<
      IRuntimeOptions & { AppProvider: IProvider; ModuleProvider: IProvider }
    >,
  ) => {
    const {
      AppProvider = defaultAppProvider,
      ModuleProvider = defaultModuleProvider,
      ...bootstrapOptions
    } = options ?? {}

    const combinedOptions = {
      ...defaultRuntimeOptions,
      ...bootstrapOptions,
    }

    if (AppProvider && isFunction(AppProvider.preload)) {
      AppProvider.preload(combinedOptions)
    }
    if (ModuleProvider && isFunction(ModuleProvider.preload)) {
      ModuleProvider.preload(combinedOptions)
    }

    const Wrapper: FunctionComponent = ({ children }) => (
      <UsecaseOptionsProvider {...usecaseOptions}>
        <RuntimeOptionsProvider {...combinedOptions}>
          <Suspense fallback={null}>
            <AppProvider>
              <ModuleProvider>{children}</ModuleProvider>
            </AppProvider>
          </Suspense>
        </RuntimeOptionsProvider>
      </UsecaseOptionsProvider>
    )

    return tlrRender(ui, { wrapper: Wrapper })
  }
}
