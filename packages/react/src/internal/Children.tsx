import { ReactNode } from 'react'
import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  Children as ReactChildren,
  isValidElement,
  useMemo,
} from 'react'
import {
  isUndefined,
  isFunction,
  isModuleHostElement,
  getAttribute,
} from '@portals/core'

import { useHost } from '../provider/HostProvider'
import { useModuleStatus } from '../provider/LoadingStatusProvider'

type Condition = boolean | (() => boolean)

interface ISlotProps extends IChildrenProps {
  name: string
}

type IChildrenProps = Omit<IChildrenImplementationProps, 'name'>

interface IChildrenImplementationProps {
  name?: string
  condition?: Condition
  fallback?: ReactNode
  map?: (child: ReactNode, index: number) => ReactNode
}

function ChildrenImplementation({
  name,
  condition,
  fallback = null,
  map,
}: IChildrenImplementationProps) {
  const { children } = useChildren(name)
  const c = isFunction(map) ? ReactChildren.map(children, map) : children
  const shouldRender = useCondition(condition, name)

  return (
    <Fragment>
      {shouldRender ? (isUndefined(children) ? fallback : c) : null}
    </Fragment>
  )
}

export const Slot: (props: ISlotProps) => JSX.Element = ChildrenImplementation
export const Children: (props: IChildrenProps) => JSX.Element =
  ChildrenImplementation

function useCondition(condition?: Condition, name?: string) {
  // TODO: Is hosy really needed here?
  // It is only used for useModuleStatus but the calls to
  // setHidden set the host explizitly for each call.
  const { host } = useHost()
  const { children } = useChildren(name)
  const { setHidden, setVisibile } = useModuleStatus(host)

  const shouldRender = isUndefined(condition)
    ? true
    : isFunction(condition)
    ? condition()
    : condition

  useEffect(() => {
    if (!shouldRender) {
      ReactChildren.forEach(children, (child) => {
        if (isValidElement(child) && isModuleHostElement(child.props.host)) {
          setHidden(child.props.host)
        }
      })
    } else {
      ReactChildren.forEach(children, (child) => {
        if (isValidElement(child) && isModuleHostElement(child.props.host)) {
          setVisibile(child.props.host)
        }
      })
    }
  }, [shouldRender, children, setHidden])

  return shouldRender
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

export function ChildrenProvider({
  content,
  children,
}: IChildrenProviderProps) {
  const ctx = useMemo(() => {
    const c: { content: ReactNode[]; [slot: string]: ReactNode } = {
      content: [],
    }
    ReactChildren.forEach(content, (child) => {
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
