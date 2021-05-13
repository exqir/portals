import { ReactNode, Dispatch, useCallback } from 'react'
import React, { useReducer, createContext, useContext, useEffect, Suspense } from 'react'

import type { IRegistry } from '../types/definitions'
import type { ModuleHostElement } from '../internal/ModuleHostElement'
import { noop } from '../internal/utils'

export enum STATUS {
  INIT = 'INIT',
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

enum ACTIONS {
  CHILD_LOADING = 'CHILD_LOADING',
  CHILD_LOADED = 'CHILD_LOADED',
  CHILD_ERRORED = 'CHILD_ERRORED',
}

interface ILoadingState {
  status: STATUS
  watching: { module: ModuleHostElement; status: STATUS }[]
}

type ILoadingAction = {
  type: ACTIONS
  payload: { module: ModuleHostElement; status: STATUS }
} | { type: 'FINISHED_RENDERING',
}

function getModuleStatus(element: ModuleHostElement) {
  return element.attributes.getNamedItem('data-module-status')?.value
}

function getAllElements(registry: IRegistry): ModuleHostElement[] {
  const elements: ModuleHostElement[] = []

  registry.getElements().forEach(element => {
    elements.push(element)
    const childrenRegistry = registry.getRegistry(element)
    if (childrenRegistry?.getElements().length) {
      getAllElements(childrenRegistry).forEach(e => {
        elements.push(e);
      })
    }
  })
  console.log(elements)
  return elements
}

function initState(registry: IRegistry) {
  return {
    status: STATUS.INIT,
    watching: getAllElements(registry).map((host) => ({
      module: host,
      status: STATUS.INIT,
    })),
  }
}

function loadingReducer(state: ILoadingState, action: ILoadingAction) {
  console.log(state, action)
  switch (action.type) {
    case 'FINISHED_RENDERING': {
      console.log('Finished loading')
      return state
    }
    case ACTIONS.CHILD_LOADING: {
      return {
        ...state,
        status: STATUS.LOADING,
        watching: [
          ...state.watching.filter(({ module }) => module !== action.payload.module),
          action.payload,
        ]
      }
    }
    case ACTIONS.CHILD_ERRORED: {
      return {
        ...state,
        status: STATUS.ERROR,
        watching: [
          ...state.watching.filter(({ module }) => module !== action.payload.module),
          action.payload,
        ]
      }
    }
    case ACTIONS.CHILD_LOADED: {
      const watching = [
        ...state.watching.filter(({ module }) => module !== action.payload.module),
        action.payload,
      ]
      const status = watching.some(({ module, status: s }) => getModuleStatus(module) === 'mounted' && s === STATUS.ERROR)
        ? STATUS.ERROR
        : watching.some(({ module, status: s }) => { const v = getModuleStatus(module) === 'mounted' && (s === STATUS.LOADING || s === STATUS.INIT); console.log(v, module, s); return v})
        ? STATUS.LOADING
        : STATUS.IDLE
      return {
        ...state,
        status,
        watching,
      }
    }
    default:
      throw Error(`Unsupported action ${action.type}.`)
  }
}

interface ILoadingContext {
  dispatchStatusChange: Dispatch<ILoadingAction>
}

const LoadingContext = createContext<ILoadingContext>({
  dispatchStatusChange: noop,
})

interface ILoadingStatusProviderProps {
  registry: IRegistry
  onStatusChanged?: (status: STATUS) => void
  onDispatch?: (action: ILoadingAction) => void
  children: ReactNode
}

export function LoadingStatusProvider({
  registry,
  onStatusChanged,
  onDispatch,
  children,
}: ILoadingStatusProviderProps) {
  const [{ status }, dispatch] = useReducer(
    loadingReducer,
    registry,
    initState,
  )

  useEffect(() => {
    // If we don't exclude INIT then this will be published as well
    // and considered a changed status.
    // In the ModuleManager this is threated like finished loading
    // and therefore it finishes to early.
    // When considered loading in the ModuleManager then loading never
    // finishes as none loading children publish INIT but never change
    // to IDLE afterwards.
    if (typeof onStatusChanged === 'function' && status !== STATUS.INIT) {
      onStatusChanged(status)
    }
  }, [status, onStatusChanged])

  const dispatchStatusChange = useCallback(
    (action: ILoadingAction) => {
      dispatch(action)
      if (typeof onDispatch === 'function') {
        onDispatch(action)
      }
    },
    [dispatch, onDispatch],
  )

  const onFinishedLoading = useCallback(() => {
    dispatch({ type: 'FINISHED_RENDERING' })
  }, [])

  return (
    <Suspense fallback={<Unmount onUnmount={onFinishedLoading} />}>
      <LoadingContext.Provider value={{ dispatchStatusChange }}>
        {children}
      </LoadingContext.Provider>
    </Suspense>
  )
}

function Unmount({ onUnmount }) {
  useEffect(() => {
    return () => {
      debugger
      onUnmount()
    }
  }, [])

  return null
}

export function useDispatchStatusChange() {
  const { dispatchStatusChange } = useContext(LoadingContext)

  return { dispatchStatusChange }
}

export function useLoadingStatus(_element: ModuleHostElement) {
  const { dispatchStatusChange } = useDispatchStatusChange()

  const setError = useCallback(
    (element = _element) => {
      dispatchStatusChange({
        type: ACTIONS.CHILD_ERRORED,
        payload: { module: element, status: STATUS.ERROR },
      })
    },
    [dispatchStatusChange, _element],
  )

  const setLoading = useCallback(
    (element = _element) => {
      dispatchStatusChange({
        type: ACTIONS.CHILD_LOADING,
        payload: { module: element, status: STATUS.LOADING },
      })
    },
    [dispatchStatusChange, _element],
  )

  const setLoaded = useCallback(
    (element = _element) => {
      dispatchStatusChange({
        type: ACTIONS.CHILD_LOADED,
        payload: { module: element, status: STATUS.IDLE },
      })
    },
    [dispatchStatusChange, _element],
  )

  return { setError, setLoading, setLoaded }
}
