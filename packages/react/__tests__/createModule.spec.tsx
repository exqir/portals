import type { ReactElement } from 'react'
import { Suspense } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'

import { BootstrapOptionsProvider } from '../src/provider/BootstrapOptionsProvider'
import { HostProvider } from '../src/provider/HostProvider'
import { LoadingStatusProvider } from '../src/provider/LoadingStatusProvider'

import { createModule } from '../src/createModule'

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
    <BootstrapOptionsProvider
      options={{
        baseUrl: './',
        Loading: () => <></>,
        Error: () => <></>,
      }}
    >
      <HostProvider host={host}>
        <LoadingStatusProvider modulesTree={tree}>
          <Suspense fallback={'Suspense'}>{element}</Suspense>
        </LoadingStatusProvider>
      </HostProvider>
    </BootstrapOptionsProvider>,
  )

  return { host, ...queries }
}

describe('[createModule]', () => {
  test('should return a tuple of tag and LoadableComponent for a module', async () => {
    const Component = () => Promise.resolve({ default: () => <>Component</> })

    const [moduleTag, LoadableComponent] = createModule({
      moduleTag: 'module-element',
      component: Component,
    })
    render(<LoadableComponent />)

    expect(moduleTag).toBe('module-element')
    screen.getByText('Suspense')
    await screen.findByText('Component')
  })

  test('should return a tuple of tag and LoadableComponent for a module with init data', async () => {
    const Component = () =>
      Promise.resolve({
        default: ({ data }: { data: string }) => <>Component</>,
      })
    const useInit = () =>
      Promise.resolve(() => ({
        data: 'data',
        loading: false,
        error: undefined,
      }))

    const [moduleTag, LoadableComponent] = createModule({
      moduleTag: 'module-element',
      component: Component,
      useInit,
    })
    render(<LoadableComponent />)

    expect(moduleTag).toBe('module-element')
    screen.getByText('Suspense')
    await screen.findByText('Component')
  })
})
