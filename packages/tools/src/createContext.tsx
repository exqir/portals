// Adopted from https://github.com/radix-ui/primitives/blob/main/packages/react/context/src/createContext.tsx
import type { ReactNode } from 'react'
import React, {
  createContext as _createContext,
  useContext as _useContext,
  useMemo,
} from 'react'

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
