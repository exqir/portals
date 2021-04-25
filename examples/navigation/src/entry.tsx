import { createUseCase, combineProvider } from '@portals/core'
import { GlobalLoadingProvider, ViewProvider } from '@portals/provider'

import { Loading } from './components/Loading'

import './styles.css'
import { modules } from './modules'

export const { bootstrap } = createUseCase({
  modules,
  AppProvider: combineProvider([GlobalLoadingProvider, ViewProvider]),
  options: {
    Loading,
  },
})

bootstrap({ baseUrl: './' })
