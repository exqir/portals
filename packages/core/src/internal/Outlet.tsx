import { ReactNode } from 'react'
import React, {
  Fragment,
  useState,
  createContext,
  useContext,
  useEffect,
  Children,
  isValidElement,
  useMemo,
} from 'react'

import { useHost } from '../provider/HostProvider'
import { isUndefined, isModuleHostElement } from './utils'

interface IOutletHostContext {
  outlet: HTMLDivElement | null
}

const OutletHostContext = createContext<IOutletHostContext>({ outlet: null })

interface IOutletProps {
  slot?: string
}

export function Outlet({ slot }: IOutletProps) {
  const { moduleId } = useHost()
  const { children } = useOutletContent(slot)
  console.log(children)
  const [outlet, setOutlet] = useState(null)

  return (
    <Fragment>
      <OutletHostContext.Provider value={{ outlet }}>
        {children}
      </OutletHostContext.Provider>
      {/* @ts-ignore */}
      <div ref={setOutlet} data-module-outlet-owner={moduleId} />
    </Fragment>
  )
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

interface IOutletContentContext {
  content: ReactNode
  [name: string]: ReactNode
}

const OutletContentContext = createContext<IOutletContentContext>({
  content: null,
})

interface IOutletContentProps {
  content: ReactNode
  children: ReactNode
}

function getAttribute(element: Element, attribute: string) {
  return element.attributes.getNamedItem(attribute)?.value
}

// TODO: Make this a "ChildrenProvider" and don't pass the children to a Module
// anymore and instead use the context?
export function OutletProvider({ content, children }: IOutletContentProps) {
  const ctx = useMemo(() => {
    const c: { content: ReactNode[]; [slot: string]: ReactNode } = {
      content: [],
    }
    Children.forEach(content, child => {
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
    <OutletContentContext.Provider value={ctx}>
      {children}
    </OutletContentContext.Provider>
  )
}

function useOutletContent(slot?: string) {
  const context = useContext(OutletContentContext)

  if (!isUndefined(slot)) {
    const { [slot]: content } = context

    return { children: content }
  }

  return { children: context.content }
}
