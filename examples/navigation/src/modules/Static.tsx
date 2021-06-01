import React from 'react'

import { ModuleBox } from '../components/ModuleBox'

export default function Static() {
  return (
    <ModuleBox>
      <p>Module with static content, not loading any data.</p>
    </ModuleBox>
  )
}
