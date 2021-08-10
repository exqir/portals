import type { ReactElement } from 'react'
import { screen, render as tlrRender } from '@testing-library/react'
import { ModuleHostElement, MODULE_STATUS } from '@portals/core'

import { createRegistry } from '../../src/internal/registry'
import { HostProvider } from '../../src/provider/HostProvider'
import { LoadingStatusProvider } from '../../src/provider/LoadingStatusProvider'

import { ChildrenProvider, Children, Slot } from '../../src/internal/Children'

beforeAll(() => {
  customElements.define('module-element', ModuleHostElement)
})

const render = (
  element: ReactElement,
  { hosts }: { hosts: ModuleHostElement[] },
) => {
  const host = new ModuleHostElement(new Set())
  const childRegistry = createRegistry()
  hosts.forEach((h) => childRegistry.register(h, createRegistry()))
  const registry = createRegistry()
  registry.register(host, childRegistry)

  const queries = tlrRender(
    <LoadingStatusProvider registry={registry}>
      <HostProvider host={host}>{element}</HostProvider>
    </LoadingStatusProvider>,
  )

  return { host, ...queries }
}

describe('[internal/Children] Children', () => {
  test('should render all children provided via ChildrenProvider', () => {
    const host1 = new ModuleHostElement(new Set())
    const host2 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
      <HostProvider host={host2} key="2">
        <div>Child2</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children />
      </ChildrenProvider>,
      {
        hosts: [host1, host2],
      },
    )

    screen.getByText('Child1')
    screen.getByText('Child2')
  })

  test('should render children when condition is `true`', () => {
    const host1 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children condition={true} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    screen.getByText('Child1')
  })

  test('should not render children when condition is `false`', () => {
    const host1 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children condition={false} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    expect(screen.queryByText('Child1')).toBeNull()
  })

  test('should render children when condition evaluates to `true`', () => {
    const host1 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children condition={() => true} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    screen.getByText('Child1')
  })

  test('should not render children when condition evaluates to `false`', () => {
    const host1 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children condition={() => false} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    expect(screen.queryByText('Child1')).toBeNull()
  })

  test('should set status of childrens host to `HIDDEN` when children are not rendered', () => {
    const host1 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children condition={false} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    expect(host1.getStatus()).toBe(MODULE_STATUS.HIDDEN)
  })

  // TODO: This functionality is not working yet, this only works for Slots right now.
  test.skip('should render fallback when no children are available', () => {
    render(
      <ChildrenProvider content={[]}>
        <Children fallback={<div>Fallback</div>} />
      </ChildrenProvider>,
      {
        hosts: [],
      },
    )

    screen.getByText('Fallback')
  })

  test('should offer a map prop to manipulate the childrens content', () => {
    const host1 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Children
          map={(child) => <div className="added-by-map">{child}</div>}
        />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    const child1 = screen.getByText('Child1')
    expect(child1.parentElement?.className).toBe('added-by-map')
  })
})

describe('[internal/Children] Slot', () => {
  test('should render children matching name provided via ChildrenProvider', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const host2 = new ModuleHostElement(new Set())
    host2.setAttribute('slot', 'b')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
      <HostProvider host={host2} key="2">
        <div>Child2</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <div className="a">
          <Slot name="a" />
        </div>
        <div className="b">
          <Slot name="b" />
        </div>
      </ChildrenProvider>,
      {
        hosts: [host1, host2],
      },
    )

    const slotA = screen.getByText('Child1')
    expect(slotA.parentElement?.className).toBe('a')
    const slotB = screen.getByText('Child2')
    expect(slotB.parentElement?.className).toBe('b')
  })

  test('should render children when condition is `true`', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Slot name="a" condition={true} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    screen.getByText('Child1')
  })

  test('should not render children when condition is `false`', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Slot name="a" condition={false} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    expect(screen.queryByText('Child1')).toBeNull()
  })

  test('should render children when condition evaluates to `true`', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Slot name="a" condition={() => true} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    screen.getByText('Child1')
  })

  test('should not render children when condition evaluates to `false`', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Slot name="a" condition={() => false} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    expect(screen.queryByText('Child1')).toBeNull()
  })

  test('should set status of childrens host to `HIDDEN` when children are not rendered', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Slot name="a" condition={false} />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    expect(host1.getStatus()).toBe(MODULE_STATUS.HIDDEN)
  })

  test('should render fallback when no children are available', () => {
    render(
      <ChildrenProvider content={[]}>
        <Slot name="a" fallback={<div>Fallback</div>} />
      </ChildrenProvider>,
      {
        hosts: [],
      },
    )

    screen.getByText('Fallback')
  })

  test('should offer a map prop to manipulate the childrens content', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <Slot
          name="a"
          map={(child) => <div className="added-by-map">{child}</div>}
        />
      </ChildrenProvider>,
      {
        hosts: [host1],
      },
    )

    const child1 = screen.getByText('Child1')
    expect(child1.parentElement?.className).toBe('added-by-map')
  })
})

describe('[internal/Children]', () => {
  test('should allow Children and Slot component to be used together', () => {
    const host1 = new ModuleHostElement(new Set())
    host1.setAttribute('slot', 'a')
    const host2 = new ModuleHostElement(new Set())
    const content = [
      <HostProvider host={host1} key="1">
        <div>Child1</div>
      </HostProvider>,
      <HostProvider host={host2} key="2">
        <div>Child2</div>
      </HostProvider>,
    ]

    render(
      <ChildrenProvider content={content}>
        <div className="a">
          <Slot name="a" />
        </div>
        <div className="children">
          <Children />
        </div>
      </ChildrenProvider>,
      {
        hosts: [host1, host2],
      },
    )

    const slotA = screen.getByText('Child1')
    expect(slotA.parentElement?.className).toBe('a')
    const children = screen.getByText('Child2')
    expect(children.parentElement?.className).toBe('children')
  })
})
