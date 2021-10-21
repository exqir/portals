import type { ReactElement, ReactNode } from 'react'
import { screen, render as tlrRender, fireEvent } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'

import { HostProvider, useHost } from '../../src/provider/HostProvider'

import {
  LoadingStatusProvider,
  useGlobalLoadingStatus,
  useChildrenLoadingStatus,
  useModuleStatus,
} from '../../src/provider/LoadingStatusProvider'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (
  element: ReactElement,
  { children }: { children: ModuleHostElement[] },
) => {
  const host = new ModuleHostElement()
  const tree = {
    element: null,
    children: [
      {
        element: host,
        children: children.map((element) => ({ element, children: [] })),
      },
    ],
  }

  const queries = tlrRender(
    <LoadingStatusProvider modulesTree={tree}>
      <HostProvider host={host}>{element}</HostProvider>
    </LoadingStatusProvider>,
  )

  return { host, ...queries }
}

describe('[provider/LoadingStatusProvider] LoadingStatusProvider', () => {
  test('should render its children ', () => {
    const Component = () => {
      return <>Component</>
    }

    render(<Component />, { children: [] })

    screen.getByText('Component')
  })
})

describe('[provider/LoadingStatusProvider] useGlobalLoadingStatus', () => {
  test('should provide initial global loading status through context', () => {
    const Component = () => {
      const { isLoading } = useGlobalLoadingStatus()
      return <>loading: {JSON.stringify(isLoading)}</>
    }

    render(<Component />, { children: [] })

    screen.getByText('loading: true')
  })

  test('should provide updated global loading status through context', async () => {
    const Component = () => {
      const { host } = useHost()
      const { setLoaded } = useModuleStatus(host)
      const { isLoading } = useGlobalLoadingStatus()

      return (
        <>
          loading: {JSON.stringify(isLoading)}
          <button onClick={() => setLoaded()}>setLoaded</button>
        </>
      )
    }

    render(<Component />, { children: [] })

    screen.getByText('loading: true')

    fireEvent.click(screen.getByRole('button', { name: 'setLoaded' }))

    await screen.findByText('loading: false')
  })
})

describe('[provider/LoadingStatusProvider] useChildrenLoadingStatus', () => {
  test('should provide loading status of children through context when called with host', async () => {
    const child1 = new ModuleHostElement()
    const child2 = new ModuleHostElement()
    const Component = ({
      name,
      children,
    }: {
      name: string
      children?: ReactNode
    }) => {
      const { host } = useHost()
      const { isLoading } = useChildrenLoadingStatus(host)

      return (
        <>
          STATUS:{' '}
          <span>
            {name} children loading: {JSON.stringify(isLoading)}
          </span>
          {children}
        </>
      )
    }

    render(
      <Component name="parent">
        <HostProvider host={child1}>
          <Component name="child1" />
        </HostProvider>
        <HostProvider host={child2}>
          <Component name="child2" />
        </HostProvider>
      </Component>,
      { children: [child1, child2] },
    )

    screen.getByText('parent children loading: true')
    screen.getByText('child1 children loading: false')
    screen.getByText('child1 children loading: false')
  })

  test('should consider children as loading until all children have finished loading', async () => {
    const child1 = new ModuleHostElement()
    const child2 = new ModuleHostElement()
    const Component = ({
      name,
      children,
    }: {
      name: string
      children?: ReactNode
    }) => {
      const { host } = useHost()
      const { setLoaded } = useModuleStatus(host)
      const { isLoading } = useChildrenLoadingStatus(host)

      return (
        <>
          STATUS:{' '}
          <span>
            {name} children loading: {JSON.stringify(isLoading)}
          </span>
          <button onClick={() => setLoaded()}>{name} setLoaded</button>
          {children}
        </>
      )
    }

    render(
      <Component name="parent">
        <HostProvider host={child1}>
          <Component name="child1" />
        </HostProvider>
        <HostProvider host={child2}>
          <Component name="child2" />
        </HostProvider>
      </Component>,
      { children: [child1, child2] },
    )

    screen.getByText('parent children loading: true')
    screen.getByText('child1 children loading: false')
    screen.getByText('child2 children loading: false')

    fireEvent.click(screen.getByRole('button', { name: 'child1 setLoaded' }))
    await screen.findByText('parent children loading: true')

    fireEvent.click(screen.getByRole('button', { name: 'child2 setLoaded' }))
    await screen.findByText('parent children loading: false')
  })

  test('should consider children as having an error when at least one child has an error', async () => {
    const child1 = new ModuleHostElement()
    const child2 = new ModuleHostElement()
    const Component = ({
      name,
      children,
    }: {
      name: string
      children?: ReactNode
    }) => {
      const { host } = useHost()
      const { setError } = useModuleStatus(host)
      const { isLoading, hasError } = useChildrenLoadingStatus(host)

      return (
        <>
          STATUS:{' '}
          <span>
            {name} children loading: {JSON.stringify(isLoading)}
          </span>
          <span>
            {name} children error: {JSON.stringify(hasError)}
          </span>
          <button onClick={() => setError()}>{name} setError</button>
          {children}
        </>
      )
    }

    render(
      <Component name="parent">
        <HostProvider host={child1}>
          <Component name="child1" />
        </HostProvider>
        <HostProvider host={child2}>
          <Component name="child2" />
        </HostProvider>
      </Component>,
      { children: [child1, child2] },
    )

    screen.getByText('parent children loading: true')
    screen.getByText('parent children error: false')

    fireEvent.click(screen.getByRole('button', { name: 'child1 setError' }))
    await screen.findByText('parent children loading: false')
    await screen.findByText('parent children error: true')
  })
})
