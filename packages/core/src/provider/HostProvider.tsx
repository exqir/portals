import { createContext } from '@portals/tools'

import type { ModuleHostElement } from '../internal/ModuleHostElement'

interface IHostContext {
  host: ModuleHostElement
}

const [HostProvider, useContext] = createContext<IHostContext>('Host')

export { HostProvider }

export function useHost() {
  const { host } = useContext()

  return {
    host,
    moduleTag: host.tagName.toLowerCase(),
    moduleId: host.moduleId,
  }
}
