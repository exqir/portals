import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'

import { ModuleHostElement } from '../../src/internal/ModuleHostElement'

import { HostProvider, useHost } from '../../src/provider/HostProvider'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (element: ReactElement) => {
  const host = new ModuleHostElement(new Set())

  const queries = tlrRender(<HostProvider host={host}>{element}</HostProvider>)

  return { host, ...queries }
}

describe('[provider/HostProvider]', () => {
  test('should render its children ', () => {
    const Component = () => {
      return <>Component</>
    }

    render(<Component />)

    screen.getByText('Component')
  })

  test('should provide ModuleHostElement through context', () => {
    const host = new ModuleHostElement(new Set())
    const Component = () => {
      const { host: hostFromContext } = useHost()
      expect(hostFromContext).toBe(host)
      return null
    }

    tlrRender(
      <HostProvider host={host}>
        <Component />
      </HostProvider>,
    )

    expect.assertions(1)
  })

  test('should provide moduleTag of host through context', () => {
    const Component = () => {
      const { moduleTag } = useHost()

      return <>{moduleTag}</>
    }

    const { host } = render(<Component />)

    screen.getByText(host.tagName.toLowerCase())
  })

  test('should provide moduleId of host through context', () => {
    const Component = () => {
      const { moduleId } = useHost()

      return <>{moduleId}</>
    }

    const { host } = render(<Component />)

    screen.getByText(host.moduleId)
  })
})
