import type { ReactNode } from 'react'
import React, { Suspense } from 'react'

import type { IProvider, IProviderOptions } from './types/definitions'
import { createPreload } from './internal/createPreload'
import { isFunction } from './internal/utils'

export function createProvider<Props, Payload>({
  Component,
  preload,
}: IProviderOptions<Props, Payload>): IProvider<Props> {
  if (isFunction(preload)) {
    const p = createPreload(preload)

    const PreloadProvider = (props: Props & { children: ReactNode }) => {
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
