import type { ReactNode } from 'react'
import React, {
  Suspense,
  createContext as _createContext,
  useContext as _useContext,
  useMemo,
} from 'react'
import { isFunction } from '@portals/core'

import type { IProvider, IProviderOptions } from './types/definitions'
import { createPreload } from './internal/createPreload'

export function createProvider<Props, Payload>({
  Component,
  preload,
}: IProviderOptions<Props, Payload>): IProvider<Props> {
  if (isFunction(preload)) {
    const p = createPreload(preload)

    const PreloadProvider: IProvider<Props> = (props) => {
      return (
        <Suspense fallback={null}>
          <Component {...props} preload={p} />
        </Suspense>
      )
    }
    PreloadProvider.preload = p.preload
    return PreloadProvider
  }

  return Component
}

export function createContext<ContextValueType extends object>(
  contextName: string,
) {
  const Context = _createContext<ContextValueType>(null as any)

  function Provider(props: ContextValueType & { children: ReactNode }) {
    const { children, ...providerProps } = props
    // Only re-memoize when prop values change
    const value = useMemo(
      () => providerProps,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(providerProps),
    ) as ContextValueType
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  function useContext() {
    const context = _useContext(Context)
    if (context === null) {
      throw new Error(
        `\`use${contextName}\` must be used within a \`${contextName}Provider\``,
      )
    }
    return context
  }

  Provider.displayName = contextName + 'Provider'
  return [Provider, useContext] as const
}
