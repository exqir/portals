import type { ReactElement, FC } from 'react'
import React, {
  Suspense,
  useEffect,
  useState,
  useCallback,
  Children,
  useLayoutEffect,
} from 'react'

import type { IOnInitHook } from '../types/definitions'
import {
  useModuleStatus,
  // LOADING_STATUS,
  LoadingStatusProvider,
} from '../provider/LoadingStatusProvider'
import { useHost } from '../provider/HostProvider'
import { useRegistry } from '../provider/RegistryProvider'
import { useBootstrapOptions } from '../provider/BootstrapOptionsProvider'

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
  const { options } = useBootstrapOptions()
  // const [
  //   { loading: childrenLoading, error: childrenError },
  //   setStatus,
  // ] = useState<{ loading: boolean; error: Error | undefined }>({
  //   // Start with loading when the Module has children.
  //   // TODO:
  //   // For a non-active view this will be set to true but
  //   // never change to false because the children will not
  //   // publish an IDLE status because they are not rendered.
  //   // Could the view publish a IDLE status if it is not active?
  //   loading: typeof props.children !== 'undefined' && (Children.count(props.children) > 0),
  //   error: undefined,
  // })
  const { host } = useHost()
  // const { registry } = useRegistry()
  const { data, error, loading } = useInit()

  useLayoutEffect(() => {
    host.moduleMounted()
  }, [host])

  const { setError, setLoading, setLoaded } = useModuleStatus(host)

  useEffect(() => {
    if (error) setError()
    else if (loading) setLoading()
    else setLoaded()
  }, [
    setError,
    setLoading,
    setLoaded,
    error,
    // childrenError,
    loading,
    // childrenLoading,
  ])

  // const onStatusChange = useCallback(
  //   (status: LOADING_STATUS) => {
  //     switch (status) {
  //       case LOADING_STATUS.ERROR: {
  //         return setStatus({
  //           loading: false,
  //           error: new Error(`Loading ${id}'s children resulted in an error.`),
  //         })
  //       }
  //       case LOADING_STATUS.LOADING: {
  //         return setStatus({ loading: true, error: undefined })
  //       }
  //       default: {
  //         return setStatus({ loading: false, error: undefined })
  //       }
  //     }
  //   },
  //   [id],
  // )

  return (
    <Suspense fallback={null}>
      {loading ? (
        <options.Loading />
      ) : error ? (
        <options.Error />
      ) : (
        <Module data={data} {...props} />
      )}
    </Suspense>
  )
}
