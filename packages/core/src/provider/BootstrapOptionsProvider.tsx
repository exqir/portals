import type { IBootstrapOptions } from '../types/definitions'
import { createContext } from '../createProvider'

interface IBootstrapOptionsContext {
  options: IBootstrapOptions
}

export const [
  BootstrapOptionsProvider,
  useBootstrapOptions,
] = createContext<IBootstrapOptionsContext>('BootstrapOptions')
