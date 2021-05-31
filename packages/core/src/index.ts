export type {
  IBootstrapOptions,
  IPreload,
  IProvider,
  IModuleDefinition,
  IOnInitHook,
} from './types/definitions'

// TODO: This should rather be available as @protals/core/provider instead
// of directly from @portals/core.
export {
  LoadingStatusProvider,
  LOADING_STATUS,
  useModuleStatus,
  useLoadingStatus,
} from './provider/LoadingStatusProvider'

export { MODULE_STATUS } from './internal/ModuleHostElement'

export { Outlet, Children } from './internal/Outlet'
export { Host } from './internal/Host'

export { combineProvider } from './combineProvider'
export { createModule } from './createModule'
export { createProvider, createContext } from './createProvider'
export { createUseCase } from './createUseCase'

export { useBootstrapOptions } from './useBootstrapOptions'
export { useHost } from './useHost'
export { useRegistry } from './useRegistry'
