import type { ReactNode } from 'react'
import React from 'react'
import { useView } from '@portals/provider'

import { ModuleBox } from '../components/ModuleBox'

export default function Navigation() {
  return (
    <ModuleBox>
      <nav>
        <NavButton name="season">Season</NavButton>
        <NavButton name="episodes">Episodes</NavButton>
        <NavButton name="characters">Characters</NavButton>
      </nav>
    </ModuleBox>
  )
}

interface INavButtonProps {
  name: string
  children: ReactNode
}

function NavButton({ name, children }: INavButtonProps) {
  const { isActive, navigate } = useView(name)

  return (
    <button
      className={`button ${isActive ? 'active' : ''}`}
      onClick={() => navigate(name)}
    >
      {children}
    </button>
  )
}
