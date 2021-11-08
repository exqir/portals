import type { IPreloadFunction } from '../types/definitions'
import { createAsset } from 'use-asset'

export type IPreload = ReturnType<typeof createAsset>

export function createPreload<Payload>(
  fn: IPreloadFunction<Payload>,
): IPreload {
  return createAsset(fn)
}
