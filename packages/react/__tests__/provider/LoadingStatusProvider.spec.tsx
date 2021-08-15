import type { ReactElement, ReactNode } from 'react'
import { screen, render as tlrRender, fireEvent } from '@testing-library/react'
import { ModuleHostElement, MODULE_STATUS } from '@portals/core'

import { HostProvider, useHost } from '../../src/provider/HostProvider'

import {
  LoadingStatusProvider,
  useLoadingStatus,
  useModuleStatus,
  LOADING_STATUS,
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

describe('[provider/LoadingStatusProvider] useLoadingStatus', () => {
  test('should provide initial global loading status through context', () => {
    const Component = () => {
      const { loadingStatus } = useLoadingStatus()
      return <>{loadingStatus}</>
    }

    render(<Component />, { children: [] })

    screen.getByText(LOADING_STATUS.INIT)
  })

  test('should provide updated global loading status through context', async () => {
    const Component = () => {
      const { host } = useHost()
      const { setLoading } = useModuleStatus(host)
      const { loadingStatus } = useLoadingStatus()

      return (
        <>
          STATUS: <span>{loadingStatus}</span>
          <button onClick={() => setLoading()}>setLoading</button>
        </>
      )
    }

    render(<Component />, { children: [] })

    screen.getByText(LOADING_STATUS.INIT)

    fireEvent.click(screen.getByRole('button', { name: 'setLoading' }))

    await screen.findByText(LOADING_STATUS.LOADING)
  })

  test('should provide module loading status through context when called with host', async () => {
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
      const { loadingStatus } = useLoadingStatus(host)

      return (
        <>
          STATUS:{' '}
          <span>
            {name} {loadingStatus}
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

    screen.getByText(`parent ${MODULE_STATUS.REGISTERED}`)
    screen.getByText(`child1 ${MODULE_STATUS.REGISTERED}`)
    screen.getByText(`child2 ${MODULE_STATUS.REGISTERED}`)
  })

  test('should return parent status as loading when a child is in a loading status', async () => {
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
      const { setLoading, setLoaded } = useModuleStatus(host)
      const { loadingStatus } = useLoadingStatus(host)

      return (
        <>
          STATUS:{' '}
          <span>
            {name} {loadingStatus}
          </span>
          <button onClick={() => setLoading()}>{name} setLoading</button>
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

    screen.getByText(`parent ${MODULE_STATUS.REGISTERED}`)
    screen.getByText(`child1 ${MODULE_STATUS.REGISTERED}`)
    screen.getByText(`child2 ${MODULE_STATUS.REGISTERED}`)

    // We need to set the parent to be loaded otherwise it is always considered
    // to be in a dirty state and will therefore use the modules state and not
    // that of its sub-tree since it can not be ready.
    fireEvent.click(screen.getByRole('button', { name: 'parent setLoaded' }))
    fireEvent.click(screen.getByRole('button', { name: 'child1 setLoading' }))

    await screen.findByText(`parent ${MODULE_STATUS.LOADING}`)
    await screen.findByText(`child1 ${MODULE_STATUS.LOADING}`)
    await screen.findByText(`child2 ${MODULE_STATUS.REGISTERED}`)
  })

  test('should return parent status as error when a child is in an error status', async () => {
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
      const { setError, setLoaded } = useModuleStatus(host)
      const { loadingStatus } = useLoadingStatus(host)

      return (
        <>
          STATUS:{' '}
          <span>
            {name} {loadingStatus}
          </span>
          <button onClick={() => setError()}>{name} setError</button>
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

    screen.getByText(`parent ${MODULE_STATUS.REGISTERED}`)
    screen.getByText(`child1 ${MODULE_STATUS.REGISTERED}`)
    screen.getByText(`child2 ${MODULE_STATUS.REGISTERED}`)

    // We need to set the parent to be loaded otherwise it is always considered
    // to be in a dirty state and will therefore use the modules state and not
    // that of its sub-tree since it can not be ready.
    fireEvent.click(screen.getByRole('button', { name: 'parent setLoaded' }))
    fireEvent.click(screen.getByRole('button', { name: 'child1 setError' }))

    await screen.findByText(`parent ${MODULE_STATUS.ERROR}`)
    await screen.findByText(`child1 ${MODULE_STATUS.ERROR}`)
    await screen.findByText(`child2 ${MODULE_STATUS.REGISTERED}`)
  })
})
