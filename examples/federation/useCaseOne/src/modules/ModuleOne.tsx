import React from 'react'

import { ModuleBox } from '../components/ModuleBox'
import { Portal } from '../components/Portal'

export default function Child() {
  return (
    <ModuleBox>
      <p className="inline">
        <Portal /> Module One.
      </p>
    </ModuleBox>
  )
}
