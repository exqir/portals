import type { Dispatch, SetStateAction, ReactNode } from "react";
import type { Location, History } from "history";
import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useLayoutEffect,
  isValidElement,
  cloneElement,
} from 'react'
import { createBrowserHistory } from 'history'
import { MODULE_STATUS, noop } from "@portals/core"
import {
  useHost,
  useModuleStatus,
  useLoadingStatus,
  Children,
  Host,
} from '@portals/react'

function initHistory() {
  return createBrowserHistory()
}

function getActiveView(location: Location) {
  const { search } = location
  const params = new URLSearchParams(search)
  return params.get('view')
}

function setActiveLocationView(history: History, newView: string) {
  if (newView === getActiveView(history.location)) {
    return newView
  }

  const { search } = history.location
  const params = new URLSearchParams(search)

  params.set('view', newView)
  history.push({ search: `?${params.toString().replace(/%2C/g, ',')}` })

  return newView
}

enum NAVIGATION_STATUS {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

interface IViewContext {
  activeView: string
  nextView: string | null
  setView: Dispatch<SetStateAction<string>>
  onNavigationStatusChange: (status: NAVIGATION_STATUS) => void
}

type ISetViewFunction = (newState: string) => string

const ViewContext = createContext<IViewContext>({
  activeView: '',
  nextView: null,
  setView: noop,
  onNavigationStatusChange: noop,
})

interface IViewState {
  active: string
  next: string | null
}

interface ViewProviderProps {
  children: ReactNode
}

export function ViewProvider({ children }: ViewProviderProps) {
  const [history] = useState(initHistory)
  const [viewState, setViewState] = useState<IViewState>({
    // TODO: Handle null case instead of type cast
    active: getActiveView(history.location) as string,
    next: null,
  })

  const setView = useCallback((view: string | ISetViewFunction): void => {
    setViewState(vs => ({
      active: vs.active,
      next: typeof view === 'function' ? view(vs.active) : view,
    }))
  }, [])

  const onNavigationStatusChange = useCallback(
    (status: NAVIGATION_STATUS) => {
      if (status === NAVIGATION_STATUS.ERROR) {
        setViewState(vs => ({ active: vs.active, next: null }))
      } else {
        if (status === NAVIGATION_STATUS.SUCCESS) {
          // @ts-ignore
          setViewState(vs => {
            // @ts-ignore
            setActiveLocationView(history, vs.next)
            return { active: vs.next, next: null }
          })
        }
      }
    },
    [history, setViewState],
  )

  return (
    <ViewContext.Provider
      value={{
        activeView: viewState.active,
        nextView: viewState.next,
        setView,
        onNavigationStatusChange,
      }}
    >
      {children}
    </ViewContext.Provider>
  )
}

export function useView(name?: string) {
  const {
    activeView,
    nextView,
    setView,
    onNavigationStatusChange,
  } = useContext(ViewContext)

  return {
    isActive: name === activeView,
    isPreloading: name === nextView,
    navigate: setView,
    pendingNavigation: nextView !== null,
    onNavigationStatusChange,
  }
}

function getAttribute(element: Element, attribute: string) {
  return element.attributes.getNamedItem(attribute)?.value
}

export function View() {
  const { host } = useHost()
  const name = getAttribute(host, 'name')
  const { isActive, isPreloading, onNavigationStatusChange } = useView(name)
  const { setHidden, setLoaded } = useModuleStatus(host)
  const { loadingStatus } = useLoadingStatus(host)

  useEffect(() => {
    if (!isActive) {
      // Set the view itself to hidden.
      setHidden()
    }
  }, [isActive, setHidden])

  useLayoutEffect(() => {
    if (isActive) {
      host.style.display = 'block'
    } else {
      host.style.display = 'none'
    }
  }, [isActive, host])

  useEffect(() => {
    console.log('View loading status', { loadingStatus })
    if (isPreloading) {
      // Set View itself to loaded
      setLoaded()
      if (loadingStatus === MODULE_STATUS.ERROR) {
        return onNavigationStatusChange(NAVIGATION_STATUS.ERROR)
      }
      if (loadingStatus === MODULE_STATUS.RENDERED) {
        return onNavigationStatusChange(NAVIGATION_STATUS.SUCCESS)
      }
    }
  }, [isPreloading, loadingStatus, onNavigationStatusChange, setLoaded])

  return (
    <Children
      condition={isActive || isPreloading}
      map={child => {
        if (isValidElement(child)) {
          const { children, ...props } = child.props
          // Wrap the modules children in Host component to render them to the actual
          // host via portal.
          // We can not wrap the whole children into Host because the outer-most ModuleProvider
          // is the HostProvider which is necessary to get the host from context. Because if this
          // the Host component needs to be a child of the HostProvider.
          return cloneElement(child, props, <Host>{children}</Host>)
        }

        return child
      }}
    />
  )
}
