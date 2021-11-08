import type { ReactNode } from 'react'
import React, { Fragment, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useUsecaseOptions, useGlobalLoadingStatus } from '@portals/react'

interface GlobalLoadingProviderProps {
  children: ReactNode
}

export function GlobalLoadingProvider({
  children,
}: GlobalLoadingProviderProps) {
  const host = useRef<HTMLDivElement>()
  const { Loading, Error } = useUsecaseOptions()
  const { isLoading, hasError } = useGlobalLoadingStatus()

  useEffect(() => {
    host.current = document.createElement('div')
    host.current.setAttribute('data-global-loading', '')
    document.body.appendChild(host.current)
    return () => {
      if (host.current) {
        document.body.removeChild(host.current)
      }
    }
  }, [])

  return (
    <Fragment>
      {(hasError || isLoading) && host.current
        ? // It should not contain styles at all, so this should also be made configurable.
          // Even though it is not part of core and therefore can esaily be replaced by an
          // own implementation, it is not that usefull if it has too much styles backed in
          // already.
          // On the other hand these should not be part of the options if it can be avoided.
          // The options have a place for specific options but this has not to be defined
          // during usage of a use case but can rather be defined while creating a use case.
          createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'gray',
                opacity: '0.8',
                zIndex: 100,
              }}
            >
              {hasError ? <Error /> : <Loading />}
            </div>,
            host.current,
          )
        : null}
      {children}
    </Fragment>
  )
}
