export type {
  IBootstrapOptions,
  IPreload,
  IProvider,
  IModuleDefinition,
  IOnInitHook,
} from './types/definitions'

// TODO: This should rather be available as @protals/core/provider instead
// of directly from @portals/react.
export {
  LoadingStatusProvider,
  useModuleStatus,
  useGlobalLoadingStatus,
  useChildrenLoadingStatus,
} from './provider/LoadingStatusProvider'

export { Slot, Children } from './internal/Children'
export { Host } from './internal/Host'

export { combineProvider } from './combineProvider'
export { createModule } from './createModule'
export { createProvider, createContext } from './createProvider'
export { createUseCase } from './createUseCase'

export { useBootstrapOptions } from './useBootstrapOptions'
export { useHost } from './useHost'
