import type { ReactNode } from 'react'
import React, { Fragment, useCallback, useState } from 'react'
import { useBootstrapOptions, useRegistry, LoadingStatusProvider, STATUS } from '@portals/core'

interface IGlobalLoadingIndiactorState {
  status: STATUS
}

interface GlobalLoadingProviderProps {
  children: ReactNode

}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const { options } = useBootstrapOptions()
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
      {status === STATUS.ERROR || isLoading ? (
        // It should not contain styles at all, so this should also be made configurable.
        // Even though it is not part of core and therefore can esaily be replaced by an
        // own implementation, it is not that usefull if it has too much styles backed in
        // already.
        // On the other hand these should not be part of the options if it can be avoided.
        // The options have a place for specific options but this has not to be defined
        // during usage of a use case but can rather be defined while creating a use case. 
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
            opacity: '0.8'
          }}
        >
          {status === STATUS.ERROR ? <options.Error /> : <options.Loading />}
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
