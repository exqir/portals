import { createUseCase, combineProvider } from '@portals/core'
import { GlobalLoadingProvider, ViewProvider } from '@portals/provider'

import { GraphQLProvider } from './provider/GraphQLProvider'
import { AppStateProvider } from './provider/AppStateProvider'

import { Loading } from './components/Loading'

import './styles.css'
import { modules } from './modules'

export const { bootstrap } = createUseCase({
  modules,
  AppProvider: combineProvider([
    GlobalLoadingProvider,
    ViewProvider,
    GraphQLProvider,
    AppStateProvider,
  ]),
  options: {
    Loading,
  },
})

bootstrap({ baseUrl: './' })
