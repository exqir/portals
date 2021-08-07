import type { IBootstrapOptions } from '../types/definitions'
import { createAsset } from 'use-asset'

type IPreloadFunction<Payload> = (
  options: IBootstrapOptions,
) => Promise<Payload>

export type IPreload = ReturnType<typeof createAsset>

export function createPreload<Payload>(
  fn: IPreloadFunction<Payload>,
): IPreload {
  return createAsset(fn)
}
