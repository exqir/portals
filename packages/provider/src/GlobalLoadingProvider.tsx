import type { ReactNode } from 'react'
import React, { Fragment, useState, useEffect } from 'react'
import { useBootstrapOptions, useLoadingStatus, LOADING_STATUS } from '@portals/core'

interface IGlobalLoadingIndiactorState {
  status: LOADING_STATUS
}

interface GlobalLoadingProviderProps {
  children: ReactNode

}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const { options } = useBootstrapOptions()
  const { loadingStatus } = useLoadingStatus()

  const [{ status }, setState] = useState<IGlobalLoadingIndiactorState>({
    status: LOADING_STATUS.INIT,
  })

  useEffect(() => {
    if (loadingStatus === LOADING_STATUS.IDLE || LOADING_STATUS.ERROR || LOADING_STATUS.LOADING) {
      console.log('Global loading status', { loadingStatus})
      // @ts-ignore
      setState({ status: loadingStatus})
    }
  }, [loadingStatus])

  const isLoading = status === LOADING_STATUS.INIT || status === LOADING_STATUS.LOADING

  return (
    <Fragment>
      {status === LOADING_STATUS.ERROR || isLoading ? (
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
          {status === LOADING_STATUS.ERROR ? <options.Error /> : <options.Loading />}
        </div>
      ) : null}
      {children}
    </Fragment>
  )
}
