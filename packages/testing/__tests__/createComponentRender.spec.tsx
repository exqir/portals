import { screen } from '@testing-library/react'
import { createContext, useBootstrapOptions, IProvider } from '@portals/react'

import { createComponentRender } from '../src/createComponentRender'

describe('[createComponentRender] module', () => {
  const ModuleComponent = () => {
    const { options } = useBootstrapOptions()
    return <div data-testid="component">BaseUrl: {options.baseUrl}</div>
  }

  const render = createComponentRender({
    defaultBootstrapOptions: { baseUrl: '/default' },
  })

  test('should render provided module', async () => {
    render(<ModuleComponent />)

    const component = await screen.findByTestId('component')
    expect(component).toBeInstanceOf(HTMLDivElement)
  })

  test('should set default bootstrap options', async () => {
    render(<ModuleComponent />)

    await screen.findByText('BaseUrl: /default')
  })

  test('should allow to overwrite default bootstrap options', async () => {
    render(<ModuleComponent />, { baseUrl: '/overwrite' })

    await screen.findByText('BaseUrl: /overwrite')
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

  const render = createComponentRender({
    defaultAppProvider: AppProvider,
    defaultModuleProvider: ModuleProvider,
    defaultBootstrapOptions: { baseUrl: '/default' },
  })

  test('should render default providers', async () => {
    render(<ModuleComponent />)

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
    render(<ModuleComponent />, {
      AppProvider: AppOverwrite,
      ModuleProvider: ModuleOverwrite,
    })

    await screen.findByText('Provider: AppOverwrite')
    await screen.findByText('Provider: ModuleOverwrite')
  })
})
