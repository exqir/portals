import type { Dispatch, SetStateAction, ReactNode } from "react";
import type { Location, History } from "history";
import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import { createBrowserHistory } from 'history'
import {
  useRegistry,
  useHost,
  useModuleStatus,
  useLoadingStatus,
  MODULE_STATUS,
} from '@portals/core'

// Should we move core utils to its own package so that they can be shared?
function noop() {}

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

interface ViewProps {
  children: ReactNode
}

function getAttribute(element: Element, attribute: string) {
  return element.attributes.getNamedItem(attribute)?.value
}

export function View({ children }: ViewProps) {
  const { host } = useHost()
  const { registry } = useRegistry()
  const name = getAttribute(host, 'name')
  const { isActive, isPreloading, onNavigationStatusChange } = useView(name)
  const { setHidden, setLoaded } = useModuleStatus(host)
  const { loadingStatus } = useLoadingStatus(host)

  useEffect(() => {
    if (!isActive) {
      // Set the view itself to hidden.
      setHidden();
      registry.getElements().forEach(e => {
        setHidden(e)
      })
    }
  }, [isActive, setHidden, registry])

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

  return isActive || isPreloading ? (
    <div style={isPreloading ? { display: 'none', visibility: 'hidden' } : {}}>
      {children}
    </div>
  ) : null
}
