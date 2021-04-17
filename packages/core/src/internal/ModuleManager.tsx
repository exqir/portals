import type { ReactElement, FC } from 'react'
import React, { Suspense, useEffect, useState, useCallback } from 'react'

import type { IOnInitHook } from '../types/definitions'
import {
  useLoadingStatus,
  STATUS,
  LoadingStatusProvider,
} from '../provider/LoadingStatusProvider'
import { useHost } from '../provider/HostProvider'
import { useRegistry } from '../provider/RegistryProvider'

interface IModuleLoaderProps<Payload = unknown> {
  useInit: IOnInitHook<Payload>
  module: FC<{ data: Payload }>
  [key: string]: unknown
}

export function ModuleManager<Payload>({
  useInit,
  module: Module,
  ...props
}: IModuleLoaderProps<Payload>): ReactElement {
  const [
    { loading: childrenLoading, error: childrenError },
    setStatus,
  ] = useState<{ loading: boolean; error: Error | undefined }>({
    // Start with loading when the Module has children.
    // TODO:
    // For a non-active view this will be set to true but
    // never change to false because the children will not
    // publish an IDLE status because they are not rendered.
    // Could the view publish a IDLE status if it is not active?
    loading: typeof props.children !== 'undefined',
    error: undefined,
  })
  const { host } = useHost()
  const { registry } = useRegistry()
  const { data, error, loading } = useInit()
  const id = host.moduleId

  useEffect(() => {
    host.moduleMounted()
  }, [host])

  const { setError, setLoading, setLoaded } = useLoadingStatus(id)

  useEffect(() => {
    if (error || childrenError) setError()
    else if (loading || childrenLoading) setLoading()
    else setLoaded()
  }, [
    setError,
    setLoading,
    setLoaded,
    error,
    childrenError,
    loading,
    childrenLoading,
  ])

  const onStatusChange = useCallback(
    (status: STATUS) => {
      switch (status) {
        case STATUS.ERROR: {
          return setStatus({
            loading: false,
            error: new Error(`Loading ${id}'s children resulted in an error.`),
          })
        }
        case STATUS.LOADING: {
          return setStatus({ loading: true, error: undefined })
        }
        default: {
          return setStatus({ loading: false, error: undefined })
        }
      }
    },
    [id],
  )

  return (
    <LoadingStatusProvider registry={registry} onStatusChanged={onStatusChange}>
      <Suspense fallback={null}>
        {loading ? (
          <div>Loading</div>
        ) : error ? (
          <div>Error</div>
        ) : (
          <Module data={data} {...props} />
        )}
      </Suspense>
    </LoadingStatusProvider>
  )
}
