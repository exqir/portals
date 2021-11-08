import type { ComponentType, ReactNode } from 'react'
import type { IRuntimeOptions, IPreload } from '@portals/react'
import React, { createContext, useContext } from 'react'
import { isUndefined } from '@portals/core'
import { createProvider, useRuntimeOptions } from '@portals/react'

import { IButtonProps, ITextProps } from '../ui/definitions'

interface IUIContext {
  Button: ComponentType<IButtonProps>
  Text: ComponentType<ITextProps>
}

const UIContext = createContext<IUIContext | undefined>(undefined)

interface IUIProviderProps {
  preload: IPreload<IUIContext>
  children: ReactNode
}

function UIProviderComponent({ preload, children }: IUIProviderProps) {
  const runtimeOptions = useRuntimeOptions()
  const components = preload.read(runtimeOptions)

  return <UIContext.Provider value={components}>{children}</UIContext.Provider>
}

function loadUIImplementation({ ui }: IRuntimeOptions): Promise<IUIContext> {
  if (typeof ui !== 'string') {
    console.warn(
      'Usage of the UI Layer requires to provide a ui value during bootstraping.',
    )
  }
  return import(`../ui/${ui ?? 'inline'}`).then(
    ({ default: components }) => components,
  )
}

export const UIProvider = createProvider({
  Component: UIProviderComponent,
  preload: loadUIImplementation,
})

type IComponent = keyof IUIContext

function useUI(component: IComponent): IUIContext[typeof component] {
  const components = useContext(UIContext)

  if (isUndefined(components)) {
    throw new Error('Could not find UI Layer components in context.')
  }

  const { [component]: Component } = components

  return Component
}

export function createUIComponent<Props = unknown>(component: IComponent) {
  return function UIComponent(props: Props) {
    const Component = useUI(component)

    // @ts-ignore
    return <Component {...props} />
  }
}
