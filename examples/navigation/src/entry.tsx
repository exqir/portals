import { createUseCase, combineProvider } from '@portals/react'
import { GlobalLoadingProvider } from '@portals/provider'

import { Loading } from './components/Loading'

import './styles.css'
import { modules } from './modules'

export const { bootstrap } = createUseCase({
  modules,
  AppProvider: combineProvider([GlobalLoadingProvider]),
  options: {
    Loading,
  },
})

bootstrap({ baseUrl: './' })
