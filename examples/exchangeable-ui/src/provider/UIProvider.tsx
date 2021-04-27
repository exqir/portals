import type { ComponentType, ReactNode } from "react";
import type { IBootstrapOptions, IPreload } from "@portals/core";
import React, { createContext, useContext } from "react";
import { createProvider, useBootstrapOptions } from "@portals/core";

import { IButtonProps, ITextProps } from "../ui/definitions"

interface IUIContext {
  Button: ComponentType<IButtonProps>;
  Text: ComponentType<ITextProps>;
}

const UIContext = createContext<IUIContext | undefined>(undefined);

interface IUIProviderProps {
  preload: IPreload;
  children: ReactNode;
}

function UIProviderComponent({ preload, children }: IUIProviderProps) {
  const { options } = useBootstrapOptions();
  const components = preload.read(options) as IUIContext;

  return <UIContext.Provider value={components}>{children}</UIContext.Provider>;
}

function loadUIImplementation({ ui }: IBootstrapOptions): Promise<IUIContext> {
  if (typeof ui !== "string") {
    console.warn(
      "Usage of the UI Layer requires to provide a ui value during bootstraping."
    );
  }
  return import(`../ui/${ui ?? 'inline'}`).then(({ default: components }) => components);
}

export const UIProvider = createProvider({
  Component: UIProviderComponent,
  preload: loadUIImplementation
});

type IComponent = keyof IUIContext;

function useUI(component: IComponent): IUIContext[typeof component] {
  const components = useContext(UIContext);
  
  if (isUndefined(components)) {
    throw new Error('Could not find UI Layer components in context.')
  }

  const { [component]: Component } = components

  return Component;
}

export function createUIComponent<Props = unknown>(component: IComponent) {
  return function UIComponent(props: Props) {
    const Component = useUI(component);

    // @ts-ignore
    return <Component {...props} />;
  };
}

function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}
