import type { IProvider, IPreloadOptions } from './types/definitions'
import type { ReactElement } from 'react'
import React from 'react'
import { isFunction } from '@portals/core'

import { NoopProvider } from './internal/utils'

export function combineProvider(provider: IProvider[]): IProvider {
  if (provider.length === 1) {
    return provider[0]
  }
  if (provider.length > 1) {
    const Provider: IProvider = ({ children }) =>
      provider.reduceRight(
        (c, NextProvider) => <NextProvider>{c}</NextProvider>,
        children,
      ) as ReactElement

    Provider.preload = function combinedPreload(options: IPreloadOptions) {
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
