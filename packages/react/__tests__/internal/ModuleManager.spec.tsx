import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement, MODULE_STATUS } from '@portals/core'

import type {
  IBootstrapOptions,
  IUseCaseOptions,
} from '../../src/types/definitions'
import { BootstrapOptionsProvider } from '../../src/provider/BootstrapOptionsProvider'
import { HostProvider } from '../../src/provider/HostProvider'
import { LoadingStatusProvider } from '../../src/provider/LoadingStatusProvider'

import { ModuleManager } from '../../src/internal/ModuleManager'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (
  element: ReactElement,
  options?: Partial<IBootstrapOptions & IUseCaseOptions>,
) => {
  const host = new ModuleHostElement()
  const tree = {
    element: null,
    children: [{ element: host, children: [] }],
  }

  const queries = tlrRender(
    <BootstrapOptionsProvider
      options={{
        baseUrl: './',
        Loading: () => <></>,
        Error: () => <></>,
        ...options,
      }}
    >
      <LoadingStatusProvider modulesTree={tree}>
        <HostProvider host={host}>{element}</HostProvider>
      </LoadingStatusProvider>
    </BootstrapOptionsProvider>,
  )

  return { host, ...queries }
}

describe('[internal/ModuleManager]', () => {
  test('should render the loading component when useInit returns loading', () => {
    const Module = () => <>Module</>
    const useInit = () => ({ data: null, loading: true, error: undefined })

    render(<ModuleManager module={Module} useInit={useInit} />, {
      Loading: () => <>Loading</>,
    })

    screen.getByText('Loading')
  })

  // Status is not set on the module element right now
  test.skip('should set status of the host to `LOADING` when useInit returns loading', () => {
    const Module = () => <>Module</>
    const useInit = () => ({ data: null, loading: true, error: undefined })

    const { host } = render(<ModuleManager module={Module} useInit={useInit} />)

    expect(host.getStatus()).toBe(MODULE_STATUS.LOADING)
  })

  test('should render the error component when useInit returns an error', () => {
    const Module = () => <>Module</>
    const error = new Error()
    const useInit = () => ({ data: null, loading: false, error })

    render(<ModuleManager module={Module} useInit={useInit} />, {
      Error: () => <>Error</>,
    })

    screen.getByText('Error')
  })

  // Status is not set on the module element right now
  test.skip('should set status of the host to `ERROR` when useInit returns an error', () => {
    const Module = () => <>Module</>
    const error = new Error()
    const useInit = () => ({ data: null, loading: false, error })

    const { host } = render(<ModuleManager module={Module} useInit={useInit} />)

    expect(host.getStatus()).toBe(MODULE_STATUS.ERROR)
  })

  test('should render the provided module when useInit retuns neither loading nor error`', () => {
    const Module = () => <>Module</>
    const useInit = () => ({ data: null, loading: false, error: undefined })

    render(<ModuleManager module={Module} useInit={useInit} />)

    screen.getByText('Module')
  })

  // Status is not set on the module element right now
  test.skip('should set status of the host to `RENDERED` when useInit retuns neither loading nor error`', () => {
    const Module = () => <>Module</>
    const useInit = () => ({ data: null, loading: false, error: undefined })

    const { host } = render(<ModuleManager module={Module} useInit={useInit} />)

    expect(host.getStatus()).toBe(MODULE_STATUS.RENDERED)
  })

  test('should pass data returned by useInit to module as data prop', () => {
    const Module = ({ data }: { data: string }) => <>{data}</>
    const useInit = () => ({
      data: 'data value',
      loading: false,
      error: undefined,
    })

    render(<ModuleManager module={Module} useInit={useInit} />)

    screen.getByText('data value')
  })

  test('should pass additional props to module', () => {
    const Module = ({
      additionalProp,
    }: {
      data: null
      additionalProp?: string
    }) => <>{additionalProp}</>
    const useInit = () => ({ data: null, loading: false, error: undefined })

    render(
      <ModuleManager
        additionalProp="additional value"
        module={Module}
        useInit={useInit}
      />,
    )

    screen.getByText('additional value')
  })
})
