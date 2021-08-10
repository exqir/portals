import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'

import type {
  IBootstrapOptions,
  IUseCaseOptions,
} from '../../src/types/definitions'
import { createRegistry } from '../../src/internal/registry'

import {
  RegistryProvider,
  useRegistry,
} from '../../src/provider/RegistryProvider'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (element: ReactElement) => {
  const host = new ModuleHostElement(new Set())
  const registry = createRegistry()
  registry.register(host, createRegistry())

  const queries = tlrRender(
    <RegistryProvider registry={registry}>{element}</RegistryProvider>,
  )

  return { host, ...queries }
}

describe('[provider/RegistryProvider]', () => {
  test('should render its children ', () => {
    const Component = () => {
      return <>Component</>
    }

    render(<Component />)

    screen.getByText('Component')
  })

  test('should provide registry through context', () => {
    const Component = () => {
      const { registry } = useRegistry()

      return <>{registry.getElements()[0].moduleId}</>
    }

    const { host } = render(<Component />)

    screen.getByText(host.moduleId)
  })
})
