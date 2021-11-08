import { IPreloadFunction, IPreloadOptions } from '../types/definitions'
import { createAsset } from 'use-asset'

export interface IPreload<Payload> {
  preload: (options: IPreloadOptions) => void
  read: (options: IPreloadOptions) => Payload
  clear: (options: IPreloadOptions) => void
  peek: (options: IPreloadOptions) => void | Payload
}

export function createPreload<Payload>(
  fn: IPreloadFunction<Payload>,
): IPreload<Payload> {
  return createAsset(fn)
}
