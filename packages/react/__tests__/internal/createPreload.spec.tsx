import { ReactElement, Suspense } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'

import { createPreload } from '../../src/internal/createPreload'

const render = (element: ReactElement) => {
  const queries = tlrRender(<Suspense fallback="Suspense">{element}</Suspense>)

  return queries
}

describe('[internal/createPreload]', () => {
  test('should return a preload suspending until data is ready', async () => {
    const preload = createPreload(() => Promise.resolve('data'))
    const Module = () => {
      const data = preload.read()
      return <>Preload: {data}</>
    }

    render(<Module />)

    screen.getByText('Suspense')
    await screen.findByText('Preload: data')
  })

  test('should return preload that can be preloaded not suspending when data is ready before the read', async () => {
    const preload = createPreload(() => Promise.resolve('data'))
    const Module = () => {
      const data = preload.read()
      return <>Preload: {data}</>
    }

    preload.preload()
    // Waiting a tick to give the promise of the preload time to resolve before the render
    await Promise.resolve()
    render(<Module />)

    screen.getByText('Preload: data')
  })
})
