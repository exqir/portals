import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'

import { UsecaseOptionsProvider } from '../../src/provider/OptionProviders'
import { HostProvider } from '../../src/provider/HostProvider'
import { LoadingStatusProvider } from '../../src/provider/LoadingStatusProvider'

import { createLoadableComponent } from '../../src/internal/createLoadableComponent'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (element: ReactElement) => {
  const host = new ModuleHostElement()
  const tree = {
    element: null,
    children: [{ element: host, children: [] }],
  }

  const queries = tlrRender(
    <UsecaseOptionsProvider Loading={() => <></>} Error={() => <></>}>
      <HostProvider host={host}>
        <LoadingStatusProvider modulesTree={tree}>
          <Suspense fallback={'Suspense'}>{element}</Suspense>
        </LoadingStatusProvider>
      </HostProvider>
    </UsecaseOptionsProvider>,
  )

  return { host, ...queries }
}

describe('[internal/createLoadableComponent]', () => {
  test('should return a Suspense-ready component', async () => {
    const Component = () => Promise.resolve({ default: () => <>Component</> })
    const LoadableComponent = createLoadableComponent({ component: Component })

    render(<LoadableComponent />)

    screen.getByText('Suspense')
    await screen.findByText('Component')
  })

  test('should return a Suspense-ready component receiving the data returned by the provided useInit hook', async () => {
    const Component = () =>
      Promise.resolve({
        default: ({ data }: { data: string }) => <>Component: {data}</>,
      })
    const useInit = () =>
      Promise.resolve(() => ({
        data: 'data',
        loading: false,
        error: undefined,
      }))
    const LoadableComponent = createLoadableComponent({
      component: Component,
      useInit,
    })

    render(<LoadableComponent />)

    screen.getByText('Suspense')
    await screen.findByText('Component: data')
  })

  test('should return a Suspense-ready component passing on additional props', async () => {
    const Component = () =>
      Promise.resolve({
        default: ({ additionalProp }: { additionalProp: string }) => (
          <>Component: {additionalProp}</>
        ),
      })
    const LoadableComponent = createLoadableComponent({
      component: Component,
    })

    render(<LoadableComponent additionalProp="additional value" />)

    screen.getByText('Suspense')
    await screen.findByText('Component: additional value')
  })

  test('should return a Suspense-ready component passing on additional props and data from useInit', async () => {
    const Component = () =>
      Promise.resolve({
        default: ({
          data,
          additionalProp,
        }: {
          data: string
          additionalProp: string
        }) => (
          <>
            Component: {data} and {additionalProp}
          </>
        ),
      })
    const useInit = () =>
      Promise.resolve(() => ({
        data: 'data',
        loading: false,
        error: undefined,
      }))

    const LoadableComponent = createLoadableComponent({
      component: Component,
      useInit,
    })

    render(<LoadableComponent additionalProp="additional value" />)

    screen.getByText('Suspense')
    await screen.findByText('Component: data and additional value')
  })
})
