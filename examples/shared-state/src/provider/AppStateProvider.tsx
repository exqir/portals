import type { ReactNode, Dispatch } from 'react'
import React, { useState } from 'react'
import { createContext } from '@portals/react'


interface IAppStateContext {
  state: IAppState,
  setState: Dispatch<IAppState>
}

interface IAppState {
  season: null | 'S01' | 'S02' | 'S03' | 'S04'
  episode: null | string
}

const [Provider, useAppState] = createContext<IAppStateContext>('AppState')

interface IAppStateProviderProps {
  children: ReactNode
}

export function AppStateProvider({ children }: IAppStateProviderProps) {
  const [state, setState] = useState<IAppState>({ season: null, episode: null })


  return <Provider state={state} setState={setState}>{children}</Provider>
}

export { useAppState }
