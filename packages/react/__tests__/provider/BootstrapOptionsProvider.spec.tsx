import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'

import type {
  IBootstrapOptions,
  IUseCaseOptions,
} from '../../src/types/definitions'
import { ModuleHostElement } from '../../src/internal/ModuleHostElement'

import {
  BootstrapOptionsProvider,
  useBootstrapOptions,
} from '../../src/provider/BootstrapOptionsProvider'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (
  element: ReactElement,
  options?: Partial<IBootstrapOptions & IUseCaseOptions>,
) => {
  const queries = tlrRender(
    <BootstrapOptionsProvider
      options={{
        baseUrl: './',
        Loading: () => <></>,
        Error: () => <></>,
        ...options,
      }}
    >
      {element}
    </BootstrapOptionsProvider>,
  )

  return queries
}

describe('[provider/BootstrapOptionsProvider]', () => {
  test('should render its children ', () => {
    const Component = () => {
      return <>Component</>
    }

    render(<Component />)

    screen.getByText('Component')
  })

  test('should provide options through context', () => {
    const Component = () => {
      const { options } = useBootstrapOptions()

      return <>{options.baseUrl}</>
    }

    render(<Component />, { baseUrl: '/test' })

    screen.getByText('/test')
  })
})
