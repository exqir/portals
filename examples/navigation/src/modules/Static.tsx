import React from 'react'
import { Children } from '@portals/react'

import { NavButton } from '../components/NavButton'
import { ModuleBox } from '../components/ModuleBox'

export default function Static() {
  return (
    <ModuleBox>
      <p>Module with static content, not loading any data.</p>
      <NavButton path="child">Child</NavButton>
      <Children />
    </ModuleBox>
  )
}
