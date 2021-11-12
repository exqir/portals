import type { To } from 'react-router-dom'
import React, { useState, useMemo } from 'react'
import {
  useNavigate,
  useLocation,
  useMatch,
  useResolvedPath,
  matchPath,
  resolvePath,
} from 'react-router-dom'
import { isNull } from '@portals/core'

import type { IProvider } from '../../types/definitions'
import { createContext } from '../../createProvider'

interface IPendingNavigationContext {
  state: IPendingNavigationState
  navigate: (to: To) => void
  onPendingNavigationSuccess: () => void
  onPendingNavigationError: () => void
}

interface IPendingNavigationState {
  nextLocation: To | null
  preloadError?: Error
}

const [PendingProvider, usePendingContext] =
  createContext<IPendingNavigationContext>('Pending')

export const PendingNavigation: IProvider = ({ children }) => {
  const navigate = useNavigate()
  const [state, setState] = useState<IPendingNavigationState>(() => ({
    nextLocation: null,
  }))

  const callbacks = useMemo(
    () => ({
      onPendingNavigationSuccess: () => {
        setState((s) => {
          const nextLocation = s.nextLocation
          if (!isNull(nextLocation)) {
            navigate(nextLocation)
          }
          return { nextLocation: null }
        })
      },
      onPendingNavigationError: (error?: Error) => {
        setState({ nextLocation: null, preloadError: error })
      },
      navigate: (to: To) => {
        setState({ nextLocation: to })
      },
    }),
    [navigate, setState],
  )

  return (
    <PendingProvider {...callbacks} state={state}>
      {children}
    </PendingProvider>
  )
}

export function useRouting() {
  const { navigate } = usePendingContext()

  return { navigate }
}

export function usePendingNavigation() {
  const { state, onPendingNavigationError, onPendingNavigationSuccess } =
    usePendingContext()
  return {
    hasPendingNavigation: !isNull(state.nextLocation),
    onPendingNavigationError,
    onPendingNavigationSuccess,
  }
}

export function useActivePath(path: To, end: boolean) {
  const location = useLocation()
  const resolvedPath = useResolvedPath(path)

  const locationPathname = location.pathname.toLowerCase()
  const toPathname = resolvedPath.pathname.toLowerCase()

  const isActive =
    locationPathname === toPathname ||
    (!end &&
      locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === '/')

  return isActive
}

export function usePendingPath(path: To) {
  const currentLocation = useLocation()
  const {
    state: { nextLocation },
  } = usePendingContext()

  const location = useResolvedPath(nextLocation ?? currentLocation)
  const resolvedPath = useResolvedPath(path)

  if (isNull(nextLocation)) {
    return false
  }

  const nextLocationPathname = location.pathname.toLowerCase()
  const toPathname = resolvedPath.pathname.toLowerCase()

  const isPending = !isNull(matchPath(toPathname, nextLocationPathname))

  return isPending
}

export function useNestedRoute(path: To) {
  const { pathname } = useResolvedPath(path)
  const hasNestedRoutes = pathname.endsWith('/*')

  return {
    hasNestedRoutes,
    path: hasNestedRoutes ? pathname.substr(0, pathname.length - 2) : path,
  }
}
