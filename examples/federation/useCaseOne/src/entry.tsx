import { createUseCase } from '@portals/react'
import { GlobalLoadingProvider } from '@portals/provider'

import './styles.css'
import { modules } from './modules'

export const { bootstrap } = createUseCase({
  modules,
  AppProvider: GlobalLoadingProvider,
})
