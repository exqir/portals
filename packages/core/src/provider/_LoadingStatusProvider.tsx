import type { ReactNode, Dispatch } from 'react'
import React, { useReducer, createContext, useContext, useEffect, useCallback } from 'react'

import type { IRegistry } from '../types/definitions'
import { noop } from '../internal/utils'

export enum LOADING_STATUS {
  INIT = 'INIT',
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

enum LOADING_ACTIONS {
  REGISTER_CHILD = 'REGISTER_CHILD',
  CHILD_LOADING = 'CHILD_LOADING',
  CHILD_LOADED = 'CHILD_LOADED',
  CHILD_ERRORED = 'CHILD_ERRORED',
}

interface ILoadingState {
  status: LOADING_STATUS
  watching: { id: string; status: LOADING_STATUS }[]
}

interface ILoadingAction {
  type: LOADING_ACTIONS
  payload: { id: string; status: LOADING_STATUS }
}

function loadingReducer(state: ILoadingState, action: ILoadingAction) {
  console.log(state, action)
  switch (action.type) {
    case LOADING_ACTIONS.REGISTER_CHILD: {
      return {
        ...state,
        watching: [...state.watching, action.payload],
      }
    }
    case LOADING_ACTIONS.CHILD_LOADING:
    case LOADING_ACTIONS.CHILD_ERRORED:
    case LOADING_ACTIONS.CHILD_LOADED: {
      const watching = [
        ...state.watching.filter(({ id }) => id !== action.payload.id),
        action.payload,
      ]
      const status = watching.some(
        ({ status: s }) => s === LOADING_STATUS.ERROR,
      )
        ? LOADING_STATUS.ERROR
        : watching.some(({ status: s }) => s === LOADING_STATUS.LOADING)
        ? LOADING_STATUS.LOADING
        : LOADING_STATUS.IDLE
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
  onStatusChanged?: (status: LOADING_STATUS) => void
  onDispatch?: (action: ILoadingAction) => void
  children: ReactNode
}

const initalState: ILoadingState = {
  status: LOADING_STATUS.INIT,
  watching: [],
}

export function LoadingStatusProvider({
  onStatusChanged,
  onDispatch,
  children,
}: ILoadingStatusProviderProps) {
  const [{ status }, dispatch] = useReducer(loadingReducer, initalState)

  useEffect(() => {
    // If we don't exclude INIT then this will be published as well
    // and considered a changed status.
    // In the ModuleManager this is threated like finished loading
    // and therefore it finishes to early.
    // When considered loading in the ModuleManager then loading never
    // finishes as none loading children publish INIT but never change
    // to IDLE afterwards.
    if (typeof onStatusChanged === 'function' && status !== LOADING_STATUS.INIT) {
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

  const register = useCallback(
    () => {
      dispatchStatusChange({
        type: LOADING_ACTIONS.REGISTER_CHILD,
        payload: {
          id: _id,
          status: LOADING_STATUS.INIT
        },
      })
    },
    [dispatchStatusChange, _id],
  )

  const setError = useCallback(
    (id = _id) => {
      dispatchStatusChange({
        type: LOADING_ACTIONS.CHILD_ERRORED,
        payload: { id, status: LOADING_STATUS.ERROR },
      })
    },
    [dispatchStatusChange, _id],
  )

  const setLoading = useCallback(
    (id = _id) => {
      dispatchStatusChange({
        type: LOADING_ACTIONS.CHILD_LOADING,
        payload: { id, status: LOADING_STATUS.LOADING },
      })
    },
    [dispatchStatusChange, _id],
  )

  const setLoaded = useCallback(
    (id = _id) => {
      dispatchStatusChange({
        type: LOADING_ACTIONS.CHILD_LOADED,
        payload: { id, status: LOADING_STATUS.IDLE },
      })
    },
    [dispatchStatusChange, _id],
  )

  return { register, setError, setLoading, setLoaded }
}
