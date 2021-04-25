import type { IBootstrapOptions, IUseCaseOptions } from '../types/definitions'
import { createContext } from '../createProvider'

interface IBootstrapOptionsContext {
  options: IBootstrapOptions & IUseCaseOptions
}

export const [
  BootstrapOptionsProvider,
  useBootstrapOptions,
] = createContext<IBootstrapOptionsContext>('BootstrapOptions')
