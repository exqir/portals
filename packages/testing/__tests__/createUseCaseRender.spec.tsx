import { screen } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'
import {
  createModule,
  createUseCase,
  createContext,
  useRuntimeOptions,
  IProvider,
  IOnInitHook,
} from '@portals/react'

import { createUseCaseRender } from '../src/createUseCaseRender'

const tag1 = 'module-element-1'
const tag2 = 'module-element-2'
const useInit: IOnInitHook<string> = () => ({
  error: undefined,
  loading: false,
  data: 'init',
})
const [_AppProvider, useApp] = createContext<{ provider: string }>('App')
const [_ModuleProvider, useModule] =
  createContext<{ provider: string }>('Module')
const AppProvider: IProvider = ({ children }) => (
  <_AppProvider provider="App">{children}</_AppProvider>
)
const ModuleProvider: IProvider = ({ children }) => (
  <_ModuleProvider provider="Module">{children}</_ModuleProvider>
)

const ModuleComponent1 = ({ data }: { data: string }) => {
  const { baseUrl } = useRuntimeOptions()
  const appData = useApp()
  const moduleData = useModule()
  return (
    <>
      <div>Module 1: {data}</div>
      <div>BaseUrl 1: {baseUrl}</div>
      <div>Provider 1: {appData.provider}</div>
      <div>Provider 1: {moduleData.provider}</div>
    </>
  )
}
const ModuleComponent2 = ({ data }: { data: string }) => {
  const { baseUrl } = useRuntimeOptions()
  return (
    <>
      <div>Module 2: {data}</div>
      <div>BaseUrl 2: {baseUrl}</div>
    </>
  )
}
const module1 = createModule({
  moduleTag: tag1,
  component: () => Promise.resolve({ default: ModuleComponent1 }),
  useInit: () => Promise.resolve(useInit),
})
const module2 = createModule({
  moduleTag: tag2,
  component: () => Promise.resolve({ default: ModuleComponent2 }),
  useInit: () => Promise.resolve(useInit),
})

describe('[createUseCaseRender] setup', () => {
  const useCase = createUseCase({ modules: new Map([module1]) })

  const render = createUseCaseRender({
    useCase,
    defaultMarkup: `<module-element-1></module-element-1>`,
    defaultRuntimeOptions: { baseUrl: '/default' },
  })

  test('should add default markup to the DOM', () => {
    render()

    const element = document.querySelector(tag1)

    expect(element).toBeInstanceOf(ModuleHostElement)
  })

  test('should remove default markup between tests', () => {
    const element = document.querySelector(tag1)

    expect(element).toBeNull()
  })
})

describe('[createUseCaseRender] modules', () => {
  const useCase = createUseCase({
    modules: new Map([module1, module2]),
    AppProvider,
    ModuleProvider,
  })

  const render = createUseCaseRender({
    useCase,
    defaultMarkup: `<module-element-1></module-element-1>`,
    defaultRuntimeOptions: { baseUrl: '/default' },
  })

  test('should render modules in defaultMarkup', async () => {
    render()

    await screen.findByText('Module 1: init')
    expect(screen.queryByText('Module 2: init')).toBeNull()
  })

  test('should render modules in markup', async () => {
    render({
      markup: `<module-element-1></module-element-1><module-element-2></module-element-2>`,
    })

    await screen.findByText('Module 1: init')
    await screen.findByText('Module 2: init')
  })

  test('should setup use case providers', async () => {
    render()

    await screen.findByText('Provider 1: App')
    await screen.findByText('Provider 1: Module')
  })

  test('should set default runtime options', async () => {
    render()

    await screen.findByText('BaseUrl 1: /default')
  })

  test('should allow to overwrite default runtime options', async () => {
    render({ baseUrl: '/overwrite' })

    await screen.findByText('BaseUrl 1: /overwrite')
  })
})
