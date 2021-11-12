import React from 'react'

import { NavButton } from '../components/NavButton'
import { ModuleBox } from '../components/ModuleBox'

export default function Navigation() {
  return (
    <ModuleBox>
      <nav>
        <NavButton path="/">Fetching data</NavButton>
        <NavButton path="/static">Static</NavButton>
      </nav>
    </ModuleBox>
  )
}
