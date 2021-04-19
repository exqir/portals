import { createUseCase } from '@portals/core'
import { AppProvider, ModuleProvider } from '@portals/provider'

import './styles.css'
import { modules } from './modules'

export const { bootstrap } = createUseCase({
  modules,
  AppProvider,
  ModuleProvider,
})

bootstrap({ baseUrl: './' })
