import type { IRuntimeOptions, IUseCaseOptions } from '../types/definitions'
import { createContext } from '../createProvider'

export const [RuntimeOptionsProvider, useRuntimeOptions] =
  createContext<IRuntimeOptions>('RuntimeOptions')

export const [UsecaseOptionsProvider, useUsecaseOptions] =
  createContext<IUseCaseOptions>('UsecaseOptions')
