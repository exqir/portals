import type { IBootstrapOptions, createUseCase } from '@portals/react'
import { render as tlrRender } from '@testing-library/react'
import { createCustomElements, getModulesTree, isFunction } from '@portals/core'
import { App } from '@portals/react/testing'

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

    document.body.innerHTML = `<div id="root"></div>${markup ?? defaultMarkup}`
    const container = document.body.children[0]

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
