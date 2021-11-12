import type { RouteElement } from 'packages/core/src/RouteElement'
import type { ReactNode } from 'react'
import React, {
  useEffect,
  useLayoutEffect,
  Children as ReactChildren,
  isValidElement,
} from 'react'
import { Routes, Route as RouterRoute, useLocation } from 'react-router-dom'
import { isModuleHostElement } from '@portals/core'

import { useHost } from '../HostProvider'
import {
  useModuleStatus,
  useChildrenLoadingStatus,
} from '../LoadingStatusProvider'
import {
  useNestedRoute,
  useActivePath,
  usePendingPath,
  usePendingNavigation,
} from './Pending'

interface RouteProps {
  element: RouteElement
  children: ReactNode
}

export function Route({ element, children }: RouteProps) {
  const location = useLocation()
  const { host } = useHost()
  // We add a /* to a path in case a nested route element was used
  // that would use it's own nested Routes component.
  // https://reactrouter.com/docs/en/v6/getting-started/overview#descendant-routes
  // const path = element.path
  const { hasNestedRoutes, path } = useNestedRoute(element.path)
  const isActive = useActivePath(path, !hasNestedRoutes)
  const isPending = usePendingPath(path)
  const { onPendingNavigationError, onPendingNavigationSuccess } =
    usePendingNavigation()

  const { setLoaded, setHidden, setVisibile } = useModuleStatus(host)
  const { hasError, isRendered } = useChildrenLoadingStatus(host)

  useEffect(() => {
    setLoaded()
  }, [setLoaded])

  useLayoutEffect(() => {
    if (isActive) {
      host.style.display = 'block'
    } else {
      host.style.display = 'none'
    }
  }, [isActive, host])

  useEffect(() => {
    if (isPending) {
      if (hasError) {
        onPendingNavigationError()
      }
      if (isRendered) {
        onPendingNavigationSuccess()
      }
    }
  }, [
    isPending,
    hasError,
    isRendered,
    onPendingNavigationSuccess,
    onPendingNavigationError,
  ])

  useEffect(() => {
    if (isActive || isPending) {
      ReactChildren.forEach(children, (child) => {
        if (isValidElement(child) && isModuleHostElement(child.props.host)) {
          setVisibile(child.props.host)
        }
      })
    } else {
      ReactChildren.forEach(children, (child) => {
        if (isValidElement(child) && isModuleHostElement(child.props.host)) {
          setHidden(child.props.host)
        }
      })
    }
  }, [isActive, isPending, children, setHidden])

  console.log('Route', {
    path,
    isActive,
    isPending,
    hasError,
    isRendered,
    location: location.pathname,
  })

  return (
    <Routes>
      <RouterRoute
        // When the navigation is pending is we use a match all path to let
        // react-router render it regardless of its original path because we need it
        // to be rendered so that the children can update their loading state.
        path={isPending ? '*' : element.path}
        element={<>{children}</>}
      />
      {/* This route suppresses the warning that no route in the routes is matching.
          This is because we wrap every Route in its own Routes component.
          A Route needs to be a direct child of Routes but our routing element can
          be anywhere in the modules tree.
          We also want to allow defining multiple routing elements in the DOM matching
          the same path.  */}
      <RouterRoute path="*" element={null} />
    </Routes>
  )
}
