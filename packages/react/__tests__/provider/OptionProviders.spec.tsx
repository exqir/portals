import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'

import type {
  IRuntimeOptions,
  IUseCaseOptions,
} from '../../src/types/definitions'
import { NoopComponent } from '../../src/internal/utils'

import {
  RuntimeOptionsProvider,
  useRuntimeOptions,
  UsecaseOptionsProvider,
  useUsecaseOptions,
} from '../../src/provider/OptionProviders'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

describe('[provider/RuntimeOptionsProvider]', () => {
  const render = (
    element: ReactElement,
    options?: Partial<IRuntimeOptions>,
  ) => {
    const queries = tlrRender(
      <RuntimeOptionsProvider baseUrl="./" {...options}>
        {element}
      </RuntimeOptionsProvider>,
    )

    return queries
  }

  test('should render its children ', () => {
    const Component = () => {
      return <>Component</>
    }

    render(<Component />)

    screen.getByText('Component')
  })

  test('should provide options through context', () => {
    const Component = () => {
      const { baseUrl } = useRuntimeOptions()

      return <>{baseUrl}</>
    }

    render(<Component />, { baseUrl: '/test' })

    screen.getByText('/test')
  })
})

describe('[provider/UsecaseOptionsProvider]', () => {
  const render = (
    element: ReactElement,
    options?: Partial<IUseCaseOptions>,
  ) => {
    const queries = tlrRender(
      <UsecaseOptionsProvider
        Loading={NoopComponent}
        Error={NoopComponent}
        {...options}
      >
        {element}
      </UsecaseOptionsProvider>,
    )

    return queries
  }

  test('should render its children ', () => {
    const Component = () => {
      return <>Component</>
    }

    render(<Component />)

    screen.getByText('Component')
  })

  test('should provide options through context', () => {
    const Component = () => {
      const { Loading } = useUsecaseOptions()

      return <Loading />
    }

    render(<Component />, { Loading: () => <>Loading</> })

    screen.getByText('Loading')
  })
})
