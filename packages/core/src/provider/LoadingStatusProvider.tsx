import { ReactElement, Dispatch, useCallback } from 'react'
import React, { useReducer, createContext, useContext, useEffect } from 'react'

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
  watching: { id: string; status: STATUS }[]
}

interface ILoadingAction {
  type: ACTIONS
  payload: { id: string; status: STATUS }
}

function initState(elements: ModuleHostElement[]) {
  return {
    status: STATUS.INIT,
    watching: elements.map((host) => ({
      id: host.moduleId,
      status: STATUS.INIT,
    })),
  }
}

function loadingReducer(state: ILoadingState, action: ILoadingAction) {
  console.log(state, action)
  switch (action.type) {
    case ACTIONS.CHILD_LOADING:
    case ACTIONS.CHILD_ERRORED:
    case ACTIONS.CHILD_LOADED: {
      const watching = [
        ...state.watching.filter(({ id }) => id !== action.payload.id),
        action.payload,
      ]
      const status = watching.some(({ status: s }) => s === STATUS.ERROR)
        ? STATUS.ERROR
        : watching.some(({ status: s }) => s === STATUS.LOADING) ||
          watching.some(({ status: s }) => s === STATUS.INIT)
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
  children: ReactElement
}

export function LoadingStatusProvider({
  registry,
  onStatusChanged,
  onDispatch,
  children,
}: ILoadingStatusProviderProps) {
  const [{ status }, dispatch] = useReducer(
    loadingReducer,
    registry.getElements(),
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

  return (
    <LoadingContext.Provider value={{ dispatchStatusChange }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useDispatchStatusChange() {
  const { dispatchStatusChange } = useContext(LoadingContext)

  return { dispatchStatusChange }
}

export function useLoadingStatus(_id: string) {
  const { dispatchStatusChange } = useDispatchStatusChange()

  const setError = useCallback(
    (id = _id) => {
      dispatchStatusChange({
        type: ACTIONS.CHILD_ERRORED,
        payload: { id, status: STATUS.ERROR },
      })
    },
    [dispatchStatusChange, _id],
  )

  const setLoading = useCallback(
    (id = _id) => {
      dispatchStatusChange({
        type: ACTIONS.CHILD_LOADING,
        payload: { id, status: STATUS.LOADING },
      })
    },
    [dispatchStatusChange, _id],
  )

  const setLoaded = useCallback(
    (id = _id) => {
      dispatchStatusChange({
        type: ACTIONS.CHILD_LOADED,
        payload: { id, status: STATUS.IDLE },
      })
    },
    [dispatchStatusChange, _id],
  )

  return { setError, setLoading, setLoaded }
}
