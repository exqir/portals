import { createContext } from '@portals/tools'

import type { IRegistry } from '../types/definitions'

interface IRegistryContext {
  registry: IRegistry
}

export const [RegistryProvider, useRegistry] = createContext<IRegistryContext>(
  'Registry',
)
