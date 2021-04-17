import { createContext } from '@portals/tools'

import type { IBootstrapOptions } from '../types/definitions'

interface IBootstrapOptionsContext {
  options: IBootstrapOptions
}

export const [
  BootstrapOptionsProvider,
  useBootstrapOptions,
] = createContext<IBootstrapOptionsContext>('BootstrapOptions')
