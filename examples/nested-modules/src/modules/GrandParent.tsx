import React from 'react'
import { Slot, Children } from '@portals/react'

import { ModuleBox } from '../components/ModuleBox'
import { Portal } from '../components/Portal'

export default function Parent() {
  return (
    <ModuleBox>
      <Slot name="top" fallback={<p>Top slot fallback</p>} />
      <div className="inline">
        <Portal /> The grand parent module rendering the parent module.
      </div>
      <Children />
    </ModuleBox>
  )
}
