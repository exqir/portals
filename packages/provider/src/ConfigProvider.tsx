import type { ReactNode } from 'react'
import type { IPreload, IPreloadOptions } from '@portals/react'
import React, { useState, createContext, useContext } from 'react'
import { createProvider, useHost, useRuntimeOptions } from '@portals/react'

function extractModuleConfig(
  config: Record<string, unknown>,
  moduleTag: string,
) {
  return () => {
    const { [moduleTag]: moduleConfig } = config
    return moduleConfig as Record<string, unknown>
  }
}

interface IConfigContext {
  config: Record<string, unknown>
}

const ConfigContext = createContext<IConfigContext>({
  config: {},
})

interface IConfigProviderProps {
  preload: IPreload
  children: ReactNode
}

function ConfigProviderComponent({ preload, children }: IConfigProviderProps) {
  const { moduleTag } = useHost()
  const { baseUrl } = useRuntimeOptions()
  const gc = preload.read({ baseUrl }) as IConfig
  const [config] = useState(extractModuleConfig(gc, moduleTag))

  return (
    <ConfigContext.Provider value={{ config }}>
      {config === null ? null : children}
    </ConfigContext.Provider>
  )
}

function loadConfig({ runtimeOptions }: IPreloadOptions): Promise<IConfig> {
  return fetch(`${runtimeOptions.baseUrl}/config.json`).then((r) => r.json())
}

export const ConfigProvider = createProvider({
  Component: ConfigProviderComponent,
  preload: loadConfig,
})

export function useConfig() {
  const { config } = useContext(ConfigContext)

  return { config }
}

type IConfig = Record<string, unknown>
