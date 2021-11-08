import type { ComponentType, ReactElement, ReactNode } from 'react'

import type { IPreload } from '../internal/createPreload'

export type ILazy<T> = () => Promise<T>

export type IOnInitHook<Payload = unknown> = () => IOnInitResult<Payload>

export interface IOnInitResult<Payload = unknown> {
  data: Payload
  error: Error | undefined
  loading: boolean
}

export type IModuleDefinition = ComponentType<any>

export type IModulesMap = Map<string, IModuleDefinition>

export interface IProviderOptions<Props = unknown, Payload = unknown> {
  Component: IProvider<Props>
  preload?: IPreloadFunction<Payload>
}

export { IPreload }

export type IPreloadOptions = IRuntimeOptions
export interface IProvider<Props = unknown, Payload = unknown> {
  (
    props: Props & { preload?: IPreload<Payload>; children: ReactNode },
  ): ReactElement | null
  preload?: (options: IPreloadOptions) => void
}

export interface IRuntimeOptions {
  baseUrl: string
  [key: string]: unknown
}
export interface IUseCaseOptions {
  Loading: ComponentType
  Error: ComponentType
}

export type IPreloadFunction<Payload> = (
  options: IPreloadOptions,
) => Promise<Payload>
