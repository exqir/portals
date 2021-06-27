import type { ReactNode } from 'react'
import React from 'react'

interface IModuleProviderProps {
  children: ReactNode
}

export function ModuleBox({ children }: IModuleProviderProps) {
  return <div className="module">{children}</div>;
}