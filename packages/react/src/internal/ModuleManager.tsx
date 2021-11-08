import type { ReactElement, FC } from 'react'
import React, { Suspense, useEffect } from 'react'

import type { IOnInitHook } from '../types/definitions'
import { useModuleStatus } from '../provider/LoadingStatusProvider'
import { useHost } from '../provider/HostProvider'
import { useUsecaseOptions } from '../provider/OptionProviders'

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
  const { Loading, Error } = useUsecaseOptions()
  const { host } = useHost()
  const { data, error, loading } = useInit()

  const { setError, setLoading, setLoaded } = useModuleStatus(host)

  useEffect(() => {
    if (error) setError()
    else if (loading) setLoading()
    else setLoaded()
    return () => setLoading()
  }, [setError, setLoading, setLoaded, error, loading])

  return (
    <Suspense fallback={<Loading />}>
      {loading ? (
        <Loading />
      ) : error ? (
        <Error />
      ) : (
        <Module data={data} {...props} />
      )}
    </Suspense>
  )
}
