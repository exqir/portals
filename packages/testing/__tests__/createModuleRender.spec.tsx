import { screen } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'
import {
  createModule,
  createContext,
  useBootstrapOptions,
  IProvider,
  IOnInitHook,
} from '@portals/react'

import { createModuleRender } from '../src/render'

const tag = 'module-element'

describe('[createModuleRender] setup', () => {
  const ModuleComponent = () => {
    const { options } = useBootstrapOptions()
    return <div data-testid="component">BaseUrl: {options.baseUrl}</div>
  }
  const module = createModule({
    moduleTag: tag,
    component: () => Promise.resolve({ default: ModuleComponent }),
  })

  const render = createModuleRender({
    module,
    defaultBootstrapOptions: { baseUrl: '/default' },
  })

  test('should add host element to the DOM', () => {
    render()

    const element = document.querySelector(tag)

    expect(element).toBeInstanceOf(ModuleHostElement)
  })

  test('should remove host elements between tests', () => {
    const element = document.querySelector(tag)

    expect(element).toBeNull()
  })
})

describe('[createModuleRender] module', () => {
  const ModuleComponent = () => {
    const { options } = useBootstrapOptions()
    return <div data-testid="component">BaseUrl: {options.baseUrl}</div>
  }
  const module = createModule({
    moduleTag: tag,
    component: () => Promise.resolve({ default: ModuleComponent }),
  })

  const render = createModuleRender({
    module,
    defaultBootstrapOptions: { baseUrl: '/default' },
  })

  test('should render provided module', async () => {
    render()

    const component = await screen.findByTestId('component')
    expect(component).toBeInstanceOf(HTMLDivElement)
  })

  test('should set default bootstrap options', async () => {
    render()

    await screen.findByText('BaseUrl: /default')
  })

  test('should allow to overwrite default bootstrap options', async () => {
    render({ baseUrl: '/overwrite' })

    await screen.findByText('BaseUrl: /overwrite')
  })
})

describe('[createModuleRender] module with data', () => {
  const useInit: IOnInitHook<string> = () => ({
    error: undefined,
    loading: false,
    data: 'init',
  })
  const ModuleComponent = ({ data }: { data: string }) => {
    return <div>Data: {data}</div>
  }
  const module = createModule({
    moduleTag: tag,
    component: () => Promise.resolve({ default: ModuleComponent }),
    useInit: () => Promise.resolve(useInit),
  })

  const render = createModuleRender({
    // @ts-expect-error Need to fix the Types to that the generics are passed on.
    module,
    defaultBootstrapOptions: { baseUrl: '/' },
  })

  test('should render provided module with data from init hook', async () => {
    render()

    await screen.findByText('Data: init')
  })
})

describe('[createModuleRender] with Providers', () => {
  const [_AppProvider, useApp] = createContext<{ provider: string }>('App')
  const [_ModuleProvider, useModule] =
    createContext<{ provider: string }>('Module')
  const AppProvider: IProvider = ({ children }) => (
    <_AppProvider provider="App">{children}</_AppProvider>
  )
  const ModuleProvider: IProvider = ({ children }) => (
    <_ModuleProvider provider="Module">{children}</_ModuleProvider>
  )

  const ModuleComponent = () => {
    const appData = useApp()
    const moduleData = useModule()
    return (
      <>
        <div>Provider: {appData.provider}</div>
        <div>Provider: {moduleData.provider}</div>
      </>
    )
  }
  const module = createModule({
    moduleTag: tag,
    component: () => Promise.resolve({ default: ModuleComponent }),
  })

  const render = createModuleRender({
    module,
    defaultAppProvider: AppProvider,
    defaultModuleProvider: ModuleProvider,
    defaultBootstrapOptions: { baseUrl: '/' },
  })

  test('should render default providers', async () => {
    render()

    await screen.findByText('Provider: App')
    await screen.findByText('Provider: Module')
  })

  test('should allow to overwrite default providers', async () => {
    const AppOverwrite: IProvider = ({ children }) => (
      <_AppProvider provider="AppOverwrite">{children}</_AppProvider>
    )
    const ModuleOverwrite: IProvider = ({ children }) => (
      <_ModuleProvider provider="ModuleOverwrite">{children}</_ModuleProvider>
    )
    render({ AppProvider: AppOverwrite, ModuleProvider: ModuleOverwrite })

    await screen.findByText('Provider: AppOverwrite')
    await screen.findByText('Provider: ModuleOverwrite')
  })
})
