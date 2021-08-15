import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement } from '@portals/core'

import { HostProvider } from '../../src/provider/HostProvider'

import { Host } from '../../src/internal/Host'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (element: ReactElement) => {
  const host = new ModuleHostElement()

  document.body.appendChild(host)
  const queries = tlrRender(<HostProvider host={host}>{element}</HostProvider>)

  return {
    host,
    ...queries,
    cleanup: () => {
      document.body.removeChild(host)
    },
  }
}

describe('[internal/Host]', () => {
  test('should render children into host', () => {
    const Module = () => <div data-testid="module">Module</div>

    const { host, cleanup } = render(
      <Host>
        <Module />
      </Host>,
    )

    const module = screen.getByTestId('module')
    expect(module.parentElement).toBe(host)

    cleanup()
  })
})
