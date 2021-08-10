import type { IBootstrapOptions, IProvider } from './types/definitions'
import React from 'react'
import { isFunction } from '@portals/core'

import { NoopProvider } from './internal/utils'

export function combineProvider(provider: IProvider[]): IProvider {
  if (provider.length === 1) {
    return provider[0]
  }
  if (provider.length > 1) {
    // Try to avoid creating a new anonymous function/component each time.
    const Provider = provider.reduce(
      (CombinedProvider, NextProvider) =>
        ({ children, ...props }) =>
          (
            <CombinedProvider {...props}>
              <NextProvider {...props}>{children}</NextProvider>
            </CombinedProvider>
          ),
    )

    Provider.preload = function combinedPreload(options: IBootstrapOptions) {
      provider
        .filter(({ preload }) => isFunction(preload))
        .forEach(({ preload }) => {
          // We made sure it is a function in the filter.
          // This could be improved by expressing this in a TypeGuard.
          preload!(options)
        })
    }

    return Provider
  }

  return NoopProvider
}
