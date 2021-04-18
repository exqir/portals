import type { IRegistry } from '../types/definitions'
import { createContext } from '../createProvider'
interface IRegistryContext {
  registry: IRegistry
}

export const [RegistryProvider, useRegistry] = createContext<IRegistryContext>(
  'Registry',
)
