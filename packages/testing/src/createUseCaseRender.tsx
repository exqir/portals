import type { IRuntimeOptions, createUseCase } from '@portals/react'
import { render as tlrRender } from '@testing-library/react'
import { createCustomElements, getModulesTree, isFunction } from '@portals/core'
import { App } from '@portals/react/testing'

interface ICreateUseCaseRenderOptions {
  useCase: ReturnType<typeof createUseCase>
  defaultMarkup: string
  defaultRuntimeOptions: IRuntimeOptions
}

export function createUseCaseRender({
  useCase,
  defaultMarkup,
  defaultRuntimeOptions,
}: ICreateUseCaseRenderOptions) {
  const { modules, AppProvider, ModuleProvider, usecaseOptions } = useCase

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

  return (options?: Partial<IRuntimeOptions & { markup: string }>) => {
    const { markup, ...runtimeOptions } = options ?? {}
    const combinedOptions = {
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

    document.body.innerHTML = `<div id="root"></div>${markup ?? defaultMarkup}`
    const container = document.body.children[0]

    const modulesTree = getModulesTree()

    return tlrRender(
      <App
        modules={modules}
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
