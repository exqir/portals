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
export interface IProvider<Props = unknown> {
  (
    props: Props & { preload?: IPreload; children: ReactNode },
  ): ReactElement | null
  preload?: (options: IBootstrapOptions) => void
}

export interface IBootstrapOptions {
  baseUrl: string
  [key: string]: unknown
}
export interface IUseCaseOptions {
  // TODO: Make these optinal. They are set to a NoopFunction otherwise
  Loading: ComponentType
  Error: ComponentType
  [key: string]: unknown
}

type IPreloadFunction<Payload> = (
  options: IBootstrapOptions,
) => Promise<Payload>
