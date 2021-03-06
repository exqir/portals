import type { ModuleHostElement } from '@portals/core'
import { createContext } from '../createProvider'
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
