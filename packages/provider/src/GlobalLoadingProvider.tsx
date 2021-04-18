import type { ReactNode } from 'react'
import React, { Fragment, useCallback, useState } from 'react'
import { useRegistry, LoadingStatusProvider, STATUS } from '@portals/core'

interface IGlobalLoadingIndiactorState {
  status: STATUS
}

interface GlobalLoadingProviderProps {
  children: ReactNode

}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const { registry } = useRegistry()
  const [{ status }, setState] = useState<IGlobalLoadingIndiactorState>({
    status: STATUS.INIT,
  })

  const onStatusChange = useCallback((status: STATUS) => {
    setState({
      status,
    })
  }, [])

  const isLoading = status === STATUS.INIT || status === STATUS.LOADING

  return (
    <Fragment>
      {status === STATUS.ERROR ? (
        <div>ERROR</div>
      ) : isLoading ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            backgroundColor: 'grey',
            width: '100%',
            height: '100%',
          }}
        >
          Global Loading...
        </div>
      ) : null}
      {/* Once the LoadingManger has reported an Error or Idle the GlobalLoadingIndicator
      is not concerened with further loading events because it should only handle the inital
      global loading. Future loading events should only concerne specific Views or modules
      and should be handled locally. */}
      <LoadingStatusProvider
        registry={registry}
        onStatusChanged={isLoading ? onStatusChange : undefined}
      >
        {children}
      </LoadingStatusProvider>
    </Fragment>
  )
}
