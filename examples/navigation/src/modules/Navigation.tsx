import type { ReactNode } from 'react'
import React from 'react'
import { useView } from '@portals/provider'

import { ModuleBox } from '../components/ModuleBox'

export default function Navigation() {
  return (
    <ModuleBox>
      <nav>
        <NavButton name="data-fetching">Fetching data</NavButton>
        <NavButton name="static">Static</NavButton>
      </nav>
    </ModuleBox>
  )
}

interface INavButtonProps {
  name: string
  children: ReactNode
}

function NavButton({ name, children }: INavButtonProps) {
  const { isActive, isPreloading, navigate } = useView(name)

  return (
    <button
      className={`button ${isActive ? 'active' : ''}`}
      onClick={() => navigate(name)}
      disabled={isPreloading}
    >
      {isPreloading ? 'Waiting' : children}
    </button>
  )
}
