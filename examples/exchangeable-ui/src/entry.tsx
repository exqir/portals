import { createUseCase, combineProvider } from '@portals/react'
import { GlobalLoadingProvider, ViewProvider } from '@portals/provider'

import { UIProvider } from './provider/UIProvider'

import './styles.css'
import { modules } from './modules'

export const { bootstrap } = createUseCase({
  modules,
  AppProvider: combineProvider([
    GlobalLoadingProvider,
    ViewProvider,
    // @ts-ignore
    UIProvider,
  ]),
})

// Switch between ui value `inline` and `stitches` to see different
// UI implementations being loaded and used inside the UIComponents
// module.
bootstrap({ baseUrl: './', ui: 'stitches' })
