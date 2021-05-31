import { ReactNode } from 'react'
import React, {
  Fragment,
  useState,
  createContext,
  useContext,
  useEffect,
  Children as ReactChildren,
  isValidElement,
  useMemo,
} from 'react'

import { useHost } from '../provider/HostProvider'
import { useModuleStatus } from '../provider/LoadingStatusProvider'
import { isUndefined, isModuleHostElement, isFunction } from './utils'

interface IOutletHostContext {
  outlet: HTMLDivElement | null
}

const OutletHostContext = createContext<IOutletHostContext>({ outlet: null })

type Condition = boolean | (() => boolean)
interface IOutletProps {
  slot: string
  condition?: Condition
  fallback?: ReactNode
}

export function Outlet({ slot, condition, fallback = null }: IOutletProps) {
  const { moduleId } = useHost()
  const { children } = useChildren(slot)
  const [outlet, setOutlet] = useState(null)
  const shouldRender = useCondition(condition)

  return (
    <Fragment>
      <OutletHostContext.Provider value={{ outlet }}>
        {shouldRender && !isUndefined(children) ? children : null}
      </OutletHostContext.Provider>
      <div
        // @ts-ignore
        ref={setOutlet}
        data-module-outlet-owner={moduleId}
        data-module-outlet-slot={slot}
      >
        {shouldRender && isUndefined(children) ? fallback : null}
      </div>
    </Fragment>
  )
}

interface IChildrenProps {
  condition?: Condition
  fallback?: ReactNode
  map?: (child: ReactNode, index: number) => ReactNode
}

export function Children({ condition, fallback = null, map }: IChildrenProps) {
  const { children } = useChildren()
  const c = isFunction(map) ? ReactChildren.map(children, map) : children
  const shouldRender = useCondition(condition)

  return (
    <Fragment>
      {shouldRender ? (isUndefined(children) ? fallback : c) : null}
    </Fragment>
  )
}

function useCondition(condition?: Condition) {
  const { host } = useHost()
  const { children } = useChildren()
  const { setHidden } = useModuleStatus(host)

  const shouldRender = isUndefined(condition)
    ? true
    : isFunction(condition)
    ? condition()
    : condition

  useEffect(() => {
    if (!shouldRender) {
      ReactChildren.forEach(children, child => {
        if (isValidElement(child) && isModuleHostElement(child.props.host)) {
          setHidden(child.props.host)
        }
      })
    }
  }, [shouldRender, children, setHidden])

  return shouldRender
}

export function useOutlet() {
  const { host } = useHost()
  const { outlet } = useContext(OutletHostContext)

  useEffect(() => {
    if (outlet) {
      // Hide the original host as the content will not be rendered into it,
      // it only serves to define what should be rendered inside the outlet.
      host.hide()
      // Handle the case when there are more then one module being rendered inside the outlet.
      outlet.setAttribute('data-module-outlet-content', host.moduleId)
    }
  }, [outlet])

  return { outlet }
}

interface IChildrenContext {
  content: ReactNode
  [name: string]: ReactNode
}

const ChildrenContext = createContext<IChildrenContext>({
  content: null,
})

interface IChildrenProviderProps {
  content: ReactNode
  children: ReactNode
}

function getAttribute(element: Element, attribute: string) {
  return element.attributes.getNamedItem(attribute)?.value
}

export function ChildrenProvider({
  content,
  children,
}: IChildrenProviderProps) {
  const ctx = useMemo(() => {
    const c: { content: ReactNode[]; [slot: string]: ReactNode } = {
      content: [],
    }
    ReactChildren.forEach(content, child => {
      if (isValidElement(child) && isModuleHostElement(child.props.host)) {
        const host = child.props.host
        const slotName = getAttribute(host, 'slot')
        if (slotName) {
          c[slotName] = child
          return
        }
      }
      c.content.push(child)
    })
    return c
  }, [content])

  return (
    <ChildrenContext.Provider value={ctx}>{children}</ChildrenContext.Provider>
  )
}

function useChildren(slot?: string) {
  const context = useContext(ChildrenContext)

  if (!isUndefined(slot)) {
    const { [slot]: content } = context

    return { children: content }
  }

  return { children: context.content }
}
